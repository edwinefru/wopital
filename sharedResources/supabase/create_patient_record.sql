-- Create a patient record for the logged-in user
-- Replace the user_id with your actual user ID from the logs

-- First, let's check what columns exist in the patients table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Now insert the patient record with only the columns that exist
INSERT INTO patients (
    user_id,
    first_name,
    last_name,
    phone,
    date_of_birth,
    gender,
    blood_type,
    created_at
) VALUES (
    '665f6c72-4e57-456a-a3cc-dbf4472a9b21', -- Your user ID from the logs
    'Edwin', -- Replace with your actual first name
    'Efru', -- Replace with your actual last name
    '+1234567890', -- Replace with your phone number
    '1990-01-01', -- Replace with your actual date of birth
    'Male', -- Replace with your gender
    'O+', -- Replace with your blood type if known
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    date_of_birth = EXCLUDED.date_of_birth,
    gender = EXCLUDED.gender,
    blood_type = EXCLUDED.blood_type,
    updated_at = NOW();

-- Verify the patient was created
SELECT * FROM patients WHERE user_id = '665f6c72-4e57-456a-a3cc-dbf4472a9b21'; 