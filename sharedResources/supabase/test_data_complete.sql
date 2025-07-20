-- Wopital Test Data - Complete Patient Records and Related Data
-- Run this in your Supabase SQL editor to populate the database with test data

-- First, let's create some hospitals
INSERT INTO hospitals (id, name, address, phone, email, website) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Central General Hospital', '123 Main Street, Accra, Ghana', '+233-20-123-4567', 'info@centralgeneral.com', 'www.centralgeneral.com'),
('550e8400-e29b-41d4-a716-446655440002', 'Korle Bu Teaching Hospital', '456 Korle Bu Road, Accra, Ghana', '+233-20-234-5678', 'contact@korlebu.edu.gh', 'www.korlebu.edu.gh'),
('550e8400-e29b-41d4-a716-446655440003', 'Ridge Hospital', '789 Ridge Avenue, Accra, Ghana', '+233-20-345-6789', 'admin@ridgehospital.com', 'www.ridgehospital.com')
ON CONFLICT (id) DO NOTHING;

-- Create some medications
INSERT INTO medications (id, name, generic_name, dosage_form, strength, manufacturer, description, side_effects) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Paracetamol', 'Acetaminophen', 'tablet', '500mg', 'GSK', 'Pain reliever and fever reducer', 'Nausea, stomach upset'),
('660e8400-e29b-41d4-a716-446655440002', 'Amoxicillin', 'Amoxicillin', 'capsule', '250mg', 'Pfizer', 'Antibiotic for bacterial infections', 'Diarrhea, nausea'),
('660e8400-e29b-41d4-a716-446655440003', 'Ibuprofen', 'Ibuprofen', 'tablet', '400mg', 'Bayer', 'Anti-inflammatory pain reliever', 'Stomach irritation'),
('660e8400-e29b-41d4-a716-446655440004', 'Omeprazole', 'Omeprazole', 'capsule', '20mg', 'AstraZeneca', 'Proton pump inhibitor for acid reflux', 'Headache, diarrhea'),
('660e8400-e29b-41d4-a716-446655440005', 'Metformin', 'Metformin', 'tablet', '500mg', 'Merck', 'Diabetes medication', 'Nausea, diarrhea')
ON CONFLICT (id) DO NOTHING;

