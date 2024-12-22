import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as sdk from "https://esm.sh/microsoft-cognitiveservices-speech-sdk";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TTSRequest } from './utils/types.ts';
import { generateSpeech } from './utils/tts-service.ts';
import { createTextHash } from './utils/hash.ts';

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
    const textHash = await createTextHash(text, gender, speed, languageCode);

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

    const audioUrl = await generateSpeech({
      text,
      languageCode,
      voiceGender: gender,
      speed
    }, Deno.env.get('AZURE_SPEECH_KEY')!, Deno.env.get('AZURE_SPEECH_REGION')!, supabase);

    // Cache the result
    console.log('Caching audio URL:', audioUrl);
    await supabase
      .from('tts_cache')
      .upsert({
        text_hash: textHash,
        text_content: text,
        language_code: languageCode,
        voice_gender: gender,
        audio_url: audioUrl
      });

    return new Response(
      JSON.stringify({ audioUrl }),
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