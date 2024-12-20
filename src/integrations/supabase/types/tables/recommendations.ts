import type { Json } from "../shared";

export interface RecommendationsTable {
  Row: {
    id: string;
    message_id: string;
    content_target_language: string;
    content_native_language: string;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    message_id: string;
    content_target_language: string;
    content_native_language: string;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    message_id?: string;
    content_target_language?: string;
    content_native_language?: string;
    created_at?: string | null;
    updated_at?: string | null;
  };
}