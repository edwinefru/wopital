-- Insert Mock Lab Results Data
-- This script inserts realistic lab results for various medical tests

-- First, let's get some existing patients and doctors to reference
-- Make sure you have patients and doctors in your database first

-- Insert Blood Test Results
INSERT INTO lab_results (patient_id, doctor_id, test_name, test_date, result_date, result_value, normal_range, unit, status, notes) VALUES
-- Blood Glucose Tests
(1, 1, 'Fasting Blood Glucose', '2024-01-15', '2024-01-15', '95', '70-100', 'mg/dL', 'normal', 'Patient fasting for 12 hours before test'),
(1, 1, 'Random Blood Glucose', '2024-01-20', '2024-01-20', '120', '70-140', 'mg/dL', 'normal', 'Taken 2 hours after meal'),
(2, 1, 'Fasting Blood Glucose', '2024-01-18', '2024-01-18', '110', '70-100', 'mg/dL', 'abnormal', 'Slightly elevated, recommend follow-up'),
(2, 1, 'HbA1c', '2024-01-18', '2024-01-18', '6.2', '4.0-5.6', '%', 'abnormal', 'Indicates prediabetes'),

-- Complete Blood Count (CBC)
(1, 1, 'Hemoglobin', '2024-01-15', '2024-01-15', '14.2', '12.0-15.5', 'g/dL', 'normal', 'Within normal range'),
(1, 1, 'White Blood Cell Count', '2024-01-15', '2024-01-15', '7.5', '4.5-11.0', 'K/µL', 'normal', 'Normal WBC count'),
(1, 1, 'Platelet Count', '2024-01-15', '2024-01-15', '250', '150-450', 'K/µL', 'normal', 'Normal platelet count'),
(2, 1, 'Hemoglobin', '2024-01-18', '2024-01-18', '11.8', '12.0-15.5', 'g/dL', 'abnormal', 'Slightly low, may indicate mild anemia'),
(2, 1, 'White Blood Cell Count', '2024-01-18', '2024-01-18', '12.5', '4.5-11.0', 'K/µL', 'abnormal', 'Elevated WBC, possible infection'),

-- Lipid Panel
(1, 1, 'Total Cholesterol', '2024-01-15', '2024-01-15', '180', '<200', 'mg/dL', 'normal', 'Good cholesterol levels'),
(1, 1, 'HDL Cholesterol', '2024-01-15', '2024-01-15', '55', '>40', 'mg/dL', 'normal', 'Good HDL levels'),
(1, 1, 'LDL Cholesterol', '2024-01-15', '2024-01-15', '100', '<100', 'mg/dL', 'normal', 'Optimal LDL levels'),
(1, 1, 'Triglycerides', '2024-01-15', '2024-01-15', '120', '<150', 'mg/dL', 'normal', 'Normal triglyceride levels'),
(2, 1, 'Total Cholesterol', '2024-01-18', '2024-01-18', '220', '<200', 'mg/dL', 'abnormal', 'Elevated cholesterol'),
(2, 1, 'HDL Cholesterol', '2024-01-18', '2024-01-18', '35', '>40', 'mg/dL', 'abnormal', 'Low HDL cholesterol'),
(2, 1, 'LDL Cholesterol', '2024-01-18', '2024-01-18', '150', '<100', 'mg/dL', 'abnormal', 'High LDL cholesterol'),

-- Kidney Function Tests
(1, 1, 'Creatinine', '2024-01-15', '2024-01-15', '0.9', '0.6-1.2', 'mg/dL', 'normal', 'Normal kidney function'),
(1, 1, 'Blood Urea Nitrogen (BUN)', '2024-01-15', '2024-01-15', '15', '7-20', 'mg/dL', 'normal', 'Normal BUN levels'),
(2, 1, 'Creatinine', '2024-01-18', '2024-01-18', '1.5', '0.6-1.2', 'mg/dL', 'abnormal', 'Elevated creatinine, possible kidney issue'),
(2, 1, 'Blood Urea Nitrogen (BUN)', '2024-01-18', '2024-01-18', '25', '7-20', 'mg/dL', 'abnormal', 'Elevated BUN'),

-- Liver Function Tests
(1, 1, 'Alanine Aminotransferase (ALT)', '2024-01-15', '2024-01-15', '25', '7-55', 'U/L', 'normal', 'Normal liver function'),
(1, 1, 'Aspartate Aminotransferase (AST)', '2024-01-15', '2024-01-15', '30', '8-48', 'U/L', 'normal', 'Normal AST levels'),
(1, 1, 'Alkaline Phosphatase', '2024-01-15', '2024-01-15', '70', '44-147', 'U/L', 'normal', 'Normal alkaline phosphatase'),
(2, 1, 'Alanine Aminotransferase (ALT)', '2024-01-18', '2024-01-18', '80', '7-55', 'U/L', 'abnormal', 'Elevated ALT, possible liver inflammation'),
(2, 1, 'Aspartate Aminotransferase (AST)', '2024-01-18', '2024-01-18', '85', '8-48', 'U/L', 'abnormal', 'Elevated AST'),

