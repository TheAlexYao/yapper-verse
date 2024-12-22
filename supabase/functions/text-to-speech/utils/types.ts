export interface TTSRequest {
  text: string;
  languageCode: string;
  voiceGender: 'male' | 'female';
  speed?: 'normal' | 'slow';
}

export interface TTSResponse {
  audioUrl: string;
  error?: string;
}