import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk"
import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

interface RequestBody {
  text: string;
  languageCode: string;
  voiceGender: 'male' | 'female';
  speed?: 'normal' | 'slow' | 'very-slow';
}

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function generateSpeech(text: string, languageCode: string, voiceName: string, speed: 'normal' | 'slow' | 'very-slow'): Promise<ArrayBuffer> {
  const speechKey = Deno.env.get('AZURE_SPEECH_KEY');
  const speechRegion = Deno.env.get('AZURE_SPEECH_REGION');

  if (!speechKey || !speechRegion) {
    throw new Error('Azure Speech credentials not configured');
  }

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechSynthesisVoiceName = voiceName;

  // Prepare SSML with speed adjustment
  let rateAdjustment = '';
  if (speed === 'slow') {
    rateAdjustment = ' rate="-20%"';
  } else if (speed === 'very-slow') {
    rateAdjustment = ' rate="-50%"';
  }

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${languageCode}">
      <voice name="${voiceName}">
        <prosody${rateAdjustment}>
          ${text}
        </prosody>
      </voice>
    </speak>`;

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      result => {
        synthesizer.close();
        if (result.audioData.byteLength > 0) {
          resolve(result.audioData);
        } else {
          reject(new Error('No audio data generated'));
        }
      },
      error => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json() as RequestBody;
    const { text, languageCode, voiceGender, speed = 'normal' } = requestBody;
    
    if (!text || !languageCode || !voiceGender) {
      throw new Error('Missing required fields: text, languageCode, or voiceGender');
    }

    console.log('Received TTS request:', { text, languageCode, voiceGender, speed });

    // Generate hash of the text + language + gender combination
    const textToHash = `${text}-${languageCode}-${voiceGender}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(textToHash);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const textHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

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
      languageData.male_voice : 
      languageData.female_voice;

    if (!voiceName) {
      throw new Error(`No ${voiceGender} voice found for language ${languageCode}`);
    }

    // Check cache first
    const { data: cacheData, error: cacheError } = await supabaseAdmin
      .from('tts_cache')
      .select('audio_url_normal, audio_url_slow, audio_url_very_slow')
      .eq('text_hash', textHash)
      .eq('language_code', languageCode)
      .eq('voice_gender', voiceGender)
      .single();

    let audioUrl;

    // If the requested speed version exists in cache, return it
    if (cacheData) {
      if (speed === 'normal' && cacheData.audio_url_normal) {
        return new Response(
          JSON.stringify({ audioUrl: cacheData.audio_url_normal }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (speed === 'slow' && cacheData.audio_url_slow) {
        return new Response(
          JSON.stringify({ audioUrl: cacheData.audio_url_slow }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else if (speed === 'very-slow' && cacheData.audio_url_very_slow) {
        return new Response(
          JSON.stringify({ audioUrl: cacheData.audio_url_very_slow }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate the audio for the requested speed
    console.log(`Generating ${speed} speed audio...`);
    const audioData = await generateSpeech(text, languageCode, voiceName, speed);

    // Upload to storage
    const filename = `${textHash}_${speed}.wav`;
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

    // Update cache table
    if (!cacheData) {
      // If no cache entry exists, create one with the current speed version
      const cacheEntry = {
        text_hash: textHash,
        text_content: text,
        language_code: languageCode,
        voice_gender: voiceGender,
        [`audio_url_${speed}`]: publicUrl
      };
      
      const { error: insertError } = await supabaseAdmin
        .from('tts_cache')
        .insert([cacheEntry]);

      if (insertError) {
        console.error('Cache insert error:', insertError);
        throw insertError;
      }
    } else {
      // Update existing cache entry with the new speed version
      const { error: updateError } = await supabaseAdmin
        .from('tts_cache')
        .update({ [`audio_url_${speed}`]: publicUrl })
        .eq('text_hash', textHash)
        .eq('language_code', languageCode)
        .eq('voice_gender', voiceGender);

      if (updateError) {
        console.error('Cache update error:', updateError);
        throw updateError;
      }
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