-- Fixed test data insertion for test1@wopital.com
-- This version handles UUID and integer data types correctly

DO $$
DECLARE
    test_user_id UUID;
    test_patient_id INTEGER;
    test_hospital_id INTEGER;
    test_doctor_id INTEGER;
BEGIN
    -- Get the user_id for test1@wopital.com
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test1@wopital.com';
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'User test1@wopital.com not found. Please create the user first.';
    END IF;
    
    RAISE NOTICE 'Found user ID: %', test_user_id;
    
    -- Get or create patient record
    SELECT id INTO test_patient_id FROM patients WHERE user_id = test_user_id;
    
    IF test_patient_id IS NULL THEN
        -- Create patient record if it doesn't exist
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
    
    -- Get a hospital (use the first one available)
    SELECT id INTO test_hospital_id FROM hospitals LIMIT 1;
    
    IF test_hospital_id IS NULL THEN
        -- Create a sample hospital if none exists
        INSERT INTO hospitals (
            name, 
            address, 
            phone, 
            email, 
            subscription_status,
            created_at
        ) VALUES (
            'General Hospital',
            '123 Medical Center Dr, City, State 12345',
            '+1234567890',
            'info@generalhospital.com',
            'active',
            NOW()
        ) RETURNING id INTO test_hospital_id;
        
        RAISE NOTICE 'Created hospital with ID: %', test_hospital_id;
    ELSE
        RAISE NOTICE 'Using existing hospital with ID: %', test_hospital_id;
    END IF;
    
    -- Get or create a doctor
    SELECT id INTO test_doctor_id FROM doctors WHERE hospital_id = test_hospital_id LIMIT 1;
    
    IF test_doctor_id IS NULL THEN
        -- Create a sample doctor if none exists
        INSERT INTO doctors (
            hospital_id,
            first_name,
            last_name,
            specialization,
            phone,
            email,
            created_at
        ) VALUES (
            test_hospital_id,
            'Dr. Sarah',
            'Johnson',
            'Cardiology',
            '+1234567892',
            'sarah.johnson@generalhospital.com',
            NOW()
        ) RETURNING id INTO test_doctor_id;
        
        RAISE NOTICE 'Created doctor with ID: %', test_doctor_id;
    ELSE
        RAISE NOTICE 'Using existing doctor with ID: %', test_doctor_id;
    END IF;
    
    -- Insert sample patient vitals (this should work)
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
    
    -- Try to insert appointments (check if table exists and has correct structure)
    BEGIN
        INSERT INTO appointments (
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
        (test_patient_id, test_doctor_id, test_hospital_id, 
         CURRENT_DATE - INTERVAL '7 days', '09:00:00', 'Check-up', 'completed', 
         'Regular health check-up. Patient reported feeling well.', 'normal', NOW()),
        
        (test_patient_id, test_doctor_id, test_hospital_id, 
         CURRENT_DATE + INTERVAL '3 days', '11:00:00', 'Check-up', 'scheduled', 
         'Regular check-up appointment', 'normal', NOW());
        
        RAISE NOTICE 'Added appointments for patient ID: %', test_patient_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert appointments: %', SQLERRM;
    END;
    
    -- Try to insert prescriptions
    BEGIN
        INSERT INTO prescriptions (
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
        (test_patient_id, test_doctor_id, 'Lisinopril', '10mg', 'Once daily', '30 days', 
         'Take in the morning with food', 'active', CURRENT_DATE - INTERVAL '14 days', NOW()),
        
        (test_patient_id, test_doctor_id, 'Metformin', '500mg', 'Twice daily', '30 days', 
         'Take with meals', 'active', CURRENT_DATE - INTERVAL '7 days', NOW());
        
        RAISE NOTICE 'Added prescriptions for patient ID: %', test_patient_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert prescriptions: %', SQLERRM;
    END;
    
    -- Try to insert lab results
    BEGIN
        INSERT INTO lab_results (
            patient_id,
            test_name,
            test_result,
            normal_range,
            unit,
            status,
            test_date,
            created_at
        ) VALUES 
        (test_patient_id, 'Complete Blood Count', 'Normal', 'Normal', 'N/A', 'completed', 
         CURRENT_DATE - INTERVAL '7 days', NOW()),
        
        (test_patient_id, 'Blood Glucose', '95', '70-100', 'mg/dL', 'completed', 
         CURRENT_DATE - INTERVAL '7 days', NOW()),
        
        (test_patient_id, 'Cholesterol Total', '180', 'Less than 200', 'mg/dL', 'completed', 
         CURRENT_DATE - INTERVAL '7 days', NOW());
        
        RAISE NOTICE 'Added lab results for patient ID: %', test_patient_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert lab results: %', SQLERRM;
    END;
    
    -- Try to insert diagnoses
    BEGIN
        INSERT INTO diagnoses (
            patient_id,
            doctor_id,
            diagnosis_name,
            diagnosis_date,
            severity,
            status,
            notes,
            created_at
        ) VALUES 
        (test_patient_id, test_doctor_id, 'Hypertension', CURRENT_DATE - INTERVAL '30 days', 
         'Mild', 'active', 'Stage 1 hypertension, monitoring required', NOW()),
        
        (test_patient_id, test_doctor_id, 'Type 2 Diabetes', CURRENT_DATE - INTERVAL '30 days', 
         'Mild', 'active', 'Pre-diabetes, lifestyle changes recommended', NOW());
        
        RAISE NOTICE 'Added diagnoses for patient ID: %', test_patient_id;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not insert diagnoses: %', SQLERRM;
    END;
    
    -- Try to insert emergency contacts
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
    RAISE NOTICE 'Hospital ID: %', test_hospital_id;
    RAISE NOTICE 'Doctor ID: %', test_doctor_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error inserting test data: %', SQLERRM;
END $$; 