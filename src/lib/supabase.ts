import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  return createClientComponentClient()
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          full_name: string | null
          avatar_url: string | null
          headline: string | null
          bio: string | null
          skills: string[] | null
          industry: string | null
          looking_for: string[] | null
        }
        Insert: {
          id: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          headline?: string | null
          bio?: string | null
          skills?: string[] | null
          industry?: string | null
          looking_for?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string | null
          avatar_url?: string | null
          headline?: string | null
          bio?: string | null
          skills?: string[] | null
          industry?: string | null
          looking_for?: string[] | null
        }
      }
      matches: {
        Row: {
          id: string
          created_at: string
          profile_id_1: string
          profile_id_2: string
          status: 'pending' | 'accepted' | 'rejected'
        }
        Insert: {
          id?: string
          created_at?: string
          profile_id_1: string
          profile_id_2: string
          status?: 'pending' | 'accepted' | 'rejected'
        }
        Update: {
          id?: string
          created_at?: string
          profile_id_1?: string
          profile_id_2?: string
          status?: 'pending' | 'accepted' | 'rejected'
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
        }
      }
    }
  }
} 