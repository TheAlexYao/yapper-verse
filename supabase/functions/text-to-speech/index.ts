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
  speed?: 'normal' | 'slow';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      throw new Error('Missing Azure Speech configuration');
    }

    // Parse and validate request body
    const { text, languageCode, voiceGender, speed = 'normal' } = await req.json() as TTSRequest;

    if (!text || !languageCode || !voiceGender) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('TTS Request:', { text, languageCode, voiceGender, speed });

    // Get voice settings from the languages table
    const { data: voiceData, error: voiceError } = await supabase
      .from('languages')
      .select(voiceGender === 'male' ? 'male_voice' : 'female_voice')
      .eq('code', languageCode)
      .single();

    if (voiceError) {
      console.error('Error fetching voice settings:', voiceError);
      throw new Error(`Failed to fetch voice settings: ${voiceError.message}`);
    }

    const voiceName = voiceData[voiceGender === 'male' ? 'male_voice' : 'female_voice'];
    if (!voiceName) {
      throw new Error(`No ${voiceGender} voice found for language ${languageCode}`);
    }

    // Create speech configuration
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechSynthesisVoiceName = voiceName;

    // Split text into sentences and add breaks
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const ssmlSentences = sentences.map(sentence => 
      `<s>${sentence.trim()}.</s><break time="500ms"/>`
    ).join('\n');

    // Create SSML with proper prosody controls
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${languageCode}">
        <voice name="${voiceName}">
          <prosody rate="${speed === 'slow' ? '0.7' : '1.0'}" pitch="+0%">
            ${ssmlSentences}
          </prosody>
        </voice>
      </speak>
    `;

    console.log('Generated SSML:', ssml);

    // Generate speech
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    
    const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
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
      throw new Error(`Speech synthesis failed: ${result.errorDetails}`);
    }

    const audioData = result.audioData;
    if (!audioData || audioData.length === 0) {
      throw new Error('No audio data generated');
    }

    // Upload to Supabase Storage
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}.wav`;
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

    return new Response(
      JSON.stringify({ audioUrl: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});