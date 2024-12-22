import * as sdk from "https://esm.sh/microsoft-cognitiveservices-speech-sdk";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TTSRequest } from './types.ts';
import { createTextHash } from './hash.ts';

export async function generateSpeech(
  request: TTSRequest,
  speechKey: string,
  speechRegion: string,
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const voiceName = await getVoiceName(request.languageCode, request.voiceGender, supabase);
  
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechSynthesisVoiceName = voiceName;
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;

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
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('tts_cache')
      .getPublicUrl(filename);

    return publicUrl;
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