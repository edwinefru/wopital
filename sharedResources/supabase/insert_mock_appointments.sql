-- Insert Mock Appointments Data
-- This script inserts realistic appointments for various medical scenarios

-- First, let's get some existing patients, doctors, and hospitals to reference
-- Make sure you have patients, doctors, and hospitals in your database first

-- Insert Various Types of Appointments
INSERT INTO appointments (patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, urgency, status, notes) VALUES
-- Regular Check-ups
(1, 1, 1, '2024-01-15', '09:00', 'Annual Physical Examination', 'normal', 'completed', 'Patient in good health, recommended annual follow-up'),
(1, 1, 1, '2024-02-15', '10:30', 'Follow-up Physical Examination', 'normal', 'scheduled', 'Routine follow-up after annual physical'),
(2, 1, 1, '2024-01-18', '14:00', 'Annual Physical Examination', 'normal', 'completed', 'Patient showing signs of prediabetes, recommended lifestyle changes'),
(2, 1, 1, '2024-02-20', '15:30', 'Diabetes Management Consultation', 'high', 'scheduled', 'Follow-up for blood glucose management'),

-- Specialist Consultations
(1, 2, 1, '2024-01-20', '11:00', 'Cardiology Consultation', 'normal', 'completed', 'Routine cardiac assessment, ECG normal'),
(1, 2, 1, '2024-03-15', '13:00', 'Cardiology Follow-up', 'normal', 'scheduled', 'Annual cardiac follow-up'),
(2, 2, 1, '2024-01-25', '16:00', 'Cardiology Consultation', 'high', 'completed', 'Patient with elevated troponin, requires monitoring'),
(2, 2, 1, '2024-02-10', '09:00', 'Cardiac Stress Test', 'high', 'scheduled', 'Stress test to evaluate cardiac function'),

-- Emergency and Urgent Care
(1, 1, 1, '2024-01-22', '08:30', 'Chest Pain Evaluation', 'urgent', 'completed', 'Patient experienced chest pain, ruled out cardiac event'),
(2, 1, 1, '2024-01-28', '12:00', 'Severe Headache', 'urgent', 'completed', 'Patient with severe headache, CT scan ordered'),
(1, 1, 1, '2024-02-05', '17:00', 'Fever and Chills', 'high', 'completed', 'Patient with 102°F fever, prescribed antibiotics'),

-- Chronic Disease Management
(2, 1, 1, '2024-01-30', '10:00', 'Diabetes Management', 'high', 'completed', 'Blood glucose monitoring, medication adjustment needed'),
(2, 1, 1, '2024-02-25', '14:30', 'Diabetes Education Session', 'normal', 'scheduled', 'Nutrition and lifestyle counseling'),
(2, 1, 1, '2024-03-10', '11:00', 'Diabetes Medication Review', 'high', 'scheduled', 'Review of current medications and side effects'),

-- Preventive Care
(1, 1, 1, '2024-02-01', '09:30', 'Vaccination Appointment', 'normal', 'completed', 'Annual flu shot and tetanus booster'),
(1, 1, 1, '2024-02-08', '15:00', 'Cancer Screening', 'normal', 'completed', 'Routine cancer screening tests'),
(2, 1, 1, '2024-02-12', '13:30', 'Preventive Health Assessment', 'normal', 'completed', 'Comprehensive health assessment and risk evaluation'),

-- Lab Work and Testing
(1, 1, 1, '2024-01-16', '07:00', 'Fasting Blood Work', 'normal', 'completed', 'Comprehensive metabolic panel and lipid profile'),
(1, 1, 1, '2024-02-18', '07:30', 'Follow-up Blood Work', 'normal', 'scheduled', 'Repeat blood work to monitor changes'),
(2, 1, 1, '2024-01-19', '08:00', 'Comprehensive Lab Testing', 'high', 'completed', 'Multiple tests including cardiac markers and inflammatory markers'),
(2, 1, 1, '2024-02-22', '08:30', 'Lab Work Follow-up', 'high', 'scheduled', 'Repeat testing to monitor abnormal results'),

-- Imaging and Diagnostic Procedures
(1, 3, 1, '2024-01-24', '10:00', 'Chest X-Ray', 'normal', 'completed', 'Routine chest X-ray, normal findings'),
(1, 3, 1, '2024-02-28', '14:00', 'Abdominal Ultrasound', 'normal', 'scheduled', 'Routine abdominal imaging'),
(2, 3, 1, '2024-01-26', '11:30', 'CT Scan - Head', 'urgent', 'completed', 'CT scan for severe headache, normal findings'),
(2, 3, 1, '2024-02-15', '16:00', 'Echocardiogram', 'high', 'scheduled', 'Cardiac ultrasound to evaluate heart function'),

-- Mental Health and Wellness
(1, 4, 1, '2024-01-29', '13:00', 'Mental Health Assessment', 'normal', 'completed', 'Annual mental health screening'),
(1, 4, 1, '2024-03-05', '14:30', 'Stress Management Consultation', 'normal', 'scheduled', 'Stress management techniques and coping strategies'),
(2, 4, 1, '2024-02-02', '15:00', 'Depression Screening', 'high', 'completed', 'Patient showing signs of depression, referred to specialist'),

