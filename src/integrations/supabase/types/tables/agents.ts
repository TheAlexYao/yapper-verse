import type { Json } from "../shared";

export interface AgentsTable {
  Row: {
    context_info: Json
    created_at: string | null
    id: string
    name: string
    persona_type: string
    personality_description: string
    updated_at: string | null
    voice_settings: Json
  }
  Insert: {
    context_info?: Json
    created_at?: string | null
    id?: string
    name: string
    persona_type: string
    personality_description: string
    updated_at?: string | null
    voice_settings?: Json
  }
  Update: {
    context_info?: Json
    created_at?: string | null
    id?: string
    name?: string
    persona_type?: string
    personality_description?: string
    updated_at?: string | null
    voice_settings?: Json
  }
  Relationships: []
}