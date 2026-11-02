import { createClient } from '@supabase/supabase-js'
// These two values are PUBLIC by design (publishable key). Row Level Security protects the data.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = url && key ? createClient(url, key) : null