-- Physical Therapy and Rehabilitation
(1, 5, 1, '2024-01-31', '09:00', 'Physical Therapy Evaluation', 'normal', 'completed', 'Assessment for back pain, exercise program prescribed'),
(1, 5, 1, '2024-02-07', '10:30', 'Physical Therapy Session', 'normal', 'completed', 'Follow-up PT session, good progress'),
(1, 5, 1, '2024-02-14', '10:30', 'Physical Therapy Session', 'normal', 'scheduled', 'Continued PT for back rehabilitation'),

-- Women's Health
(1, 6, 1, '2024-02-03', '11:00', 'Gynecological Examination', 'normal', 'completed', 'Annual gynecological exam and Pap smear'),
(1, 6, 1, '2024-03-08', '10:00', 'Breast Cancer Screening', 'normal', 'scheduled', 'Mammogram appointment'),

-- Men's Health
(2, 7, 1, '2024-02-04', '14:00', 'Prostate Examination', 'normal', 'completed', 'Annual prostate exam, PSA elevated'),
(2, 7, 1, '2024-03-12', '15:00', 'Urology Follow-up', 'high', 'scheduled', 'Follow-up for elevated PSA levels'),

-- Pediatric Care (if applicable)
(1, 8, 1, '2024-02-06', '09:30', 'Child Wellness Check', 'normal', 'completed', 'Annual pediatric wellness examination'),
(1, 8, 1, '2024-03-20', '10:00', 'Vaccination Update', 'normal', 'scheduled', 'Catch-up vaccinations for child'),

-- Dental Care
(1, 9, 1, '2024-02-09', '13:00', 'Dental Cleaning and Check-up', 'normal', 'completed', 'Routine dental cleaning and examination'),
(1, 9, 1, '2024-03-25', '14:00', 'Dental Follow-up', 'normal', 'scheduled', 'Follow-up for minor cavity treatment'),

-- Dermatology
(1, 10, 1, '2024-02-11', '11:30', 'Skin Cancer Screening', 'normal', 'completed', 'Annual skin examination, no suspicious lesions'),
(2, 10, 1, '2024-02-13', '16:30', 'Mole Evaluation', 'high', 'completed', 'Evaluation of changing mole, biopsy recommended'),
(2, 10, 1, '2024-03-01', '15:30', 'Skin Biopsy Follow-up', 'high', 'scheduled', 'Follow-up for biopsy results'),

-- Ophthalmology
(1, 11, 1, '2024-02-16', '10:00', 'Eye Examination', 'normal', 'completed', 'Annual eye exam, vision stable'),
(1, 11, 1, '2024-03-30', '11:00', 'Glaucoma Screening', 'normal', 'scheduled', 'Routine glaucoma screening'),

-- Orthopedics
(1, 12, 1, '2024-02-19', '14:00', 'Knee Pain Evaluation', 'normal', 'completed', 'Evaluation of chronic knee pain, X-rays ordered'),
(1, 12, 1, '2024-03-15', '15:00', 'Orthopedic Follow-up', 'normal', 'scheduled', 'Follow-up for knee pain treatment'),

-- Gastroenterology
(2, 13, 1, '2024-02-21', '09:00', 'Stomach Pain Consultation', 'high', 'completed', 'Evaluation of chronic stomach pain'),
(2, 13, 1, '2024-03-18', '10:30', 'Endoscopy Procedure', 'high', 'scheduled', 'Upper endoscopy to evaluate stomach issues'),

-- Neurology
(2, 14, 1, '2024-02-23', '13:00', 'Headache Consultation', 'high', 'completed', 'Evaluation of chronic headaches'),
(2, 14, 1, '2024-03-22', '14:00', 'Neurology Follow-up', 'high', 'scheduled', 'Follow-up for headache treatment'),

-- No-show and Cancelled Appointments
(1, 1, 1, '2024-01-17', '10:00', 'Routine Check-up', 'normal', 'no-show', 'Patient did not show up for appointment'),
(2, 1, 1, '2024-01-23', '11:00', 'Follow-up Visit', 'normal', 'cancelled', 'Patient cancelled due to illness'),

-- Future Appointments
(1, 1, 1, '2024-04-15', '09:00', 'Annual Physical Examination', 'normal', 'scheduled', 'Next year annual physical'),
(1, 1, 1, '2024-04-22', '10:30', 'Vaccination Update', 'normal', 'scheduled', 'Annual vaccination updates'),
(2, 1, 1, '2024-04-10', '14:00', 'Diabetes Management', 'high', 'scheduled', 'Quarterly diabetes management'),
(2, 1, 1, '2024-04-25', '15:30', 'Cardiac Follow-up', 'high', 'scheduled', 'Cardiac monitoring follow-up');

-- Note: Make sure to replace patient_id, doctor_id, and hospital_id values with actual IDs from your database
-- You may need to adjust these IDs based on your existing patients, doctors, and hospitals
-- Also adjust the dates to be more recent if needed 