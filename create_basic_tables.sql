-- Create basic tables for mobile app functionality
-- This script creates the essential tables needed for the patient mobile app

-- 1. Create patients table if it doesn't exist
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_type TEXT,
    emergency_contact JSONB,
    hospital_id UUID,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create appointments table if it doesn't exist
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    reason TEXT,
    notes TEXT,
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'emergency')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create doctors table if it doesn't exist
CREATE TABLE IF NOT EXISTS doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    specialty TEXT,
    license_number TEXT,
    hospital_id UUID,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create hospitals table if it doesn't exist
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    license_number TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending_approval')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create prescriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT,
    instructions TEXT,
    prescribed_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create patient_vitals table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_vitals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    blood_pressure TEXT,
    heart_rate INTEGER,
    temperature DECIMAL(4,1),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    oxygen_saturation INTEGER,
    notes TEXT,
    recorded_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create diagnoses table if it doesn't exist
CREATE TABLE IF NOT EXISTS diagnoses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    diagnosis TEXT NOT NULL,
    diagnosis_date DATE DEFAULT CURRENT_DATE,
    symptoms TEXT,
    treatment_plan TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create immunizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS immunizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    vaccine_name TEXT NOT NULL,
    immunization_date DATE NOT NULL,
    next_due_date DATE,
    batch_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create emergency_contacts table if it doesn't exist
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for patients table
DROP POLICY IF EXISTS "Patients can view their own data" ON patients;
DROP POLICY IF EXISTS "Patients can insert their own data" ON patients;
DROP POLICY IF EXISTS "Patients can update their own data" ON patients;

CREATE POLICY "Patients can view their own data" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own data" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update their own data" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

-- Create basic RLS policies for appointments table
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their appointments" ON appointments;

CREATE POLICY "Users can view their appointments" ON appointments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = appointments.patient_id
        )
    );

CREATE POLICY "Users can insert appointments" ON appointments
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = appointments.patient_id
        )
    );

CREATE POLICY "Users can update their appointments" ON appointments
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = appointments.patient_id
        )
    );

-- Create basic RLS policies for doctors table
DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can manage their own data" ON doctors;

CREATE POLICY "Anyone can view doctors" ON doctors
    FOR SELECT USING (true);

CREATE POLICY "Doctors can manage their own data" ON doctors
    FOR ALL USING (auth.uid() = user_id);

-- Create basic RLS policies for hospitals table
DROP POLICY IF EXISTS "Anyone can view hospitals" ON hospitals;

CREATE POLICY "Anyone can view hospitals" ON hospitals
    FOR SELECT USING (true);

-- Create basic RLS policies for prescriptions table
DROP POLICY IF EXISTS "Users can view their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can insert prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can update their prescriptions" ON prescriptions;

CREATE POLICY "Users can view their prescriptions" ON prescriptions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = prescriptions.patient_id
        )
    );

CREATE POLICY "Users can insert prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = prescriptions.doctor_id
        )
    );

CREATE POLICY "Users can update their prescriptions" ON prescriptions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = prescriptions.doctor_id
        )
    );

-- Create basic RLS policies for patient_vitals table
DROP POLICY IF EXISTS "Users can view their vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Users can insert vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Users can update their vitals" ON patient_vitals;

CREATE POLICY "Users can view their vitals" ON patient_vitals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = patient_vitals.patient_id
        )
    );

CREATE POLICY "Users can insert vitals" ON patient_vitals
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = patient_vitals.doctor_id
        )
    );

CREATE POLICY "Users can update their vitals" ON patient_vitals
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = patient_vitals.doctor_id
        )
    );

-- Create basic RLS policies for diagnoses table
DROP POLICY IF EXISTS "Users can view their diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Users can insert diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Users can update their diagnoses" ON diagnoses;

CREATE POLICY "Users can view their diagnoses" ON diagnoses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = diagnoses.patient_id
        )
    );

CREATE POLICY "Users can insert diagnoses" ON diagnoses
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = diagnoses.doctor_id
        )
    );

CREATE POLICY "Users can update their diagnoses" ON diagnoses
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = diagnoses.doctor_id
        )
    );

-- Create basic RLS policies for immunizations table
DROP POLICY IF EXISTS "Users can view their immunizations" ON immunizations;
DROP POLICY IF EXISTS "Users can insert immunizations" ON immunizations;
DROP POLICY IF EXISTS "Users can update their immunizations" ON immunizations;

CREATE POLICY "Users can view their immunizations" ON immunizations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = immunizations.patient_id
        )
    );

CREATE POLICY "Users can insert immunizations" ON immunizations
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = immunizations.doctor_id
        )
    );

CREATE POLICY "Users can update their immunizations" ON immunizations
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = immunizations.doctor_id
        )
    );

-- Create basic RLS policies for payments table
DROP POLICY IF EXISTS "Users can view their payments" ON payments;
DROP POLICY IF EXISTS "Users can insert payments" ON payments;
DROP POLICY IF EXISTS "Users can update their payments" ON payments;

CREATE POLICY "Users can view their payments" ON payments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = payments.patient_id
        )
    );

CREATE POLICY "Users can insert payments" ON payments
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = payments.patient_id
        )
    );

CREATE POLICY "Users can update their payments" ON payments
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = payments.patient_id
        )
    );

-- Create basic RLS policies for emergency_contacts table
DROP POLICY IF EXISTS "Users can view their emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can insert emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can update their emergency contacts" ON emergency_contacts;

CREATE POLICY "Users can view their emergency contacts" ON emergency_contacts
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = emergency_contacts.patient_id
        )
    );

CREATE POLICY "Users can insert emergency contacts" ON emergency_contacts
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = emergency_contacts.patient_id
        )
    );

CREATE POLICY "Users can update their emergency contacts" ON emergency_contacts
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM patients WHERE id = emergency_contacts.patient_id
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Show created tables
SELECT 'Tables created successfully' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE_TABLE'
ORDER BY table_name; 