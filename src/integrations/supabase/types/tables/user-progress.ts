import type { Json } from "../shared";

export interface UserProgressTable {
  Row: {
    id: string;
    telegram_id: number;
    language_id: string;
    total_conversations: number;
    total_messages: number;
    total_pronunciation_attempts: number;
    average_pronunciation_score: number;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    telegram_id: number;
    language_id: string;
    total_conversations?: number;
    total_messages?: number;
    total_pronunciation_attempts?: number;
    average_pronunciation_score?: number;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    telegram_id?: number;
    language_id?: string;
    total_conversations?: number;
    total_messages?: number;
    total_pronunciation_attempts?: number;
    average_pronunciation_score?: number;
    created_at?: string | null;
    updated_at?: string | null;
  };
}