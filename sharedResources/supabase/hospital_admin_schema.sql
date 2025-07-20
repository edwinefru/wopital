-- Hospital Admin System Schema
-- This extends the existing DigiCare schema with hospital admin functionality and pharmacies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hospital Admins table
CREATE TABLE IF NOT EXISTS hospital_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin, manager
    hospital_id UUID REFERENCES hospitals(id),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    operating_hours JSONB, -- {"monday": "9:00-18:00", "tuesday": "9:00-18:00", ...}
    is_24_hours BOOLEAN DEFAULT false,
    accepts_insurance BOOLEAN DEFAULT true,
    delivery_available BOOLEAN DEFAULT false,
    rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pharmacy Inventory table
CREATE TABLE IF NOT EXISTS pharmacy_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    quantity_in_stock INTEGER DEFAULT 0,
    price DECIMAL(10,2),
    prescription_required BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    last_restocked DATE,
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pharmacy_id, medication_id)
);

-- Prescription Fulfillment table
CREATE TABLE IF NOT EXISTS prescription_fulfillments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
    pharmacy_id UUID REFERENCES pharmacies(id),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id),
    quantity_dispensed INTEGER NOT NULL,
    price_per_unit DECIMAL(10,2),
    total_price DECIMAL(10,2),
    dispensed_by UUID REFERENCES doctors(id),
    dispensed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'dispensed', -- dispensed, picked_up, cancelled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital Departments table
CREATE TABLE IF NOT EXISTS hospital_departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_doctor_id UUID REFERENCES doctors(id),
    floor_number INTEGER,
    room_count INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Records Categories table
CREATE TABLE IF NOT EXISTS medical_record_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- hex color
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Medical Records table
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    category_id UUID REFERENCES medical_record_categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    record_type VARCHAR(100), -- lab_result, xray, mri, ultrasound, etc.
    file_url TEXT,
    file_size INTEGER,
    file_type VARCHAR(50),
    recorded_by UUID REFERENCES doctors(id),
    reviewed_by UUID REFERENCES doctors(id),
    record_date DATE NOT NULL,
    is_confidential BOOLEAN DEFAULT false,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to existing medical_records table if it exists
DO $$ 
BEGIN
    -- Add category_id to medical_records table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'category_id') THEN
        ALTER TABLE medical_records ADD COLUMN category_id UUID REFERENCES medical_record_categories(id);
        RAISE NOTICE 'Added category_id column to medical_records table';
    END IF;
    
    -- Add file_size to medical_records table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'file_size') THEN
        ALTER TABLE medical_records ADD COLUMN file_size INTEGER;
        RAISE NOTICE 'Added file_size column to medical_records table';
    END IF;
    
    -- Add file_type to medical_records table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'file_type') THEN
        ALTER TABLE medical_records ADD COLUMN file_type VARCHAR(50);
        RAISE NOTICE 'Added file_type column to medical_records table';
    END IF;
    
    -- Add reviewed_by to medical_records table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'reviewed_by') THEN
        ALTER TABLE medical_records ADD COLUMN reviewed_by UUID REFERENCES doctors(id);
        RAISE NOTICE 'Added reviewed_by column to medical_records table';
    END IF;
    
    -- Add is_confidential to medical_records table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'is_confidential') THEN
        ALTER TABLE medical_records ADD COLUMN is_confidential BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_confidential column to medical_records table';
    END IF;
    
    -- Add tags to medical_records table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medical_records' AND column_name = 'tags') THEN
        ALTER TABLE medical_records ADD COLUMN tags TEXT[];
        RAISE NOTICE 'Added tags column to medical_records table';
    END IF;
END $$;

