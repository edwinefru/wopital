-- Fix infinite recursion in RLS policies (Corrected Version)
-- This script fixes the circular reference in platform_admins table policies
-- Only references tables that actually exist in the database

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Platform admins can view all data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can insert their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can update their own data" ON platform_admins;
DROP POLICY IF EXISTS "Platform admins can delete their own data" ON platform_admins;

-- Create simplified policies without recursion
CREATE POLICY "Platform admins can view all data" ON platform_admins
    FOR SELECT USING (true);

CREATE POLICY "Platform admins can insert their own data" ON platform_admins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Platform admins can update their own data" ON platform_admins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Platform admins can delete their own data" ON platform_admins
    FOR DELETE USING (auth.uid() = user_id);

-- Also fix any potential issues with other admin tables
DROP POLICY IF EXISTS "Hospital admins can view all data" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can insert their own data" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can update their own data" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can delete their own data" ON hospital_admins;

CREATE POLICY "Hospital admins can view all data" ON hospital_admins
    FOR SELECT USING (true);

CREATE POLICY "Hospital admins can insert their own data" ON hospital_admins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hospital admins can update their own data" ON hospital_admins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Hospital admins can delete their own data" ON hospital_admins
    FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on all tables if not already enabled
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_actions ENABLE ROW LEVEL SECURITY;

-- Create basic policies for patients table
DROP POLICY IF EXISTS "Patients can view their own data" ON patients;
DROP POLICY IF EXISTS "Patients can insert their own data" ON patients;
DROP POLICY IF EXISTS "Patients can update their own data" ON patients;

CREATE POLICY "Patients can view their own data" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert their own data" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update their own data" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

-- Create basic policies for appointments table
DROP POLICY IF EXISTS "Users can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their appointments" ON appointments;

CREATE POLICY "Users can view their appointments" ON appointments
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = appointments.doctor_id
        )
    );

CREATE POLICY "Users can insert appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update their appointments" ON appointments
    FOR UPDATE USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = appointments.doctor_id
        )
    );

-- Create basic policies for hospitals table
DROP POLICY IF EXISTS "Anyone can view hospitals" ON hospitals;
DROP POLICY IF EXISTS "Hospital admins can manage their hospital" ON hospitals;

CREATE POLICY "Anyone can view hospitals" ON hospitals
    FOR SELECT USING (true);

CREATE POLICY "Hospital admins can manage their hospital" ON hospitals
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM hospital_admins WHERE hospital_id = hospitals.id
        )
    );

-- Create basic policies for doctors table
DROP POLICY IF EXISTS "Anyone can view doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can manage their own data" ON doctors;

CREATE POLICY "Anyone can view doctors" ON doctors
    FOR SELECT USING (true);

CREATE POLICY "Doctors can manage their own data" ON doctors
    FOR ALL USING (auth.uid() = user_id);

-- Create basic policies for prescriptions table
DROP POLICY IF EXISTS "Users can view their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can insert prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Users can update their prescriptions" ON prescriptions;

CREATE POLICY "Users can view their prescriptions" ON prescriptions
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = prescriptions.doctor_id
        )
    );

CREATE POLICY "Users can insert prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = prescriptions.doctor_id
        )
    );

CREATE POLICY "Users can update their prescriptions" ON prescriptions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = prescriptions.doctor_id
        )
    );

-- Create basic policies for medical_records table
DROP POLICY IF EXISTS "Users can view their medical records" ON medical_records;
DROP POLICY IF EXISTS "Users can insert medical records" ON medical_records;
DROP POLICY IF EXISTS "Users can update their medical records" ON medical_records;

CREATE POLICY "Users can view their medical records" ON medical_records
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = medical_records.doctor_id
        )
    );

CREATE POLICY "Users can insert medical records" ON medical_records
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = medical_records.doctor_id
        )
    );

CREATE POLICY "Users can update their medical records" ON medical_records
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = medical_records.doctor_id
        )
    );

-- Create basic policies for lab_results table
DROP POLICY IF EXISTS "Users can view their lab results" ON lab_results;
DROP POLICY IF EXISTS "Users can insert lab results" ON lab_results;
DROP POLICY IF EXISTS "Users can update their lab results" ON lab_results;

CREATE POLICY "Users can view their lab results" ON lab_results
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = lab_results.doctor_id
        )
    );

CREATE POLICY "Users can insert lab results" ON lab_results
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = lab_results.doctor_id
        )
    );

CREATE POLICY "Users can update their lab results" ON lab_results
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = lab_results.doctor_id
        )
    );

