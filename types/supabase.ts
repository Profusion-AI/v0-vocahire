export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          interviews_count: number
          feedback_count: number
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          interviews_count?: number
          feedback_count?: number
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          interviews_count?: number
          feedback_count?: number
        }
      }
      interviews: {
        Row: {
          id: string
          user_id: string
          created_at: string
          job_title: string
          status: "pending" | "completed" | "failed"
          transcript: Json | null
          session_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          job_title: string
          status?: "pending" | "completed" | "failed"
          transcript?: Json | null
          session_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          job_title?: string
          status?: "pending" | "completed" | "failed"
          transcript?: Json | null
          session_id?: string | null
        }
      }
      feedback: {
        Row: {
          id: string
          interview_id: string
          user_id: string
          created_at: string
          content: Json
          raw_content: string | null
        }
        Insert: {
          id?: string
          interview_id: string
          user_id: string
          created_at?: string
          content: Json
          raw_content?: string | null
        }
        Update: {
          id?: string
          interview_id?: string
          user_id?: string
          created_at?: string
          content?: Json
          raw_content?: string | null
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
