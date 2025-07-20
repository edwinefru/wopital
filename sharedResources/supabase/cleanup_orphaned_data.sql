-- Cleanup Orphaned Data Script
-- This script removes appointments and lab results that aren't linked to real patients
-- Run this if you have orphaned data from the old mock scripts

-- Step 1: Show orphaned appointments (appointments without valid patient_id)
SELECT 'Orphaned Appointments:' as message;
SELECT a.id, a.appointment_date, a.reason, a.patient_id
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
WHERE p.id IS NULL;

-- Step 2: Show orphaned lab results (lab results without valid patient_id)
SELECT 'Orphaned Lab Results:' as message;
SELECT lr.id, lr.test_name, lr.test_date, lr.patient_id
FROM lab_results lr
LEFT JOIN patients p ON lr.patient_id = p.id
WHERE p.id IS NULL;

-- Step 3: Show orphaned vitals (vitals without valid patient_id)
SELECT 'Orphaned Patient Vitals:' as message;
SELECT pv.id, pv.recorded_at, pv.patient_id
FROM patient_vitals pv
LEFT JOIN patients p ON pv.patient_id = p.id
WHERE p.id IS NULL;

-- Step 4: Clean up orphaned data (UNCOMMENT TO RUN)
-- WARNING: This will permanently delete orphaned data
/*
DELETE FROM appointments 
WHERE patient_id NOT IN (SELECT id FROM patients);

DELETE FROM lab_results 
WHERE patient_id NOT IN (SELECT id FROM patients);

DELETE FROM patient_vitals 
WHERE patient_id NOT IN (SELECT id FROM patients);

DELETE FROM prescriptions 
WHERE patient_id NOT IN (SELECT id FROM patients);

DELETE FROM diagnoses 
WHERE patient_id NOT IN (SELECT id FROM patients);

DELETE FROM payments 
WHERE patient_id NOT IN (SELECT id FROM patients);

DELETE FROM immunizations 
WHERE patient_id NOT IN (SELECT id FROM patients);

DELETE FROM medical_records 
WHERE patient_id NOT IN (SELECT id FROM patients);

DELETE FROM emergency_contacts 
WHERE patient_id NOT IN (SELECT id FROM patients);
*/

-- Step 5: Verify cleanup
SELECT 'After cleanup - Appointments count:' as message;
SELECT COUNT(*) as total_appointments FROM appointments;

SELECT 'After cleanup - Lab results count:' as message;
SELECT COUNT(*) as total_lab_results FROM lab_results;

SELECT 'After cleanup - Patient vitals count:' as message;
SELECT COUNT(*) as total_vitals FROM patient_vitals;

-- Step 6: Show valid relationships
SELECT 'Valid Appointments (linked to real patients):' as message;
SELECT a.id, a.appointment_date, a.reason, p.first_name, p.last_name
FROM appointments a
JOIN patients p ON a.patient_id = p.id
LIMIT 5;

SELECT 'Valid Lab Results (linked to real patients):' as message;
SELECT lr.id, lr.test_name, lr.test_date, p.first_name, p.last_name
FROM lab_results lr
JOIN patients p ON lr.patient_id = p.id
LIMIT 5; 