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
    console.log('Processing TTS request...');
    const { text, gender = 'female', speed = 'normal', languageCode } = await req.json();

    if (!text) {
      console.error('Missing required text parameter');
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!languageCode) {
      console.error('Missing required languageCode parameter');
      return new Response(
        JSON.stringify({ error: 'Language code is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate BCP 47 language code format
    const bcp47Regex = /^[a-z]{2,3}(-[A-Z]{2,3})?$/;
    if (!bcp47Regex.test(languageCode)) {
      console.error('Invalid language code format:', languageCode);
      return new Response(
        JSON.stringify({ error: `Invalid language code format. Expected BCP 47 format (e.g., 'en-US', 'zh-CN')` }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('TTS request parameters:', { text, gender, speed, languageCode });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create hash for caching
    const textToHash = `${text}-${gender}-${speed}-${languageCode}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const textHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache first
    console.log('Checking TTS cache for hash:', textHash);
    const { data: cacheEntry, error: cacheError } = await supabase
      .from('tts_cache')
      .select('audio_url')
      .eq('text_hash', textHash)
      .maybeSingle();

    if (cacheError) {
      console.error('Cache lookup error:', cacheError);
      throw cacheError;
    }

    if (cacheEntry?.audio_url) {
      console.log('Cache hit, returning cached audio URL');
      return new Response(
        JSON.stringify({ audioUrl: cacheEntry.audio_url }),
        { headers: corsHeaders }
      );
    }

    console.log('Cache miss, generating new audio');

    // Get voice name from language settings
    const { data: language } = await supabase
      .from('languages')
      .select(`${gender}_voice`)
      .eq('code', languageCode)
      .single();

    if (!language) {
      console.error(`No language found for code: ${languageCode}`);
      return new Response(
        JSON.stringify({ error: `Language not supported: ${languageCode}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    const voiceName = language[`${gender}_voice`];
    if (!voiceName) {
      console.error(`No ${gender} voice found for language ${languageCode}`);
      return new Response(
        JSON.stringify({ error: `No ${gender} voice available for ${languageCode}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Configure speech synthesis
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      Deno.env.get('AZURE_SPEECH_KEY')!,
      Deno.env.get('AZURE_SPEECH_REGION')!
    );

    speechConfig.speechSynthesisVoiceName = voiceName;

    // Generate SSML with proper language code
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${languageCode}">
        <voice name="${voiceName}">
          <prosody rate="${speed === 'slow' ? '0.7' : '1.0'}" pitch="+0%">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    // Generate audio
    console.log('Generating audio with voice:', voiceName);
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

    console.log('Uploading audio file:', filename);
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
    console.log('Caching audio URL:', publicUrl);
    await supabase
      .from('tts_cache')
      .upsert({
        text_hash: textHash,
        text_content: text,
        language_code: languageCode,
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