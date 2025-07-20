-- Create Test Platform Admin User
-- This creates a platform admin with a specific user_id for testing

-- First, let's temporarily disable RLS to allow insertion
ALTER TABLE platform_admins DISABLE ROW LEVEL SECURITY;

-- Create a test platform admin user
-- Using a known UUID for testing purposes
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
    '00000000-0000-0000-0000-000000000001', -- Test user_id
    'Test',
    'Admin',
    'testadmin@wopital.com',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Create a real platform admin user (you'll need to create the auth user first)
-- Replace the user_id with the actual user_id from Supabase Auth
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
    'real-admin-001',
    'REPLACE_WITH_ACTUAL_USER_ID', -- Replace this with actual user_id
    'Admin',
    'User',
    'admin@wopital.com',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Display all platform admins
SELECT 
    'Platform Admins' as table_name,
    COUNT(*) as total_count
FROM platform_admins;

SELECT 
    id,
    first_name,
    last_name,
    email,
    role,
    is_active,
    CASE 
        WHEN user_id IS NULL THEN 'No Auth User'
        WHEN user_id = '00000000-0000-0000-0000-000000000001' THEN 'Test User'
        ELSE 'Real Auth User'
    END as user_type,
    created_at
FROM platform_admins
ORDER BY created_at DESC;

-- Instructions for creating the auth user:
/*
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Enter:
   - Email: admin@wopital.com
   - Password: Admin123!
   - Email Confirm: true
4. Copy the user_id from the created user
5. Update the 'REPLACE_WITH_ACTUAL_USER_ID' above with the real user_id
6. Run this script again to create the real admin
*/ 