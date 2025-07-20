-- Fix appointments table - Add all missing columns
-- Run this in your Supabase SQL editor

-- Add all missing columns to appointments table
DO $$ 
BEGIN
    -- Add appointment_time column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'appointment_time') THEN
        ALTER TABLE appointments ADD COLUMN appointment_time TIME;
        RAISE NOTICE 'Added appointment_time column';
    END IF;
    
    -- Add duration_minutes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'duration_minutes') THEN
        ALTER TABLE appointments ADD COLUMN duration_minutes INTEGER DEFAULT 30;
        RAISE NOTICE 'Added duration_minutes column';
    END IF;
    
    -- Add type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'type') THEN
        ALTER TABLE appointments ADD COLUMN type VARCHAR(50);
        RAISE NOTICE 'Added type column';
    END IF;
    
    -- Add urgency column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'urgency') THEN
        ALTER TABLE appointments ADD COLUMN urgency VARCHAR(20) DEFAULT 'routine';
        RAISE NOTICE 'Added urgency column';
    END IF;
    
    -- Add reason column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'reason') THEN
        ALTER TABLE appointments ADD COLUMN reason TEXT;
        RAISE NOTICE 'Added reason column';
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'notes') THEN
        ALTER TABLE appointments ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column';
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'location') THEN
        ALTER TABLE appointments ADD COLUMN location VARCHAR(255);
        RAISE NOTICE 'Added location column';
    END IF;
    
    -- Add room_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'room_number') THEN
        ALTER TABLE appointments ADD COLUMN room_number VARCHAR(20);
        RAISE NOTICE 'Added room_number column';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'updated_at') THEN
        ALTER TABLE appointments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
    
    -- Add hospital_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'hospital_id') THEN
        ALTER TABLE appointments ADD COLUMN hospital_id UUID REFERENCES hospitals(id);
        RAISE NOTICE 'Added hospital_id column';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position; 