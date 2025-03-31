import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key are required. Please check your environment variables.')
}

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(
  supabaseUrl ?? '', // Provide empty string as fallback
  supabaseAnonKey ?? '' // Provide empty string as fallback
)

// Export database table types for use in components
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Message = Database['public']['Tables']['messages']['Row'] 