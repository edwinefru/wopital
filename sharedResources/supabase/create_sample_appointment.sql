-- Create a sample appointment for the user
-- First run the add_appointment_time_column.sql script to add missing columns

-- First, let's get your patient ID from the patients table
SELECT id as patient_id, first_name, last_name 
FROM patients 
WHERE user_id = '665f6c72-4e57-456a-a3cc-dbf4472a9b21';

-- Now insert a sample appointment
INSERT INTO appointments (
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    type,
    urgency,
    reason,
    notes,
    status,
    created_at
) VALUES (
    (SELECT id FROM patients WHERE user_id = '665f6c72-4e57-456a-a3cc-dbf4472a9b21'), -- Your patient ID
    (SELECT id FROM doctors LIMIT 1), -- First available doctor (or NULL if no doctors)
    '2024-02-15', -- Sample appointment date
    '10:30:00', -- Sample appointment time (10:30 AM)
    'consultation', -- Appointment type
    'routine', -- Urgency level
    'Regular check-up and consultation', -- Reason for appointment
    'Patient requested a general health check-up', -- Notes
    'scheduled', -- Status
    NOW() -- Created timestamp
);

-- Verify the appointment was created
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.type,
    a.urgency,
    a.reason,
    a.status,
    p.first_name,
    p.last_name,
    d.first_name as doctor_first_name,
    d.last_name as doctor_last_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
LEFT JOIN doctors d ON a.doctor_id = d.id
WHERE p.user_id = '665f6c72-4e57-456a-a3cc-dbf4472a9b21'
ORDER BY a.created_at DESC
LIMIT 5; 