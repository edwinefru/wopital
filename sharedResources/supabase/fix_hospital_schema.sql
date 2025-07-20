-- Fix Hospital Schema and RLS Policies
-- This script fixes the column references and RLS policies

-- First, let's check what columns actually exist in the hospitals table
-- and update the RLS policies accordingly

-- Drop existing RLS policies that reference non-existent columns
DROP POLICY IF EXISTS "Hospitals can view own data" ON hospitals;
DROP POLICY IF EXISTS "Hospitals can update own data" ON hospitals;
DROP POLICY IF EXISTS "Hospitals can insert own data" ON hospitals;

-- Create new RLS policies based on subscription_key instead of user_id
CREATE POLICY "Hospitals can view own data" ON hospitals FOR SELECT USING (
    subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
);

CREATE POLICY "Hospitals can update own data" ON hospitals FOR UPDATE USING (
    subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
);

CREATE POLICY "Hospitals can insert own data" ON hospitals FOR INSERT WITH CHECK (
    subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
);

-- Update the create_hospital_subscription function to not reference user_id
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

-- Update the assign_patient_to_hospital function
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
        assigned_at = NOW(),
        updated_at = NOW()
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

-- Update patients RLS policy to use hospital_id instead of user_id
DROP POLICY IF EXISTS "Patients can view own data" ON patients;
CREATE POLICY "Patients can view own data" ON patients FOR SELECT USING (
    auth.uid() = user_id OR
    hospital_id IN (
        SELECT id FROM hospitals 
        WHERE subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
    )
);

-- Update patients RLS policy for updates
DROP POLICY IF EXISTS "Patients can update own data" ON patients;
CREATE POLICY "Patients can update own data" ON patients FOR UPDATE USING (
    auth.uid() = user_id
);

-- Update patients RLS policy for inserts
DROP POLICY IF EXISTS "Patients can insert own data" ON patients;
CREATE POLICY "Patients can insert own data" ON patients FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

-- Make sure all required columns exist in hospitals table
DO $$ 
BEGIN
    -- Add subscription_key column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitals' AND column_name = 'subscription_key') THEN
        ALTER TABLE hospitals ADD COLUMN subscription_key VARCHAR(255) UNIQUE;
    END IF;
    
    -- Add subscription_expires_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitals' AND column_name = 'subscription_expires_at') THEN
        ALTER TABLE hospitals ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add subscription_renewal_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitals' AND column_name = 'subscription_renewal_date') THEN
        ALTER TABLE hospitals ADD COLUMN subscription_renewal_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add subscription_auto_renew column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitals' AND column_name = 'subscription_auto_renew') THEN
        ALTER TABLE hospitals ADD COLUMN subscription_auto_renew BOOLEAN DEFAULT true;
    END IF;
    
    -- Add subscription_last_payment_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitals' AND column_name = 'subscription_last_payment_date') THEN
        ALTER TABLE hospitals ADD COLUMN subscription_last_payment_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add subscription_next_billing_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hospitals' AND column_name = 'subscription_next_billing_date') THEN
        ALTER TABLE hospitals ADD COLUMN subscription_next_billing_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add hospital_id column to patients if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'hospital_id') THEN
        ALTER TABLE patients ADD COLUMN hospital_id UUID REFERENCES hospitals(id);
    END IF;
    
    -- Add hospital_patient_id column to patients if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'hospital_patient_id') THEN
        ALTER TABLE patients ADD COLUMN hospital_patient_id VARCHAR(100);
    END IF;
    
    -- Add assigned_by column to patients if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'assigned_by') THEN
        ALTER TABLE patients ADD COLUMN assigned_by UUID REFERENCES admin_users(id);
    END IF;
    
    -- Add assigned_at column to patients if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'assigned_at') THEN
        ALTER TABLE patients ADD COLUMN assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospitals_subscription_key ON hospitals(subscription_key);
CREATE INDEX IF NOT EXISTS idx_hospitals_subscription_expires ON hospitals(subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_subscription_keys_hospital_id ON hospital_subscription_keys(hospital_id);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON hospital_registration_requests(status);

-- Insert sample subscription plans if they don't exist
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, max_doctors, max_patients, max_storage_gb) VALUES
('Basic Hospital', 'Essential features for small hospitals', 50000, 'monthly', '{"appointments": true, "patient_records": true, "basic_reports": true}', 5, 100, 1),
('Standard Hospital', 'Complete solution for medium hospitals', 100000, 'monthly', '{"appointments": true, "patient_records": true, "lab_results": true, "prescriptions": true, "advanced_reports": true}', 15, 500, 5),
('Premium Hospital', 'Enterprise solution for large hospitals', 200000, 'monthly', '{"appointments": true, "patient_records": true, "lab_results": true, "prescriptions": true, "advanced_reports": true, "analytics": true, "api_access": true}', 50, 2000, 20)
ON CONFLICT DO NOTHING; 