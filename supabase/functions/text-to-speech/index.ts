import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk"
import { createClient } from "npm:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts";
import { createHash } from "https://deno.land/std@0.168.0/hash/mod.ts"

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
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, languageCode, voiceGender } = await req.json() as RequestBody;
    console.log('Received TTS request:', { text, languageCode, voiceGender });

    // Generate hash of the text + language + gender combination
    const textHash = createHash('md5')
      .update(`${text}-${languageCode}-${voiceGender}`)
      .toString();

    // Check cache first
    const { data: cacheData, error: cacheError } = await supabaseAdmin
      .from('tts_cache')
      .select('audio_url')
      .eq('text_hash', textHash)
      .eq('language_code', languageCode)
      .eq('voice_gender', voiceGender)
      .single();

    if (cacheError && cacheError.code !== 'PGRST116') {
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

    if (languageError) throw languageError;

    const voiceName = voiceGender === 'male' ? languageData.male_voice : languageData.female_voice;
    if (!voiceName) {
      throw new Error(`No ${voiceGender} voice found for language ${languageCode}`);
    }

    // Configure speech SDK
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      Deno.env.get('AZURE_SPEECH_KEY') ?? '',
      Deno.env.get('AZURE_SPEECH_REGION') ?? ''
    );
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

    if (uploadError) throw uploadError;

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

    if (insertError) throw insertError;

    console.log('Successfully generated and cached audio:', publicUrl);
    return new Response(
      JSON.stringify({ audioUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});