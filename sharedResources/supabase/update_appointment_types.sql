-- Update appointment types to use standardized values
-- This script ensures all appointments use one of the 4 standard types

-- First, let's see what appointment types currently exist
SELECT DISTINCT type FROM appointments ORDER BY type;

-- Update any non-standard appointment types to standard ones
UPDATE appointments 
SET type = 'consultation' 
WHERE type NOT IN ('consultation', 'follow-up', 'emergency', 'routine')
   OR type IS NULL;

-- Update specific variations to standard types
UPDATE appointments SET type = 'consultation' WHERE type IN ('Consultation', 'consultation', 'urgent', 'critical');
UPDATE appointments SET type = 'follow-up' WHERE type IN ('Follow-up', 'follow-up', 'Follow up', 'follow up');
UPDATE appointments SET type = 'emergency' WHERE type IN ('Emergency', 'emergency', 'Critical Care', 'Urgent Care');
UPDATE appointments SET type = 'routine' WHERE type IN ('Routine Check-up', 'routine', 'Check-up', 'check-up', 'Routine');

-- Verify the update
SELECT DISTINCT type FROM appointments ORDER BY type;

-- Add a check constraint to ensure only valid types can be inserted
-- (This will prevent future invalid types from being added)
ALTER TABLE appointments 
ADD CONSTRAINT check_appointment_type 
CHECK (type IN ('consultation', 'follow-up', 'emergency', 'routine'));

-- Show final result
SELECT 
  type,
  COUNT(*) as count
FROM appointments 
GROUP BY type 
ORDER BY type; 