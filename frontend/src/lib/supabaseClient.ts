
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uueyifyhwvbtqqcggnni.supabase.co'
const supabaseKey =  process.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
