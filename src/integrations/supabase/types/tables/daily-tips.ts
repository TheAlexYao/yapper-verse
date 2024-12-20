import type { Json } from "../base";

export interface DailyTipsTable {
  Row: {
    id: string
    language_code: string
    tip_text: string
    cultural_context: string | null
    created_at: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    language_code: string
    tip_text: string
    cultural_context?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    language_code?: string
    tip_text?: string
    cultural_context?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "daily_tips_language_code_fkey"
      columns: ["language_code"]
      isOneToOne: false
      referencedRelation: "languages"
      referencedColumns: ["code"]
    }
  ]
}