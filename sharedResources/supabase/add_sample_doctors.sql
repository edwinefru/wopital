-- Add sample doctors for appointment booking
-- You can modify these details as needed

-- First, let's add a sample hospital if it doesn't exist
INSERT INTO hospitals (
    id,
    name,
    address,
    phone,
    email,
    website,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000', -- Sample hospital ID
    'DigiCare General Hospital',
    '123 Healthcare Ave, Medical District, City',
    '+1-555-0123',
    'info@digicare-hospital.com',
    'https://digicare-hospital.com',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add sample doctors
INSERT INTO doctors (
    id,
    first_name,
    last_name,
    specialty,
    license_number,
    phone,
    email,
    hospital_id,
    created_at,
    updated_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Dr. Sarah',
    'Johnson',
    'Cardiology',
    'MD123456',
    '+1-555-0101',
    'sarah.johnson@digicare.com',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Dr. Michael',
    'Chen',
    'Orthopedics',
    'MD123457',
    '+1-555-0102',
    'michael.chen@digicare.com',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Dr. Emily',
    'Rodriguez',
    'Pediatrics',
    'MD123458',
    '+1-555-0103',
    'emily.rodriguez@digicare.com',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Dr. James',
    'Wilson',
    'Neurology',
    'MD123459',
    '+1-555-0104',
    'james.wilson@digicare.com',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Dr. Lisa',
    'Thompson',
    'Dermatology',
    'MD123460',
    '+1-555-0105',
    'lisa.thompson@digicare.com',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the doctors were created
SELECT 
    id,
    first_name,
    last_name,
    specialty,
    phone,
    email
FROM doctors 
ORDER BY first_name, last_name; 