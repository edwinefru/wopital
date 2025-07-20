-- Insert comprehensive test data for test1@wopital.com patient
-- This will populate the dashboard with realistic medical data

-- First, let's get the user_id for test1@wopital.com
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
            emergency_contact,
            created_at
        ) VALUES (
            test_user_id,
            'John',
            'Doe',
            '+1234567890',
            '1990-05-15',
            'Male',
            'O+',
            '{"name": "Jane Doe", "phone": "+1234567891", "relationship": "Spouse"}',
            NOW()
        ) RETURNING id INTO test_patient_id;
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
    END IF;
    
    -- Insert sample appointments
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
    -- Past appointments
    (test_patient_id, test_doctor_id, test_hospital_id, 
     CURRENT_DATE - INTERVAL '7 days', '09:00:00', 'Check-up', 'completed', 
     'Regular health check-up. Patient reported feeling well.', 'normal', NOW()),
    
    (test_patient_id, test_doctor_id, test_hospital_id, 
     CURRENT_DATE - INTERVAL '14 days', '14:30:00', 'Follow-up', 'completed', 
     'Follow-up on blood pressure medication. BP improved.', 'normal', NOW()),
    
    (test_patient_id, test_doctor_id, test_hospital_id, 
     CURRENT_DATE - INTERVAL '30 days', '10:15:00', 'Consultation', 'completed', 
     'Initial consultation for chest pain. ECG and blood tests ordered.', 'high', NOW()),
    
    -- Upcoming appointments
    (test_patient_id, test_doctor_id, test_hospital_id, 
     CURRENT_DATE + INTERVAL '3 days', '11:00:00', 'Check-up', 'scheduled', 
     'Regular check-up appointment', 'normal', NOW()),
    
    (test_patient_id, test_doctor_id, test_hospital_id, 
     CURRENT_DATE + INTERVAL '14 days', '15:30:00', 'Follow-up', 'scheduled', 
     'Follow-up on medication effectiveness', 'normal', NOW());
    
    -- Insert sample prescriptions
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
     'Take with meals', 'active', CURRENT_DATE - INTERVAL '7 days', NOW()),
    
    (test_patient_id, test_doctor_id, 'Aspirin', '81mg', 'Once daily', '90 days', 
     'Take in the evening', 'active', CURRENT_DATE - INTERVAL '30 days', NOW()),
    
    (test_patient_id, test_doctor_id, 'Ibuprofen', '400mg', 'As needed', '7 days', 
     'Take for pain relief, maximum 3 times per day', 'completed', CURRENT_DATE - INTERVAL '45 days', NOW());
    
    -- Insert sample patient vitals
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
    
    -- Insert sample lab results
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
     CURRENT_DATE - INTERVAL '7 days', NOW()),
    
    (test_patient_id, 'HDL Cholesterol', '55', '40-60', 'mg/dL', 'completed', 
     CURRENT_DATE - INTERVAL '7 days', NOW()),
    
    (test_patient_id, 'LDL Cholesterol', '100', 'Less than 100', 'mg/dL', 'completed', 
     CURRENT_DATE - INTERVAL '7 days', NOW()),
    
    (test_patient_id, 'Triglycerides', '120', 'Less than 150', 'mg/dL', 'completed', 
     CURRENT_DATE - INTERVAL '7 days', NOW()),
    
    (test_patient_id, 'Hemoglobin A1c', '5.8', 'Less than 5.7', '%', 'completed', 
     CURRENT_DATE - INTERVAL '7 days', NOW());
    
    -- Insert sample diagnoses
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
     'Mild', 'active', 'Pre-diabetes, lifestyle changes recommended', NOW()),
    
    (test_patient_id, test_doctor_id, 'Upper Respiratory Infection', CURRENT_DATE - INTERVAL '45 days', 
     'Mild', 'resolved', 'Viral infection, resolved with rest and fluids', NOW());
    
    -- Insert sample medical records
    INSERT INTO medical_records (
        patient_id,
        record_type,
        title,
        description,
        file_url,
        created_at
    ) VALUES 
    (test_patient_id, 'document', 'Initial Consultation Report', 
     'Comprehensive health assessment and treatment plan', NULL, NOW()),
    
    (test_patient_id, 'image', 'Chest X-Ray', 
     'Normal chest X-ray showing clear lung fields', NULL, NOW()),
    
    (test_patient_id, 'document', 'Blood Test Results', 
     'Complete blood count and metabolic panel results', NULL, NOW()),
    
    (test_patient_id, 'document', 'Treatment Plan', 
     'Long-term treatment plan for hypertension and diabetes management', NULL, NOW());
    
    -- Insert sample emergency contacts
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
    (test_patient_id, 'Mike Smith', 'Brother', '+1234567892', 'mike.smith@email.com', false, NOW()),
    (test_patient_id, 'Dr. Sarah Johnson', 'Primary Care Physician', '+1234567893', 'sarah.johnson@hospital.com', false, NOW());
    
    RAISE NOTICE 'Successfully inserted test data for patient ID: %', test_patient_id;
    RAISE NOTICE 'User ID: %, Patient ID: %, Hospital ID: %, Doctor ID: %', 
                 test_user_id, test_patient_id, test_hospital_id, test_doctor_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error inserting test data: %', SQLERRM;
END $$; 