-- Step 1: Add missing columns to hospitals table
-- Run this first to add the required columns

-- Add subscription_key column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_key VARCHAR(255) UNIQUE;

-- Add subscription_expires_at column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Add subscription_renewal_date column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_renewal_date TIMESTAMP WITH TIME ZONE;

-- Add subscription_auto_renew column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_auto_renew BOOLEAN DEFAULT true;

-- Add subscription_last_payment_date column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_last_payment_date TIMESTAMP WITH TIME ZONE;

-- Add subscription_next_billing_date column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_next_billing_date TIMESTAMP WITH TIME ZONE;

-- Add subscription_status column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'pending';

-- Add subscription_tier column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'basic';

-- Add is_approved column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add approved_by column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS approved_by UUID;

-- Add approved_at column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Add updated_at column if it doesn't exist
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Add missing columns to patients table
-- Add hospital_id column to patients if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospital_id UUID;

-- Add hospital_patient_id column to patients if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospital_patient_id VARCHAR(100);

-- Add assigned_by column to patients if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS assigned_by UUID;

-- Add assigned_at column to patients if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add subscription_status column to patients if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'pending';

-- Add is_approved column to patients if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add approved_by column to patients if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS approved_by UUID;

-- Add approved_at column to patients if it doesn't exist
ALTER TABLE patients ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Create the subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'UGX',
    billing_cycle VARCHAR(20) NOT NULL,
    features JSONB DEFAULT '{}',
    max_doctors INTEGER,
    max_patients INTEGER,
    max_storage_gb INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create the hospital_subscription_keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS hospital_subscription_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    subscription_key VARCHAR(255) UNIQUE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    renewed_at TIMESTAMP WITH TIME ZONE,
    renewed_by UUID,
    notes TEXT,
    created_by UUID
);

-- Step 5: Create the hospital_registration_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS hospital_registration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    license_number VARCHAR(100),
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    payment_reference VARCHAR(255),
    mtn_transaction_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT
);

-- Step 6: Create the patient_assignment_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_assignment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action VARCHAR(50) NOT NULL,
    previous_hospital_id UUID REFERENCES hospitals(id),
    notes TEXT
);

-- Step 7: Create the subscription_renewal_reminders table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_renewal_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_via VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'sent',
    message_content TEXT
);

