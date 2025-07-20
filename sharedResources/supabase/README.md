# DigiCare Database Setup Guide

## Quick Fix for "No patient profile found" Error

If you're seeing the error "No patient profile found for this user" in the mobile app, follow these steps:

### Step 1: Run the Database Schema
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the `database_schema.sql` file first

### Step 2: Create Your Patient Record
1. In the SQL Editor, run the `create_patient_record.sql` file
2. **Important**: Update the personal information in the script:
   - Replace `'Edwin'` with your actual first name
   - Replace `'Efru'` with your actual last name
   - Replace `'+1234567890'` with your actual phone number
   - Replace `'1990-01-01'` with your actual date of birth
   - Replace `'Male'` with your actual gender
   - Update the emergency contact information

### Step 3: Add Sample Doctors (Optional)
1. Run the `add_sample_doctors.sql` file to add sample doctors for booking appointments

### Step 4: Add Urgency Column
1. Run the `add_urgency_to_appointments.sql` file to ensure the urgency field is available

## Your User ID
Based on the logs, your user ID is: `665f6c72-4e57-456a-a3cc-dbf4472a9b21`

This ID is already included in the `create_patient_record.sql` script.

## After Running the Scripts

1. **Restart your mobile app** (close and reopen)
2. **Log out and log back in** to refresh the session
3. The "Add Appointment" button should now be visible
4. You should be able to book appointments with the sample doctors

## Troubleshooting

### If you still see "Loading appointments..."
- Check that the patient record was created successfully
- Verify your user ID matches the one in the script
- Try logging out and back in

### If the "Add Appointment" button is not visible
- The button should appear in all states (loading, error, and normal)
- Check that the navigation to 'BookAppointment' is working
- Ensure all dependencies are installed

### If booking appointments fails
- Make sure the sample doctors were added successfully
- Check that the urgency column exists in the appointments table
- Verify RLS (Row Level Security) policies are set up correctly

## Database Tables Overview

- **patients**: Your personal information
- **doctors**: Available doctors for appointments
- **appointments**: Your booked appointments
- **hospitals**: Hospital information
- **patient_vitals**: Your health vitals
- **prescriptions**: Your prescriptions
- **payments**: Payment records

## Security Notes

- The patient record is linked to your Supabase auth user ID
- Only you can see your own patient data
- RLS policies ensure data privacy

## Setup Instructions

### 1. Initial Database Schema
Run the main database schema first:
```sql
-- Copy and paste the contents of database_schema.sql into your Supabase SQL editor
```

### 2. Add Urgency Column to Appointments
Run the urgency migration:
```sql
-- Copy and paste the contents of run_urgency_migration.sql into your Supabase SQL editor
```

### 3. Set Up Row Level Security (RLS)
Run the RLS policies:
```sql
-- Copy and paste the contents of setup_rls_policies.sql into your Supabase SQL editor
```

## Database Tables

### Core Tables
- **patients**: Patient information linked to auth.users
- **doctors**: Doctor information linked to auth.users  
- **appointments**: Appointment bookings with urgency levels
- **patient_vitals**: Patient vital signs and measurements
- **prescriptions**: Medication prescriptions
- **immunizations**: Vaccination records
- **payments**: Payment transactions
- **lab_results**: Laboratory test results

### Appointment Features
- **Urgency Levels**: routine, urgent, critical, emergency
- **Appointment Types**: consultation, follow-up, emergency, routine, urgent, critical
- **Status Tracking**: scheduled, confirmed, completed, cancelled, rescheduled

## Security
- Row Level Security (RLS) is enabled on all tables
- Patients can only access their own data
- Doctors can only access appointments they're assigned to
- Proper authentication required for all operations

## Testing the Setup
1. Create a test patient account in your app
2. Try booking an appointment with different urgency levels
3. Verify the appointment appears in the appointments list
4. Test the appointment detail screen with call, cancel, confirm buttons

## Troubleshooting
- If you get permission errors, make sure RLS policies are set up correctly
- If appointments don't save, check that the patient record exists for the authenticated user
- If doctors don't appear in the booking form, ensure doctor records exist in the database 