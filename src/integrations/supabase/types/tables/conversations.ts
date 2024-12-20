import type { Json } from "../shared";

export interface ConversationsTable {
  Row: {
    id: string;
    telegram_id: number;
    language_id: string;
    agent_id: string;
    status: string;
    native_language_code: string;
    created_at: string | null;
    updated_at: string | null;
    completed_at: string | null;
  };
  Insert: {
    id?: string;
    telegram_id: number;
    language_id: string;
    agent_id: string;
    status?: string;
    native_language_code: string;
    created_at?: string | null;
    updated_at?: string | null;
    completed_at?: string | null;
  };
  Update: {
    id?: string;
    telegram_id?: number;
    language_id?: string;
    agent_id?: string;
    status?: string;
    native_language_code?: string;
    created_at?: string | null;
    updated_at?: string | null;
    completed_at?: string | null;
  };
}