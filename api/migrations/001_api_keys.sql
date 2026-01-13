-- BookFlow API - Database Migration
-- Run this in Supabase SQL Editor
-- ===========================================
-- API Keys Table
-- ===========================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    prefix TEXT NOT NULL,
    organization_id UUID,
    allowed_origins TEXT [] DEFAULT ARRAY ['*']::TEXT [],
    rate_limit INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);
-- Index for faster key lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(prefix);
-- ===========================================
-- Widget Configurations Table
-- ===========================================
CREATE TABLE IF NOT EXISTS widget_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
    primary_color TEXT DEFAULT '#3B82F6',
    show_employees BOOLEAN DEFAULT TRUE,
    show_prices BOOLEAN DEFAULT TRUE,
    locale TEXT DEFAULT 'sk',
    custom_css TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- One config per API key
CREATE UNIQUE INDEX IF NOT EXISTS idx_widget_configs_api_key ON widget_configs(api_key_id);
-- ===========================================
-- Row Level Security (RLS)
-- ===========================================
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;
-- Service role has full access (for API server)
CREATE POLICY "Service role full access on api_keys" ON api_keys FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on widget_configs" ON widget_configs FOR ALL USING (auth.role() = 'service_role');
-- ===========================================
-- Helper Function: Generate API Key
-- ===========================================
CREATE OR REPLACE FUNCTION generate_api_key(
        key_name TEXT,
        origins TEXT [] DEFAULT ARRAY ['*']::TEXT []
    ) RETURNS TABLE(api_key TEXT, key_id UUID) AS $$
DECLARE new_key TEXT;
new_id UUID;
key_prefix TEXT;
hashed_key TEXT;
BEGIN -- Generate random key: bf_live_xxxxxxxxxxxxxxxxxxxx
new_key := 'bf_live_' || encode(gen_random_bytes(24), 'hex');
key_prefix := substring(
    new_key
    from 1 for 8
);
hashed_key := encode(sha256(new_key::bytea), 'hex');
INSERT INTO api_keys (name, key_hash, prefix, allowed_origins)
VALUES (key_name, hashed_key, key_prefix, origins)
RETURNING id INTO new_id;
RETURN QUERY
SELECT new_key,
    new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ===========================================
-- Usage Example (run to generate test key):
-- ===========================================
-- SELECT * FROM generate_api_key('My WordPress Site', ARRAY['https://mysite.com']);