# 🗄️ Supabase Setup Guide for Wopital

## 📋 **Prerequisites**
- Supabase account (free tier available)
- Basic knowledge of SQL

## 🚀 **Step 1: Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** to your account
3. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `wopital`
   - Enter database password (save this!)
   - Choose region closest to your users
   - Click "Create new project"

## 🗄️ **Step 2: Run Database Schema**

1. **Open SQL Editor**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New Query"

2. **Copy and Paste Schema**
   - Open `sharedResources/supabase/complete_database_setup.sql`
   - Copy the entire content
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Setup**
   - Go to "Table Editor" in Supabase
   - You should see all tables created:
     - `hospitals`
     - `hospital_admins`
     - `platform_admins`
     - `doctors`
     - `patients`
     - `emergency_contacts`
     - `patient_vitals`
     - `diagnoses`
     - `medical_records`
     - `appointments`
     - `appointment_actions`
     - `medications`
     - `prescriptions`
     - `immunizations`
     - `lab_results`
     - `payments`
     - `subscriptions`
     - `subscription_keys`

## 🔑 **Step 3: Get API Keys**

1. **Go to Settings**
   - In Supabase dashboard, click "Settings" (gear icon)
   - Click "API"

2. **Copy Keys**
   - **Project URL**: Copy the "Project URL"
   - **Anon Key**: Copy the "anon public" key
   - **Service Role Key**: Copy the "service_role" key (keep this secret!)

## ⚙️ **Step 4: Configure Environment Variables**

### **Platform Admin (.env)**
```bash
cd platformAdmin
# Create .env file
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Hospital Admin (.env)**
```bash
cd hospitalAdmin
# Create .env file
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **Patient Mobile App (.env)**
```bash
cd patientMobileApp
# Create .env file
EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🔐 **Step 5: Configure Authentication**

1. **Go to Authentication Settings**
   - In Supabase dashboard, click "Authentication"
   - Click "Settings"

2. **Configure Email Auth**
   - Enable "Enable email confirmations" (optional)
   - Set "Secure email change" to enabled
   - Configure "Site URL" to your domain

3. **Configure OAuth (Optional)**
   - Enable Google, GitHub, or other providers
   - Add redirect URLs for your apps

## 📁 **Step 6: Configure Storage**

1. **Go to Storage**
   - In Supabase dashboard, click "Storage"

2. **Verify Buckets Created**
   - `medical-records` (private)
   - `avatars` (public)
   - `lab-results` (private)

3. **Test File Upload**
   - Try uploading a test file to verify permissions

## 👥 **Step 7: Create Initial Platform Admin**

1. **Go to SQL Editor**
2. **Run this query** (replace with your email):

```sql
-- Insert a platform admin user
INSERT INTO platform_admins (user_id, first_name, last_name, email, role)
VALUES (
  'your_user_id_here', -- Get this from auth.users after signing up
  'Admin',
  'User',
  'admin@wopital.com',
  'super_admin'
);
```

3. **Get User ID**
   - Sign up through your app or Supabase Auth
   - Go to "Authentication" > "Users"
   - Copy the user ID
   - Update the SQL query above with the real user ID

## 🧪 **Step 8: Test the Setup**

### **Test Database Connection**
```bash
# Test from any app directory
npm start
```

### **Test Authentication**
1. Try to sign up a new user
2. Try to sign in
3. Check if user appears in Supabase Auth

### **Test Data Operations**
1. Create a hospital
2. Create a patient
3. Create an appointment
4. Verify data appears in Supabase tables

## 🔧 **Step 9: Environment-Specific Configuration**

### **Development**
- Use localhost URLs for redirects
- Enable all debug logging

### **Production**
- Update Site URL in Auth settings
- Configure proper redirect URLs
- Set up custom domain (optional)

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"Invalid API Key" Error**
   - Check that you copied the correct keys
   - Verify the keys are in the right environment variables

2. **"Table doesn't exist" Error**
   - Make sure you ran the complete database setup script
   - Check that all tables were created

3. **"RLS Policy" Error**
   - Verify RLS policies were created
   - Check that users have proper roles

4. **"Storage Permission" Error**
   - Verify storage buckets exist
   - Check storage policies are correct

### **Debug Steps:**
1. Check Supabase logs in dashboard
2. Verify environment variables are loaded
3. Test API calls in Supabase dashboard
4. Check browser console for errors

## 📞 **Support**

If you encounter issues:
1. Check Supabase documentation
2. Review the error logs
3. Verify all setup steps were completed
4. Test with a fresh project if needed

## ✅ **Verification Checklist**

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] All tables visible in Table Editor
- [ ] API keys copied to environment files
- [ ] Authentication configured
- [ ] Storage buckets created
- [ ] Initial platform admin created
- [ ] Apps can connect to Supabase
- [ ] User registration works
- [ ] Data operations work

---

**Your Wopital platform is now ready to use! 🎉** 