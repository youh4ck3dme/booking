
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we're in demo mode (no valid Supabase credentials)
export const isDemoMode = !supabaseUrl ||
    supabaseUrl === 'YOUR_SUPABASE_URL' ||
    !supabaseAnonKey ||
    supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY';

// Use a valid URL for demo mode to prevent supabase-js from throwing an error
const validSupabaseUrl = isDemoMode ? 'https://placeholder.supabase.co' : supabaseUrl;
const validSupabaseKey = isDemoMode ? 'placeholder' : supabaseAnonKey;

export const supabase = createClient(validSupabaseUrl, validSupabaseKey);
