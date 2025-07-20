-- Fix Rate Limits in Supabase
-- This script helps increase rate limits to prevent "email rate limit exceeded" errors

-- Note: Most rate limits are configured in Supabase Dashboard, not via SQL
-- This script provides guidance and some database-level fixes

-- 1. Check current rate limit settings
-- Go to Supabase Dashboard > Settings > API > Rate Limiting
-- Increase these values:
-- - Auth rate limit: 100 requests per minute (default is often 10)
-- - Email rate limit: 50 emails per hour (default is often 10)
-- - Signup rate limit: 20 signups per hour (default is often 5)

-- 2. Create a function to track signup attempts in database
CREATE OR REPLACE FUNCTION track_signup_attempt(
    user_email TEXT,
    attempt_success BOOLEAN DEFAULT false
) RETURNS VOID AS $$
BEGIN
    -- Insert or update signup attempt tracking
    INSERT INTO signup_attempts (email, attempt_count, last_attempt, success)
    VALUES (user_email, 1, NOW(), attempt_success)
    ON CONFLICT (email) DO UPDATE SET
        attempt_count = signup_attempts.attempt_count + 1,
        last_attempt = NOW(),
        success = EXCLUDED.success;
END;
$$ LANGUAGE plpgsql;

-- 3. Create signup attempts tracking table
CREATE TABLE IF NOT EXISTS signup_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_signup_attempts_email ON signup_attempts(email);
CREATE INDEX IF NOT EXISTS idx_signup_attempts_last_attempt ON signup_attempts(last_attempt);

-- 5. Create function to check if signup is allowed
CREATE OR REPLACE FUNCTION can_signup(
    user_email TEXT,
    max_attempts INTEGER DEFAULT 5,
    time_window_hours INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
    total_attempts INTEGER;
    time_window TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get attempt count within time window
    time_window := NOW() - INTERVAL '1 hour' * time_window_hours;
    
    SELECT COALESCE(SUM(attempt_count), 0) INTO total_attempts
    FROM signup_attempts
    WHERE email = user_email
    AND last_attempt > time_window
    AND success = false;
    
    RETURN total_attempts < max_attempts;
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to clean up old signup attempts
CREATE OR REPLACE FUNCTION cleanup_old_signup_attempts(
    days_old INTEGER DEFAULT 7
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM signup_attempts
    WHERE last_attempt < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 7. Create a scheduled job to clean up old attempts (if using pg_cron)
-- Uncomment if you have pg_cron extension enabled
/*
SELECT cron.schedule(
    'cleanup-signup-attempts',
    '0 2 * * *', -- Daily at 2 AM
    'SELECT cleanup_old_signup_attempts(7);'
);
*/

-- 8. Grant permissions
GRANT ALL ON signup_attempts TO authenticated;
GRANT ALL ON signup_attempts TO anon;
GRANT EXECUTE ON FUNCTION track_signup_attempt(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION track_signup_attempt(TEXT, BOOLEAN) TO anon;
GRANT EXECUTE ON FUNCTION can_signup(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION can_signup(TEXT, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION cleanup_old_signup_attempts(INTEGER) TO authenticated;

-- 9. Enable RLS on signup_attempts table
ALTER TABLE signup_attempts ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
DROP POLICY IF EXISTS "Users can view own signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Users can insert own signup attempts" ON signup_attempts;
DROP POLICY IF EXISTS "Users can update own signup attempts" ON signup_attempts;

CREATE POLICY "Users can view own signup attempts" ON signup_attempts
    FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert own signup attempts" ON signup_attempts
    FOR INSERT WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update own signup attempts" ON signup_attempts
    FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- 11. Test the functions
SELECT 'Rate limit functions created successfully' as status;

-- Test can_signup function
SELECT can_signup('test@example.com') as can_signup_test;

-- Show current signup attempts (if any)
SELECT 
    email,
    attempt_count,
    last_attempt,
    success,
    CASE 
        WHEN last_attempt > NOW() - INTERVAL '1 hour' THEN 'Recent'
        ELSE 'Old'
    END as status
FROM signup_attempts
ORDER BY last_attempt DESC
LIMIT 10;

-- Instructions for Supabase Dashboard:
/*
1. Go to Supabase Dashboard > Settings > API > Rate Limiting
2. Increase these values:
   - Auth rate limit: 100 requests per minute
   - Email rate limit: 50 emails per hour  
   - Signup rate limit: 20 signups per hour
   - Password reset rate limit: 10 per hour
   - Magic link rate limit: 10 per hour

3. Go to Authentication > Settings > Email Templates
4. Make sure email confirmation is enabled
5. Set "Confirm email" to "Required" for better security

6. Go to Authentication > Settings > General
7. Set "Enable email confirmations" to true
8. Set "Secure email change" to true

These changes will significantly reduce rate limit errors.
*/ 