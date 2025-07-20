-- Fix patient_vitals table schema
-- Add missing doctor_id column and fix any schema issues

-- First, let's check the current structure of patient_vitals table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patient_vitals' 
ORDER BY ordinal_position;

-- Add doctor_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patient_vitals' AND column_name = 'doctor_id'
    ) THEN
        ALTER TABLE patient_vitals ADD COLUMN doctor_id UUID;
        RAISE NOTICE 'Added doctor_id column to patient_vitals table';
    ELSE
        RAISE NOTICE 'doctor_id column already exists in patient_vitals table';
    END IF;
END $$;

-- Update the patient_vitals table structure to match the expected schema
ALTER TABLE patient_vitals 
ADD COLUMN IF NOT EXISTS doctor_id UUID,
ADD COLUMN IF NOT EXISTS blood_pressure TEXT,
ADD COLUMN IF NOT EXISTS heart_rate INTEGER,
ADD COLUMN IF NOT EXISTS temperature DECIMAL(4,1),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS oxygen_saturation INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS recorded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Show the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'patient_vitals' 
ORDER BY ordinal_position;

-- Update RLS policies for patient_vitals table
DROP POLICY IF EXISTS "Users can view their vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Users can insert vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Users can update their vitals" ON patient_vitals;

CREATE POLICY "Users can view their vitals" ON patient_vitals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = patient_vitals.patient_id
        )
    );

CREATE POLICY "Users can insert vitals" ON patient_vitals
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = patient_vitals.doctor_id
        )
    );

CREATE POLICY "Users can update their vitals" ON patient_vitals
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = patient_vitals.doctor_id
        )
    );

-- Grant permissions
GRANT ALL ON patient_vitals TO anon, authenticated; 