import type { Json } from "../shared";

export interface LanguagesTable {
  Row: {
    id: string;
    code: string;
    name: string;
    emoji: string | null;
    created_at: string | null;
    updated_at: string | null;
    male_voice: string | null;
    female_voice: string | null;
    sample_rate: number | null;
    features: string | null;
    shortname_male: string | null;
    shortname_female: string | null;
    output_format: string | null;
    style_list: string | null;
  };
  Insert: {
    id?: string;
    code: string;
    name: string;
    emoji?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    male_voice?: string | null;
    female_voice?: string | null;
    sample_rate?: number | null;
    features?: string | null;
    shortname_male?: string | null;
    shortname_female?: string | null;
    output_format?: string | null;
    style_list?: string | null;
  };
  Update: {
    id?: string;
    code?: string;
    name?: string;
    emoji?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    male_voice?: string | null;
    female_voice?: string | null;
    sample_rate?: number | null;
    features?: string | null;
    shortname_male?: string | null;
    shortname_female?: string | null;
    output_format?: string | null;
    style_list?: string | null;
  };
}