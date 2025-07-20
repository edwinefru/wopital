-- Add urgency column to appointments table
-- This column was referenced in the BookAppointmentScreen but may not exist in the database

-- Add urgency column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'urgency') THEN
        ALTER TABLE appointments ADD COLUMN urgency VARCHAR(20) DEFAULT 'routine';
        
        -- Add a comment to explain the urgency levels
        COMMENT ON COLUMN appointments.urgency IS 'Urgency levels: routine, urgent, critical, emergency';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'appointments' AND column_name = 'urgency';

-- Update the type column to include urgency levels
-- The type column will now include: consultation, follow-up, emergency, routine, urgent, critical

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