import type { Json } from "../shared";

export interface TransformationsTable {
  Row: {
    id: string;
    recommendation_id: string;
    user_prompt: string;
    transformed_content_target_language: string;
    transformed_content_native_language: string;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    recommendation_id: string;
    user_prompt: string;
    transformed_content_target_language: string;
    transformed_content_native_language: string;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    recommendation_id?: string;
    user_prompt?: string;
    transformed_content_target_language?: string;
    transformed_content_native_language?: string;
    created_at?: string | null;
    updated_at?: string | null;
  };
}