import type { Json } from "../shared";

export interface CharactersTable {
  Row: {
    age: number | null
    avatar_url: string | null
    bio: string | null
    bio_translations: Json | null
    created_at: string | null
    gender: string | null
    id: string
    language_style: string[] | null
    language_style_translations: Json | null
    name: string
    name_translations: Json | null
    scenario_id: string | null
    updated_at: string | null
  }
  Insert: {
    age?: number | null
    avatar_url?: string | null
    bio?: string | null
    bio_translations?: Json | null
    created_at?: string | null
    gender?: string | null
    id?: string
    language_style?: string[] | null
    language_style_translations?: Json | null
    name: string
    name_translations?: Json | null
    scenario_id?: string | null
    updated_at?: string | null
  }
  Update: {
    age?: number | null
    avatar_url?: string | null
    bio?: string | null
    bio_translations?: Json | null
    created_at?: string | null
    gender?: string | null
    id?: string
    language_style?: string[] | null
    language_style_translations?: Json | null
    name?: string
    name_translations?: Json | null
    scenario_id?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "characters_scenario_id_fkey"
      columns: ["scenario_id"]
      isOneToOne: false
      referencedRelation: "scenarios"
      referencedColumns: ["id"]
    }
  ]
}