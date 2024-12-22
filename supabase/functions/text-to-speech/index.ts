import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './utils/cors.ts';
import { createTextHash } from './utils/hash.ts';
import { generateSpeech } from './utils/tts-service.ts';
import type { TTSRequest, TTSResponse } from './utils/types.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY');
    const AZURE_SPEECH_REGION = Deno.env.get('AZURE_SPEECH_REGION');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing required environment variables');
      throw new Error('Server configuration error');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let requestData: TTSRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!requestData?.text || !requestData?.languageCode || !requestData?.voiceGender) {
      const missingParams = [];
      if (!requestData?.text) missingParams.push('text');
      if (!requestData?.languageCode) missingParams.push('languageCode');
      if (!requestData?.voiceGender) missingParams.push('voiceGender');

      console.error('Missing required parameters:', missingParams);
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', missingParams }),
        { status: 400, headers: corsHeaders }
      );
    }

    const textHash = createTextHash(
      requestData.text,
      requestData.languageCode,
      requestData.voiceGender,
      requestData.speed
    );

    const { data: cachedEntry, error: cacheError } = await supabase
      .from('tts_cache')
      .select('audio_url')
      .eq('text_hash', textHash)
      .maybeSingle();

    if (cacheError) {
      console.error('Error checking cache:', cacheError);
    } else if (cachedEntry?.audio_url) {
      console.log('Cache hit, returning cached audio URL');
      return new Response(
        JSON.stringify({ audioUrl: cachedEntry.audio_url }),
        { headers: corsHeaders }
      );
    }

    const publicUrl = await generateSpeech(
      requestData,
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION,
      supabase
    );

    const { error: cacheInsertError } = await supabase
      .from('tts_cache')
      .upsert({
        text_hash: textHash,
        text_content: requestData.text,
        language_code: requestData.languageCode,
        voice_gender: requestData.voiceGender,
        audio_url: publicUrl
      });

    if (cacheInsertError) {
      console.error('Cache insert error:', cacheInsertError);
    }

    return new Response(
      JSON.stringify({ audioUrl: publicUrl }),
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});