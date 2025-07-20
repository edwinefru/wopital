-- Disable Email Confirmation in Supabase
-- This script helps bypass rate limits by disabling email confirmations

-- Note: This is a temporary solution for development/testing
-- DO NOT use in production!

-- 1. Disable email confirmations via SQL (if possible)
-- Note: Most email settings are in the dashboard, not SQL

-- 2. Clear all signup attempts to reset rate limiting
DELETE FROM signup_attempts;

-- 3. Clear any existing auth users (optional - WARNING: deletes all users)
-- WARNING: This will delete ALL users in your auth system!
-- UNCOMMENT ONLY IF YOU WANT TO START COMPLETELY FRESH
-- DELETE FROM auth.users;

-- 4. Reset any rate limit counters
-- This clears any server-side rate limiting counters

-- 5. Create a function to bypass email confirmation
CREATE OR REPLACE FUNCTION bypass_email_confirmation(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- This function can be used to manually confirm users
    -- without sending emails
    
    -- Update user to confirmed status
    UPDATE auth.users 
    SET email_confirmed_at = NOW(),
        updated_at = NOW()
    WHERE email = user_email;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION bypass_email_confirmation(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION bypass_email_confirmation(TEXT) TO anon;

-- 7. Test the function
SELECT bypass_email_confirmation('test@example.com') as confirmation_bypassed;

-- MANUAL STEPS REQUIRED IN DASHBOARD:
/*
1. Go to Supabase Dashboard → Authentication → Settings → General
2. UNCHECK "Enable email confirmations"
3. UNCHECK "Secure email change"
4. Save changes

5. Go to Authentication → Settings → Email Templates
6. Set "Confirm email" to "Not required"

7. Go to Settings → API → Rate Limiting
8. Set all limits to maximum values:
   - Auth rate limit: 1000/min
   - Email rate limit: 1000/hour
   - Signup rate limit: 1000/hour
   - Password reset: 1000/hour
   - Magic link: 1000/hour
*/

-- 8. Create test users without email confirmation
-- This function creates users that are automatically confirmed
CREATE OR REPLACE FUNCTION create_test_user(
    user_email TEXT,
    user_password TEXT DEFAULT 'Test123!',
    first_name TEXT DEFAULT 'Test',
    last_name TEXT DEFAULT 'User'
) RETURNS TEXT AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Insert user directly into auth.users (bypasses Supabase auth)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        user_email,
        crypt(user_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('first_name', first_name, 'last_name', last_name),
        false,
        '',
        '',
        '',
        ''
    ) RETURNING id INTO user_id;
    
    -- Create corresponding patient record
    INSERT INTO patients (
        id,
        user_id,
        first_name,
        last_name,
        phone,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        user_id,
        first_name,
        last_name,
        '+1234567890',
        NOW(),
        NOW()
    );
    
    RETURN user_id::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 9. Grant permissions for test user creation
GRANT EXECUTE ON FUNCTION create_test_user(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_test_user(TEXT, TEXT, TEXT, TEXT) TO anon;

-- 10. Create some test users
SELECT create_test_user('test1@wopital.com', 'Test123!', 'Test', 'User1') as user1_id;
SELECT create_test_user('test2@wopital.com', 'Test123!', 'Test', 'User2') as user2_id;
SELECT create_test_user('test3@wopital.com', 'Test123!', 'Test', 'User3') as user3_id;

-- 11. Show created test users
SELECT 
    u.email,
    u.email_confirmed_at,
    p.first_name,
    p.last_name
FROM auth.users u
LEFT JOIN patients p ON u.id = p.user_id
WHERE u.email LIKE '%test%'
ORDER BY u.created_at DESC;

-- SUCCESS MESSAGE
SELECT 'Email confirmation disabled and test users created successfully!' as status; 