import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Graceful handling of missing environment variables
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Using placeholder client.')
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file')
  
  // Create a placeholder client to prevent app crashes
  supabase = createClient(
    'https://placeholder.supabase.co', 
    'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'arcade-learn-auth',
      storage: window.localStorage
    }
  })
}

export { supabase }

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_game_data: {
        Row: {
          id: string
          user_id: string
          total_xp: number
          level: number
          current_streak: number
          longest_streak: number
          last_active_date: string
          total_components_completed: number
          completed_roadmaps: string[]
          completed_components: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          last_active_date?: string
          total_components_completed?: number
          completed_roadmaps?: string[]
          completed_components?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          last_active_date?: string
          total_components_completed?: number
          completed_roadmaps?: string[]
          completed_components?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          created_at?: string
        }
      }
      ai_chats: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_messages: {
        Row: {
          id: string
          chat_id: string
          type: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          type: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          type?: string
          content?: string
          created_at?: string
        }
      }
      parsed_resumes: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_size: number
          file_url: string | null
          resume_data: any
          parser_version: string
          parsing_accuracy_score: number | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_size: number
          file_url?: string | null
          resume_data: any
          parser_version?: string
          parsing_accuracy_score?: number | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_size?: number
          file_url?: string | null
          resume_data?: any
          parser_version?: string
          parsing_accuracy_score?: number | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      resume_edit_history: {
        Row: {
          id: string
          resume_id: string
          field_path: string
          old_value: string | null
          new_value: string | null
          edited_at: string
          edit_reason: string
          edited_by: string | null
        }
        Insert: {
          id?: string
          resume_id: string
          field_path: string
          old_value?: string | null
          new_value?: string | null
          edited_at?: string
          edit_reason?: string
          edited_by?: string | null
        }
        Update: {
          id?: string
          resume_id?: string
          field_path?: string
          old_value?: string | null
          new_value?: string | null
          edited_at?: string
          edit_reason?: string
          edited_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
