-- Simple test data insertion for test1@wopital.com
-- This adds basic data that should work with the current schema

-- First, ensure we have the user
DO $$
DECLARE
    test_user_id UUID;
    test_patient_id INTEGER;
BEGIN
    -- Get the user_id for test1@wopital.com
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test1@wopital.com';
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'User test1@wopital.com not found. Please create the user first.';
    END IF;
    
    -- Create or get patient record
    SELECT id INTO test_patient_id FROM patients WHERE user_id = test_user_id;
    
    IF test_patient_id IS NULL THEN
        -- Create basic patient record
        INSERT INTO patients (
            user_id, 
            first_name, 
            last_name, 
            phone, 
            date_of_birth, 
            gender, 
            blood_type,
            created_at
        ) VALUES (
            test_user_id,
            'John',
            'Doe',
            '+1234567890',
            '1990-05-15',
            'Male',
            'O+',
            NOW()
        ) RETURNING id INTO test_patient_id;
        
        RAISE NOTICE 'Created patient record with ID: %', test_patient_id;
    ELSE
        RAISE NOTICE 'Patient record already exists with ID: %', test_patient_id;
    END IF;
    
    -- Add some basic vitals data
    INSERT INTO patient_vitals (
        patient_id,
        blood_pressure_systolic,
        blood_pressure_diastolic,
        heart_rate,
        temperature,
        weight,
        height,
        oxygen_saturation,
        recorded_date,
        created_at
    ) VALUES 
    (test_patient_id, 120, 80, 72, 98.6, 75.5, 175, 98, CURRENT_DATE - INTERVAL '1 day', NOW()),
    (test_patient_id, 118, 78, 70, 98.4, 75.2, 175, 99, CURRENT_DATE - INTERVAL '3 days', NOW()),
    (test_patient_id, 125, 82, 75, 98.8, 75.8, 175, 97, CURRENT_DATE - INTERVAL '7 days', NOW());
    
    RAISE NOTICE 'Added vitals data for patient ID: %', test_patient_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error: %', SQLERRM;
END $$; 