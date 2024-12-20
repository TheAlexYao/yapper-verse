import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk"
import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

interface RequestBody {
  text: string;
  languageCode: string;
  voiceGender: 'male' | 'female';
}

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestBody = await req.json().catch((error) => {
      console.error('Failed to parse request body:', error);
      throw new Error('Invalid request body');
    });

    const { text, languageCode, voiceGender } = requestBody as RequestBody;
    
    if (!text || !languageCode || !voiceGender) {
      throw new Error('Missing required fields: text, languageCode, or voiceGender');
    }

    console.log('Received TTS request:', { text, languageCode, voiceGender });

    // Generate hash of the text + language + gender combination
    const textToHash = `${text}-${languageCode}-${voiceGender}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const textHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache first
    const { data: cacheData, error: cacheError } = await supabaseAdmin
      .from('tts_cache')
      .select('audio_url')
      .eq('text_hash', textHash)
      .eq('language_code', languageCode)
      .eq('voice_gender', voiceGender)
      .single();

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Cache lookup error:', cacheError);
      throw cacheError;
    }

    if (cacheData?.audio_url) {
      console.log('Cache hit:', cacheData.audio_url);
      return new Response(
        JSON.stringify({ audioUrl: cacheData.audio_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get voice configuration for the language
    const { data: languageData, error: languageError } = await supabaseAdmin
      .from('languages')
      .select('male_voice, female_voice')
      .eq('code', languageCode)
      .single();

    if (languageError) {
      console.error('Language lookup error:', languageError);
      throw languageError;
    }

    const voiceName = voiceGender === 'male' ? 
      (languageCode === 'fr-FR' ? 'fr-FR-AlainNeural' : languageData.male_voice) : 
      (languageCode === 'fr-FR' ? 'fr-FR-DeniseNeural' : languageData.female_voice);

    if (!voiceName) {
      throw new Error(`No ${voiceGender} voice found for language ${languageCode}`);
    }

    console.log('Using voice:', voiceName);

    // Configure speech SDK
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY');
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION');

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech credentials not configured');
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
    speechConfig.speechSynthesisVoiceName = voiceName;

    // Create the synthesizer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    // Generate audio
    console.log('Generating audio with voice:', voiceName);
    const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => {
          synthesizer.close();
          resolve(result);
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });

    if (result.errorDetails) {
      console.error('Speech synthesis error:', result.errorDetails);
      throw new Error(result.errorDetails);
    }

    // Get audio data
    const audioData = result.audioData;
    
    // Generate a unique filename
    const filename = `${textHash}.wav`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('tts_cache')
      .upload(filename, audioData, {
        contentType: 'audio/wav',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('tts_cache')
      .getPublicUrl(filename);

    // Cache the result
    const { error: insertError } = await supabaseAdmin
      .from('tts_cache')
      .insert({
        text_hash: textHash,
        text_content: text,
        language_code: languageCode,
        voice_gender: voiceGender,
        audio_url: publicUrl
      });

    if (insertError) {
      console.error('Cache insert error:', insertError);
      throw insertError;
    }

    console.log('Successfully generated and cached audio:', publicUrl);
    return new Response(
      JSON.stringify({ audioUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});