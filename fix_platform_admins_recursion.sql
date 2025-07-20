-- Fix infinite recursion error in platform_admins table RLS policies
-- This script will disable RLS temporarily, drop problematic policies, and recreate them safely

-- Step 1: Disable RLS on platform_admins table to break recursion
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on platform_admins table
DROP POLICY IF EXISTS "Platform admins can view their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can insert their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can update their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can delete their own data" ON platform_admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON platform_admins;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON platform_admins;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON platform_admins;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON platform_admins;

-- Step 3: Re-enable RLS
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
CREATE POLICY "Platform admins can view their own data" ON platform_admins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can insert their own data" ON platform_admins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Platform admins can update their own data" ON platform_admins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can delete their own data" ON platform_admins
    FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Grant necessary permissions
GRANT ALL ON platform_admins TO authenticated;
GRANT ALL ON platform_admins TO anon;

-- Step 6: Verify the fix
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

-- Step 7: Test the connection
SELECT COUNT(*) FROM platform_admins LIMIT 1; 