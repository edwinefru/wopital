-- Fix Patient Relationships Script
-- This script ensures appointments and lab results are properly linked to actual patients
-- Run this after you have created your patient profile in the mobile app

-- Step 1: First, let's check what patients exist in your database
-- Run this query to see your patient ID:
-- SELECT id, first_name, last_name, user_id FROM patients WHERE user_id = auth.uid();

-- Step 2: Create sample doctors if they don't exist
INSERT INTO doctors (first_name, last_name, specialty, license_number, phone, email, hospital_id) VALUES 
('Dr. John', 'Smith', 'Cardiology', 'MD123456', '+1234567892', 'dr.smith@cityhospital.com', 
 (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1)),
('Dr. Sarah', 'Johnson', 'Pediatrics', 'MD789012', '+1234567893', 'dr.johnson@medicalcenter.com', 
 (SELECT id FROM hospitals WHERE name = 'Medical Center' LIMIT 1)),
('Dr. Michael', 'Brown', 'Internal Medicine', 'MD345678', '+1234567894', 'dr.brown@cityhospital.com', 
 (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1)),
('Dr. Emily', 'Davis', 'Dermatology', 'MD901234', '+1234567895', 'dr.davis@medicalcenter.com', 
 (SELECT id FROM hospitals WHERE name = 'Medical Center' LIMIT 1)),