-- Create basic policies for emergency_contacts table
DROP POLICY IF EXISTS "Users can view their emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can insert emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can update their emergency contacts" ON emergency_contacts;

CREATE POLICY "Users can view their emergency contacts" ON emergency_contacts
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert emergency contacts" ON emergency_contacts
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update their emergency contacts" ON emergency_contacts
    FOR UPDATE USING (auth.uid() = patient_id);

-- Create basic policies for patient_vitals table
DROP POLICY IF EXISTS "Users can view their vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Users can insert vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Users can update their vitals" ON patient_vitals;

CREATE POLICY "Users can view their vitals" ON patient_vitals
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = patient_vitals.doctor_id
        )
    );

CREATE POLICY "Users can insert vitals" ON patient_vitals
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = patient_vitals.doctor_id
        )
    );

CREATE POLICY "Users can update their vitals" ON patient_vitals
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = patient_vitals.doctor_id
        )
    );

-- Create basic policies for diagnoses table
DROP POLICY IF EXISTS "Users can view their diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Users can insert diagnoses" ON diagnoses;
DROP POLICY IF EXISTS "Users can update their diagnoses" ON diagnoses;

CREATE POLICY "Users can view their diagnoses" ON diagnoses
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = diagnoses.doctor_id
        )
    );

CREATE POLICY "Users can insert diagnoses" ON diagnoses
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = diagnoses.doctor_id
        )
    );

CREATE POLICY "Users can update their diagnoses" ON diagnoses
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = diagnoses.doctor_id
        )
    );

-- Create basic policies for payments table
DROP POLICY IF EXISTS "Users can view their payments" ON payments;
DROP POLICY IF EXISTS "Users can insert payments" ON payments;
DROP POLICY IF EXISTS "Users can update their payments" ON payments;

CREATE POLICY "Users can view their payments" ON payments
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Users can update their payments" ON payments
    FOR UPDATE USING (auth.uid() = patient_id);

-- Create basic policies for immunizations table
DROP POLICY IF EXISTS "Users can view their immunizations" ON immunizations;
DROP POLICY IF EXISTS "Users can insert immunizations" ON immunizations;
DROP POLICY IF EXISTS "Users can update their immunizations" ON immunizations;

CREATE POLICY "Users can view their immunizations" ON immunizations
    FOR SELECT USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = immunizations.doctor_id
        )
    );

CREATE POLICY "Users can insert immunizations" ON immunizations
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = immunizations.doctor_id
        )
    );

CREATE POLICY "Users can update their immunizations" ON immunizations
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id = immunizations.doctor_id
        )
    );

-- Create basic policies for medications table
DROP POLICY IF EXISTS "Anyone can view medications" ON medications;
DROP POLICY IF EXISTS "Doctors can manage medications" ON medications;

CREATE POLICY "Anyone can view medications" ON medications
    FOR SELECT USING (true);

CREATE POLICY "Doctors can manage medications" ON medications
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM doctors
        )
    );

-- Create basic policies for pharmacies table
DROP POLICY IF EXISTS "Anyone can view pharmacies" ON pharmacies;
DROP POLICY IF EXISTS "Hospital admins can manage pharmacies" ON pharmacies;

CREATE POLICY "Anyone can view pharmacies" ON pharmacies
    FOR SELECT USING (true);

CREATE POLICY "Hospital admins can manage pharmacies" ON pharmacies
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM hospital_admins WHERE hospital_id = pharmacies.hospital_id
        )
    );

-- Create basic policies for appointment_actions table
DROP POLICY IF EXISTS "Users can view appointment actions" ON appointment_actions;
DROP POLICY IF EXISTS "Users can insert appointment actions" ON appointment_actions;
DROP POLICY IF EXISTS "Users can update appointment actions" ON appointment_actions;

CREATE POLICY "Users can view appointment actions" ON appointment_actions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT patient_id FROM appointments WHERE id = appointment_actions.appointment_id
        ) OR
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id IN (
                SELECT doctor_id FROM appointments WHERE id = appointment_actions.appointment_id
            )
        )
    );

CREATE POLICY "Users can insert appointment actions" ON appointment_actions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id IN (
                SELECT doctor_id FROM appointments WHERE id = appointment_actions.appointment_id
            )
        )
    );

CREATE POLICY "Users can update appointment actions" ON appointment_actions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM doctors WHERE id IN (
                SELECT doctor_id FROM appointments WHERE id = appointment_actions.appointment_id
            )
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Refresh the database
SELECT pg_notify('supabase_changes', 'RLS policies updated'); 