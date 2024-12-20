export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agents: {
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
      conversations: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          language_id: string
          native_language_code: string
          status: string
          telegram_id: number
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          language_id: string
          native_language_code: string
          status?: string
          telegram_id: number
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          language_id?: string
          native_language_code?: string
          status?: string
          telegram_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_native_language_code_fkey"
            columns: ["native_language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "conversations_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      languages: {
        Row: {
          city: string
          code: string
          country: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          city: string
          code: string
          country: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          code?: string
          country?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content_native_language: string | null
          content_target_language: string
          conversation_id: string
          created_at: string | null
          id: string
          is_direct_voice: boolean
          pronunciation_attempt_id: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          storage_path: string | null
          updated_at: string | null
        }
        Insert: {
          content_native_language?: string | null
          content_target_language: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_direct_voice?: boolean
          pronunciation_attempt_id?: string | null
          sender_type: Database["public"]["Enums"]["sender_type"]
          storage_path?: string | null
          updated_at?: string | null
        }
        Update: {
          content_native_language?: string | null
          content_target_language?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_direct_voice?: boolean
          pronunciation_attempt_id?: string | null
          sender_type?: Database["public"]["Enums"]["sender_type"]
          storage_path?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pronunciation_attempt"
            columns: ["pronunciation_attempt_id"]
            isOneToOne: false
            referencedRelation: "pronunciation_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pronunciation_attempts: {
        Row: {
          assessment_details: Json
          assessment_score: number | null
          created_at: string | null
          id: string
          is_successful: boolean
          recommendation_id: string | null
          storage_path: string
          telegram_id: number
          transcription: string | null
          transformation_id: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_details?: Json
          assessment_score?: number | null
          created_at?: string | null
          id?: string
          is_successful?: boolean
          recommendation_id?: string | null
          storage_path: string
          telegram_id: number
          transcription?: string | null
          transformation_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_details?: Json
          assessment_score?: number | null
          created_at?: string | null
          id?: string
          is_successful?: boolean
          recommendation_id?: string | null
          storage_path?: string
          telegram_id?: number
          transcription?: string | null
          transformation_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pronunciation_attempts_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pronunciation_attempts_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "pronunciation_attempts_transformation_id_fkey"
            columns: ["transformation_id"]
            isOneToOne: false
            referencedRelation: "transformations"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          content_native_language: string
          content_target_language: string
          created_at: string | null
          id: string
          message_id: string
          updated_at: string | null
        }
        Insert: {
          content_native_language: string
          content_target_language: string
          created_at?: string | null
          id?: string
          message_id: string
          updated_at?: string | null
        }
        Update: {
          content_native_language?: string
          content_target_language?: string
          created_at?: string | null
          id?: string
          message_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      transformations: {
        Row: {
          created_at: string | null
          id: string
          recommendation_id: string
          transformed_content_native_language: string
          transformed_content_target_language: string
          updated_at: string | null
          user_prompt: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          recommendation_id: string
          transformed_content_native_language: string
          transformed_content_target_language: string
          updated_at?: string | null
          user_prompt: string
        }
        Update: {
          created_at?: string | null
          id?: string
          recommendation_id?: string
          transformed_content_native_language?: string
          transformed_content_target_language?: string
          updated_at?: string | null
          user_prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "transformations_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          average_pronunciation_score: number
          created_at: string | null
          id: string
          language_id: string
          telegram_id: number
          total_conversations: number
          total_messages: number
          total_pronunciation_attempts: number
          updated_at: string | null
        }
        Insert: {
          average_pronunciation_score?: number
          created_at?: string | null
          id?: string
          language_id: string
          telegram_id: number
          total_conversations?: number
          total_messages?: number
          total_pronunciation_attempts?: number
          updated_at?: string | null
        }
        Update: {
          average_pronunciation_score?: number
          created_at?: string | null
          id?: string
          language_id?: string
          telegram_id?: number
          total_conversations?: number
          total_messages?: number
          total_pronunciation_attempts?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          first_name: string | null
          language_code: string | null
          last_name: string | null
          telegram_id: number
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          language_code?: string | null
          last_name?: string | null
          telegram_id: number
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          language_code?: string | null
          last_name?: string | null
          telegram_id?: number
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      sender_type: "user" | "agent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never