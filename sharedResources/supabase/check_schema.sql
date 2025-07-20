-- Diagnostic script to check table structure and data types
-- This will help us understand the actual schema

-- Check patients table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Check if patients table exists and has data
SELECT COUNT(*) as patient_count FROM patients;

-- Check auth.users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Check if test1@wopital.com user exists
SELECT id, email, created_at FROM auth.users WHERE email = 'test1@wopital.com';

-- Check hospitals table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'hospitals' 
ORDER BY ordinal_position;

-- Check doctors table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;

-- Check patient_vitals table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'patient_vitals' 
ORDER BY ordinal_position;

-- Check appointments table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- Check prescriptions table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'prescriptions' 
ORDER BY ordinal_position;

-- Check lab_results table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'lab_results' 
ORDER BY ordinal_position;

-- Check diagnoses table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'diagnoses' 
ORDER BY ordinal_position;

-- Check emergency_contacts table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'emergency_contacts' 
ORDER BY ordinal_position; 