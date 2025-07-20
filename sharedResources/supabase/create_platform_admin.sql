-- Create Platform Admin User with Password
-- Run this in your Supabase SQL editor to create a test platform admin

-- First, let's create the auth user (this will be done via Supabase Auth)
-- You'll need to create the user manually in Supabase Auth dashboard or via API
-- For now, we'll create a placeholder that you can update with the actual user_id

-- Step 1: Create a platform admin record (you'll need to update the user_id)
-- Replace 'YOUR_USER_ID_HERE' with the actual user_id from Supabase Auth

INSERT INTO platform_admins (
    id,
    user_id,
    first_name,
    last_name,
    email,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin-001',
    'YOUR_USER_ID_HERE', -- Replace this with actual user_id from Supabase Auth
    'Admin',
    'User',
    'admin@wopital.com',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Alternative - Create a function to help you create admin users
-- This function will help you create admin users more easily

CREATE OR REPLACE FUNCTION create_platform_admin(
    admin_email TEXT,
    admin_first_name TEXT,
    admin_last_name TEXT,
    admin_role TEXT DEFAULT 'admin'
) RETURNS TEXT AS $$
DECLARE
    new_user_id UUID;
    admin_id UUID;
BEGIN
    -- Generate a new UUID for the admin
    admin_id := uuid_generate_v4();
    
    -- Insert the platform admin record
    INSERT INTO platform_admins (
        id,
        user_id,
        first_name,
        last_name,
        email,
        role,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        admin_id,
        new_user_id, -- This will be NULL initially
        admin_first_name,
        admin_last_name,
        admin_email,
        admin_role,
        true,
        NOW(),
        NOW()
    );
    
    RETURN 'Platform admin record created with ID: ' || admin_id || 
           '. Please update the user_id field with the actual Supabase Auth user_id.';
END;
$$ LANGUAGE plpgsql;

-- Step 3: Instructions for creating the auth user
-- You need to create the auth user in Supabase Auth dashboard or via API
-- Here are the steps:

/*
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter the following details:
   - Email: admin@wopital.com
   - Password: Admin123! (or your preferred password)
   - Email Confirm: true
5. Copy the user_id from the created user
6. Update the user_id in the platform_admins table above
*/

-- Step 4: Query to check if platform admin exists
SELECT 
    'Platform Admin Status' as status,
    COUNT(*) as total_admins,
    STRING_AGG(email, ', ') as admin_emails
FROM platform_admins;

-- Step 5: Test query to verify the admin can access data
-- This will help verify that the RLS policies are working correctly
SELECT 
    'Test Query' as test_type,
    COUNT(*) as hospitals_count
FROM hospitals
WHERE EXISTS (
    SELECT 1 FROM platform_admins 
    WHERE user_id = auth.uid()
);

-- Step 6: Create a simple admin user for testing (if RLS is disabled)
-- Uncomment the following if you want to create a test admin without auth user

/*
INSERT INTO platform_admins (
    id,
    user_id,
    first_name,
    last_name,
    email,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'test-admin-001',
    NULL, -- No auth user for testing
    'Test',
    'Admin',
    'testadmin@wopital.com',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;
*/

-- Display current platform admins
SELECT 
    id,
    first_name,
    last_name,
    email,
    role,
    is_active,
    created_at
FROM platform_admins
ORDER BY created_at DESC; 