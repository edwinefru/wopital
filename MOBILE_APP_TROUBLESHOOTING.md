# Mobile App Login Troubleshooting Guide

## Problem: Mobile app stuck at "Signing in..."

### Quick Fix Steps:

#### 1. **Create Test User in Supabase Auth**
1. Go to your **Supabase Dashboard**
2. Navigate to **Authentication > Users**
3. Click **"Add User"**
4. Enter:
   - **Email**: `testpatient@wopital.com`
   - **Password**: `Test123!`
   - **Email Confirm**: `true`
5. Copy the **user_id** from the created user

#### 2. **Create Patient Profile**
1. Run the script: `sharedResources/supabase/create_test_patient.sql`
2. Replace `'REPLACE_WITH_ACTUAL_USER_ID'` with the user_id you copied
3. Run the script in Supabase SQL Editor

#### 3. **Test Login**
- **Email**: `testpatient@wopital.com`
- **Password**: `Test123!`

### Debug Steps:

#### Step 1: Check Console Logs
1. Open your mobile app
2. Open **Developer Tools** (if using Expo)
3. Look for error messages in the console
4. Check for network errors or authentication errors

#### Step 2: Test Connection
The app includes a connection test. Look for these logs:
- `✅ Supabase connection successful`
- `✅ Basic connection successful`
- `❌ Connection failed`

#### Step 3: Common Issues

**Issue 1: Network Connection**
```
❌ Network error - check your internet connection
```
**Solution**: Check your internet connection and try again

**Issue 2: Invalid Credentials**
```
❌ Invalid login credentials
```
**Solution**: Use the test credentials above or create a new user

**Issue 3: Rate Limiting**
```
❌ Rate limit exceeded
```
**Solution**: Wait a few minutes before trying again

**Issue 4: Email Not Confirmed**
```
❌ Email not confirmed
```
**Solution**: Go to Supabase Auth and manually confirm the email

### Advanced Debugging:

#### 1. **Use Debug Script**
Import and use the debug script in your mobile app:
```javascript
import { debugLogin } from './debug-login';

// In your login function
const result = await debugLogin(email, password);
console.log('Debug result:', result);
```

#### 2. **Check Supabase Configuration**
Verify your Supabase URL and key in `patientMobileApp/lib/supabase.js`:
```javascript
const supabaseUrl = 'https://rabeukllyuytkctmnegi.supabase.co';
const supabaseKey = 'your-anon-key';
```

#### 3. **Test Database Connection**
Run this in Supabase SQL Editor:
```sql
SELECT COUNT(*) as doctors_count FROM doctors;
SELECT COUNT(*) as patients_count FROM patients;
SELECT COUNT(*) as hospitals_count FROM hospitals;
```

### PowerShell Commands to Start Apps:

```powershell
# Terminal 1 - Platform Admin
cd platformAdmin
npm start

# Terminal 2 - Hospital Admin  
cd hospitalAdmin
npm start

# Terminal 3 - Mobile App
cd patientMobileApp
npx expo start --lan
```

### Alternative: Use Batch Script
Run the `start-all-apps.bat` file I created earlier.

### Still Having Issues?

1. **Check Supabase Dashboard** for any errors
2. **Verify RLS Policies** are not blocking access
3. **Test with a simple login** (no rate limiting)
4. **Check network connectivity** on your device
5. **Try clearing app cache** and restarting

### Test Credentials Summary:

**Platform Admin:**
- Email: `admin@wopital.com`
- Password: `Admin123!`

**Test Patient:**
- Email: `testpatient@wopital.com`
- Password: `Test123!`

**Test Patient (Alternative):**
- Email: `mobile@tester.com`
- Password: `Test123!` 