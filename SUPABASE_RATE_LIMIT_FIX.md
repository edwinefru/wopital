# URGENT: Fix Supabase Rate Limits in Dashboard

## **The Problem:**
The rate limit errors are coming from **Supabase's server-side rate limiting**, not our database functions. We need to increase the limits in the Supabase Dashboard.

## **IMMEDIATE FIX - Follow These Steps:**

### **Step 1: Go to Supabase Dashboard**
1. Open: https://supabase.com/dashboard
2. Select your **Wopital** project
3. Click on **Settings** (gear icon) in the left sidebar

### **Step 2: Increase API Rate Limits**
1. Click on **API** in the settings menu
2. Scroll down to **Rate Limiting** section
3. **CHANGE THESE VALUES:**

```
Current (Default) → New (Recommended)
Auth rate limit: 10/min → 100/min
Email rate limit: 10/hour → 50/hour  
Signup rate limit: 5/hour → 20/hour
Password reset: 5/hour → 10/hour
Magic link: 5/hour → 10/hour
```

### **Step 3: Authentication Settings**
1. Go to **Authentication** → **Settings**
2. Click on **General** tab
3. **ENABLE THESE:**
   - ✅ Enable email confirmations
   - ✅ Secure email change
   - ✅ Enable phone confirmations (optional)

### **Step 4: Email Templates**
1. Go to **Authentication** → **Settings**
2. Click on **Email Templates**
3. **CONFIGURE:**
   - Set "Confirm email" to **Required**
   - Customize email templates if needed

### **Step 5: URL Configuration**
1. Go to **Authentication** → **Settings**
2. Click on **URL Configuration**
3. **ADD THESE REDIRECT URLs:**
   ```
   exp://localhost:19000/--/*
   exp://192.168.*.*:19000/--/*
   http://localhost:3000
   http://localhost:3001
   http://localhost:3002
   ```

## **ALTERNATIVE: Disable Rate Limiting (Development Only)**

If you're still getting rate limit errors, you can temporarily disable rate limiting:

### **Option A: Disable in Dashboard**
1. Go to **Settings** → **API** → **Rate Limiting**
2. Set all limits to very high values:
   ```
   Auth rate limit: 1000/min
   Email rate limit: 1000/hour
   Signup rate limit: 1000/hour
   ```

### **Option B: Use Different Email Domains**
For testing, use different email domains to avoid rate limits:
```
test1@wopital.com
test2@wopital.com
test3@wopital.com
test4@wopital.com
test5@wopital.com
```

## **TEST THE FIX:**

### **Test 1: Create Multiple Accounts**
Try creating accounts with different emails:
- `test1@wopital.com`
- `test2@wopital.com`
- `test3@wopital.com`

### **Test 2: Check Current Rate Limits**
Run this in Supabase SQL Editor:
```sql
-- Check if rate limit functions are working
SELECT can_signup('test@example.com') as can_signup_test;

-- View current attempts
SELECT * FROM signup_attempts ORDER BY last_attempt DESC LIMIT 5;
```

### **Test 3: Clear Rate Limits (if needed)**
```sql
-- Clear all signup attempts (EMERGENCY ONLY)
DELETE FROM signup_attempts;
```

## **POWERSHELL COMMANDS (Fixed):**

Since you're on Windows PowerShell, use these commands in **separate terminal windows**:

### **Terminal 1 - Platform Admin:**
```powershell
cd platformAdmin
npm start
```

### **Terminal 2 - Hospital Admin:**
```powershell
cd hospitalAdmin
npm start
```

### **Terminal 3 - Mobile App:**
```powershell
cd patientMobileApp
npx expo start --lan
```

**Note:** PowerShell doesn't support `&&` operator. Run each command separately.

## **EMERGENCY OVERRIDE:**

If you need to bypass rate limits completely for testing:

### **Option 1: Use Different Supabase Project**
1. Create a new Supabase project
2. Update environment variables in all apps
3. Run the database setup scripts

### **Option 2: Use Mock Authentication**
1. Temporarily disable Supabase auth
2. Use local authentication for testing
3. Re-enable Supabase auth later

## **VERIFICATION:**

After making changes in Supabase Dashboard:

1. **Wait 5-10 minutes** for changes to take effect
2. **Clear browser cache** and app data
3. **Try creating accounts** with different emails
4. **Check Supabase logs** for rate limit errors

## **SUPPORT:**

If you're still getting rate limit errors after following these steps:

1. **Check Supabase status**: https://status.supabase.com
2. **Contact Supabase support** if needed
3. **Use different email domains** for testing
4. **Consider upgrading Supabase plan** for higher limits

## **SUMMARY:**

The rate limit issue is **server-side** in Supabase, not in our code. You must:
1. ✅ Increase rate limits in Supabase Dashboard
2. ✅ Configure authentication settings
3. ✅ Add redirect URLs
4. ✅ Test with different email domains

This should completely resolve the rate limit errors across all three apps! 