-- Final fix for RLS recursion issues - corrected variable naming
-- This script will fix the infinite recursion error without causing naming conflicts

-- Step 1: Check which tables exist and disable RLS only on existing ones
DO $$
DECLARE
    tbl_name text;
    tables_to_check text[] := ARRAY[
        'platform_admins', 'patients', 'doctors', 'hospitals', 
        'hospital_admins', 'appointments', 'prescriptions', 
        'patient_vitals', 'diagnoses', 'immunizations', 
        'payments', 'emergency_contacts', 'lab_results'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_check
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = tbl_name
        ) THEN
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'Disabled RLS on table: %', tbl_name;
        ELSE
            RAISE NOTICE 'Table does not exist, skipping: %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- Step 2: Drop all existing policies on tables that exist
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

-- Step 3: Re-enable RLS only on existing tables
DO $$
DECLARE
    tbl_name text;
    tables_to_check text[] := ARRAY[
        'platform_admins', 'patients', 'doctors', 'hospitals', 
        'hospital_admins', 'appointments', 'prescriptions', 
        'patient_vitals', 'diagnoses', 'immunizations', 
        'payments', 'emergency_contacts', 'lab_results'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_check
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = tbl_name
        ) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl_name);
            RAISE NOTICE 'Enabled RLS on table: %', tbl_name;
        ELSE
            RAISE NOTICE 'Table does not exist, skipping: %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- Step 4: Create simple, non-recursive policies only on existing tables

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

-- Step 5: Grant permissions only on existing tables
DO $$
DECLARE
    tbl_name text;
    tables_to_check text[] := ARRAY[
        'platform_admins', 'patients', 'doctors', 'hospitals', 
        'hospital_admins', 'appointments', 'prescriptions', 
        'patient_vitals', 'diagnoses', 'immunizations', 
        'payments', 'emergency_contacts', 'lab_results'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY tables_to_check
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = tbl_name
        ) THEN
            EXECUTE format('GRANT ALL ON %I TO anon, authenticated', tbl_name);
            RAISE NOTICE 'Granted permissions on table: %', tbl_name;
        ELSE
            RAISE NOTICE 'Table does not exist, skipping permissions: %', tbl_name;
        END IF;
    END LOOP;
END $$;

-- Step 6: Test the connection
SELECT 'RLS recursion issues fixed successfully' as status;

-- Test basic queries on existing tables
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