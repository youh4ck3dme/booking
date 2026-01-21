
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we're in demo mode (no valid Supabase credentials OR forced via localStorage for E2E)
const forceDemo = typeof window !== 'undefined' && window.localStorage.getItem('FORCE_DEMO_MODE') === 'true';

export const isDemoMode = forceDemo || !supabaseUrl ||
    supabaseUrl === 'YOUR_SUPABASE_URL' ||
    !supabaseAnonKey ||
    supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY';

// Use a valid URL for demo mode to prevent supabase-js from throwing an error
const validSupabaseUrl = isDemoMode ? 'https://placeholder.supabase.co' : supabaseUrl;
const validSupabaseKey = isDemoMode ? 'placeholder' : supabaseAnonKey;

export const supabase = createClient(validSupabaseUrl, validSupabaseKey);
