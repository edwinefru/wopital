-- Insert Sample Patients and Doctors
-- This script adds realistic patients and doctors to support the mock data

-- Insert Sample Patients
INSERT INTO patients (user_id, first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, blood_type, allergies, medical_history, insurance_provider, insurance_number) VALUES
-- Patient 1 (Healthy patient)
('user_1_uuid', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+1-555-0101', '1985-03-15', 'Female', '123 Main St, Anytown, USA', 'John Johnson', '+1-555-0102', 'O+', 'Penicillin', 'None significant', 'Blue Cross Blue Shield', 'BCBS123456789'),

-- Patient 2 (Patient with health issues)
('user_2_uuid', 'Michael', 'Chen', 'michael.chen@email.com', '+1-555-0201', '1978-07-22', 'Male', '456 Oak Ave, Somewhere, USA', 'Lisa Chen', '+1-555-0202', 'A-', 'Sulfa drugs', 'Diabetes, Hypertension', 'Aetna', 'AETNA987654321'),

-- Additional patients for variety
('user_3_uuid', 'Emily', 'Rodriguez', 'emily.rodriguez@email.com', '+1-555-0301', '1992-11-08', 'Female', '789 Pine Rd, Elsewhere, USA', 'Carlos Rodriguez', '+1-555-0302', 'B+', 'Latex', 'Asthma', 'Cigna', 'CIGNA456789123'),

('user_4_uuid', 'David', 'Thompson', 'david.thompson@email.com', '+1-555-0401', '1965-09-14', 'Male', '321 Elm St, Nowhere, USA', 'Mary Thompson', '+1-555-0402', 'AB+', 'None', 'Heart disease, High cholesterol', 'UnitedHealth', 'UHC789123456'),

('user_5_uuid', 'Jennifer', 'Williams', 'jennifer.williams@email.com', '+1-555-0501', '1988-12-03', 'Female', '654 Maple Dr, Anywhere, USA', 'Robert Williams', '+1-555-0502', 'O-', 'Peanuts', 'Migraines', 'Humana', 'HUMANA321654987'),

('user_6_uuid', 'James', 'Brown', 'james.brown@email.com', '+1-555-0601', '1972-04-18', 'Male', '987 Cedar Ln, Someplace, USA', 'Patricia Brown', '+1-555-0602', 'A+', 'Shellfish', 'Diabetes, Kidney disease', 'Kaiser Permanente', 'KP147258369'),

('user_7_uuid', 'Amanda', 'Davis', 'amanda.davis@email.com', '+1-555-0701', '1995-06-25', 'Female', '147 Birch Way, Everywhere, USA', 'Thomas Davis', '+1-555-0702', 'B-', 'Dairy', 'Depression, Anxiety', 'Anthem', 'ANTHEM963852741'),

('user_8_uuid', 'Christopher', 'Miller', 'christopher.miller@email.com', '+1-555-0801', '1980-01-30', 'Male', '258 Spruce Ct, Anywhere, USA', 'Susan Miller', '+1-555-0802', 'O+', 'None', 'Hypertension', 'Molina Healthcare', 'MOLINA852963741'),

('user_9_uuid', 'Jessica', 'Wilson', 'jessica.wilson@email.com', '+1-555-0901', '1987-08-12', 'Female', '369 Willow St, Somewhere, USA', 'Daniel Wilson', '+1-555-0902', 'AB-', 'Eggs', 'Thyroid disorder', 'CareSource', 'CARESOURCE741852963'),

('user_10_uuid', 'Matthew', 'Taylor', 'matthew.taylor@email.com', '+1-555-1001', '1975-12-07', 'Male', '741 Poplar Ave, Elsewhere, USA', 'Nancy Taylor', '+1-555-1002', 'A-', 'Aspirin', 'Arthritis, Back pain', 'Bright Health', 'BRIGHT159753468');

-- Insert Sample Doctors
INSERT INTO doctors (first_name, last_name, email, phone, specialization, license_number, hospital_id, years_of_experience, education, certifications) VALUES
-- Primary Care Physicians
('Dr. Robert', 'Smith', 'robert.smith@hospital.com', '+1-555-1001', 'Primary Care', 'MD123456', 1, 15, 'Harvard Medical School', 'Board Certified in Internal Medicine'),

('Dr. Lisa', 'Garcia', 'lisa.garcia@hospital.com', '+1-555-1002', 'Primary Care', 'MD123457', 1, 12, 'Stanford Medical School', 'Board Certified in Family Medicine'),

-- Cardiologists
('Dr. James', 'Wilson', 'james.wilson@hospital.com', '+1-555-1003', 'Cardiology', 'MD123458', 1, 20, 'Johns Hopkins Medical School', 'Board Certified in Cardiology'),

('Dr. Maria', 'Martinez', 'maria.martinez@hospital.com', '+1-555-1004', 'Cardiology', 'MD123459', 1, 18, 'UCLA Medical School', 'Board Certified in Cardiology'),

-- Radiologists
('Dr. David', 'Anderson', 'david.anderson@hospital.com', '+1-555-1005', 'Radiology', 'MD123460', 1, 14, 'Yale Medical School', 'Board Certified in Radiology'),

-- Psychiatrists
('Dr. Sarah', 'Taylor', 'sarah.taylor@hospital.com', '+1-555-1006', 'Psychiatry', 'MD123461', 1, 16, 'Columbia Medical School', 'Board Certified in Psychiatry'),

-- Physical Therapists
('Dr. Michael', 'Johnson', 'michael.johnson@hospital.com', '+1-555-1007', 'Physical Therapy', 'PT123456', 1, 10, 'University of California, San Francisco', 'Licensed Physical Therapist'),

-- Gynecologists
('Dr. Jennifer', 'Brown', 'jennifer.brown@hospital.com', '+1-555-1008', 'Gynecology', 'MD123462', 1, 13, 'University of Michigan Medical School', 'Board Certified in Obstetrics and Gynecology'),

-- Urologists
('Dr. Christopher', 'Davis', 'christopher.davis@hospital.com', '+1-555-1009', 'Urology', 'MD123463', 1, 17, 'Duke Medical School', 'Board Certified in Urology'),

-- Pediatricians
('Dr. Amanda', 'Miller', 'amanda.miller@hospital.com', '+1-555-1010', 'Pediatrics', 'MD123464', 1, 11, 'University of Pennsylvania Medical School', 'Board Certified in Pediatrics'),

-- Dentists
('Dr. Jessica', 'Wilson', 'jessica.wilson@hospital.com', '+1-555-1011', 'Dentistry', 'DDS123456', 1, 9, 'University of North Carolina School of Dentistry', 'Licensed Dentist'),

-- Dermatologists
('Dr. Matthew', 'Taylor', 'matthew.taylor@hospital.com', '+1-555-1012', 'Dermatology', 'MD123465', 1, 15, 'Vanderbilt Medical School', 'Board Certified in Dermatology'),

-- Ophthalmologists
('Dr. Nicole', 'Anderson', 'nicole.anderson@hospital.com', '+1-555-1013', 'Ophthalmology', 'MD123466', 1, 19, 'University of Washington Medical School', 'Board Certified in Ophthalmology'),

-- Orthopedic Surgeons
('Dr. Kevin', 'Thomas', 'kevin.thomas@hospital.com', '+1-555-1014', 'Orthopedics', 'MD123467', 1, 21, 'Mayo Clinic Medical School', 'Board Certified in Orthopedic Surgery'),

-- Gastroenterologists
('Dr. Rachel', 'Jackson', 'rachel.jackson@hospital.com', '+1-555-1015', 'Gastroenterology', 'MD123468', 1, 14, 'University of Chicago Medical School', 'Board Certified in Gastroenterology'),

-- Neurologists
('Dr. Steven', 'White', 'steven.white@hospital.com', '+1-555-1016', 'Neurology', 'MD123469', 1, 16, 'Northwestern Medical School', 'Board Certified in Neurology');

-- Insert Sample Hospital (if not exists)
INSERT INTO hospitals (name, address, phone, email, website, capacity, emergency_services, specialties) VALUES
('DigiCare General Hospital', '123 Healthcare Blvd, Medical District, USA', '+1-555-0001', 'info@digicarehospital.com', 'https://digicarehospital.com', 500, true, 'Primary Care, Cardiology, Emergency Medicine, Surgery, Pediatrics, Obstetrics, Psychiatry, Radiology, Laboratory Services, Pharmacy');

-- Note: Replace user_id values with actual user IDs from your auth.users table
-- You may need to adjust these based on your existing user accounts 