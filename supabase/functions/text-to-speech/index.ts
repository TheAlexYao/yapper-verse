import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as sdk from "https://esm.sh/microsoft-cognitiveservices-speech-sdk";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash } from "https://deno.land/std@0.177.0/hash/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

interface TTSRequest {
  text: string;
  languageCode: string;
  voiceGender: 'male' | 'female';
  speed?: 'normal' | 'slow';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let synthesizer: sdk.SpeechSynthesizer | null = null;
  
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

    // Parse request body
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

    // Validate request data
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

    // Generate hash for caching
    const textHash = createHash('md5')
      .update(`${requestData.text}-${requestData.languageCode}-${requestData.voiceGender}-${requestData.speed || 'normal'}`)
      .toString();

    // Check cache
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

    // Get voice from languages table
    const { data: languageData, error: languageError } = await supabase
      .from('languages')
      .select(`${requestData.voiceGender}_voice`)
      .eq('code', requestData.languageCode)
      .single();

    if (languageError || !languageData) {
      console.error('Error fetching language voice:', languageError);
      return new Response(
        JSON.stringify({ error: `Language not supported: ${requestData.languageCode}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    const voiceName = languageData[`${requestData.voiceGender}_voice`];
    if (!voiceName) {
      console.error('Voice not found for:', requestData.languageCode, requestData.voiceGender);
      return new Response(
        JSON.stringify({ error: `Voice not available for ${requestData.languageCode} in ${requestData.voiceGender} gender` }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Configure speech synthesis
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION
    );

    speechConfig.speechSynthesisVoiceName = voiceName;
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${requestData.languageCode}">
        <voice name="${voiceName}">
          <prosody rate="${requestData.speed === 'slow' ? '0.7' : '1.0'}" pitch="+0%">
            ${requestData.text}
          </prosody>
        </voice>
      </speak>
    `;

    synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    
    // Generate speech
    const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
      synthesizer!.speakSsmlAsync(
        ssml,
        result => resolve(result),
        error => reject(error)
      );
    });

    if (result.errorDetails) {
      console.error('Speech synthesis error:', result.errorDetails);
      throw new Error(`Speech synthesis failed: ${result.errorDetails}`);
    }

    // Create blob and upload to storage
    const audioData = result.audioData;
    const blob = new Blob([audioData], { type: 'audio/wav' });
    
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${randomString}.wav`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('tts_cache')
      .upload(filename, blob, {
        contentType: 'audio/wav',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to store audio file');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('tts_cache')
      .getPublicUrl(filename);

    // Cache the result
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
  } finally {
    if (synthesizer) {
      try {
        synthesizer.close();
      } catch (error) {
        console.error('Error closing synthesizer:', error);
      }
    }
  }
});