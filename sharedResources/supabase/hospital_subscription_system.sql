-- Hospital Subscription System
-- This extends the existing multi-tenant schema with subscription keys and patient relationships

-- Add subscription key and expiration fields to hospitals table
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_key VARCHAR(255) UNIQUE;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_renewal_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_auto_renew BOOLEAN DEFAULT true;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_last_payment_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS subscription_next_billing_date TIMESTAMP WITH TIME ZONE;

-- Add hospital relationship to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospital_patient_id VARCHAR(100); -- Internal patient ID for the hospital
ALTER TABLE patients ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES admin_users(id);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create subscription keys table for better management
CREATE TABLE IF NOT EXISTS hospital_subscription_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    subscription_key VARCHAR(255) UNIQUE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active', -- active, expired, suspended, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    renewed_at TIMESTAMP WITH TIME ZONE,
    renewed_by UUID REFERENCES admin_users(id),
    notes TEXT,
    created_by UUID REFERENCES admin_users(id)
);

-- Create hospital registration requests table
CREATE TABLE IF NOT EXISTS hospital_registration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    license_number VARCHAR(100),
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, payment_pending
    admin_notes TEXT,
    payment_reference VARCHAR(255),
    mtn_transaction_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES admin_users(id),
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejected_reason TEXT
);

-- Create patient assignment logs
CREATE TABLE IF NOT EXISTS patient_assignment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES admin_users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action VARCHAR(50) NOT NULL, -- assigned, unassigned, transferred
    previous_hospital_id UUID REFERENCES hospitals(id),
    notes TEXT
);

-- Create subscription renewal reminders
CREATE TABLE IF NOT EXISTS subscription_renewal_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) NOT NULL, -- 30_days, 7_days, 1_day, expired
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_via VARCHAR(50) NOT NULL, -- email, sms, both
    status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, failed
    message_content TEXT
);

-- Function to generate subscription key
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

-- Function to create hospital subscription
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

-- Function to check and update expired subscriptions
CREATE OR REPLACE FUNCTION check_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER := 0;
    hospital_record RECORD;
BEGIN
    -- Find expired subscriptions
    FOR hospital_record IN 
        SELECT h.id, h.name, h.subscription_key, h.subscription_expires_at
        FROM hospitals h
        WHERE h.subscription_expires_at < NOW() 
        AND h.subscription_status = 'active'
    LOOP
        -- Update subscription status to expired
        UPDATE hospitals SET
            subscription_status = 'expired',
            updated_at = NOW()
        WHERE id = hospital_record.id;
        
        -- Update subscription key status
        UPDATE hospital_subscription_keys SET
            status = 'expired',
            renewed_at = NOW()
        WHERE hospital_id = hospital_record.id AND status = 'active';
        
        expired_count := expired_count + 1;
        
        -- Log the expiration
        INSERT INTO audit_logs (
            action,
            entity_type,
            entity_id,
            new_values
        ) VALUES (
            'subscription_expired',
            'hospital',
            hospital_record.id,
            jsonb_build_object('hospital_name', hospital_record.name, 'expired_at', NOW())
        );
    END LOOP;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to assign patient to hospital
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

-- Create a scheduled job to check expired subscriptions (this would be set up in Supabase)
-- For now, we'll create a function that can be called manually or via cron
CREATE OR REPLACE FUNCTION scheduled_check_expired_subscriptions()
RETURNS void AS $$
BEGIN
    PERFORM check_expired_subscriptions();
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for new tables
ALTER TABLE hospital_subscription_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_assignment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_renewal_reminders ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all subscription keys
CREATE POLICY "Admins can manage subscription keys" ON hospital_subscription_keys FOR ALL USING (auth.role() = 'authenticated');

-- Admin users can manage registration requests
CREATE POLICY "Admins can manage registration requests" ON hospital_registration_requests FOR ALL USING (auth.role() = 'authenticated');

-- Admin users can view assignment logs
CREATE POLICY "Admins can view assignment logs" ON patient_assignment_logs FOR SELECT USING (auth.role() = 'authenticated');

-- Admin users can manage renewal reminders
CREATE POLICY "Admins can manage renewal reminders" ON subscription_renewal_reminders FOR ALL USING (auth.role() = 'authenticated');

-- Update existing RLS policies to include hospital relationships
DROP POLICY IF EXISTS "Hospitals can view own data" ON hospitals;
CREATE POLICY "Hospitals can view own data" ON hospitals FOR SELECT USING (
    auth.uid() = user_id OR 
    subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
);

-- Patients can view their own data and hospital data
DROP POLICY IF EXISTS "Patients can view own data" ON patients;
CREATE POLICY "Patients can view own data" ON patients FOR SELECT USING (
    auth.uid() = user_id OR
    hospital_id IN (
        SELECT id FROM hospitals 
        WHERE subscription_key = current_setting('request.headers')::json->>'x-subscription-key'
    )
); 