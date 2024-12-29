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
      characters: {
        Row: {
          age: number | null
          avatar_url: string | null
          bio: string | null
          bio_translations: Json | null
          city_id: string | null
          created_at: string | null
          gender: string | null
          id: string
          language_style: string[] | null
          language_style_translations: Json | null
          localized_image_url: string | null
          name: string
          name_translations: Json | null
          scenario_id: string | null
          updated_at: string | null
          voice_id: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bio_translations?: Json | null
          city_id?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          language_style?: string[] | null
          language_style_translations?: Json | null
          localized_image_url?: string | null
          name: string
          name_translations?: Json | null
          scenario_id?: string | null
          updated_at?: string | null
          voice_id?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          bio_translations?: Json | null
          city_id?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          language_style?: string[] | null
          language_style_translations?: Json | null
          localized_image_url?: string | null
          name?: string
          name_translations?: Json | null
          scenario_id?: string | null
          updated_at?: string | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "characters_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country: string
          created_at: string | null
          cultural_notes: string | null
          id: string
          language_id: string | null
          local_slang: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          country: string
          created_at?: string | null
          cultural_notes?: string | null
          id?: string
          language_id?: string | null
          local_slang?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          cultural_notes?: string | null
          id?: string
          language_id?: string | null
          local_slang?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tips: {
        Row: {
          created_at: string | null
          cultural_context: string | null
          id: string
          language_code: string
          tip_text: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cultural_context?: string | null
          id?: string
          language_code: string
          tip_text: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cultural_context?: string | null
          id?: string
          language_code?: string
          tip_text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_tips_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
        ]
      }
      default_scenarios: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          title: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      guided_conversation_messages: {
        Row: {
          audio_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_user: boolean
          pronunciation_data: Json | null
          pronunciation_score: number | null
          reference_audio_url: string | null
          sentence_count: number | null
          translation: string | null
          transliteration: string | null
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_user?: boolean
          pronunciation_data?: Json | null
          pronunciation_score?: number | null
          reference_audio_url?: string | null
          sentence_count?: number | null
          translation?: string | null
          transliteration?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_user?: boolean
          pronunciation_data?: Json | null
          pronunciation_score?: number | null
          reference_audio_url?: string | null
          sentence_count?: number | null
          translation?: string | null
          transliteration?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guided_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversation_analytics"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "guided_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "guided_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      guided_conversations: {
        Row: {
          character_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          metrics: Json | null
          native_language_id: string
          scenario_id: string
          status: string
          target_language_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          character_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metrics?: Json | null
          native_language_id: string
          scenario_id: string
          status?: string
          target_language_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          character_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          metrics?: Json | null
          native_language_id?: string
          scenario_id?: string
          status?: string
          target_language_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guided_conversations_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guided_conversations_native_language_id_fkey"
            columns: ["native_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guided_conversations_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guided_conversations_target_language_id_fkey"
            columns: ["target_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          emoji: string | null
          features: string | null
          female_voice: string | null
          id: string
          male_voice: string | null
          name: string
          output_format: string | null
          sample_rate: number | null
          shortname_female: string | null
          shortname_male: string | null
          style_list: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          emoji?: string | null
          features?: string | null
          female_voice?: string | null
          id?: string
          male_voice?: string | null
          name: string
          output_format?: string | null
          sample_rate?: number | null
          shortname_female?: string | null
          shortname_male?: string | null
          style_list?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          emoji?: string | null
          features?: string | null
          female_voice?: string | null
          id?: string
          male_voice?: string | null
          name?: string
          output_format?: string | null
          sample_rate?: number | null
          shortname_female?: string | null
          shortname_male?: string | null
          style_list?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          custom_goals: string[] | null
          full_name: string | null
          id: string
          languages_learning: string[] | null
          learning_goals: string[] | null
          native_language: string | null
          onboarding_completed: boolean | null
          target_language: string | null
          updated_at: string
          username: string | null
          voice_preference: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          custom_goals?: string[] | null
          full_name?: string | null
          id: string
          languages_learning?: string[] | null
          learning_goals?: string[] | null
          native_language?: string | null
          onboarding_completed?: boolean | null
          target_language?: string | null
          updated_at?: string
          username?: string | null
          voice_preference?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          custom_goals?: string[] | null
          full_name?: string | null
          id?: string
          languages_learning?: string[] | null
          learning_goals?: string[] | null
          native_language?: string | null
          onboarding_completed?: boolean | null
          target_language?: string | null
          updated_at?: string
          username?: string | null
          voice_preference?: string | null
        }
        Relationships: []
      }
      scenario_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          language_code: string | null
          region: string | null
          scenario_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          language_code?: string | null
          region?: string | null
          scenario_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          language_code?: string | null
          region?: string | null
          scenario_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_images_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "scenario_images_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "default_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          category: string
          created_at: string | null
          cultural_notes: string | null
          cultural_notes_translations: Json | null
          description: string | null
          description_translations: Json | null
          id: string
          location_details: string | null
          location_details_translations: Json | null
          primary_goal: string | null
          primary_goal_translations: Json | null
          title: string
          title_translations: Json | null
          updated_at: string | null
          useful_phrases: string[] | null
          useful_phrases_translations: Json | null
        }
        Insert: {
          category: string
          created_at?: string | null
          cultural_notes?: string | null
          cultural_notes_translations?: Json | null
          description?: string | null
          description_translations?: Json | null
          id?: string
          location_details?: string | null
          location_details_translations?: Json | null
          primary_goal?: string | null
          primary_goal_translations?: Json | null
          title: string
          title_translations?: Json | null
          updated_at?: string | null
          useful_phrases?: string[] | null
          useful_phrases_translations?: Json | null
        }
        Update: {
          category?: string
          created_at?: string | null
          cultural_notes?: string | null
          cultural_notes_translations?: Json | null
          description?: string | null
          description_translations?: Json | null
          id?: string
          location_details?: string | null
          location_details_translations?: Json | null
          primary_goal?: string | null
          primary_goal_translations?: Json | null
          title?: string
          title_translations?: Json | null
          updated_at?: string | null
          useful_phrases?: string[] | null
          useful_phrases_translations?: Json | null
        }
        Relationships: []
      }
      script_messages: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string | null
          id: string
          line_number: number
          pronunciation_data: Json | null
          pronunciation_score: number | null
          reference_audio_url: string | null
          script_template_id: string | null
          sentence_count: number
          speaker: string | null
          translation: string | null
          transliteration: string | null
          updated_at: string | null
          user_audio_url: string | null
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          line_number: number
          pronunciation_data?: Json | null
          pronunciation_score?: number | null
          reference_audio_url?: string | null
          script_template_id?: string | null
          sentence_count?: number
          speaker?: string | null
          translation?: string | null
          transliteration?: string | null
          updated_at?: string | null
          user_audio_url?: string | null
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          line_number?: number
          pronunciation_data?: Json | null
          pronunciation_score?: number | null
          reference_audio_url?: string | null
          script_template_id?: string | null
          sentence_count?: number
          speaker?: string | null
          translation?: string | null
          transliteration?: string | null
          updated_at?: string | null
          user_audio_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "script_messages_script_template_id_fkey"
            columns: ["script_template_id"]
            isOneToOne: false
            referencedRelation: "script_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      script_templates: {
        Row: {
          character_id: string | null
          city_id: string | null
          created_at: string | null
          id: string
          scenario_id: string | null
          updated_at: string | null
          user_gender: string | null
        }
        Insert: {
          character_id?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          scenario_id?: string | null
          updated_at?: string | null
          user_gender?: string | null
        }
        Update: {
          character_id?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string
          scenario_id?: string | null
          updated_at?: string | null
          user_gender?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "script_templates_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "script_templates_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "script_templates_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string | null
          description: string | null
          description_translations: Json | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          title: string
          title_translations: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          description_translations?: Json | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title: string
          title_translations?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          description_translations?: Json | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          title?: string
          title_translations?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tts_cache: {
        Row: {
          audio_url: string | null
          audio_url_normal: string | null
          audio_url_slow: string | null
          audio_url_very_slow: string | null
          created_at: string | null
          id: string
          language_code: string
          text_content: string
          text_hash: string
          updated_at: string | null
          voice_gender: string
        }
        Insert: {
          audio_url?: string | null
          audio_url_normal?: string | null
          audio_url_slow?: string | null
          audio_url_very_slow?: string | null
          created_at?: string | null
          id?: string
          language_code: string
          text_content: string
          text_hash: string
          updated_at?: string | null
          voice_gender: string
        }
        Update: {
          audio_url?: string | null
          audio_url_normal?: string | null
          audio_url_slow?: string | null
          audio_url_very_slow?: string | null
          created_at?: string | null
          id?: string
          language_code?: string
          text_content?: string
          text_hash?: string
          updated_at?: string | null
          voice_gender?: string
        }
        Relationships: []
      }
      user_scenarios: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          scenario_id: string
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          scenario_id: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          scenario_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_scenarios_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      conversation_analytics: {
        Row: {
          ai_messages: number | null
          avg_pronunciation_score: number | null
          conversation_id: string | null
          native_language_id: string | null
          target_language_id: string | null
          total_messages: number | null
          total_sentences: number | null
          user_id: string | null
          user_messages: number | null
        }
        Relationships: [
          {
            foreignKeyName: "guided_conversations_native_language_id_fkey"
            columns: ["native_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guided_conversations_target_language_id_fkey"
            columns: ["target_language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
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
