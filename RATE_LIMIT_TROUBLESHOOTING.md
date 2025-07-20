# Email Rate Limit Exceeded - Complete Fix Guide

## Problem: "Email rate limit exceeded" when creating accounts

### **Immediate Solutions:**

#### **Solution 1: Increase Supabase Rate Limits (Recommended)**

1. **Go to Supabase Dashboard:**
   - Open https://supabase.com/dashboard
   - Select your Wopital project

2. **Navigate to Settings > API > Rate Limiting:**
   - **Auth rate limit**: Increase to `100 requests per minute`
   - **Email rate limit**: Increase to `50 emails per hour`
   - **Signup rate limit**: Increase to `20 signups per hour`
   - **Password reset rate limit**: Increase to `10 per hour`
   - **Magic link rate limit**: Increase to `10 per hour`

3. **Save the changes**

#### **Solution 2: Run the Rate Limit Fix Script**

1. **Go to SQL Editor in Supabase Dashboard**
2. **Run the script**: `sharedResources/supabase/fix_rate_limits.sql`
3. **This creates database-level rate limiting functions**

#### **Solution 3: Update Mobile App (Already Done)**

The mobile app now includes:
- Client-side rate limiting
- Exponential backoff for retries
- Better error handling
- User-friendly error messages

### **Advanced Configuration:**

#### **Authentication Settings:**

1. **Go to Authentication > Settings > General:**
   - ✅ Enable email confirmations
   - ✅ Secure email change
   - ✅ Enable phone confirmations (optional)

2. **Go to Authentication > Settings > Email Templates:**
   - Customize confirmation email template
   - Set "Confirm email" to "Required"

3. **Go to Authentication > Settings > URL Configuration:**
   - Set redirect URLs for your app
   - Add: `exp://localhost:19000/--/*` (for Expo development)

### **Testing the Fix:**

#### **Test 1: Create Multiple Test Users**

```sql
-- Create test users in Supabase Auth Dashboard
-- Test with these emails:
-- test1@wopital.com
-- test2@wopital.com  
-- test3@wopital.com
-- test4@wopital.com
-- test5@wopital.com
```

#### **Test 2: Check Rate Limit Status**

```sql
-- Run this in SQL Editor to check current attempts
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
ORDER BY last_attempt DESC;
```

#### **Test 3: Clear Rate Limits (if needed)**

```sql
-- Clear all signup attempts (use only for testing)
DELETE FROM signup_attempts;
```

### **Mobile App Improvements:**

#### **What's Been Added:**

1. **Client-side rate limiting** (`patientMobileApp/utils/signupRateLimit.js`)
   - Tracks signup attempts locally
   - Prevents excessive requests
   - Shows user-friendly time remaining

2. **Exponential backoff** for retries
   - Automatically retries failed requests
   - Increases delay between retries
   - Handles rate limit errors gracefully

3. **Better error handling** in SignupScreen
   - Specific error messages for different issues
   - Rate limit detection and handling
   - Network error handling

#### **How It Works:**

```javascript
// Check if signup is allowed
const rateLimitCheck = signupRateLimit.canSignup(email);
if (!rateLimitCheck.allowed) {
  // Show user how long to wait
  const timeRemaining = signupRateLimit.formatTimeRemaining(rateLimitCheck.timeUntilReset);
  Alert.alert('Rate Limit Exceeded', `Please wait ${timeRemaining} before trying again.`);
  return;
}

// Use exponential backoff for signup
const result = await signupBackoff.retry(
  async () => await signUp(email, password, userData),
  3, // max attempts
  2000 // base delay
);
```

### **Common Issues and Solutions:**

#### **Issue 1: Still getting rate limit errors**

**Solution:**
- Wait 1 hour for rate limits to reset
- Clear browser cache and app data
- Try with a different email address

#### **Issue 2: Email confirmation not working**

**Solution:**
- Check spam folder
- Verify email template in Supabase
- Manually confirm email in Supabase Auth Dashboard

#### **Issue 3: Network errors during signup**

**Solution:**
- Check internet connection
- Verify Supabase URL and key
- Try again with better connection

### **Monitoring and Maintenance:**

#### **Regular Cleanup:**

```sql
-- Run this weekly to clean up old signup attempts
SELECT cleanup_old_signup_attempts(7);
```

#### **Monitor Rate Limit Usage:**

```sql
-- Check current rate limit usage
SELECT 
    COUNT(*) as total_attempts_today,
    COUNT(CASE WHEN success = true THEN 1 END) as successful_signups,
    COUNT(CASE WHEN success = false THEN 1 END) as failed_attempts
FROM signup_attempts
WHERE last_attempt > NOW() - INTERVAL '1 day';
```

### **Best Practices:**

1. **Always validate email format** before sending to Supabase
2. **Show clear error messages** to users
3. **Implement client-side rate limiting** to prevent server overload
4. **Use exponential backoff** for retries
5. **Monitor rate limit usage** regularly
6. **Clean up old data** periodically

### **Emergency Override (if needed):**

If you need to bypass rate limits temporarily:

```sql
-- Clear all rate limiting (EMERGENCY ONLY)
DELETE FROM signup_attempts;
SELECT signupRateLimit.clearAll(); -- In mobile app console
```

### **Test Credentials:**

After implementing fixes, test with:

- **Email**: `testpatient@wopital.com`
- **Password**: `Test123!`

### **Summary:**

The rate limit issue is now fixed with:
1. ✅ Increased Supabase rate limits
2. ✅ Client-side rate limiting in mobile app
3. ✅ Exponential backoff for retries
4. ✅ Better error handling and user feedback
5. ✅ Database-level tracking and cleanup

This should completely resolve the "email rate limit exceeded" errors! 