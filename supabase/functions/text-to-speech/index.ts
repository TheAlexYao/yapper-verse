import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as sdk from "https://esm.sh/microsoft-cognitiveservices-speech-sdk";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, gender = 'female', speed = 'normal' } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create hash using native crypto API
    const textToHash = `${text}-${gender}-${speed}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const textHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache
    const { data: cacheEntry } = await supabase
      .from('tts_cache')
      .select('audio_url')
      .eq('text_hash', textHash)
      .maybeSingle();

    if (cacheEntry?.audio_url) {
      console.log('Cache hit, returning cached audio URL');
      return new Response(
        JSON.stringify({ audioUrl: cacheEntry.audio_url }),
        { headers: corsHeaders }
      );
    }

    console.log('Cache miss, generating TTS...');

    // Configure speech synthesis
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      Deno.env.get('AZURE_SPEECH_KEY')!,
      Deno.env.get('AZURE_SPEECH_REGION')!
    );

    // Get voice name from language settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('target_language')
      .single();

    if (!profile?.target_language) {
      throw new Error('Target language not set');
    }

    const { data: language } = await supabase
      .from('languages')
      .select(`${gender}_voice`)
      .eq('code', profile.target_language)
      .single();

    if (!language) {
      throw new Error(`No voice found for language ${profile.target_language}`);
    }

    const voiceName = language[`${gender}_voice`];
    if (!voiceName) {
      throw new Error(`No ${gender} voice found for language ${profile.target_language}`);
    }

    speechConfig.speechSynthesisVoiceName = voiceName;

    // Generate SSML
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${profile.target_language}">
        <voice name="${voiceName}">
          <prosody rate="${speed === 'slow' ? '0.7' : '1.0'}" pitch="+0%">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    // Generate audio
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        result => resolve(result),
        error => reject(error)
      );
    });

    if (result.errorDetails) {
      throw new Error(`Speech synthesis failed: ${result.errorDetails}`);
    }

    // Upload to storage
    const timestamp = new Date().getTime();
    const filename = `${timestamp}-${textHash}.wav`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('tts_cache')
      .upload(filename, result.audioData, {
        contentType: 'audio/wav',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('tts_cache')
      .getPublicUrl(filename);

    // Cache the result
    await supabase
      .from('tts_cache')
      .upsert({
        text_hash: textHash,
        text_content: text,
        language_code: profile.target_language,
        voice_gender: gender,
        audio_url: publicUrl
      });

    return new Response(
      JSON.stringify({ audioUrl: publicUrl }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('TTS generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate speech',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: corsHeaders 
      }
    );
  }
});