('Dr. Robert', 'Wilson', 'Orthopedics', 'MD567890', '+1234567896', 'dr.wilson@cityhospital.com', 
 (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Step 3: Create sample appointments for your patient
-- Replace 'YOUR_PATIENT_ID_HERE' with your actual patient ID from Step 1
-- Example: If your patient ID is '123e4567-e89b-12d3-a456-426614174000', use that

-- Get your patient ID (run this first to get your ID):
-- SELECT id FROM patients WHERE user_id = auth.uid();

-- Then run this with your actual patient ID:
DO $$
DECLARE
    patient_uuid UUID;
    doctor1_uuid UUID;
    doctor2_uuid UUID;
    hospital_uuid UUID;
BEGIN
    -- Get your patient ID
    SELECT id INTO patient_uuid FROM patients WHERE user_id = auth.uid() LIMIT 1;
    
    -- Get sample doctors
    SELECT id INTO doctor1_uuid FROM doctors WHERE first_name = 'Dr. John' LIMIT 1;
    SELECT id INTO doctor2_uuid FROM doctors WHERE first_name = 'Dr. Sarah' LIMIT 1;
    
    -- Get hospital
    SELECT id INTO hospital_uuid FROM hospitals WHERE name = 'City General Hospital' LIMIT 1;
    
    -- Only create appointments if patient exists
    IF patient_uuid IS NOT NULL THEN
        -- Insert appointments for your patient
        INSERT INTO appointments (patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, urgency, status, notes) VALUES
        (patient_uuid, doctor1_uuid, hospital_uuid, CURRENT_DATE + INTERVAL '7 days', '09:00', 'Annual Physical Examination', 'normal', 'scheduled', 'Routine annual check-up'),
        (patient_uuid, doctor1_uuid, hospital_uuid, CURRENT_DATE + INTERVAL '14 days', '10:30', 'Follow-up Consultation', 'normal', 'scheduled', 'Follow-up after recent visit'),
        (patient_uuid, doctor2_uuid, hospital_uuid, CURRENT_DATE + INTERVAL '21 days', '14:00', 'Specialist Consultation', 'normal', 'scheduled', 'Specialist evaluation'),
        (patient_uuid, doctor1_uuid, hospital_uuid, CURRENT_DATE - INTERVAL '7 days', '11:00', 'Blood Work Results Review', 'normal', 'completed', 'Review of recent lab results'),
        (patient_uuid, doctor1_uuid, hospital_uuid, CURRENT_DATE - INTERVAL '14 days', '15:30', 'Routine Check-up', 'normal', 'completed', 'Regular health assessment')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created 5 appointments for patient ID: %', patient_uuid;
    ELSE
        RAISE NOTICE 'No patient found for current user. Please create a patient profile first.';
    END IF;
END $$;

-- Step 4: Create sample lab results for your patient
-- This simulates the hospital entering lab results for your patient
DO $$
DECLARE
    patient_uuid UUID;
    doctor_uuid UUID;
BEGIN
    -- Get your patient ID
    SELECT id INTO patient_uuid FROM patients WHERE user_id = auth.uid() LIMIT 1;
    
    -- Get a doctor
    SELECT id INTO doctor_uuid FROM doctors WHERE first_name = 'Dr. John' LIMIT 1;
    
    -- Only create lab results if patient exists
    IF patient_uuid IS NOT NULL THEN
        -- Insert lab results for your patient
        INSERT INTO lab_results (patient_id, ordered_by, test_name, test_date, result_value, normal_range, unit, status, notes) VALUES
        (patient_uuid, doctor_uuid, 'Fasting Blood Glucose', CURRENT_DATE - INTERVAL '10 days', '95', '70-100', 'mg/dL', 'normal', 'Routine blood glucose test'),
        (patient_uuid, doctor_uuid, 'Hemoglobin', CURRENT_DATE - INTERVAL '10 days', '14.2', '12.0-15.5', 'g/dL', 'normal', 'Complete blood count'),
        (patient_uuid, doctor_uuid, 'Total Cholesterol', CURRENT_DATE - INTERVAL '10 days', '180', '<200', 'mg/dL', 'normal', 'Lipid panel'),
        (patient_uuid, doctor_uuid, 'Creatinine', CURRENT_DATE - INTERVAL '10 days', '0.9', '0.6-1.2', 'mg/dL', 'normal', 'Kidney function test'),
        (patient_uuid, doctor_uuid, 'TSH', CURRENT_DATE - INTERVAL '10 days', '2.5', '0.4-4.0', 'mIU/L', 'normal', 'Thyroid function test'),
        (patient_uuid, doctor_uuid, 'Vitamin D', CURRENT_DATE - INTERVAL '10 days', '35', '30-100', 'ng/mL', 'normal', 'Vitamin D screening'),
        (patient_uuid, doctor_uuid, 'Blood Pressure', CURRENT_DATE - INTERVAL '5 days', '120/80', '90/60-140/90', 'mmHg', 'normal', 'Blood pressure reading'),
        (patient_uuid, doctor_uuid, 'Heart Rate', CURRENT_DATE - INTERVAL '5 days', '72', '60-100', 'bpm', 'normal', 'Resting heart rate'),
        (patient_uuid, doctor_uuid, 'Temperature', CURRENT_DATE - INTERVAL '5 days', '98.6', '97.0-99.0', '°F', 'normal', 'Body temperature'),
        (patient_uuid, doctor_uuid, 'Oxygen Saturation', CURRENT_DATE - INTERVAL '5 days', '98', '95-100', '%', 'normal', 'Blood oxygen level')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created 10 lab results for patient ID: %', patient_uuid;
    ELSE
        RAISE NOTICE 'No patient found for current user. Please create a patient profile first.';
    END IF;
END $$;

-- Step 5: Create sample patient vitals
DO $$
DECLARE
    patient_uuid UUID;
    doctor_uuid UUID;
BEGIN
    -- Get your patient ID
    SELECT id INTO patient_uuid FROM patients WHERE user_id = auth.uid() LIMIT 1;
    
    -- Get a doctor
    SELECT id INTO doctor_uuid FROM doctors WHERE first_name = 'Dr. John' LIMIT 1;
    
    -- Only create vitals if patient exists
    IF patient_uuid IS NOT NULL THEN
        -- Insert patient vitals
        INSERT INTO patient_vitals (patient_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature_f, oxygen_saturation, weight_kg, height_cm, bmi, respiratory_rate, notes, recorded_by) VALUES
        (patient_uuid, 120, 80, 72, 98.6, 98, 70.5, 170, 24.4, 16, 'Normal vitals recorded during routine check-up', doctor_uuid),
        (patient_uuid, 118, 78, 75, 98.4, 97, 71.0, 170, 24.6, 15, 'Follow-up vitals check', doctor_uuid)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created 2 vital records for patient ID: %', patient_uuid;
    ELSE
        RAISE NOTICE 'No patient found for current user. Please create a patient profile first.';
    END IF;
END $$;

-- Step 6: Verify the relationships
-- Run this query to see all your appointments:
-- SELECT a.id, a.appointment_date, a.reason, a.status, p.first_name, p.last_name, d.first_name as doctor_name
-- FROM appointments a
-- JOIN patients p ON a.patient_id = p.id
-- JOIN doctors d ON a.doctor_id = d.id
-- WHERE p.user_id = auth.uid();

-- Run this query to see all your lab results:
-- SELECT lr.id, lr.test_name, lr.test_date, lr.result_value, lr.status, p.first_name, p.last_name
-- FROM lab_results lr
-- JOIN patients p ON lr.patient_id = p.id
-- WHERE p.user_id = auth.uid();

-- Run this query to see all your vitals:
-- SELECT pv.id, pv.blood_pressure_systolic, pv.heart_rate, pv.temperature_f, pv.recorded_at, p.first_name, p.last_name
-- FROM patient_vitals pv
-- JOIN patients p ON pv.patient_id = p.id
-- WHERE p.user_id = auth.uid(); 