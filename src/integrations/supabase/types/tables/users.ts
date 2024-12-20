import type { Json } from "../shared";

export interface UsersTable {
  Row: {
    telegram_id: number;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    language_code: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    telegram_id: number;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    language_code?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    telegram_id?: number;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    language_code?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
}