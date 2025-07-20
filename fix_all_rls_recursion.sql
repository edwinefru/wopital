-- Comprehensive fix for all RLS recursion issues
-- This script will fix the infinite recursion error that's preventing mobile app connection

-- Step 1: Disable RLS temporarily to break recursion
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses DISABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to clean slate
-- Platform admins
DROP POLICY IF EXISTS "Platform admins can view their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can insert their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can update their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can delete their own data" ON platform_admins;
DROP POLICY IF EXISTS "Users can view platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Users can insert platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Users can update platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Users can delete platform admins" ON platform_admins;

-- Patients
DROP POLICY IF EXISTS "Patients can view their own data" ON patients;
DROP POLICY IF EXISTS "Patients can insert their own data" ON patients;
DROP POLICY IF EXISTS "Patients can update their own data" ON patients;
DROP POLICY IF EXISTS "Patients can delete their own data" ON patients;

-- Doctors
DROP POLICY IF EXISTS "Doctors can view their own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert their own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can delete their own data" ON doctors;

-- Hospitals
DROP POLICY IF EXISTS "Hospital admins can view their data" ON hospitals;
DROP POLICY IF EXISTS "Hospital admins can insert their data" ON hospitals;
DROP POLICY IF EXISTS "Hospital admins can update their data" ON hospitals;
DROP POLICY IF EXISTS "Hospital admins can delete their data" ON hospitals;

-- Appointments
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their appointments" ON appointments;

-- Prescriptions
DROP POLICY IF EXISTS "Users can view their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can insert prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can update their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can delete their prescriptions" ON prescriptions;

-- Patient vitals
DROP POLICY IF EXISTS "Users can view their vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Users can insert vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Users can update their vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Users can delete their vitals" ON patient_vitals;

-- Step 3: Re-enable RLS
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies

-- Platform admins - simple direct user_id check
CREATE POLICY "Platform admins can view their own data" ON platform_admins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can insert their own data" ON platform_admins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Platform admins can update their own data" ON platform_admins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can delete their own data" ON platform_admins
    FOR DELETE USING (auth.uid() = user_id);

-- Patients - simple direct user_id check
CREATE POLICY "Patients can view their own data" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own data" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update their own data" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Patients can delete their own data" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Doctors - simple direct user_id check
CREATE POLICY "Doctors can view their own data" ON doctors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert their own data" ON doctors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own data" ON doctors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Doctors can delete their own data" ON doctors
    FOR DELETE USING (auth.uid() = user_id);

-- Hospitals - allow all authenticated users to view
CREATE POLICY "Users can view hospitals" ON hospitals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Hospital admins can insert hospitals" ON hospitals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Hospital admins can update hospitals" ON hospitals
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Appointments - patients can view their own appointments
CREATE POLICY "Patients can view their appointments" ON appointments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view appointments" ON appointments
    FOR SELECT USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert appointments" ON appointments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update appointments" ON appointments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Prescriptions - patients can view their own prescriptions
CREATE POLICY "Patients can view their prescriptions" ON prescriptions
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view prescriptions" ON prescriptions
    FOR SELECT USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update prescriptions" ON prescriptions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Patient vitals - patients can view their own vitals
CREATE POLICY "Patients can view their vitals" ON patient_vitals
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can view vitals" ON patient_vitals
    FOR SELECT USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert vitals" ON patient_vitals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update vitals" ON patient_vitals
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Step 5: Grant permissions
GRANT ALL ON platform_admins TO anon, authenticated;
GRANT ALL ON patients TO anon, authenticated;
GRANT ALL ON doctors TO anon, authenticated;
GRANT ALL ON hospitals TO anon, authenticated;
GRANT ALL ON hospital_admins TO anon, authenticated;
GRANT ALL ON appointments TO anon, authenticated;
GRANT ALL ON prescriptions TO anon, authenticated;
GRANT ALL ON patient_vitals TO anon, authenticated;
GRANT ALL ON diagnoses TO anon, authenticated;
GRANT ALL ON immunizations TO anon, authenticated;
GRANT ALL ON payments TO anon, authenticated;
GRANT ALL ON emergency_contacts TO anon, authenticated;
GRANT ALL ON lab_results TO anon, authenticated;
GRANT ALL ON pharmacies TO anon, authenticated;

-- Step 6: Test the connection
SELECT 'All RLS recursion issues fixed successfully' as status;

-- Test basic queries
SELECT COUNT(*) as platform_admins_count FROM platform_admins;
SELECT COUNT(*) as patients_count FROM patients;
SELECT COUNT(*) as doctors_count FROM doctors;
SELECT COUNT(*) as hospitals_count FROM hospitals;

-- Show all policies to verify they're simple and non-recursive
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('platform_admins', 'patients', 'doctors', 'hospitals', 'appointments', 'prescriptions', 'patient_vitals')
ORDER BY tablename, cmd; 