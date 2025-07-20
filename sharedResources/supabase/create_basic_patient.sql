-- Simple script to create a basic patient record for test1@wopital.com
-- This uses only the columns we know exist from the schema

DO $$
DECLARE
    test_user_id UUID;
    new_patient_id UUID;
BEGIN
    -- Get the user_id for test1@wopital.com
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test1@wopital.com';
    
    IF test_user_id IS NULL THEN
        RAISE EXCEPTION 'User test1@wopital.com not found. Please create the user first.';
    END IF;
    
    RAISE NOTICE 'Found user ID: %', test_user_id;
    
    -- Create a basic patient record using only the columns we know exist
    INSERT INTO patients (
        id,
        name, 
        phone, 
        email,
        relationship,
        created_at
    ) VALUES (
        gen_random_uuid(),
        'John Doe',
        '+1234567890',
        'test1@wopital.com',
        'Self',
        NOW()
    ) RETURNING id INTO new_patient_id;
    
    RAISE NOTICE 'Successfully created patient record with ID: %', new_patient_id;
    RAISE NOTICE '=== PATIENT CREATION COMPLETE ===';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error creating patient: %', SQLERRM;
END $$; 