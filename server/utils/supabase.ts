import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient() {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.supabaseUrl
  const supabaseKey = config.supabaseServiceKey || config.public.supabaseAnonKey

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be set in environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}
