-- Fix existing users by creating patient profiles for those who don't have them
-- This will resolve the login issue for existing users

-- First, let's see what users exist and which ones have patient profiles
SELECT 
    au.id as user_id,
    au.email,
    au.raw_user_meta_data,
    CASE WHEN p.id IS NOT NULL THEN 'Has Profile' ELSE 'No Profile' END as profile_status
FROM auth.users au
LEFT JOIN patients p ON au.id = p.user_id
ORDER BY au.created_at DESC;

-- Create patient profiles for users who don't have them
INSERT INTO patients (
    user_id,
    first_name,
    last_name,
    phone,
    created_at,
    updated_at
)
SELECT 
    au.id as user_id,
    COALESCE(au.raw_user_meta_data->>'first_name', 'Patient') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', 'User') as last_name,
    COALESCE(au.raw_user_meta_data->>'phone', '') as phone,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users au
LEFT JOIN patients p ON au.id = p.user_id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Show the results after creating profiles
SELECT 
    au.id as user_id,
    au.email,
    p.first_name,
    p.last_name,
    CASE WHEN p.id IS NOT NULL THEN 'Profile Created' ELSE 'Still No Profile' END as status
FROM auth.users au
LEFT JOIN patients p ON au.id = p.user_id
ORDER BY au.created_at DESC;

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Patients can view their own data" ON patients;
DROP POLICY IF EXISTS "Patients can insert their own data" ON patients;
DROP POLICY IF EXISTS "Patients can update their own data" ON patients;

CREATE POLICY "Patients can view their own data" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own data" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update their own data" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON patients TO anon, authenticated;

-- Show final status
SELECT 'User profiles fixed successfully' as status;
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_patients FROM patients; 