-- Thyroid Function Tests
(1, 1, 'TSH (Thyroid Stimulating Hormone)', '2024-01-15', '2024-01-15', '2.5', '0.4-4.0', 'mIU/L', 'normal', 'Normal thyroid function'),
(1, 1, 'Free T4', '2024-01-15', '2024-01-15', '1.2', '0.8-1.8', 'ng/dL', 'normal', 'Normal T4 levels'),
(2, 1, 'TSH (Thyroid Stimulating Hormone)', '2024-01-18', '2024-01-18', '6.5', '0.4-4.0', 'mIU/L', 'abnormal', 'Elevated TSH, possible hypothyroidism'),
(2, 1, 'Free T4', '2024-01-18', '2024-01-18', '0.6', '0.8-1.8', 'ng/dL', 'abnormal', 'Low T4 levels'),

-- Urinalysis
(1, 1, 'Urine pH', '2024-01-15', '2024-01-15', '6.0', '4.5-8.0', 'pH', 'normal', 'Normal urine pH'),
(1, 1, 'Urine Specific Gravity', '2024-01-15', '2024-01-15', '1.020', '1.005-1.030', 'g/mL', 'normal', 'Normal urine concentration'),
(1, 1, 'Urine Protein', '2024-01-15', '2024-01-15', 'Negative', 'Negative', 'mg/dL', 'normal', 'No protein detected'),
(2, 1, 'Urine pH', '2024-01-18', '2024-01-18', '5.0', '4.5-8.0', 'pH', 'normal', 'Slightly acidic but normal'),
(2, 1, 'Urine Protein', '2024-01-18', '2024-01-18', 'Trace', 'Negative', 'mg/dL', 'abnormal', 'Trace protein detected'),

-- Cardiac Markers
(1, 1, 'Troponin I', '2024-01-15', '2024-01-15', '0.01', '<0.04', 'ng/mL', 'normal', 'Normal troponin levels'),
(2, 1, 'Troponin I', '2024-01-18', '2024-01-18', '0.08', '<0.04', 'ng/mL', 'critical', 'Elevated troponin, possible cardiac event'),

-- Inflammatory Markers
(1, 1, 'C-Reactive Protein (CRP)', '2024-01-15', '2024-01-15', '2.0', '<3.0', 'mg/L', 'normal', 'Normal CRP levels'),
(2, 1, 'C-Reactive Protein (CRP)', '2024-01-18', '2024-01-18', '15.0', '<3.0', 'mg/L', 'abnormal', 'Elevated CRP, possible inflammation'),

-- Vitamin D
(1, 1, 'Vitamin D (25-OH)', '2024-01-15', '2024-01-15', '35', '30-100', 'ng/mL', 'normal', 'Adequate vitamin D levels'),
(2, 1, 'Vitamin D (25-OH)', '2024-01-18', '2024-01-18', '18', '30-100', 'ng/mL', 'abnormal', 'Low vitamin D levels'),

-- Iron Studies
(1, 1, 'Iron', '2024-01-15', '2024-01-15', '85', '60-170', 'µg/dL', 'normal', 'Normal iron levels'),
(1, 1, 'Ferritin', '2024-01-15', '2024-01-15', '120', '20-250', 'ng/mL', 'normal', 'Normal ferritin levels'),
(2, 1, 'Iron', '2024-01-18', '2024-01-18', '35', '60-170', 'µg/dL', 'abnormal', 'Low iron levels'),
(2, 1, 'Ferritin', '2024-01-18', '2024-01-18', '15', '20-250', 'ng/mL', 'abnormal', 'Low ferritin levels'),

-- Additional tests for variety
(1, 1, 'PSA (Prostate Specific Antigen)', '2024-01-15', '2024-01-15', '1.2', '<4.0', 'ng/mL', 'normal', 'Normal PSA levels'),
(1, 1, 'CA-125 (Ovarian Cancer Marker)', '2024-01-15', '2024-01-15', '15', '<35', 'U/mL', 'normal', 'Normal CA-125 levels'),
(2, 1, 'PSA (Prostate Specific Antigen)', '2024-01-18', '2024-01-18', '5.5', '<4.0', 'ng/mL', 'abnormal', 'Elevated PSA, recommend follow-up'),
(2, 1, 'CA-125 (Ovarian Cancer Marker)', '2024-01-18', '2024-01-18', '45', '<35', 'U/mL', 'abnormal', 'Elevated CA-125 levels');

-- Note: Make sure to replace patient_id and doctor_id values with actual IDs from your database
-- You may need to adjust these IDs based on your existing patients and doctors 