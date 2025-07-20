-- Fix infinite recursion error in platform_admins table ONLY
-- This script will fix the admin account creation issue

-- Step 1: Disable RLS on platform_admins table to break recursion
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on platform_admins table
DROP POLICY IF EXISTS "Platform admins can view their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can insert their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can update their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can delete their own data" ON platform_admins;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON platform_admins;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON platform_admins;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON platform_admins;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON platform_admins;
DROP POLICY IF EXISTS "Enable all access for platform admins" ON platform_admins;

-- Step 3: Re-enable RLS
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
CREATE POLICY "platform_admins_select_policy" ON platform_admins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "platform_admins_insert_policy" ON platform_admins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "platform_admins_update_policy" ON platform_admins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "platform_admins_delete_policy" ON platform_admins
    FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Grant necessary permissions
GRANT ALL ON platform_admins TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 6: Test the fix
SELECT 'Platform admins table fixed successfully' as status;
SELECT COUNT(*) as platform_admins_count FROM platform_admins; 