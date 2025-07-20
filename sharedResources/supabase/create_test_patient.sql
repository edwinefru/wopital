-- Create Test Patient User for Mobile App
-- This creates a test patient that can be used to test the mobile app login

-- First, let's create a test patient record
-- You'll need to create the auth user in Supabase Auth dashboard first

INSERT INTO patients (
    id,
    user_id,
    first_name,
    last_name,
    phone,
    date_of_birth,
    gender,
    blood_type,
    height_cm,
    weight_kg,
    emergency_contact,
    hospital_id,
    created_at,
    updated_at
) VALUES (
    'test-patient-001',
    'REPLACE_WITH_ACTUAL_USER_ID', -- Replace with actual user_id from Supabase Auth
    'Test',
    'Patient',
    '+233-24-999-9999',
    '1990-01-01',
    'Male',
    'O+',
    175.0,
    70.0,
    '{"name": "Emergency Contact", "phone": "+233-24-888-8888", "relationship": "Spouse"}',
    '550e8400-e29b-41d4-a716-446655440001', -- Central General Hospital
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create a test patient with a known user_id for immediate testing
INSERT INTO patients (
    id,
    user_id,
    first_name,
    last_name,
    phone,
    date_of_birth,
    gender,
    blood_type,
    height_cm,
    weight_kg,
    emergency_contact,
    hospital_id,
    created_at,
    updated_at
) VALUES (
    'test-patient-002',
    '00000000-0000-0000-0000-000000000002', -- Test user_id
    'Mobile',
    'Tester',
    '+233-24-777-7777',
    '1985-05-15',
    'Female',
    'A+',
    165.0,
    60.0,
    '{"name": "Test Contact", "phone": "+233-24-666-6666", "relationship": "Friend"}',
    '550e8400-e29b-41d4-a716-446655440002', -- Korle Bu Teaching Hospital
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Display all patients
SELECT 
    'Patients' as table_name,
    COUNT(*) as total_count
FROM patients;

SELECT 
    id,
    first_name,
    last_name,
    email,
    phone,
    CASE 
        WHEN user_id IS NULL THEN 'No Auth User'
        WHEN user_id = '00000000-0000-0000-0000-000000000002' THEN 'Test User'
        ELSE 'Real Auth User'
    END as user_type,
    created_at
FROM patients
ORDER BY created_at DESC;

-- Instructions for creating the auth user:
/*
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Enter:
   - Email: testpatient@wopital.com
   - Password: Test123!
   - Email Confirm: true
4. Copy the user_id from the created user
5. Update the 'REPLACE_WITH_ACTUAL_USER_ID' above with the real user_id
6. Run this script again to create the real patient

Test Login Credentials:
- Email: testpatient@wopital.com
- Password: Test123!
*/ 