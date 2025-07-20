# 📊 Add Test Data for Patient Dashboard

## **🎯 Goal:**
Add sample data for `test1@wopital.com` so you can see a populated dashboard with appointments, vitals, prescriptions, etc.

## **📋 What Data Will Be Added:**

### **Patient Profile:**
- Name: John Doe
- Phone: +1234567890
- DOB: 1990-05-15
- Gender: Male
- Blood Type: O+

### **Medical Data:**
- **Vitals:** Blood pressure, heart rate, temperature, weight, height, oxygen levels
- **Appointments:** Past and upcoming appointments
- **Prescriptions:** Active medications (Lisinopril, Metformin, Aspirin)
- **Lab Results:** Blood tests, cholesterol, glucose levels
- **Diagnoses:** Hypertension, Type 2 Diabetes
- **Emergency Contacts:** Spouse, brother, doctor

## **🚀 How to Add the Data:**

### **Option 1: Comprehensive Data (Recommended)**
1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste** the content from `sharedResources/supabase/insert_test1_patient_data.sql`
4. **Run the script**

### **Option 2: Basic Data Only**
1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste** the content from `sharedResources/supabase/insert_basic_test_data.sql`
4. **Run the script**

## **✅ Expected Results:**

After running the script, when you log in as `test1@wopital.com`, you should see:

- **Dashboard** with patient information
- **Vitals section** with blood pressure, heart rate, etc.
- **Appointments** (past and upcoming)
- **Prescriptions** with active medications
- **Lab results** with test data
- **Medical records** and documents
- **Emergency contacts**

## **🔧 If You Get Errors:**

### **Error: "User not found"**
- Make sure you've logged in as `test1@wopital.com` at least once
- The user needs to exist in the `auth.users` table

### **Error: "Table doesn't exist"**
- Some tables might not be created yet
- Use the basic data script instead

### **Error: "Column doesn't exist"**
- The schema might be different
- Check the table structure in Supabase

## **📱 Test the Dashboard:**

1. **Log in** with `test1@wopital.com` / `Test123!`
2. **Navigate** through different sections
3. **Check** that data appears in:
   - Dashboard overview
   - Vitals page
   - Appointments page
   - Prescriptions page
   - Lab results page

## **🎯 Quick Test:**

Run the basic data script first to ensure it works, then try the comprehensive one if you want more data.

**Let me know if you need help running the scripts or if you encounter any errors!** 