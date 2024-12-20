import { corsHeaders, type RequestBody } from "../_shared/tts-utils.ts";
import { generateSpeech } from "./speechGenerator.ts";
import { CacheManager } from "./cacheManager.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const cacheManager = new CacheManager();

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
    const { data: languageData, error: languageError } = await cacheManager.getSupabaseClient()
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
    const cacheEntry = await cacheManager.getCacheEntry(textHash, languageCode, voiceGender);
    const audioUrlField = `audio_url_${speed}`;
    
    // If the requested speed version exists in cache, return it
    if (cacheEntry && cacheEntry[audioUrlField]) {
      return new Response(
        JSON.stringify({ audioUrl: cacheEntry[audioUrlField] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate the audio for the requested speed
    console.log(`Generating ${speed} speed audio...`);
    const audioData = await generateSpeech(text, languageCode, voiceName, speed);

    // Upload to storage with correct extension and content type
    const filename = `${textHash}_${speed}.mp3`;
    const publicUrl = await cacheManager.uploadAudio(filename, audioData);

    // Update cache entry
    await cacheManager.updateCacheEntry(
      textHash,
      speed,
      publicUrl,
      cacheEntry,
      text,
      languageCode,
      voiceGender
    );

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