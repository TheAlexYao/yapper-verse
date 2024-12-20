import type { Json } from "../shared";

export interface ScenariosTable {
  Row: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    primary_goal: string | null;
    useful_phrases: string[] | null;
    cultural_notes: string | null;
    location_details: string | null;
    language_id: string | null;
    created_at: string | null;
    updated_at: string | null;
    title_translations: Json | null;
    description_translations: Json | null;
    primary_goal_translations: Json | null;
    cultural_notes_translations: Json | null;
    location_details_translations: Json | null;
    useful_phrases_translations: Json | null;
  };
  Insert: {
    id?: string;
    title: string;
    description?: string | null;
    category: string;
    primary_goal?: string | null;
    useful_phrases?: string[] | null;
    cultural_notes?: string | null;
    location_details?: string | null;
    language_id?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    title_translations?: Json | null;
    description_translations?: Json | null;
    primary_goal_translations?: Json | null;
    cultural_notes_translations?: Json | null;
    location_details_translations?: Json | null;
    useful_phrases_translations?: Json | null;
  };
  Update: {
    id?: string;
    title?: string;
    description?: string | null;
    category?: string;
    primary_goal?: string | null;
    useful_phrases?: string[] | null;
    cultural_notes?: string | null;
    location_details?: string | null;
    language_id?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    title_translations?: Json | null;
    description_translations?: Json | null;
    primary_goal_translations?: Json | null;
    cultural_notes_translations?: Json | null;
    location_details_translations?: Json | null;
    useful_phrases_translations?: Json | null;
  };
}