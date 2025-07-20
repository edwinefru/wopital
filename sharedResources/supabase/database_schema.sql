-- DigiCare Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)
-- This is automatically created by Supabase

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    license_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    hospital_id UUID REFERENCES hospitals(id),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table (enhanced)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_type VARCHAR(5),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    emergency_contact JSONB,
    hospital_id UUID REFERENCES hospitals(id),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
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

-- Patient Vitals table
CREATE TABLE IF NOT EXISTS patient_vitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature_f DECIMAL(4,1),
    oxygen_saturation INTEGER,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(4,2),
    respiratory_rate INTEGER,
    notes TEXT,
    recorded_by UUID REFERENCES doctors(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    condition_name VARCHAR(255) NOT NULL,
    icd_code VARCHAR(20),
    diagnosis_date DATE NOT NULL,
    is_treated BOOLEAN DEFAULT false,
    treatment_notes TEXT,
    follow_up_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, resolved, chronic
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table (enhanced)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    hospital_id UUID REFERENCES hospitals(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    type VARCHAR(50), -- consultation, follow-up, emergency, routine
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, rescheduled
    reason TEXT,
    notes TEXT,
    location VARCHAR(255),
    room_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment Actions table (for tracking calls, reschedules, cancellations)
CREATE TABLE IF NOT EXISTS appointment_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- call, reschedule, cancel, confirm
    action_by UUID REFERENCES patients(id),
    action_notes TEXT,
    new_date DATE,
    new_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage_form VARCHAR(100), -- tablet, capsule, liquid, etc.
    strength VARCHAR(100),
    manufacturer VARCHAR(255),
    description TEXT,
    side_effects TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table (enhanced)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    medication_id UUID REFERENCES medications(id),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration_days INTEGER,
    prescribed_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    refills_remaining INTEGER DEFAULT 0,
    pharmacy_name VARCHAR(255),
    pharmacy_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active', -- active, completed, discontinued
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Immunizations table
CREATE TABLE IF NOT EXISTS immunizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    administered_date DATE NOT NULL,
    next_due_date DATE,
    administered_by UUID REFERENCES doctors(id),
    lot_number VARCHAR(100),
    manufacturer VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50), -- cash, card, insurance, mobile_money
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    transaction_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    record_type VARCHAR(100), -- lab_result, xray, mri, etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    recorded_by UUID REFERENCES doctors(id),
    record_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Results table
CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    result_value VARCHAR(255),
    normal_range VARCHAR(100),
    unit VARCHAR(50),
    status VARCHAR(50), -- normal, high, low, critical
    notes TEXT,
    ordered_by UUID REFERENCES doctors(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON patient_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON payments(patient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables (with IF NOT EXISTS)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_patients_updated_at') THEN
        CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_doctors_updated_at') THEN
        CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_appointments_updated_at') THEN
        CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prescriptions_updated_at') THEN
        CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_diagnoses_updated_at') THEN
        CREATE TRIGGER update_diagnoses_updated_at BEFORE UPDATE ON diagnoses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Row Level Security (RLS) policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Patients can only see their own data
DROP POLICY IF EXISTS "Patients can view own profile" ON patients;
DROP POLICY IF EXISTS "Patients can update own profile" ON patients;
DROP POLICY IF EXISTS "Patients can create own profile" ON patients;

CREATE POLICY "Patients can view own profile" ON patients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Patients can update own profile" ON patients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Patients can create own profile" ON patients FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Appointments policies
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;

CREATE POLICY "Patients can view own appointments" ON appointments FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients can create appointments" ON appointments FOR INSERT WITH CHECK (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "Patients can update own appointments" ON appointments FOR UPDATE USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Similar policies for other tables...
DROP POLICY IF EXISTS "Patients can view own prescriptions" ON prescriptions;
CREATE POLICY "Patients can view own prescriptions" ON prescriptions FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Patients can view own vitals" ON patient_vitals;
CREATE POLICY "Patients can view own vitals" ON patient_vitals FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Patients can view own diagnoses" ON diagnoses;
CREATE POLICY "Patients can view own diagnoses" ON diagnoses FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Enable RLS for public tables that should be readable by all authenticated users
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view hospitals, doctors, and medications
DROP POLICY IF EXISTS "Allow authenticated users to view hospitals" ON hospitals;
DROP POLICY IF EXISTS "Allow authenticated users to view doctors" ON doctors;
DROP POLICY IF EXISTS "Allow authenticated users to view medications" ON medications;

CREATE POLICY "Allow authenticated users to view hospitals" ON hospitals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to view doctors" ON doctors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to view medications" ON medications FOR SELECT USING (auth.role() = 'authenticated');

-- Insert sample data for testing
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

-- Insert sample medications
INSERT INTO medications (name, generic_name, dosage_form, strength, manufacturer) VALUES 
('Lisinopril', 'Lisinopril', 'tablet', '10mg', 'Generic Pharma'),
('Metformin', 'Metformin', 'tablet', '500mg', 'Generic Pharma'),
('Amoxicillin', 'Amoxicillin', 'capsule', '500mg', 'Generic Pharma')
ON CONFLICT DO NOTHING;

-- Note: Sample appointments, vitals, and diagnoses will be created automatically 
-- when users sign up and interact with the app, as they require patient_id references

-- Add sample patient vitals (this will be accessible once a patient profile is created)
-- INSERT INTO patient_vitals (patient_id, blood_pressure_systolic, blood_pressure_diastolic, heart_rate, temperature_f, oxygen_saturation, weight_kg, height_cm, bmi, respiratory_rate, notes) VALUES 
-- ((SELECT id FROM patients LIMIT 1), 120, 80, 72, 98.6, 98, 70.5, 170, 24.4, 16, 'Normal vitals');

-- Add sample diagnoses (this will be accessible once a patient profile is created)
-- INSERT INTO diagnoses (patient_id, doctor_id, condition_name, icd_code, diagnosis_date, is_treated, treatment_notes, status) VALUES 
-- ((SELECT id FROM patients LIMIT 1), (SELECT id FROM doctors LIMIT 1), 'Hypertension', 'I10', '2024-01-15', false, 'Monitor blood pressure regularly', 'active'); 