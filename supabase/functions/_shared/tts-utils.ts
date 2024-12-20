export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export interface RequestBody {
  text: string;
  languageCode: string;
  voiceGender: 'male' | 'female';
  speed?: 'normal' | 'slow' | 'very-slow';
}

export interface TTSCacheEntry {
  text_hash: string;
  text_content: string;
  language_code: string;
  voice_gender: string;
  audio_url_normal?: string;
  audio_url_slow?: string;
  audio_url_very_slow?: string;
}