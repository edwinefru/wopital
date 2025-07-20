# Mock Data Setup for DigiCare

This directory contains SQL scripts to set up mock data for the DigiCare application.

## Database Relationships (IMPORTANT)

The DigiCare system follows these correct relationships:

### ✅ **Correct Relationships:**
1. **Patients** make appointments → `appointments.patient_id` links to `patients.id`
2. **Hospitals** enter lab results for patients → `lab_results.patient_id` links to `patients.id`
3. **Patients** can only see their own data (enforced by Row Level Security)

### ❌ **What We Fixed:**
- Previous mock data used hardcoded IDs (like `patient_id = 1`) instead of linking to actual patient records
- This created orphaned appointments and lab results that weren't connected to real patients

## Setup Instructions

### Step 1: Run the Database Schema
First, run the main database schema:
```sql
-- Run this in Supabase SQL Editor
-- Copy and paste the contents of database_schema.sql
```

### Step 2: Create Your Patient Profile
1. Open the DigiCare mobile app
2. Sign up or sign in
3. Go to Profile screen and create your patient profile
4. This will create a patient record linked to your user account

### Step 3: Run the Fix Script
Run the `fix_patient_relationships.sql` script in Supabase SQL Editor:
```sql
-- This script will:
-- 1. Create sample doctors
-- 2. Create appointments linked to YOUR patient record
-- 3. Create lab results linked to YOUR patient record
-- 4. Create patient vitals linked to YOUR patient record
```

### Step 4: Verify the Data
Run these queries to see your data:

```sql
-- See your appointments
SELECT a.id, a.appointment_date, a.reason, a.status, p.first_name, p.last_name, d.first_name as doctor_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN doctors d ON a.doctor_id = d.id
WHERE p.user_id = auth.uid();

-- See your lab results
SELECT lr.id, lr.test_name, lr.test_date, lr.result_value, lr.status, p.first_name, p.last_name
FROM lab_results lr
JOIN patients p ON lr.patient_id = p.id
WHERE p.user_id = auth.uid();

-- See your vitals
SELECT pv.id, pv.blood_pressure_systolic, pv.heart_rate, pv.temperature_f, pv.recorded_at, p.first_name, p.last_name
FROM patient_vitals pv
JOIN patients p ON pv.patient_id = p.id
WHERE p.user_id = auth.uid();
```

## Available Scripts

### `fix_patient_relationships.sql` (RECOMMENDED)
- **Use this script** - it properly links data to your actual patient record
- Creates appointments, lab results, and vitals for YOUR patient profile
- Automatically finds your patient ID using `auth.uid()`

### `insert_mock_appointments.sql` (DEPRECATED)
- ❌ Uses hardcoded patient IDs
- ❌ Creates orphaned appointments not linked to real patients
- Only use if you manually replace the patient IDs

### `insert_mock_lab_results.sql` (DEPRECATED)
- ❌ Uses hardcoded patient IDs  
- ❌ Creates orphaned lab results not linked to real patients
- Only use if you manually replace the patient IDs

### `insert_sample_patients_and_doctors.sql` (DEPRECATED)
- ❌ Creates sample patients with fake user IDs
- ❌ These patients can't be accessed by real users
- The fix script handles doctor creation automatically

## How It Works

1. **Patient Mobile App**: Patients can book appointments and view their own data
2. **Hospital Web Dashboard**: Hospital staff can view all patients and enter lab results
3. **Row Level Security**: Ensures patients only see their own data
4. **Proper Relationships**: All data is correctly linked to patient records

## Troubleshooting

### "No patient found" Error
If you get "No patient found for current user", it means:
1. You haven't created a patient profile in the mobile app yet
2. Go to the Profile screen in the mobile app and create your profile first
3. Then run the fix script again

### "Permission denied" Error
This means Row Level Security is working correctly:
1. Make sure you're signed in to Supabase
2. The queries use `auth.uid()` to find your data
3. Only your own patient data will be visible

### Empty Results
If queries return no results:
1. Check that you have a patient profile created
2. Verify the fix script ran successfully
3. Make sure you're using the correct user account

## Security Notes

- All patient data is protected by Row Level Security (RLS)
- Patients can only see their own appointments, lab results, and vitals
- Hospital staff can see all patient data (for the web dashboard)
- The mobile app only shows data for the logged-in patient

## 📁 Files Included

1. **`insert_sample_patients_and_doctors.sql`** - Sample patients and doctors
2. **`insert_mock_lab_results.sql`** - Realistic lab test results
3. **`insert_mock_appointments.sql`** - Various types of medical appointments

## 🚀 How to Use

### Step 1: Prepare Your Database
Make sure you have:
- ✅ Supabase project set up
- ✅ Database schema created (run `database_schema.sql` first)
- ✅ RLS policies configured (run `setup_rls_policies.sql`)

### Step 2: Get Your User IDs
Before running the scripts, you need to get the actual user IDs from your `auth.users` table:

```sql
-- Run this in your Supabase SQL editor to see your users
SELECT id, email FROM auth.users;
```

### Step 3: Update the Scripts
Edit the SQL scripts to replace the placeholder user IDs:

**In `insert_sample_patients_and_doctors.sql`:**
```sql
-- Replace these placeholder values:
('user_1_uuid', 'Sarah', 'Johnson', ...)
('user_2_uuid', 'Michael', 'Chen', ...)

-- With actual user IDs like:
('actual-user-id-1', 'Sarah', 'Johnson', ...)
('actual-user-id-2', 'Michael', 'Chen', ...)
```

