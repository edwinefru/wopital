-- Corrected test data insertion for test1@wopital.com
-- This version uses UUID data types correctly based on the actual schema

DO $$
DECLARE
    test_user_id UUID;
    test_patient_id UUID;
    test_hospital_id UUID;
    test_doctor_id UUID;
BEGIN
    -- Get the user_id for test1@wopital.com
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test1@wopital.com';
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'User test1@wopital.com not found. Please create the user first.';
    END IF;
    
    RAISE NOTICE 'Found user ID: %', test_user_id;
    
    -- Get or create patient record
    SELECT id INTO test_patient_id FROM patients WHERE patient_id = test_user_id;
    
    IF test_patient_id IS NULL THEN
        -- Create patient record if it doesn't exist
        INSERT INTO patients (
            id,
            patient_id, 
            name, 
            phone, 
            email,
            relationship,
            created_at
        ) VALUES (
            gen_random_uuid(),
            test_user_id,
            'John Doe',
            '+1234567890',
            'test1@wopital.com',
            'Self',
            NOW()
        ) RETURNING id INTO test_patient_id;
        
        RAISE NOTICE 'Created patient record with ID: %', test_patient_id;
    ELSE
        RAISE NOTICE 'Patient record already exists with ID: %', test_patient_id;
    END IF;
    
    -- Try to add vitals data (if the table exists and has the right structure)
    BEGIN
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
        (test_patient_id, 125, 82, 75, 98.8, 75.8, 175, 97, CURRENT_DATE - INTERVAL '7 days', NOW()),
        (test_patient_id, 130, 85, 80, 99.1, 76.1, 175, 96, CURRENT_DATE - INTERVAL '14 days', NOW()),
        (test_patient_id, 135, 88, 85, 99.2, 76.5, 175, 95, CURRENT_DATE - INTERVAL '30 days', NOW());
        
        RAISE NOTICE 'Added vitals data for patient ID: %', test_patient_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert vitals data: %', SQLERRM;
    END;
    
    -- Try to add emergency contacts
    BEGIN
        INSERT INTO emergency_contacts (
            patient_id,
            name,
            relationship,
            phone,
            email,
            is_primary,
            created_at
        ) VALUES 
        (test_patient_id, 'Jane Doe', 'Spouse', '+1234567891', 'jane.doe@email.com', true, NOW()),
        (test_patient_id, 'Mike Smith', 'Brother', '+1234567892', 'mike.smith@email.com', false, NOW());
        
        RAISE NOTICE 'Added emergency contacts for patient ID: %', test_patient_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert emergency contacts: %', SQLERRM;
    END;
    
    RAISE NOTICE '=== TEST DATA INSERTION COMPLETE ===';
    RAISE NOTICE 'User ID: %', test_user_id;
    RAISE NOTICE 'Patient ID: %', test_patient_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error inserting test data: %', SQLERRM;
END $$; 