-- Add test data for existing test1@wopital.com patient
-- This script works with the actual schema we discovered

DO $$
DECLARE
    test_user_id UUID;
    test_patient_id UUID;
BEGIN
    -- Get the user_id for test1@wopital.com
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test1@wopital.com';
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'User test1@wopital.com not found. Please create the user first.';
    END IF;
    
    RAISE NOTICE 'Found user ID: %', test_user_id;
    
    -- Get the existing patient record
    SELECT id INTO test_patient_id FROM patients WHERE user_id = test_user_id;
    
    IF test_patient_id IS NULL THEN
        RAISE EXCEPTION 'Patient record for test1@wopital.com not found.';
    END IF;
    
    RAISE NOTICE 'Found existing patient record with ID: %', test_patient_id;
    
    -- Update the patient record with more complete information
    UPDATE patients SET
        first_name = 'John',
        last_name = 'Doe',
        phone = '+1234567890',
        date_of_birth = '1990-05-15',
        gender = 'Male',
        blood_type = 'O+',
        height_cm = 175,
        weight_kg = 75.5,
        allergies = 'None known',
        emergency_contact = '{"name": "Jane Doe", "phone": "+1234567891", "relationship": "Spouse"}',
        updated_at = NOW()
    WHERE id = test_patient_id;
    
    RAISE NOTICE 'Updated patient record with complete information';
    
    -- Try to add vitals data (if the table exists)
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
    
    -- Try to add appointments (if the table exists)
    BEGIN
        -- First, get or create a hospital
        DECLARE
            test_hospital_id UUID;
            test_doctor_id UUID;
        BEGIN
            SELECT id INTO test_hospital_id FROM hospitals LIMIT 1;
            
            IF test_hospital_id IS NULL THEN
                INSERT INTO hospitals (
                    id,
                    name, 
                    address, 
                    phone, 
                    email, 
                    subscription_status,
                    created_at
                ) VALUES (
                    gen_random_uuid(),
                    'General Hospital',
                    '123 Medical Center Dr, City, State 12345',
                    '+1234567890',
                    'info@generalhospital.com',
                    'active',
                    NOW()
                ) RETURNING id INTO test_hospital_id;
            END IF;
            
            -- Get or create a doctor
            SELECT id INTO test_doctor_id FROM doctors WHERE hospital_id = test_hospital_id LIMIT 1;
            
            IF test_doctor_id IS NULL THEN
                INSERT INTO doctors (
                    id,
                    hospital_id,
                    first_name,
                    last_name,
                    specialization,
                    phone,
                    email,
                    created_at
                ) VALUES (
                    gen_random_uuid(),
                    test_hospital_id,
                    'Dr. Sarah',
                    'Johnson',
                    'Cardiology',
                    '+1234567892',
                    'sarah.johnson@generalhospital.com',
                    NOW()
                ) RETURNING id INTO test_doctor_id;
            END IF;
            
            -- Add appointments
            INSERT INTO appointments (
                id,
                patient_id,
                doctor_id,
                hospital_id,
                appointment_date,
                appointment_time,
                appointment_type,
                status,
                notes,
                urgency,
                created_at
            ) VALUES 
            (gen_random_uuid(), test_patient_id, test_doctor_id, test_hospital_id, 
             CURRENT_DATE - INTERVAL '7 days', '09:00:00', 'Check-up', 'completed', 
             'Regular health check-up. Patient reported feeling well.', 'normal', NOW()),
            
            (gen_random_uuid(), test_patient_id, test_doctor_id, test_hospital_id, 
             CURRENT_DATE + INTERVAL '3 days', '11:00:00', 'Check-up', 'scheduled', 
             'Regular check-up appointment', 'normal', NOW());
            
            RAISE NOTICE 'Added appointments for patient ID: %', test_patient_id;
        END;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert appointments: %', SQLERRM;
    END;
    
    -- Try to add prescriptions
    BEGIN
        INSERT INTO prescriptions (
            id,
            patient_id,
            doctor_id,
            medication_name,
            dosage,
            frequency,
            duration,
            instructions,
            status,
            prescribed_date,
            created_at
        ) VALUES 
        (gen_random_uuid(), test_patient_id, test_doctor_id, 'Lisinopril', '10mg', 'Once daily', '30 days', 
         'Take in the morning with food', 'active', CURRENT_DATE - INTERVAL '14 days', NOW()),
        
        (gen_random_uuid(), test_patient_id, test_doctor_id, 'Metformin', '500mg', 'Twice daily', '30 days', 
         'Take with meals', 'active', CURRENT_DATE - INTERVAL '7 days', NOW());
        
        RAISE NOTICE 'Added prescriptions for patient ID: %', test_patient_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert prescriptions: %', SQLERRM;
    END;
    
    RAISE NOTICE '=== TEST DATA INSERTION COMPLETE ===';
    RAISE NOTICE 'User ID: %', test_user_id;
    RAISE NOTICE 'Patient ID: %', test_patient_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error inserting test data: %', SQLERRM;
END $$; 