### Step 4: Run the Scripts in Order

1. **First, run the patients and doctors script:**
   ```sql
   -- Copy and paste the contents of insert_sample_patients_and_doctors.sql
   -- Make sure to update the user_id values first
   ```

2. **Then, run the lab results script:**
   ```sql
   -- Copy and paste the contents of insert_mock_lab_results.sql
   ```

3. **Finally, run the appointments script:**
   ```sql
   -- Copy and paste the contents of insert_mock_appointments.sql
   ```

## 📊 What Data You'll Get

### Patients (10 total)
- **Sarah Johnson** - Healthy patient with normal results
- **Michael Chen** - Patient with diabetes and cardiac issues
- **Emily Rodriguez** - Patient with asthma
- **David Thompson** - Patient with heart disease
- **Jennifer Williams** - Patient with migraines
- **James Brown** - Patient with diabetes and kidney disease
- **Amanda Davis** - Patient with depression
- **Christopher Miller** - Patient with hypertension
- **Jessica Wilson** - Patient with thyroid disorder
- **Matthew Taylor** - Patient with arthritis

### Doctors (16 total)
- **Primary Care**: Dr. Robert Smith, Dr. Lisa Garcia
- **Cardiology**: Dr. James Wilson, Dr. Maria Martinez
- **Radiology**: Dr. David Anderson
- **Psychiatry**: Dr. Sarah Taylor
- **Physical Therapy**: Dr. Michael Johnson
- **Gynecology**: Dr. Jennifer Brown
- **Urology**: Dr. Christopher Davis
- **Pediatrics**: Dr. Amanda Miller
- **Dentistry**: Dr. Jessica Wilson
- **Dermatology**: Dr. Matthew Taylor
- **Ophthalmology**: Dr. Nicole Anderson
- **Orthopedics**: Dr. Kevin Thomas
- **Gastroenterology**: Dr. Rachel Jackson
- **Neurology**: Dr. Steven White

### Lab Results (50+ tests)
- **Blood Tests**: Glucose, HbA1c, CBC, Lipid panel
- **Kidney Function**: Creatinine, BUN
- **Liver Function**: ALT, AST, Alkaline Phosphatase
- **Thyroid Function**: TSH, Free T4
- **Urinalysis**: pH, Specific Gravity, Protein
- **Cardiac Markers**: Troponin I
- **Inflammatory Markers**: CRP
- **Vitamins**: Vitamin D
- **Iron Studies**: Iron, Ferritin
- **Cancer Markers**: PSA, CA-125

### Appointments (50+ appointments)
- **Regular Check-ups**: Annual physicals, follow-ups
- **Specialist Consultations**: Cardiology, dermatology, etc.
- **Emergency Care**: Chest pain, severe headaches
- **Chronic Disease Management**: Diabetes, hypertension
- **Preventive Care**: Vaccinations, cancer screenings
- **Lab Work**: Blood tests, comprehensive panels
- **Imaging**: X-rays, CT scans, ultrasounds
- **Mental Health**: Assessments, counseling
- **Physical Therapy**: Evaluations, sessions
- **Specialty Care**: Women's health, men's health, pediatrics

## 🔧 Troubleshooting

### Common Issues:

1. **Foreign Key Errors**
   - Make sure you have hospitals in your `hospitals` table
   - Check that patient_id and doctor_id references exist

2. **User ID Errors**
   - Verify that the user_id values match actual users in `auth.users`
   - Make sure the users exist before creating patient records

3. **Date Format Issues**
   - All dates are in 'YYYY-MM-DD' format
   - Times are in 'HH:MM' format

### Verification Queries:

After running the scripts, you can verify the data:

```sql
-- Check patients
SELECT COUNT(*) as patient_count FROM patients;

-- Check doctors
SELECT COUNT(*) as doctor_count FROM doctors;

-- Check lab results
SELECT COUNT(*) as lab_result_count FROM lab_results;

-- Check appointments
SELECT COUNT(*) as appointment_count FROM appointments;

-- Check specific patient data
SELECT p.first_name, p.last_name, COUNT(lr.id) as lab_results, COUNT(a.id) as appointments
FROM patients p
LEFT JOIN lab_results lr ON p.id = lr.patient_id
LEFT JOIN appointments a ON p.id = a.patient_id
GROUP BY p.id, p.first_name, p.last_name;
```

## 🎯 Customization

You can customize the mock data by:

1. **Adding more patients**: Copy the INSERT statements and modify the data
2. **Changing dates**: Update the dates to be more recent
3. **Modifying test results**: Adjust the lab values to test different scenarios
4. **Adding more appointments**: Create additional appointment types

## 📝 Notes

- All data is fictional and for demonstration purposes only
- Patient names and details are randomly generated
- Medical values are realistic but not based on real patients
- Dates are set in 2024 but can be adjusted as needed
- The scripts assume hospital_id = 1 exists

## 🚨 Important

- **Backup your database** before running these scripts
- **Test in a development environment** first
- **Review the data** after insertion to ensure it meets your needs
- **Remove sensitive data** if deploying to production

## 📞 Support

If you encounter issues:
1. Check the Supabase logs for error messages
2. Verify your database schema matches the expected structure
3. Ensure all foreign key relationships are properly set up
4. Check that RLS policies allow the necessary operations 