import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from './types'

// Create a single supabase client for interacting with your database
export const supabase = createClientComponentClient<Database>()

// Export database table types for use in components
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Message = Database['public']['Tables']['messages']['Row'] 