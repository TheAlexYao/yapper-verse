import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";
import * as sdk from "https://esm.sh/microsoft-cognitiveservices-speech-sdk";

const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY') || '';
const AZURE_SPEECH_REGION = Deno.env.get('AZURE_SPEECH_REGION') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TTSRequest {
  text: string;
  languageCode: string;
  voiceGender: 'male' | 'female';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, languageCode, voiceGender } = await req.json() as TTSRequest;

    if (!text || !languageCode || !voiceGender) {
      throw new Error('Missing required parameters');
    }

    // Create a hash of the request parameters for caching
    const textHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${text}-${languageCode}-${voiceGender}`)
    );
    const hashHex = Array.from(new Uint8Array(textHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Check cache first
    const { data: cacheData, error: cacheError } = await supabase
      .from('tts_cache')
      .select('audio_url')
      .eq('text_hash', hashHex)
      .single();

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Cache lookup error:', cacheError);
      throw cacheError;
    }

    if (cacheData?.audio_url) {
      console.log('Cache hit, returning cached audio URL');
      return new Response(
        JSON.stringify({ audioUrl: cacheData.audio_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Cache miss, generating new audio');

    // Get voice settings from the languages table
    const { data: voiceData, error: voiceError } = await supabase
      .from('languages')
      .select(voiceGender === 'male' ? 'male_voice' : 'female_voice')
      .eq('code', languageCode)
      .single();

    if (voiceError) {
      console.error('Error fetching voice settings:', voiceError);
      throw voiceError;
    }

    const voiceName = voiceData[voiceGender === 'male' ? 'male_voice' : 'female_voice'];
    if (!voiceName) {
      throw new Error(`No ${voiceGender} voice found for language ${languageCode}`);
    }

    // Generate speech
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechSynthesisVoiceName = voiceName;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    
    const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => resolve(result),
        error => reject(error)
      );
    });

    if (result.errorDetails) {
      throw new Error(`Speech synthesis failed: ${result.errorDetails}`);
    }

    const audioData = result.audioData;
    synthesizer.close();

    if (!audioData || audioData.length === 0) {
      throw new Error('No audio data generated');
    }

    // Upload to Supabase Storage
    const timestamp = new Date().getTime();
    const fileName = `${hashHex}-${timestamp}.wav`;
    const filePath = `${languageCode}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('tts_cache')
      .upload(filePath, audioData, {
        contentType: 'audio/wav',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: publicUrl } = supabase
      .storage
      .from('tts_cache')
      .getPublicUrl(filePath);

    // Cache the result
    const { error: insertError } = await supabase
      .from('tts_cache')
      .insert({
        text_hash: hashHex,
        text_content: text,
        language_code: languageCode,
        voice_gender: voiceGender,
        audio_url: publicUrl.publicUrl
      });

    if (insertError) {
      console.error('Cache insert error:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ audioUrl: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});