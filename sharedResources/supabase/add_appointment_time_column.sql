-- Add missing columns to appointments table
-- Run this in your Supabase SQL editor

-- Add appointment_time column if it doesn't exist
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time TIME;

-- Add other missing columns that might not exist
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'routine';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS room_number VARCHAR(20);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position; 