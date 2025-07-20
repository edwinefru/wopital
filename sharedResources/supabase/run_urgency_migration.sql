-- Add urgency column to appointments table
-- Run this in your Supabase SQL editor

-- Add urgency column if it doesn't exist
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'routine';

-- Add a comment to explain the urgency levels
COMMENT ON COLUMN appointments.urgency IS 'Urgency levels: routine, urgent, critical, emergency';

-- Update existing appointments to have appropriate urgency based on type
UPDATE appointments 
SET urgency = CASE 
    WHEN type = 'emergency' THEN 'emergency'
    WHEN type = 'urgent' THEN 'urgent'
    WHEN type = 'critical' THEN 'critical'
    ELSE 'routine'
END
WHERE urgency IS NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_urgency ON appointments(urgency);

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' AND column_name = 'urgency'; 