-- Step 8: Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, max_doctors, max_patients, max_storage_gb) VALUES
('Basic Hospital', 'Essential features for small hospitals', 50000, 'monthly', '{"appointments": true, "patient_records": true, "basic_reports": true}', 5, 100, 1),
('Standard Hospital', 'Complete solution for medium hospitals', 100000, 'monthly', '{"appointments": true, "patient_records": true, "lab_results": true, "prescriptions": true, "advanced_reports": true}', 15, 500, 5),
('Premium Hospital', 'Enterprise solution for large hospitals', 200000, 'monthly', '{"appointments": true, "patient_records": true, "lab_results": true, "prescriptions": true, "advanced_reports": true, "analytics": true, "api_access": true}', 50, 2000, 20)
ON CONFLICT DO NOTHING;

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospitals_subscription_key ON hospitals(subscription_key);
CREATE INDEX IF NOT EXISTS idx_hospitals_subscription_expires ON hospitals(subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_subscription_keys_hospital_id ON hospital_subscription_keys(hospital_id);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON hospital_registration_requests(status);

-- Step 10: Create the generate_subscription_key function
CREATE OR REPLACE FUNCTION generate_subscription_key()
RETURNS VARCHAR(255) AS $$
DECLARE
    key VARCHAR(255);
    exists_key BOOLEAN;
BEGIN
    LOOP
        -- Generate a unique key: DIGI-XXXX-XXXX-XXXX
        key := 'DIGI-' || 
               upper(substring(md5(random()::text) from 1 for 4)) || '-' ||
               upper(substring(md5(random()::text) from 1 for 4)) || '-' ||
               upper(substring(md5(random()::text) from 1 for 4));
        
        -- Check if key already exists
        SELECT EXISTS(SELECT 1 FROM hospital_subscription_keys WHERE subscription_key = key) INTO exists_key;
        
        IF NOT exists_key THEN
            RETURN key;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create the create_hospital_subscription function
CREATE OR REPLACE FUNCTION create_hospital_subscription(
    p_hospital_id UUID,
    p_plan_id UUID,
    p_duration_months INTEGER DEFAULT 1,
    p_created_by UUID DEFAULT NULL
)
RETURNS VARCHAR(255) AS $$
DECLARE
    subscription_key VARCHAR(255);
    plan_record RECORD;
BEGIN
    -- Get plan details
    SELECT * INTO plan_record FROM subscription_plans WHERE id = p_plan_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription plan not found';
    END IF;
    
    -- Generate unique subscription key
    subscription_key := generate_subscription_key();
    
    -- Calculate expiration date
    INSERT INTO hospital_subscription_keys (
        hospital_id,
        subscription_key,
        plan_id,
        expires_at,
        created_by
    ) VALUES (
        p_hospital_id,
        subscription_key,
        p_plan_id,
        NOW() + INTERVAL '1 month' * p_duration_months,
        p_created_by
    );
    
    -- Update hospital record
    UPDATE hospitals SET
        subscription_key = subscription_key,
        subscription_expires_at = NOW() + INTERVAL '1 month' * p_duration_months,
        subscription_renewal_date = NOW() + INTERVAL '1 month' * p_duration_months,
        subscription_status = 'active',
        subscription_tier = plan_record.name,
        updated_at = NOW()
    WHERE id = p_hospital_id;
    
    RETURN subscription_key;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create the assign_patient_to_hospital function
CREATE OR REPLACE FUNCTION assign_patient_to_hospital(
    p_patient_id UUID,
    p_hospital_id UUID,
    p_assigned_by UUID,
    p_hospital_patient_id VARCHAR(100) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    previous_hospital_id UUID;
    hospital_active BOOLEAN;
BEGIN
    -- Check if hospital subscription is active
    SELECT subscription_status = 'active' INTO hospital_active
    FROM hospitals 
    WHERE id = p_hospital_id;
    
    IF NOT hospital_active THEN
        RAISE EXCEPTION 'Hospital subscription is not active';
    END IF;
    
    -- Get previous hospital assignment
    SELECT hospital_id INTO previous_hospital_id
    FROM patients
    WHERE id = p_patient_id;
    
    -- Update patient assignment
    UPDATE patients SET
        hospital_id = p_hospital_id,
        hospital_patient_id = COALESCE(p_hospital_patient_id, hospital_patient_id),
        assigned_by = p_assigned_by,
        assigned_at = NOW()
    WHERE id = p_patient_id;
    
    -- Log the assignment
    INSERT INTO patient_assignment_logs (
        patient_id,
        hospital_id,
        assigned_by,
        action,
        previous_hospital_id,
        notes
    ) VALUES (
        p_patient_id,
        p_hospital_id,
        p_assigned_by,
        CASE 
            WHEN previous_hospital_id IS NULL THEN 'assigned'
            ELSE 'transferred'
        END,
        previous_hospital_id,
        p_notes
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Step 13: Enable RLS on all tables
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_subscription_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_assignment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_renewal_reminders ENABLE ROW LEVEL SECURITY;

-- Step 14: Create RLS policies (now that columns exist)
-- Hospitals policies
DROP POLICY IF EXISTS "Hospitals can view own data" ON hospitals;
CREATE POLICY "Hospitals can view own data" ON hospitals FOR SELECT USING (
    subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
);

DROP POLICY IF EXISTS "Hospitals can update own data" ON hospitals;
CREATE POLICY "Hospitals can update own data" ON hospitals FOR UPDATE USING (
    subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
);

DROP POLICY IF EXISTS "Hospitals can insert own data" ON hospitals;
CREATE POLICY "Hospitals can insert own data" ON hospitals FOR INSERT WITH CHECK (
    subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
);

-- Patients policies
DROP POLICY IF EXISTS "Patients can view own data" ON patients;
CREATE POLICY "Patients can view own data" ON patients FOR SELECT USING (
    auth.uid() = user_id OR
    hospital_id IN (
        SELECT id FROM hospitals 
        WHERE subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
    )
);

DROP POLICY IF EXISTS "Patients can update own data" ON patients;
CREATE POLICY "Patients can update own data" ON patients FOR UPDATE USING (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "Patients can insert own data" ON patients;
CREATE POLICY "Patients can insert own data" ON patients FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Admin policies for subscription management
CREATE POLICY "Admins can manage subscription keys" ON hospital_subscription_keys FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage registration requests" ON hospital_registration_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can view assignment logs" ON patient_assignment_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage renewal reminders" ON subscription_renewal_reminders FOR ALL USING (auth.role() = 'authenticated');

-- Public policies for subscription plans
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans FOR SELECT USING (true); 