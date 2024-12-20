import type { Json } from "../shared";

export interface PronunciationAttemptsTable {
  Row: {
    id: string;
    telegram_id: number;
    recommendation_id: string | null;
    transformation_id: string | null;
    storage_path: string;
    transcription: string | null;
    assessment_score: number | null;
    assessment_details: Json;
    is_successful: boolean;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    telegram_id: number;
    recommendation_id?: string | null;
    transformation_id?: string | null;
    storage_path: string;
    transcription?: string | null;
    assessment_score?: number | null;
    assessment_details?: Json;
    is_successful?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    telegram_id?: number;
    recommendation_id?: string | null;
    transformation_id?: string | null;
    storage_path?: string;
    transcription?: string | null;
    assessment_score?: number | null;
    assessment_details?: Json;
    is_successful?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
  };
}