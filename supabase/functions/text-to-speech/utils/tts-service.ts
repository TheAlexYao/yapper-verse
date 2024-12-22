import * as sdk from "https://esm.sh/microsoft-cognitiveservices-speech-sdk";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TTSRequest } from './types.ts';

export async function generateSpeech(
  request: TTSRequest,
  speechKey: string,
  speechRegion: string,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const voiceName = await getVoiceName(request.languageCode, request.voiceGender, supabase);
  
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechSynthesisVoiceName = voiceName;
  
  // Use MP3 format instead of WAV for better browser compatibility
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz96KBitRateMonoMp3;

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${request.languageCode}">
      <voice name="${voiceName}">
        <prosody rate="${request.speed === 'slow' ? '0.7' : '1.0'}" pitch="+0%">
          ${request.text}
        </prosody>
      </voice>
    </speak>
  `;

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  
  try {
    console.log('Starting speech synthesis with voice:', voiceName);
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

    // Upload to storage with MP3 content type
    const timestamp = new Date().getTime();
    const filename = `${timestamp}-${crypto.randomUUID()}.mp3`;

    console.log('Uploading audio file:', filename);
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('tts_cache')
      .upload(filename, result.audioData, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('tts_cache')
      .getPublicUrl(filename);

    return publicUrl;

  } catch (error) {
    console.error('Speech synthesis error:', error);
    throw error;
  } finally {
    synthesizer.close();
  }
}

async function getVoiceName(
  languageCode: string,
  voiceGender: string,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const { data: languageData, error: languageError } = await supabase
    .from('languages')
    .select(`${voiceGender}_voice`)
    .eq('code', languageCode)
    .single();

  if (languageError || !languageData) {
    throw new Error(`Language not supported: ${languageCode}`);
  }

  const voiceName = languageData[`${voiceGender}_voice`];
  if (!voiceName) {
    throw new Error(`Voice not available for ${languageCode} in ${voiceGender} gender`);
  }

  return voiceName;
}