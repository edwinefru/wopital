-- Add missing columns to patients table
-- Run this in your Supabase SQL editor

-- Add height_cm column
ALTER TABLE patients ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2);

-- Add weight_kg column  
ALTER TABLE patients ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2);

-- Add emergency_contact column
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact JSONB;

-- Add hospital_id column
ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id);

-- Add avatar_url column
ALTER TABLE patients ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add updated_at column
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position; 