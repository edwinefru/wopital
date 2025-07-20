-- Check the actual structure of lab_results table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'lab_results'
ORDER BY ordinal_position;

-- Create lab results with correct columns (without ordered_by)
INSERT INTO lab_results (patient_id, test_name, test_date, result_value, normal_range, unit, status, notes) VALUES
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'Fasting Blood Glucose', CURRENT_DATE - INTERVAL '10 days', '95', '70-100', 'mg/dL', 'normal', 'Patient fasting for 12 hours'),
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'Hemoglobin', CURRENT_DATE - INTERVAL '10 days', '14.2', '12.0-15.5', 'g/dL', 'normal', 'Complete blood count'),
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'Total Cholesterol', CURRENT_DATE - INTERVAL '10 days', '180', '<200', 'mg/dL', 'normal', 'Lipid panel'),
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'Creatinine', CURRENT_DATE - INTERVAL '10 days', '0.9', '0.6-1.2', 'mg/dL', 'normal', 'Kidney function'),
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'TSH', CURRENT_DATE - INTERVAL '10 days', '2.5', '0.4-4.0', 'mIU/L', 'normal', 'Thyroid function'),
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'Vitamin D', CURRENT_DATE - INTERVAL '10 days', '35', '30-100', 'ng/mL', 'normal', 'Vitamin D screening'),
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'Blood Pressure', CURRENT_DATE - INTERVAL '5 days', '120/80', '90/60-140/90', 'mmHg', 'normal', 'Blood pressure reading'),
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'Heart Rate', CURRENT_DATE - INTERVAL '5 days', '72', '60-100', 'bpm', 'normal', 'Resting heart rate'),
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'Temperature', CURRENT_DATE - INTERVAL '5 days', '98.6', '97.0-99.0', '°F', 'normal', 'Body temperature'),
('665f6c72-4e57-456a-a3cc-dbf4472a9b21', 'Oxygen Saturation', CURRENT_DATE - INTERVAL '5 days', '98', '95-100', '%', 'normal', 'Blood oxygen level'); 