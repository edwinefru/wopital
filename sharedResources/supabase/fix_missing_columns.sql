-- Fix Missing Columns in DigiCare Database
-- Run this script in your Supabase SQL editor to add missing columns

-- 1. Add missing columns to patients table
DO $$ 
BEGIN
    -- Add avatar_url to patients table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'avatar_url') THEN
        ALTER TABLE patients ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to patients table';
    END IF;
    
    -- Add user_id to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'user_id') THEN
        ALTER TABLE doctors ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to doctors table';
    END IF;
    
    -- Add height_cm column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'height_cm') THEN
        ALTER TABLE patients ADD COLUMN height_cm DECIMAL(5,2);
        RAISE NOTICE 'Added height_cm column to patients table';
    END IF;
    
    -- Add weight_kg column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'weight_kg') THEN
        ALTER TABLE patients ADD COLUMN weight_kg DECIMAL(5,2);
        RAISE NOTICE 'Added weight_kg column to patients table';
    END IF;
    
    -- Add emergency_contact column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact JSONB;
        RAISE NOTICE 'Added emergency_contact column to patients table';
    END IF;
    
    -- Add hospital_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'hospital_id') THEN
        ALTER TABLE patients ADD COLUMN hospital_id UUID REFERENCES hospitals(id);
        RAISE NOTICE 'Added hospital_id column to patients table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'updated_at') THEN
        ALTER TABLE patients ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to patients table';
    END IF;
END $$;

-- 2. Add missing columns to doctors table
DO $$ 
BEGIN
    -- Add first_name to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'first_name') THEN
        ALTER TABLE doctors ADD COLUMN first_name VARCHAR(100);
        RAISE NOTICE 'Added first_name column to doctors table';
    END IF;
    
    -- Add last_name to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'last_name') THEN
        ALTER TABLE doctors ADD COLUMN last_name VARCHAR(100);
        RAISE NOTICE 'Added last_name column to doctors table';
    END IF;
    
    -- Add specialty to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'specialty') THEN
        ALTER TABLE doctors ADD COLUMN specialty VARCHAR(100);
        RAISE NOTICE 'Added specialty column to doctors table';
    END IF;
    
    -- Add license_number to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'license_number') THEN
        ALTER TABLE doctors ADD COLUMN license_number VARCHAR(50);
        RAISE NOTICE 'Added license_number column to doctors table';
    END IF;
    
    -- Add phone to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'phone') THEN
        ALTER TABLE doctors ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'Added phone column to doctors table';
    END IF;
    
    -- Add email to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'email') THEN
        ALTER TABLE doctors ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Added email column to doctors table';
    END IF;
    
    -- Add hospital_id to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'hospital_id') THEN
        ALTER TABLE doctors ADD COLUMN hospital_id UUID REFERENCES hospitals(id);
        RAISE NOTICE 'Added hospital_id column to doctors table';
    END IF;
    
    -- Add avatar_url to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'avatar_url') THEN
        ALTER TABLE doctors ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to doctors table';
    END IF;
    
    -- Add created_at to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'created_at') THEN
        ALTER TABLE doctors ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to doctors table';
    END IF;
    
    -- Add updated_at to doctors table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'updated_at') THEN
        ALTER TABLE doctors ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to doctors table';
    END IF;
    
    -- Add avatar_url to patients table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'avatar_url') THEN
        ALTER TABLE patients ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to patients table';
    END IF;
END $$;

-- 3. Add missing columns to medications table
DO $$ 
BEGIN
    -- Add generic_name to medications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'generic_name') THEN
        ALTER TABLE medications ADD COLUMN generic_name VARCHAR(255);
        RAISE NOTICE 'Added generic_name column to medications table';
    END IF;
    
    -- Add dosage_form to medications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'dosage_form') THEN
        ALTER TABLE medications ADD COLUMN dosage_form VARCHAR(100);
        RAISE NOTICE 'Added dosage_form column to medications table';
    END IF;
    
    -- Add strength to medications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'strength') THEN
        ALTER TABLE medications ADD COLUMN strength VARCHAR(100);
        RAISE NOTICE 'Added strength column to medications table';
    END IF;
    
    -- Add manufacturer to medications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'manufacturer') THEN
        ALTER TABLE medications ADD COLUMN manufacturer VARCHAR(255);
        RAISE NOTICE 'Added manufacturer column to medications table';
    END IF;
    
    -- Add description to medications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'description') THEN
        ALTER TABLE medications ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to medications table';
    END IF;
    
    -- Add side_effects to medications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'side_effects') THEN
        ALTER TABLE medications ADD COLUMN side_effects TEXT;
        RAISE NOTICE 'Added side_effects column to medications table';
    END IF;
    
    -- Add created_at to medications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'created_at') THEN
        ALTER TABLE medications ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to medications table';
    END IF;
END $$;

-- 4. Enable RLS on tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid conflicts
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

-- 6. Create the correct policies
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

-- 7. Insert sample data safely
-- Insert hospitals
INSERT INTO hospitals (name, address, phone, email) VALUES 
('City General Hospital', '123 Main St, City', '+1234567890', 'info@cityhospital.com'),
('Medical Center', '456 Oak Ave, Town', '+1234567891', 'contact@medicalcenter.com')
ON CONFLICT DO NOTHING;

