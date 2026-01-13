-- BookFlow API - Multi-Location Migration
-- Phase 1: Database & API Foundation
-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    business_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "tuesday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "wednesday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "thursday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "friday": {"open": "09:00", "close": "17:00", "is_closed": false},
        "saturday": {"open": "09:00", "close": "12:00", "is_closed": false},
        "sunday": {"open": "00:00", "close": "00:00", "is_closed": true}
    }'::jsonb,
    coordinates POINT,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add location_id to existing tables
ALTER TABLE services
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE CASCADE;
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE
SET NULL;
-- Enable RLS on locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
-- Migration logic for existing data (optional/demo)
-- Note: In a production environment, you would create a default location and link existing data here.
-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_location_id ON services(location_id);
CREATE INDEX IF NOT EXISTS idx_employees_location_id ON employees(location_id);
CREATE INDEX IF NOT EXISTS idx_bookings_location_id ON bookings(location_id);
CREATE INDEX IF NOT EXISTS idx_locations_api_key_id ON locations(api_key_id);