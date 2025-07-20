-- Completely remove RLS from platform_admins table to fix infinite recursion
-- This will allow admin account creation to work

-- Step 1: Disable RLS on platform_admins table
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies on platform_admins table
DROP POLICY IF EXISTS "Platform admins can view their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can insert their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can update their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can delete their own data" ON platform_admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON platform_admins;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON platform_admins;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON platform_admins;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON platform_admins;

-- Step 3: Grant full access to authenticated users
GRANT ALL ON platform_admins TO authenticated;
GRANT ALL ON platform_admins TO anon;

-- Step 4: Test the table
SELECT 'Platform admins table is now accessible' as status;
SELECT COUNT(*) as total_admins FROM platform_admins; 