-- Insert doctors with dynamic column checking
DO $$ 
DECLARE
    hospital1_id UUID;
    hospital2_id UUID;
    has_user_id BOOLEAN;
    has_specialty BOOLEAN;
    has_license BOOLEAN;
    has_phone BOOLEAN;
    has_email BOOLEAN;
    has_hospital_id BOOLEAN;
BEGIN
    -- Get hospital IDs
    SELECT id INTO hospital1_id FROM hospitals WHERE name = 'City General Hospital' LIMIT 1;
    SELECT id INTO hospital2_id FROM hospitals WHERE name = 'Medical Center' LIMIT 1;
    
    -- Check which columns exist
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'user_id') INTO has_user_id;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'specialty') INTO has_specialty;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'license_number') INTO has_license;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'phone') INTO has_phone;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'email') INTO has_email;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'hospital_id') INTO has_hospital_id;
    
    -- Insert doctors based on available columns (without user_id for sample data)
    IF has_specialty AND has_license AND has_phone AND has_email AND has_hospital_id THEN
        -- Insert with all columns except user_id (sample data doesn't need real auth users)
        INSERT INTO doctors (first_name, last_name, specialty, license_number, phone, email, hospital_id) VALUES 
        ('John', 'Smith', 'Cardiology', 'MD123456', '+1234567892', 'dr.smith@cityhospital.com', hospital1_id),
        ('Sarah', 'Johnson', 'Pediatrics', 'MD789012', '+1234567893', 'dr.johnson@medicalcenter.com', hospital2_id)
        ON CONFLICT DO NOTHING;
    ELSIF has_specialty AND has_license AND has_phone AND has_email THEN
        -- Insert without user_id and hospital_id
        INSERT INTO doctors (first_name, last_name, specialty, license_number, phone, email) VALUES 
        ('John', 'Smith', 'Cardiology', 'MD123456', '+1234567892', 'dr.smith@cityhospital.com'),
        ('Sarah', 'Johnson', 'Pediatrics', 'MD789012', '+1234567893', 'dr.johnson@medicalcenter.com')
        ON CONFLICT DO NOTHING;
    ELSIF has_specialty AND has_license AND has_phone THEN
        -- Insert without user_id, hospital_id, and email
        INSERT INTO doctors (first_name, last_name, specialty, license_number, phone) VALUES 
        ('John', 'Smith', 'Cardiology', 'MD123456', '+1234567892'),
        ('Sarah', 'Johnson', 'Pediatrics', 'MD789012', '+1234567893')
        ON CONFLICT DO NOTHING;
    ELSE
        -- Minimal insert with only basic columns
        INSERT INTO doctors (first_name, last_name) VALUES 
        ('John', 'Smith'),
        ('Sarah', 'Johnson')
        ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Inserted sample doctors based on available columns';
END $$;

-- Insert medications with dynamic column checking
DO $$ 
DECLARE
    has_generic_name BOOLEAN;
    has_dosage_form BOOLEAN;
    has_strength BOOLEAN;
    has_manufacturer BOOLEAN;
BEGIN
    -- Check which columns exist
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'generic_name') INTO has_generic_name;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'dosage_form') INTO has_dosage_form;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'strength') INTO has_strength;
    SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'manufacturer') INTO has_manufacturer;
    
    -- Insert medications based on available columns
    IF has_generic_name AND has_dosage_form AND has_strength AND has_manufacturer THEN
        -- Full insert with all columns
        INSERT INTO medications (name, generic_name, dosage_form, strength, manufacturer) VALUES 
        ('Lisinopril', 'Lisinopril', 'tablet', '10mg', 'Generic Pharma'),
        ('Metformin', 'Metformin', 'tablet', '500mg', 'Generic Pharma'),
        ('Amoxicillin', 'Amoxicillin', 'capsule', '500mg', 'Generic Pharma')
        ON CONFLICT DO NOTHING;
    ELSIF has_dosage_form AND has_strength AND has_manufacturer THEN
        -- Insert without generic_name
        INSERT INTO medications (name, dosage_form, strength, manufacturer) VALUES 
        ('Lisinopril', 'tablet', '10mg', 'Generic Pharma'),
        ('Metformin', 'tablet', '500mg', 'Generic Pharma'),
        ('Amoxicillin', 'capsule', '500mg', 'Generic Pharma')
        ON CONFLICT DO NOTHING;
    ELSIF has_dosage_form AND has_strength THEN
        -- Insert without generic_name and manufacturer
        INSERT INTO medications (name, dosage_form, strength) VALUES 
        ('Lisinopril', 'tablet', '10mg'),
        ('Metformin', 'tablet', '500mg'),
        ('Amoxicillin', 'capsule', '500mg')
        ON CONFLICT DO NOTHING;
    ELSE
        -- Minimal insert with only name
        INSERT INTO medications (name) VALUES 
        ('Lisinopril'),
        ('Metformin'),
        ('Amoxicillin')
        ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Inserted sample medications based on available columns';
END $$;

RAISE NOTICE 'Database schema fix completed successfully!'; 