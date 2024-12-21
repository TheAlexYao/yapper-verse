import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as sdk from "https://esm.sh/microsoft-cognitiveservices-speech-sdk";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash } from "https://deno.land/std@0.177.0/hash/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TTSRequest {
  text: string;
  languageCode: string;
  voiceGender: 'male' | 'female';
  speed?: 'normal' | 'slow';
}

serve(async (req) => {
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

    const requestData = await req.json();
    console.log('Received TTS request:', requestData);

    if (!requestData?.text || !requestData?.languageCode || !requestData?.voiceGender) {
      const missingParams = [];
      if (!requestData?.text) missingParams.push('text');
      if (!requestData?.languageCode) missingParams.push('languageCode');
      if (!requestData?.voiceGender) missingParams.push('voiceGender');

      console.error('Missing required parameters:', missingParams);
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', missingParams }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validatedData = requestData as TTSRequest;
    
    // Generate a unique hash for the TTS request
    const textHash = createHash('md5')
      .update(`${validatedData.text}-${validatedData.languageCode}-${validatedData.voiceGender}-${validatedData.speed || 'normal'}`)
      .toString();

    // Check cache first
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
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch voice from languages table
    const { data: languageData, error: languageError } = await supabase
      .from('languages')
      .select(`${validatedData.voiceGender}_voice`)
      .eq('code', validatedData.languageCode)
      .single();

    if (languageError || !languageData) {
      console.error('Error fetching language voice:', languageError);
      return new Response(
        JSON.stringify({ error: `Language not supported: ${validatedData.languageCode}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const voiceName = languageData[`${validatedData.voiceGender}_voice`];
    if (!voiceName) {
      console.error('Voice not found for:', validatedData.languageCode, validatedData.voiceGender);
      return new Response(
        JSON.stringify({ error: `Voice not available for ${validatedData.languageCode} in ${validatedData.voiceGender} gender` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Using voice:', voiceName);

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION
    );

    speechConfig.speechSynthesisVoiceName = voiceName;
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${validatedData.languageCode}">
        <voice name="${voiceName}">
          <prosody rate="${validatedData.speed === 'slow' ? '0.7' : '1.0'}" pitch="+0%">
            ${validatedData.text}
          </prosody>
        </voice>
      </speak>
    `;

    synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    
    try {
      const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
        synthesizer!.speakSsmlAsync(
          ssml,
          result => {
            resolve(result);
          },
          error => {
            reject(error);
          }
        );
      });

      if (result.errorDetails) {
        console.error('Speech synthesis error:', result.errorDetails);
        throw new Error(`Speech synthesis failed: ${result.errorDetails}`);
      }

      // Create a blob URL from the audio data
      const audioData = result.audioData;
      const blob = new Blob([audioData], { type: 'audio/wav' });
      
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const randomString = Math.random().toString(36).substring(7);
      const filename = `${timestamp}-${randomString}.wav`;

      // Store the audio in Supabase Storage
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

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('tts_cache')
        .getPublicUrl(filename);

      // Cache the result
      const { error: cacheInsertError } = await supabase
        .from('tts_cache')
        .insert({
          text_hash: textHash,
          text_content: validatedData.text,
          language_code: validatedData.languageCode,
          voice_gender: validatedData.voiceGender,
          audio_url: publicUrl
        })
        .single();

      if (cacheInsertError) {
        console.error('Cache insert error:', cacheInsertError);
        // Don't throw here, we still want to return the audio URL
      }

      return new Response(
        JSON.stringify({ audioUrl: publicUrl }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );

    } finally {
      if (synthesizer) {
        try {
          synthesizer.close();
        } catch (error) {
          console.error('Error closing synthesizer in inner finally block:', error);
        }
      }
    }

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } finally {
    if (synthesizer) {
      try {
        synthesizer.close();
      } catch (error) {
        console.error('Error disposing synthesizer in outer finally block:', error);
      }
    }
  }
});