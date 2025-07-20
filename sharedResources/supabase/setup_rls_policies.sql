-- Set up RLS policies for appointments table
-- Run this in your Supabase SQL editor

-- Enable RLS on appointments table
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy for patients to view their own appointments
CREATE POLICY "Patients can view their own appointments" ON appointments
    FOR SELECT USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- Policy for patients to insert their own appointments
CREATE POLICY "Patients can insert their own appointments" ON appointments
    FOR INSERT WITH CHECK (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- Policy for patients to update their own appointments
CREATE POLICY "Patients can update their own appointments" ON appointments
    FOR UPDATE USING (
        patient_id IN (
            SELECT id FROM patients WHERE user_id = auth.uid()
        )
    );

-- Policy for doctors to view appointments they are assigned to
CREATE POLICY "Doctors can view their appointments" ON appointments
    FOR SELECT USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Policy for doctors to update appointments they are assigned to
CREATE POLICY "Doctors can update their appointments" ON appointments
    FOR UPDATE USING (
        doctor_id IN (
            SELECT id FROM doctors WHERE user_id = auth.uid()
        )
    );

-- Policy for hospital admins to view all appointments (if you have an admin role)
-- Uncomment if you have an admin role setup
-- CREATE POLICY "Admins can view all appointments" ON appointments
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM user_roles 
--             WHERE user_id = auth.uid() AND role = 'admin'
--         )
--     ); 