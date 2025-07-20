-- Comprehensive fix for all RLS recursion issues
-- This script will fix the infinite recursion error that's preventing admin account creation

-- Step 1: Disable RLS on all tables to break recursion
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses DISABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_actions DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to clean slate
-- Platform Admins
DROP POLICY IF EXISTS "Platform admins can view their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can insert their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can update their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can delete their own data" ON platform_admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON platform_admins;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON platform_admins;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON platform_admins;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON platform_admins;

-- Hospital Admins
DROP POLICY IF EXISTS "Hospital admins can view their own data" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can insert their own data" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can update their own data" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can delete their own data" ON hospital_admins;

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
DROP POLICY IF EXISTS "Hospitals can view their own data" ON hospitals;
DROP POLICY IF EXISTS "Hospitals can insert their own data" ON hospitals;
DROP POLICY IF EXISTS "Hospitals can update their own data" ON hospitals;
DROP POLICY IF EXISTS "Hospitals can delete their own data" ON hospitals;

-- Step 3: Re-enable RLS on all tables
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_actions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies for platform_admins
CREATE POLICY "Platform admins can view their own data" ON platform_admins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can insert their own data" ON platform_admins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Platform admins can update their own data" ON platform_admins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can delete their own data" ON platform_admins
    FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Create simple policies for hospital_admins
CREATE POLICY "Hospital admins can view their own data" ON hospital_admins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Hospital admins can insert their own data" ON hospital_admins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hospital admins can update their own data" ON hospital_admins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Hospital admins can delete their own data" ON hospital_admins
    FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Create simple policies for patients
CREATE POLICY "Patients can view their own data" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own data" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update their own data" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Patients can delete their own data" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create simple policies for doctors
CREATE POLICY "Doctors can view their own data" ON doctors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert their own data" ON doctors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own data" ON doctors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Doctors can delete their own data" ON doctors
    FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Create simple policies for hospitals (allow all authenticated users)
CREATE POLICY "Hospitals can view all data" ON hospitals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Hospitals can insert data" ON hospitals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Hospitals can update data" ON hospitals
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Hospitals can delete data" ON hospitals
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 9: Grant necessary permissions
GRANT ALL ON platform_admins TO authenticated;
GRANT ALL ON platform_admins TO anon;
GRANT ALL ON hospital_admins TO authenticated;
GRANT ALL ON hospital_admins TO anon;
GRANT ALL ON patients TO authenticated;
GRANT ALL ON patients TO anon;
GRANT ALL ON doctors TO authenticated;
GRANT ALL ON doctors TO anon;
GRANT ALL ON hospitals TO authenticated;
GRANT ALL ON hospitals TO anon;

-- Step 10: Verify the fix
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('platform_admins', 'hospital_admins', 'patients', 'doctors', 'hospitals')
ORDER BY tablename, policyname;

-- Step 11: Test the connection
SELECT 'Platform admins table test:' as test_name, COUNT(*) as count FROM platform_admins LIMIT 1;

SELECT 'Hospital admins table test:' as test_name, COUNT(*) as count FROM hospital_admins LIMIT 1;

SELECT 'Patients table test:' as test_name, COUNT(*) as count FROM patients LIMIT 1;

SELECT 'Doctors table test:' as test_name, COUNT(*) as count FROM doctors LIMIT 1;

SELECT 'Hospitals table test:' as test_name, COUNT(*) as count FROM hospitals LIMIT 1; 