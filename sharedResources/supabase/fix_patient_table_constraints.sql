-- Fix patients table constraints and create patient record
-- Run this in your Supabase SQL editor

-- Step 1: Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'patients_user_id_key' 
        AND conrelid = 'patients'::regclass
    ) THEN
        ALTER TABLE patients ADD CONSTRAINT patients_user_id_key UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint on user_id';
    END IF;
END $$;

-- Step 2: Create your patient record
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
INSERT INTO patients (
    user_id,
    first_name,
    last_name,
    phone,
    date_of_birth,
    gender,
    blood_type,
    height_cm,
    weight_kg,
    emergency_contact,
    created_at
) VALUES (
    'YOUR_USER_ID_HERE', -- Replace with your actual user ID
    'Edwin', -- Your first name
    'Efru', -- Your last name
    '+1234567890', -- Your phone number
    '1990-01-01', -- Your date of birth
    'Male', -- Your gender
    'O+', -- Your blood type
    175.0, -- Your height in cm
    70.0, -- Your weight in kg
    '{"name": "Emergency Contact", "phone": "+1234567890", "relationship": "Family"}'::jsonb,
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    blood_type = EXCLUDED.blood_type,
    height_cm = EXCLUDED.height_cm,
    weight_kg = EXCLUDED.weight_kg,
    emergency_contact = EXCLUDED.emergency_contact,
    updated_at = NOW();

-- Step 3: Verify the patient was created
SELECT * FROM patients WHERE user_id = 'YOUR_USER_ID_HERE'; 