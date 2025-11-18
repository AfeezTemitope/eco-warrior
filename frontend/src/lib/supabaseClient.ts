import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uueyifyhwvbtqqcggnni.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseKey) {
    throw new Error('Missing Supabase anon key')
}

export const supabase = createClient(supabaseUrl, supabaseKey)