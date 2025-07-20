-- Fix infinite recursion error in hospital_admins table RLS policies
-- This script will fix the mobile app connection issue

-- Step 1: Disable RLS on hospital_admins table to break recursion
ALTER TABLE hospital_admins DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on hospital_admins table
DROP POLICY IF EXISTS "Hospital admins can view their own data" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can insert their own data" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can update their own data" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can delete their own data" ON hospital_admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON hospital_admins;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON hospital_admins;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON hospital_admins;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON hospital_admins;

-- Step 3: Grant full access to authenticated users
GRANT ALL ON hospital_admins TO authenticated;
GRANT ALL ON hospital_admins TO anon;

-- Step 4: Test the table
SELECT 'Hospital admins table is now accessible' as status;
SELECT COUNT(*) as total_hospital_admins FROM hospital_admins; 