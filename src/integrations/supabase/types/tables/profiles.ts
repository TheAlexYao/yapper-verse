import type { Json } from "../shared";

export interface ProfilesTable {
  Row: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
    native_language: string | null;
    target_language: string | null;
    voice_preference: string | null;
    learning_goals: string[] | null;
    custom_goals: string[] | null;
    onboarding_completed: boolean | null;
    languages_learning: string[] | null;
  };
  Insert: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
    native_language?: string | null;
    target_language?: string | null;
    voice_preference?: string | null;
    learning_goals?: string[] | null;
    custom_goals?: string[] | null;
    onboarding_completed?: boolean | null;
    languages_learning?: string[] | null;
  };
  Update: {
    id?: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
    native_language?: string | null;
    target_language?: string | null;
    voice_preference?: string | null;
    learning_goals?: string[] | null;
    custom_goals?: string[] | null;
    onboarding_completed?: boolean | null;
    languages_learning?: string[] | null;
  };
}