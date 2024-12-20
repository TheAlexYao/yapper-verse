export interface GuidedConversation {
  id: string;
  user_id: string;
  character_id: string;
  scenario_id: string;
  native_language_id: string;
  target_language_id: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  metrics: {
    pronunciationScore?: number;
    stylePoints?: number;
    sentencesUsed?: number;
    sentenceLimit?: number;
  };
}

export interface GuidedMessage {
  id: string;
  conversation_id: string;
  content: string;
  translation?: string;
  transliteration?: string;
  is_user: boolean;
  pronunciation_score?: number;
  pronunciation_data?: any;
  audio_url?: string;
  sentence_count?: number;
  created_at?: string;
  updated_at?: string;
}