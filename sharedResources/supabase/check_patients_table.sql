-- Check the exact structure of the patients table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Check if there are any existing patients
SELECT COUNT(*) as patient_count FROM patients;

-- Show a few sample records if any exist
SELECT * FROM patients LIMIT 3; 