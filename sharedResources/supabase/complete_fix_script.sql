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

DO $$
DECLARE
    patient_uuid UUID;
    doctor1_uuid UUID;
    doctor2_uuid UUID;
    hospital_uuid UUID;
BEGIN
    SELECT id INTO patient_uuid FROM patients WHERE user_id = auth.uid() LIMIT 1;
    SELECT id INTO doctor1_uuid FROM doctors WHERE first_name = 'Dr. John' LIMIT 1;
    SELECT id INTO doctor2_uuid FROM doctors WHERE first_name = 'Dr. Sarah' LIMIT 1;
    SELECT id INTO hospital_uuid FROM hospitals WHERE name = 'City General Hospital' LIMIT 1;
    
    IF patient_uuid IS NOT NULL THEN
        INSERT INTO appointments (patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, urgency, status, notes) VALUES
        (patient_uuid, doctor1_uuid, hospital_uuid, CURRENT_DATE + INTERVAL '7 days', '09:00', 'Annual Physical Examination', 'normal', 'scheduled', 'Routine annual check-up'),
        (patient_uuid, doctor1_uuid, hospital_uuid, CURRENT_DATE + INTERVAL '14 days', '10:30', 'Follow-up Consultation', 'normal', 'scheduled', 'Follow-up after recent visit'),
        (patient_uuid, doctor2_uuid, hospital_uuid, CURRENT_DATE + INTERVAL '21 days', '14:00', 'Specialist Consultation', 'normal', 'scheduled', 'Specialist evaluation'),
        (patient_uuid, doctor1_uuid, hospital_uuid, CURRENT_DATE - INTERVAL '7 days', '11:00', 'Blood Work Results Review', 'normal', 'completed', 'Review of recent lab results'),
        (patient_uuid, doctor1_uuid, hospital_uuid, CURRENT_DATE - INTERVAL '14 days', '15:30', 'Routine Check-up', 'normal', 'completed', 'Regular health assessment')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

DO $$
DECLARE
    patient_uuid UUID;
    doctor_uuid UUID;
BEGIN
    SELECT id INTO patient_uuid FROM patients WHERE user_id = auth.uid() LIMIT 1;
    SELECT id INTO doctor_uuid FROM doctors WHERE first_name = 'Dr. John' LIMIT 1;
    
    IF patient_uuid IS NOT NULL THEN
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
    END IF;
END $$;

DO $$
DECLARE
    patient_uuid UUID;
    doctor_uuid UUID;
BEGIN
    SELECT id INTO patient_uuid FROM patients WHERE user_id = auth.uid() LIMIT 1;
    SELECT id INTO doctor_uuid FROM doctors WHERE first_name = 'Dr. John' LIMIT 1;
    
    IF patient_uuid IS NOT NULL THEN
        INSERT INTO patient_vitals (patient_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature_f, oxygen_saturation, weight_kg, height_cm, bmi, respiratory_rate, notes, recorded_by) VALUES
        (patient_uuid, 120, 80, 72, 98.6, 98, 70.5, 170, 24.4, 16, 'Normal vitals recorded during routine check-up', doctor_uuid),
        (patient_uuid, 118, 78, 75, 98.4, 97, 71.0, 170, 24.6, 15, 'Follow-up vitals check', doctor_uuid)
        ON CONFLICT DO NOTHING;
    END IF;
END $$; 