-- ========================================
-- WOPITAL - COMPLETE DATABASE SETUP
-- ========================================
-- Run this script in your Supabase SQL Editor
-- This creates all tables, policies, and functions needed

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. CORE TABLES
-- ========================================

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    website VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending_approval', -- pending_approval, approved, rejected, suspended
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspension_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital Admins table
CREATE TABLE IF NOT EXISTS hospital_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, hospital_id)
);

-- Platform Admins table
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin
    is_active BOOLEAN DEFAULT true,
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
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
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
    allergies TEXT,
    emergency_contact JSONB,
    hospital_id UUID REFERENCES hospitals(id),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    relationship VARCHAR(50),
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. MEDICAL DATA TABLES
-- ========================================

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
    status VARCHAR(50) DEFAULT 'active', -- active, resolved, chronic, monitoring
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    record_type VARCHAR(50) NOT NULL, -- lab_result, imaging, procedure, consultation, surgery, discharge, prescription, vaccination, allergy, other
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT,
    record_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. APPOINTMENT TABLES
-- ========================================

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    hospital_id UUID REFERENCES hospitals(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    type VARCHAR(50), -- consultation, follow-up, emergency, routine
    urgency VARCHAR(20) DEFAULT 'routine', -- routine, urgent, critical, emergency
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, rescheduled
    reason TEXT,
    notes TEXT,
    location VARCHAR(255),
    room_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment Actions table
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

-- ========================================
-- 4. MEDICATION TABLES
-- ========================================

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

-- Prescriptions table
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

-- ========================================
-- 5. OTHER MEDICAL TABLES
-- ========================================

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

-- Lab Results table
CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    test_name VARCHAR(255) NOT NULL,
    test_date DATE NOT NULL,
    result_value VARCHAR(255),
    normal_range VARCHAR(100),
    unit VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- pending, normal, abnormal, critical
    notes TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. BUSINESS TABLES
-- ========================================

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

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- basic, premium, enterprise
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL, -- monthly, yearly
    status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired, suspended
    start_date DATE NOT NULL,
    end_date DATE,
    max_patients INTEGER,
    max_doctors INTEGER,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Keys table
CREATE TABLE IF NOT EXISTS subscription_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    permissions JSONB,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hospital_id ON doctors(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_admins_user_id ON hospital_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_admins_hospital_id ON hospital_admins(hospital_id);
CREATE INDEX IF NOT EXISTS idx_platform_admins_user_id ON platform_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON patient_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_patient_id ON emergency_contacts(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_patient_id ON payments(patient_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_hospital_id ON subscriptions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_subscription_keys_hospital_id ON subscription_keys(hospital_id);

-- ========================================
-- 8. FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospital_admins_updated_at BEFORE UPDATE ON hospital_admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_admins_updated_at BEFORE UPDATE ON platform_admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnoses_updated_at BEFORE UPDATE ON diagnoses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_keys_updated_at BEFORE UPDATE ON subscription_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_keys ENABLE ROW LEVEL SECURITY;

-- Platform Admin Policies (can access everything)
CREATE POLICY "Platform admins can access all data" ON hospitals FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON hospital_admins FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON platform_admins FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON doctors FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON patients FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON emergency_contacts FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON patient_vitals FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON diagnoses FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON medical_records FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON appointments FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON appointment_actions FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON medications FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON prescriptions FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON immunizations FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON lab_results FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON payments FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON subscriptions FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Platform admins can access all data" ON subscription_keys FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
);

-- Hospital Admin Policies (can access their hospital's data)
CREATE POLICY "Hospital admins can access their hospital data" ON hospitals FOR ALL USING (
    id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Hospital admins can access their hospital data" ON hospital_admins FOR ALL USING (
    hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Hospital admins can access their hospital data" ON doctors FOR ALL USING (
    hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Hospital admins can access their hospital data" ON patients FOR ALL USING (
    hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Hospital admins can access their hospital data" ON emergency_contacts FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid()))
);

CREATE POLICY "Hospital admins can access their hospital data" ON patient_vitals FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid()))
);

CREATE POLICY "Hospital admins can access their hospital data" ON diagnoses FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid()))
);

CREATE POLICY "Hospital admins can access their hospital data" ON medical_records FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid()))
);

CREATE POLICY "Hospital admins can access their hospital data" ON appointments FOR ALL USING (
    hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Hospital admins can access their hospital data" ON appointment_actions FOR ALL USING (
    appointment_id IN (SELECT id FROM appointments WHERE hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid()))
);

CREATE POLICY "Hospital admins can access their hospital data" ON prescriptions FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid()))
);

CREATE POLICY "Hospital admins can access their hospital data" ON immunizations FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid()))
);

CREATE POLICY "Hospital admins can access their hospital data" ON lab_results FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid()))
);

CREATE POLICY "Hospital admins can access their hospital data" ON payments FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid()))
);

