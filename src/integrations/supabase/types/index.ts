import type { Database as BaseDatabase } from "./base";
import type { DailyTipsTable } from "./tables/daily-tips";

export interface Database extends BaseDatabase {
  public: {
    Tables: {
      daily_tips: DailyTipsTable
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
      characters: {
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
          },
        ]
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
          content_target_language?: string;
          conversation_id?: string;
          created_at?: string | null;
          id?: string;
          is_direct_voice?: boolean;
          pronunciation_attempt_id?: string | null;
          sender_type?: Database["public"]["Enums"]["sender_type"];
          storage_path?: string | null;
          updated_at?: string | null;
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
          telegram_id: number
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
      scenarios: {
        Row: {
          category: string
          created_at: string | null
          cultural_notes: string | null
          cultural_notes_translations: Json | null
          description: string | null
          description_translations: Json | null
          id: string
          language_id: string | null
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
          language_id?: string | null
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
          language_id?: string | null
          location_details?: string | null
          location_details_translations?: Json | null
          primary_goal?: string | null
          primary_goal_translations?: string | null
          title?: string
          title_translations?: Json | null
          updated_at?: string | null
          useful_phrases?: string[] | null
          useful_phrases_translations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
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
          telegram_id: number
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
          telegram_id: number
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
    } & BaseDatabase["public"]["Tables"]
    Views: BaseDatabase["public"]["Views"]
    Functions: BaseDatabase["public"]["Functions"]
    Enums: BaseDatabase["public"]["Enums"]
    CompositeTypes: BaseDatabase["public"]["CompositeTypes"]
  }
}

export type * from "./base";