-- Create test patients (without user_id for now - you'll need to link these to actual auth users)
INSERT INTO patients (id, first_name, last_name, phone, date_of_birth, gender, blood_type, height_cm, weight_kg, emergency_contact, hospital_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Kwame', 'Mensah', '+233-24-111-1111', '1985-03-15', 'Male', 'O+', 175.5, 75.2, '{"name": "Ama Mensah", "phone": "+233-24-111-1112", "relationship": "Wife"}', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440002', 'Ama', 'Osei', '+233-24-222-2222', '1990-07-22', 'Female', 'A+', 162.0, 58.5, '{"name": "Kofi Osei", "phone": "+233-24-222-2223", "relationship": "Husband"}', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440003', 'Kofi', 'Addo', '+233-24-333-3333', '1978-11-08', 'Male', 'B+', 180.0, 82.1, '{"name": "Efua Addo", "phone": "+233-24-333-3334", "relationship": "Sister"}', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440004', 'Efua', 'Darko', '+233-24-444-4444', '1992-05-14', 'Female', 'AB+', 168.5, 65.8, '{"name": "Yaw Darko", "phone": "+233-24-444-4445", "relationship": "Brother"}', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440005', 'Yaw', 'Owusu', '+233-24-555-5555', '1983-09-30', 'Male', 'O-', 172.0, 78.3, '{"name": "Akosua Owusu", "phone": "+233-24-555-5556", "relationship": "Wife"}', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (id) DO NOTHING;

-- Create doctors
INSERT INTO doctors (id, first_name, last_name, specialty, license_number, phone, email, hospital_id) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Dr. Sarah', 'Johnson', 'Cardiology', 'GH-MED-001', '+233-24-666-6666', 'sarah.johnson@centralgeneral.com', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440002', 'Dr. Michael', 'Chen', 'Pediatrics', 'GH-MED-002', '+233-24-777-7777', 'michael.chen@korlebu.edu.gh', '550e8400-e29b-41d4-a716-446655440002'),
('880e8400-e29b-41d4-a716-446655440003', 'Dr. Fatima', 'Ahmed', 'Internal Medicine', 'GH-MED-003', '+233-24-888-8888', 'fatima.ahmed@ridgehospital.com', '550e8400-e29b-41d4-a716-446655440003'),
('880e8400-e29b-41d4-a716-446655440004', 'Dr. David', 'Wilson', 'Orthopedics', 'GH-MED-004', '+233-24-999-9999', 'david.wilson@centralgeneral.com', '550e8400-e29b-41d4-a716-446655440001'),
('880e8400-e29b-41d4-a716-446655440005', 'Dr. Grace', 'Mensah', 'Dermatology', 'GH-MED-005', '+233-24-000-0000', 'grace.mensah@korlebu.edu.gh', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- Create patient vitals
INSERT INTO patient_vitals (id, patient_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature_f, oxygen_saturation, weight_kg, height_cm, bmi, respiratory_rate, notes, recorded_by) VALUES
('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 120, 80, 72, 98.6, 98, 75.2, 175.5, 24.5, 16, 'Normal vitals, patient in good health', '880e8400-e29b-41d4-a716-446655440001'),
('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 118, 78, 68, 98.4, 99, 58.5, 162.0, 22.3, 14, 'Excellent vitals, healthy patient', '880e8400-e29b-41d4-a716-446655440002'),
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 135, 85, 76, 99.1, 96, 82.1, 180.0, 25.4, 18, 'Slightly elevated BP, monitor closely', '880e8400-e29b-41d4-a716-446655440003'),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 110, 70, 64, 98.2, 99, 65.8, 168.5, 23.1, 15, 'Normal vitals for age and gender', '880e8400-e29b-41d4-a716-446655440004'),
('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 125, 82, 74, 98.8, 97, 78.3, 172.0, 26.5, 17, 'Good vitals, slight weight gain noted', '880e8400-e29b-41d4-a716-446655440005')
ON CONFLICT (id) DO NOTHING;

-- Create diagnoses
INSERT INTO diagnoses (id, patient_id, doctor_id, condition_name, icd_code, diagnosis_date, is_treated, treatment_notes, follow_up_date, status) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Hypertension', 'I10', '2024-01-15', true, 'Prescribed amlodipine 5mg daily, lifestyle modifications recommended', '2024-04-15', 'active'),
('aa0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 'Type 2 Diabetes', 'E11', '2024-02-20', true, 'Metformin 500mg twice daily, diet and exercise plan provided', '2024-05-20', 'active'),
('aa0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 'Acute Bronchitis', 'J20.9', '2024-03-10', true, 'Amoxicillin 500mg three times daily for 7 days', '2024-03-24', 'resolved'),
('aa0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', 'Migraine', 'G43.9', '2024-01-05', true, 'Sumatriptan 50mg as needed, stress management techniques', '2024-04-05', 'chronic'),
('aa0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', 'Dermatitis', 'L30.9', '2024-02-28', true, 'Topical corticosteroid cream, avoid irritants', '2024-05-28', 'active')
ON CONFLICT (id) DO NOTHING;

-- Create appointments
INSERT INTO appointments (id, patient_id, doctor_id, hospital_id, appointment_date, appointment_time, duration_minutes, type, status, reason, notes, location, room_number) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-07-25', '09:00:00', 30, 'consultation', 'scheduled', 'Follow-up for hypertension', 'Check blood pressure and medication effectiveness', 'Cardiology Department', 'C-101'),
('bb0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2024-07-26', '14:30:00', 45, 'follow-up', 'confirmed', 'Diabetes management', 'Review blood sugar levels and adjust medication', 'Endocrinology Clinic', 'E-205'),
('bb0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '2024-07-27', '11:15:00', 30, 'routine', 'scheduled', 'Annual checkup', 'Comprehensive health assessment', 'Internal Medicine', 'IM-103'),
('bb0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '2024-07-28', '16:00:00', 30, 'consultation', 'scheduled', 'Migraine evaluation', 'Assess frequency and severity of headaches', 'Neurology Department', 'N-301'),
('bb0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '2024-07-29', '10:30:00', 30, 'follow-up', 'scheduled', 'Skin condition review', 'Check dermatitis improvement', 'Dermatology Clinic', 'D-401')
ON CONFLICT (id) DO NOTHING;

-- Create prescriptions
INSERT INTO prescriptions (id, patient_id, doctor_id, medication_id, dosage, frequency, duration_days, prescribed_date, end_date, instructions, refills_remaining, pharmacy_name, pharmacy_phone, status) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', '20mg', 'Once daily', 30, '2024-01-15', '2024-02-15', 'Take in the morning before breakfast', 2, 'Central Pharmacy', '+233-20-111-0000', 'active'),
('cc0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', '500mg', 'Twice daily', 30, '2024-02-20', '2024-03-20', 'Take with meals to reduce stomach upset', 1, 'Korle Bu Pharmacy', '+233-20-222-0000', 'active'),
('cc0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', '500mg', 'Three times daily', 7, '2024-03-10', '2024-03-17', 'Take with plenty of water', 0, 'Ridge Pharmacy', '+233-20-333-0000', 'completed'),
('cc0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '500mg', 'As needed', 30, '2024-01-05', '2024-02-05', 'Take at first sign of migraine', 3, 'Central Pharmacy', '+233-20-111-0000', 'active'),
('cc0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', '400mg', 'Three times daily', 10, '2024-02-28', '2024-03-10', 'Take with food to prevent stomach irritation', 0, 'Korle Bu Pharmacy', '+233-20-222-0000', 'completed')
ON CONFLICT (id) DO NOTHING;

-- Create immunizations
INSERT INTO immunizations (id, patient_id, vaccine_name, administered_date, next_due_date, administered_by, lot_number, manufacturer, notes) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'COVID-19 Vaccine (Pfizer)', '2023-12-15', '2024-12-15', '880e8400-e29b-41d4-a716-446655440001', 'PF123456', 'Pfizer', 'Second booster dose'),
('dd0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Influenza Vaccine', '2023-10-20', '2024-10-20', '880e8400-e29b-41d4-a716-446655440002', 'FLU789012', 'GSK', 'Annual flu shot'),
('dd0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Tetanus Booster', '2023-08-10', '2028-08-10', '880e8400-e29b-41d4-a716-446655440003', 'TET345678', 'Sanofi', '10-year booster'),
('dd0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Hepatitis B Vaccine', '2023-06-05', '2028-06-05', '880e8400-e29b-41d4-a716-446655440004', 'HEPB901234', 'Merck', 'Complete series'),
('dd0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'Pneumococcal Vaccine', '2023-09-12', '2028-09-12', '880e8400-e29b-41d4-a716-446655440005', 'PNEU567890', 'Pfizer', 'One-time dose for adults')
ON CONFLICT (id) DO NOTHING;

-- Create payments
INSERT INTO payments (id, patient_id, appointment_id, amount, payment_date, payment_method, status, transaction_id, description) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 150.00, '2024-07-20', 'mobile_money', 'completed', 'TXN001234', 'Cardiology consultation fee'),
('ee0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', 200.00, '2024-07-21', 'card', 'completed', 'TXN002345', 'Endocrinology follow-up'),
('ee0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', 120.00, '2024-07-22', 'cash', 'completed', 'TXN003456', 'Annual checkup fee'),
('ee0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440004', 180.00, '2024-07-23', 'mobile_money', 'pending', 'TXN004567', 'Neurology consultation'),
('ee0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440005', 160.00, '2024-07-24', 'card', 'completed', 'TXN005678', 'Dermatology follow-up')
ON CONFLICT (id) DO NOTHING;

-- Create emergency contacts
INSERT INTO emergency_contacts (id, patient_id, name, relationship, phone, email, address, is_primary) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Ama Mensah', 'Wife', '+233-24-111-1112', 'ama.mensah@email.com', '123 Main Street, Accra, Ghana', true),
('ff0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Kofi Osei', 'Husband', '+233-24-222-2223', 'kofi.osei@email.com', '456 Oak Avenue, Accra, Ghana', true),
('ff0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Efua Addo', 'Sister', '+233-24-333-3334', 'efua.addo@email.com', '789 Pine Street, Accra, Ghana', true),
('ff0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Yaw Darko', 'Brother', '+233-24-444-4445', 'yaw.darko@email.com', '321 Elm Road, Accra, Ghana', true),
('ff0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'Akosua Owusu', 'Wife', '+233-24-555-5556', 'akosua.owusu@email.com', '654 Maple Drive, Accra, Ghana', true)
ON CONFLICT (id) DO NOTHING;

-- Create lab results
INSERT INTO lab_results (id, patient_id, test_name, test_date, result_value, normal_range, unit, status, ordered_by, notes) VALUES
('gg0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'Blood Glucose', '2024-07-15', 95, '70-100', 'mg/dL', 'normal', '880e8400-e29b-41d4-a716-446655440001', 'Fasting blood glucose test'),
('gg0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'HbA1c', '2024-07-16', 6.2, '4.0-5.6', '%', 'elevated', '880e8400-e29b-41d4-a716-446655440002', 'Diabetes monitoring'),
('gg0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Complete Blood Count', '2024-07-17', 12.5, '11.0-15.5', 'g/dL', 'normal', '880e8400-e29b-41d4-a716-446655440003', 'Routine health check'),
('gg0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'Cholesterol Panel', '2024-07-18', 180, '0-200', 'mg/dL', 'normal', '880e8400-e29b-41d4-a716-446655440004', 'Cardiovascular risk assessment'),
('gg0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'Liver Function Test', '2024-07-19', 25, '7-56', 'U/L', 'normal', '880e8400-e29b-41d4-a716-446655440005', 'Medication monitoring')
ON CONFLICT (id) DO NOTHING;

-- Create medical records
INSERT INTO medical_records (id, patient_id, record_type, record_date, title, description, file_url, recorded_by) VALUES
('hh0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'consultation', '2024-07-15', 'Cardiology Consultation', 'Patient presents with controlled hypertension. BP: 120/80. Medication compliance good. Lifestyle modifications discussed.', NULL, '880e8400-e29b-41d4-a716-446655440001'),
('hh0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'follow_up', '2024-07-16', 'Diabetes Follow-up', 'Blood sugar levels stable. HbA1c: 6.2%. Continue current medication regimen. Diet and exercise plan reviewed.', NULL, '880e8400-e29b-41d4-a716-446655440002'),
('hh0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'emergency', '2024-07-17', 'Emergency Visit - Chest Pain', 'Patient admitted with chest pain. ECG normal. Troponin levels negative. Discharged with follow-up instructions.', NULL, '880e8400-e29b-41d4-a716-446655440003'),
('hh0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'consultation', '2024-07-18', 'Neurology Consultation', 'Migraine frequency reduced with current treatment. Continue sumatriptan as needed. Stress management techniques effective.', NULL, '880e8400-e29b-41d4-a716-446655440004'),
('hh0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'follow_up', '2024-07-19', 'Dermatology Follow-up', 'Dermatitis significantly improved. Continue topical treatment for 2 more weeks. Avoid known irritants.', NULL, '880e8400-e29b-41d4-a716-446655440005')
ON CONFLICT (id) DO NOTHING;

-- Create appointment actions
INSERT INTO appointment_actions (id, appointment_id, action_type, action_by, action_notes, new_date, new_time) VALUES
('ii0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 'confirm', '770e8400-e29b-41d4-a716-446655440001', 'Patient confirmed appointment via phone call', NULL, NULL),
('ii0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', 'reschedule', '770e8400-e29b-41d4-a716-446655440002', 'Patient requested reschedule due to work conflict', '2024-07-27', '14:30:00'),
('ii0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', 'call', '770e8400-e29b-41d4-a716-446655440003', 'Reminder call made 24 hours before appointment', NULL, NULL),
('ii0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440004', 'confirm', '770e8400-e29b-41d4-a716-446655440004', 'Appointment confirmed via SMS', NULL, NULL),
('ii0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440005', 'call', '770e8400-e29b-41d4-a716-446655440005', 'Follow-up call to confirm appointment details', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Display summary of inserted data
SELECT 'Test Data Insertion Complete' as status;
SELECT 'Hospitals: ' || COUNT(*) as count FROM hospitals;
SELECT 'Patients: ' || COUNT(*) as count FROM patients;
SELECT 'Doctors: ' || COUNT(*) as count FROM doctors;
SELECT 'Patient Vitals: ' || COUNT(*) as count FROM patient_vitals;
SELECT 'Diagnoses: ' || COUNT(*) as count FROM diagnoses;
SELECT 'Appointments: ' || COUNT(*) as count FROM appointments;
SELECT 'Prescriptions: ' || COUNT(*) as count FROM prescriptions;
SELECT 'Immunizations: ' || COUNT(*) as count FROM immunizations;
SELECT 'Payments: ' || COUNT(*) as count FROM payments;
SELECT 'Emergency Contacts: ' || COUNT(*) as count FROM emergency_contacts;
SELECT 'Lab Results: ' || COUNT(*) as count FROM lab_results;
SELECT 'Medical Records: ' || COUNT(*) as count FROM medical_records;
SELECT 'Appointment Actions: ' || COUNT(*) as count FROM appointment_actions; 