-- Patient Notes table
CREATE TABLE IF NOT EXISTS patient_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id),
    note_type VARCHAR(50) DEFAULT 'general', -- general, consultation, follow_up, emergency
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointment Reminders table
CREATE TABLE IF NOT EXISTS appointment_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) DEFAULT 'sms', -- sms, email, push
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hospital Staff table (for non-doctor staff)
CREATE TABLE IF NOT EXISTS hospital_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(100) NOT NULL, -- nurse, receptionist, lab_technician, etc.
    department_id UUID REFERENCES hospital_departments(id),
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospital_admins_user_id ON hospital_admins(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_admins_hospital_id ON hospital_admins(hospital_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_pharmacy_id ON pharmacy_inventory(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_inventory_medication_id ON pharmacy_inventory(medication_id);
CREATE INDEX IF NOT EXISTS idx_prescription_fulfillments_prescription_id ON prescription_fulfillments(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_fulfillments_pharmacy_id ON prescription_fulfillments(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_hospital_departments_hospital_id ON hospital_departments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_category_id ON medical_records(category_id);
CREATE INDEX IF NOT EXISTS idx_patient_notes_patient_id ON patient_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment_id ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_hospital_staff_user_id ON hospital_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_staff_department_id ON hospital_staff(department_id);

-- Add updated_at triggers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hospital_admins_updated_at') THEN
        CREATE TRIGGER update_hospital_admins_updated_at BEFORE UPDATE ON hospital_admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pharmacies_updated_at') THEN
        CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pharmacy_inventory_updated_at') THEN
        CREATE TRIGGER update_pharmacy_inventory_updated_at BEFORE UPDATE ON pharmacy_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hospital_departments_updated_at') THEN
        CREATE TRIGGER update_hospital_departments_updated_at BEFORE UPDATE ON hospital_departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_medical_records_updated_at') THEN
        CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_patient_notes_updated_at') THEN
        CREATE TRIGGER update_patient_notes_updated_at BEFORE UPDATE ON patient_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hospital_staff_updated_at') THEN
        CREATE TRIGGER update_hospital_staff_updated_at BEFORE UPDATE ON hospital_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE hospital_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_fulfillments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_record_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Hospital Admins
DROP POLICY IF EXISTS "Hospital admins can view own profile" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can update own profile" ON hospital_admins;
DROP POLICY IF EXISTS "Hospital admins can view all data" ON hospital_admins;

CREATE POLICY "Hospital admins can view own profile" ON hospital_admins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Hospital admins can update own profile" ON hospital_admins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Hospital admins can view all data" ON hospital_admins FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for Public Data (Pharmacies, etc.)
CREATE POLICY "Allow authenticated users to view pharmacies" ON pharmacies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to view pharmacy inventory" ON pharmacy_inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to view medical record categories" ON medical_record_categories FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for Patient Data (accessible by hospital admins and patients)
CREATE POLICY "Patients can view own medical records" ON medical_records FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "Hospital admins can view all medical records" ON medical_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM hospital_admins WHERE user_id = auth.uid())
);

CREATE POLICY "Patients can view own notes" ON patient_notes FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
CREATE POLICY "Hospital admins can view all patient notes" ON patient_notes FOR SELECT USING (
    EXISTS (SELECT 1 FROM hospital_admins WHERE user_id = auth.uid())
);

-- Insert sample data with error handling
DO $$ 
BEGIN
    -- Insert medical record categories
    INSERT INTO medical_record_categories (name, description, color, icon) VALUES 
    ('Lab Results', 'Blood tests, urine tests, and other laboratory results', '#3B82F6', 'test-tube'),
    ('Imaging', 'X-rays, MRIs, CT scans, and ultrasounds', '#10B981', 'scan'),
    ('Prescriptions', 'Medication prescriptions and refills', '#F59E0B', 'pill'),
    ('Vaccinations', 'Immunization records and vaccine history', '#EF4444', 'shield'),
    ('Consultations', 'Doctor consultation notes and recommendations', '#8B5CF6', 'stethoscope'),
    ('Emergency', 'Emergency room visits and urgent care records', '#DC2626', 'alert')
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Inserted medical record categories';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting medical record categories: %', SQLERRM;
END $$;

-- Insert sample pharmacies with error handling
DO $$ 
BEGIN
    INSERT INTO pharmacies (name, address, phone, email, website, is_24_hours, accepts_insurance, delivery_available, rating) VALUES 
    ('City Pharmacy', '123 Main St, City Center', '+1234567890', 'info@citypharmacy.com', 'https://citypharmacy.com', false, true, true, 4.5),
    ('24/7 Express Pharmacy', '456 Oak Ave, Downtown', '+1234567891', 'contact@expresspharmacy.com', 'https://expresspharmacy.com', true, true, true, 4.2),
    ('Community Drug Store', '789 Pine St, Suburb', '+1234567892', 'hello@communitydrug.com', 'https://communitydrug.com', false, true, false, 4.0),
    ('Hospital Pharmacy', '321 Medical Center Dr', '+1234567893', 'pharmacy@hospital.com', 'https://hospitalpharmacy.com', true, true, true, 4.8)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Inserted sample pharmacies';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting pharmacies: %', SQLERRM;
END $$;

-- Insert sample hospital departments with error handling
DO $$ 
BEGIN
    INSERT INTO hospital_departments (name, description, floor_number, room_count) VALUES 
    ('Emergency Department', '24/7 emergency care and trauma services', 1, 15),
    ('Cardiology', 'Heart and cardiovascular care', 2, 20),
    ('Pediatrics', 'Children and adolescent care', 3, 25),
    ('Orthopedics', 'Bone and joint care', 4, 18),
    ('Neurology', 'Brain and nervous system care', 5, 12),
    ('Oncology', 'Cancer treatment and care', 6, 10)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Inserted sample hospital departments';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting hospital departments: %', SQLERRM;
END $$;

-- Note: Sample hospital admin users should be created through the auth system
-- and then linked to hospital_admins table with appropriate hospital_id

RAISE NOTICE 'Hospital admin schema and sample data created successfully!'; 