CREATE POLICY "Hospital admins can access their hospital data" ON subscriptions FOR ALL USING (
    hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Hospital admins can access their hospital data" ON subscription_keys FOR ALL USING (
    hospital_id IN (SELECT hospital_id FROM hospital_admins WHERE user_id = auth.uid())
);

-- Patient Policies (can access their own data)
CREATE POLICY "Patients can access their own data" ON patients FOR ALL USING (
    user_id = auth.uid()
);

CREATE POLICY "Patients can access their own data" ON emergency_contacts FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can access their own data" ON patient_vitals FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can access their own data" ON diagnoses FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can access their own data" ON medical_records FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can access their own data" ON appointments FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can access their own data" ON appointment_actions FOR ALL USING (
    appointment_id IN (SELECT id FROM appointments WHERE patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()))
);

CREATE POLICY "Patients can access their own data" ON prescriptions FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can access their own data" ON immunizations FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can access their own data" ON lab_results FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can access their own data" ON payments FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Doctor Policies (can access their patients' data)
CREATE POLICY "Doctors can access their patients' data" ON patients FOR SELECT USING (
    id IN (SELECT patient_id FROM appointments WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
);

CREATE POLICY "Doctors can access their patients' data" ON emergency_contacts FOR ALL USING (
    patient_id IN (SELECT patient_id FROM appointments WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
);

CREATE POLICY "Doctors can access their patients' data" ON patient_vitals FOR ALL USING (
    patient_id IN (SELECT patient_id FROM appointments WHERE doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid()))
);

CREATE POLICY "Doctors can access their patients' data" ON diagnoses FOR ALL USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);

CREATE POLICY "Doctors can access their patients' data" ON medical_records FOR ALL USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);

CREATE POLICY "Doctors can access their patients' data" ON appointments FOR ALL USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);

CREATE POLICY "Doctors can access their patients' data" ON prescriptions FOR ALL USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);

CREATE POLICY "Doctors can access their patients' data" ON immunizations FOR ALL USING (
    administered_by IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);

CREATE POLICY "Doctors can access their patients' data" ON lab_results FOR ALL USING (
    doctor_id IN (SELECT id FROM doctors WHERE user_id = auth.uid())
);

-- Public read access for medications
CREATE POLICY "Anyone can read medications" ON medications FOR SELECT USING (true);

-- ========================================
-- 10. SAMPLE DATA (Optional)
-- ========================================

-- Insert sample medications
INSERT INTO medications (name, generic_name, dosage_form, strength, manufacturer, description) VALUES
('Aspirin', 'Acetylsalicylic acid', 'tablet', '81mg', 'Bayer', 'Pain reliever and blood thinner'),
('Ibuprofen', 'Ibuprofen', 'tablet', '200mg', 'Advil', 'Anti-inflammatory pain reliever'),
('Acetaminophen', 'Acetaminophen', 'tablet', '500mg', 'Tylenol', 'Pain reliever and fever reducer'),
('Amoxicillin', 'Amoxicillin', 'capsule', '250mg', 'Generic', 'Antibiotic for bacterial infections'),
('Lisinopril', 'Lisinopril', 'tablet', '10mg', 'Generic', 'ACE inhibitor for high blood pressure')
ON CONFLICT DO NOTHING;

-- ========================================
-- 11. STORAGE SETUP
-- ========================================

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
('medical-records', 'medical-records', false),
('avatars', 'avatars', true),
('lab-results', 'lab-results', false)
ON CONFLICT DO NOTHING;

-- Storage policies for medical records
CREATE POLICY "Hospital admins can upload medical records" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'medical-records' AND 
    EXISTS (SELECT 1 FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Hospital admins can view medical records" ON storage.objects FOR SELECT USING (
    bucket_id = 'medical-records' AND 
    EXISTS (SELECT 1 FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can view their own medical records" ON storage.objects FOR SELECT USING (
    bucket_id = 'medical-records' AND 
    EXISTS (SELECT 1 FROM medical_records mr 
            JOIN patients p ON mr.patient_id = p.id 
            WHERE p.user_id = auth.uid() AND mr.file_url LIKE '%' || name)
);

-- Storage policies for avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (
    bucket_id = 'avatars'
);

-- Storage policies for lab results
CREATE POLICY "Hospital admins can upload lab results" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'lab-results' AND 
    EXISTS (SELECT 1 FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Hospital admins can view lab results" ON storage.objects FOR SELECT USING (
    bucket_id = 'lab-results' AND 
    EXISTS (SELECT 1 FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can view their own lab results" ON storage.objects FOR SELECT USING (
    bucket_id = 'lab-results' AND 
    EXISTS (SELECT 1 FROM lab_results lr 
            JOIN patients p ON lr.patient_id = p.id 
            WHERE p.user_id = auth.uid() AND lr.file_url LIKE '%' || name)
);

-- ========================================
-- COMPLETE SETUP FINISHED
-- ========================================

-- Display setup completion message
SELECT 'Wopital Database Setup Complete!' as status; 