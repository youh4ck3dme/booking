// BookFlow API - Database Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

// Check if we're in demo mode (no valid Supabase credentials)
export const isDemoMode = !supabaseUrl || !supabaseServiceKey;

if (isDemoMode) {
    console.warn('⚠️ Missing Supabase credentials. Running in DEMO MODE with mock data.');
}

// Use placeholder URL for demo mode to prevent supabase-js from throwing
const validUrl = isDemoMode ? 'https://placeholder.supabase.co' : supabaseUrl;
const validKey = isDemoMode ? 'placeholder-key' : supabaseServiceKey;

// Use service role key for full access (server-side only!)
export const supabase = createClient(validUrl, validKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

