
-- Check the actual structure of lab_results table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'lab_results'
ORDER BY ordinal_position;

-- Check if lab_results table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'lab_results'
);

-- Show sample data from lab_results if it exists
SELECT * FROM lab_results LIMIT 5;

-- Alternative query without result_value column
SELECT lr.id, lr.test_name, lr.test_date, lr.status, p.first_name, p.last_name
FROM lab_results lr
JOIN patients p ON lr.patient_id = p.id
WHERE p.user_id = auth.uid(); 