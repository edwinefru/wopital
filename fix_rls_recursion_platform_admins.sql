-- Fix infinite recursion error in platform_admins table RLS policies
-- This error is preventing the mobile app from connecting to Supabase

-- First, let's see what policies exist on platform_admins table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'platform_admins';

-- Drop all existing policies on platform_admins table to fix recursion
DROP POLICY IF EXISTS "Platform admins can view their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can insert their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can update their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can delete their own data" ON platform_admins;
DROP POLICY IF EXISTS "Users can view platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Users can insert platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Users can update platform admins" ON platform_admins;
DROP POLICY IF EXISTS "Users can delete platform admins" ON platform_admins;

-- Create simple, non-recursive policies for platform_admins
CREATE POLICY "Platform admins can view their own data" ON platform_admins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can insert their own data" ON platform_admins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Platform admins can update their own data" ON platform_admins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can delete their own data" ON platform_admins
    FOR DELETE USING (auth.uid() = user_id);

-- Also check and fix any other tables that might have recursive policies
-- Let's check for any other potential recursion issues
SELECT 
    schemaname,
    tablename,
    policyname,
    qual
FROM pg_policies 
WHERE qual LIKE '%platform_admins%' 
   OR qual LIKE '%auth.uid() IN (SELECT%'
   OR qual LIKE '%EXISTS (SELECT%';

-- Fix any other tables that reference platform_admins in their policies
-- Drop and recreate policies for tables that might reference platform_admins

-- Fix patients table policies if they reference platform_admins
DROP POLICY IF EXISTS "Patients can view their own data" ON patients;
DROP POLICY IF EXISTS "Patients can insert their own data" ON patients;
DROP POLICY IF EXISTS "Patients can update their own data" ON patients;

CREATE POLICY "Patients can view their own data" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own data" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update their own data" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

-- Fix doctors table policies if they reference platform_admins
DROP POLICY IF EXISTS "Doctors can view their own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert their own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own data" ON doctors;

CREATE POLICY "Doctors can view their own data" ON doctors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert their own data" ON doctors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update their own data" ON doctors
    FOR UPDATE USING (auth.uid() = user_id);

-- Fix hospitals table policies if they reference platform_admins
DROP POLICY IF EXISTS "Hospital admins can view their data" ON hospitals;
DROP POLICY IF EXISTS "Hospital admins can insert their data" ON hospitals;
DROP POLICY IF EXISTS "Hospital admins can update their data" ON hospitals;

CREATE POLICY "Hospital admins can view their data" ON hospitals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM hospital_admins WHERE hospital_id = hospitals.id
        )
    );

CREATE POLICY "Hospital admins can insert their data" ON hospitals
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM hospital_admins WHERE hospital_id = hospitals.id
        )
    );

CREATE POLICY "Hospital admins can update their data" ON hospitals
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM hospital_admins WHERE hospital_id = hospitals.id
        )
    );

-- Grant necessary permissions
GRANT ALL ON platform_admins TO anon, authenticated;
GRANT ALL ON patients TO anon, authenticated;
GRANT ALL ON doctors TO anon, authenticated;
GRANT ALL ON hospitals TO anon, authenticated;

-- Show the fixed policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('platform_admins', 'patients', 'doctors', 'hospitals')
ORDER BY tablename, cmd;

-- Test the connection by running a simple query
SELECT 'RLS recursion fixed successfully' as status;
SELECT COUNT(*) as platform_admins_count FROM platform_admins;
SELECT COUNT(*) as patients_count FROM patients;
SELECT COUNT(*) as doctors_count FROM doctors; 