import type { Json } from "../shared";

export interface MessagesTable {
  Row: {
    id: string;
    conversation_id: string;
    sender_type: "user" | "agent";
    content_target_language: string;
    content_native_language: string | null;
    storage_path: string | null;
    pronunciation_attempt_id: string | null;
    is_direct_voice: boolean;
    created_at: string | null;
    updated_at: string | null;
  };
  Insert: {
    id?: string;
    conversation_id: string;
    sender_type: "user" | "agent";
    content_target_language: string;
    content_native_language?: string | null;
    storage_path?: string | null;
    pronunciation_attempt_id?: string | null;
    is_direct_voice?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
  };
  Update: {
    id?: string;
    conversation_id?: string;
    sender_type?: "user" | "agent";
    content_target_language?: string;
    content_native_language?: string | null;
    storage_path?: string | null;
    pronunciation_attempt_id?: string | null;
    is_direct_voice?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
  };
}