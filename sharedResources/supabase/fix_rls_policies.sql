-- Fix RLS Policies for DigiCare
-- Run this script in your Supabase SQL editor to fix the current issues

-- 1. Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add avatar_url to patients table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'avatar_url') THEN
        ALTER TABLE patients ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Add user_id to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'user_id') THEN
        ALTER TABLE doctors ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Enable RLS on tables if not already enabled
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Patients can view own profile" ON patients;
DROP POLICY IF EXISTS "Patients can update own profile" ON patients;
DROP POLICY IF EXISTS "Patients can create own profile" ON patients;

DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;

DROP POLICY IF EXISTS "Patients can view own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Patients can view own vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Patients can view own diagnoses" ON diagnoses;

DROP POLICY IF EXISTS "Allow authenticated users to view hospitals" ON hospitals;
DROP POLICY IF EXISTS "Allow authenticated users to view doctors" ON doctors;
DROP POLICY IF EXISTS "Allow authenticated users to view medications" ON medications;

-- 4. Create the correct policies
-- Patients policies
CREATE POLICY "Patients can view own profile" ON patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Patients can update own profile" ON patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Patients can create own profile" ON patients FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Patients can view own appointments" ON appointments FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients can create appointments" ON appointments FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients can update own appointments" ON appointments FOR UPDATE USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Other patient data policies
CREATE POLICY "Patients can view own prescriptions" ON prescriptions FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can view own vitals" ON patient_vitals FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can view own diagnoses" ON diagnoses FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Public data policies
CREATE POLICY "Allow authenticated users to view hospitals" ON hospitals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to view doctors" ON doctors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to view medications" ON medications FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Insert sample data if not exists
INSERT INTO hospitals (name, address, phone, email) VALUES 
('City General Hospital', '123 Main St, City', '+1234567890', 'info@cityhospital.com'),
('Medical Center', '456 Oak Ave, Town', '+1234567891', 'contact@medicalcenter.com')
ON CONFLICT DO NOTHING;

-- Insert sample doctors (without user_id for sample data)
DO $$ 
BEGIN
    -- Insert without user_id (sample data doesn't need real auth users)
    INSERT INTO doctors (first_name, last_name, specialty, license_number, phone, email, hospital_id) VALUES 
    ('John', 'Smith', 'Cardiology', 'MD123456', '+1234567892', 'dr.smith@cityhospital.com', (SELECT id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1)),
    ('Sarah', 'Johnson', 'Pediatrics', 'MD789012', '+1234567893', 'dr.johnson@medicalcenter.com', (SELECT id FROM hospitals WHERE name = 'Medical Center' LIMIT 1))
    ON CONFLICT DO NOTHING;
END $$;

INSERT INTO medications (name, generic_name, dosage_form, strength, manufacturer) VALUES 
('Lisinopril', 'Lisinopril', 'tablet', '10mg', 'Generic Pharma'),
('Metformin', 'Metformin', 'tablet', '500mg', 'Generic Pharma'),
('Amoxicillin', 'Amoxicillin', 'capsule', '500mg', 'Generic Pharma')
ON CONFLICT DO NOTHING;

-- 6. Create a test patient profile for the current user (if needed)
-- This will help test the system
-- Uncomment the line below and replace with your user ID to create a test profile
-- INSERT INTO patients (user_id, first_name, last_name, phone) VALUES ('YOUR_USER_ID_HERE', 'Test', 'User', '+1234567890') ON CONFLICT DO NOTHING; 