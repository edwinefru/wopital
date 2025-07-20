-- Simple RLS Fix to Prevent Infinite Recursion
-- Run this in Supabase SQL Editor

-- 1. Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Patients can view own profile" ON patients;
DROP POLICY IF EXISTS "Patients can update own profile" ON patients;
DROP POLICY IF EXISTS "Patients can create own profile" ON patients;

DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;

DROP POLICY IF EXISTS "Patients can view own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Patients can view own vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Patients can view own diagnoses" ON diagnoses;

-- 2. Create simple, non-recursive policies
-- Patients policies - direct user_id comparison
CREATE POLICY "Patients can view own profile" ON patients 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can update own profile" ON patients 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Patients can create own profile" ON patients 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Appointments policies - direct patient_id comparison
-- First, let's check if we can get the patient_id directly
CREATE POLICY "Patients can view own appointments" ON appointments 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM patients 
        WHERE patients.id = appointments.patient_id 
        AND patients.user_id = auth.uid()
    )
);

CREATE POLICY "Patients can create appointments" ON appointments 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM patients 
        WHERE patients.id = appointments.patient_id 
        AND patients.user_id = auth.uid()
    )
);

CREATE POLICY "Patients can update own appointments" ON appointments 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM patients 
        WHERE patients.id = appointments.patient_id 
        AND patients.user_id = auth.uid()
    )
);

-- Prescriptions policies
CREATE POLICY "Patients can view own prescriptions" ON prescriptions 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM patients 
        WHERE patients.id = prescriptions.patient_id 
        AND patients.user_id = auth.uid()
    )
);

-- Vitals policies
CREATE POLICY "Patients can view own vitals" ON patient_vitals 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM patients 
        WHERE patients.id = patient_vitals.patient_id 
        AND patients.user_id = auth.uid()
    )
);

-- Diagnoses policies
CREATE POLICY "Patients can view own diagnoses" ON diagnoses 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM patients 
        WHERE patients.id = diagnoses.patient_id 
        AND patients.user_id = auth.uid()
    )
);

-- 3. Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

-- 4. Test the fix
DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated successfully. Testing patient access...';
    
    -- Check if policies exist
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'patients' 
        AND policyname = 'Patients can view own profile'
    ) THEN
        RAISE NOTICE 'Patient policies created successfully';
    ELSE
        RAISE NOTICE 'ERROR: Patient policies not created';
    END IF;
    
END $$; 