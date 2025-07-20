import { createClient } from '@supabase/supabase-js'

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rabeukllyuytkctmnegi.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6em11cHdqYWlmZ2NlaXBjZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTgzNTYsImV4cCI6MjA2NzIzNDM1Nn0.RHXNiJJxRsK4K0kYLmdBNCi0YkQYWHqPOUMMB5FBTU8'

// Log configuration for debugging
console.log('HospitalAdmin Supabase URL:', supabaseUrl)
console.log('HospitalAdmin configured successfully')

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database table names
export const TABLES = {
  USERS: 'users',
  PATIENTS: 'patients',
  HOSPITALS: 'hospitals',
  DOCTORS: 'doctors',
  APPOINTMENTS: 'appointments',
  LAB_RESULTS: 'lab_results',
  PHARMACIES: 'pharmacies',
  MEDICATIONS: 'medications',
  PRESCRIPTIONS: 'prescriptions',
  IMMUNIZATIONS: 'immunizations',
  PAYMENTS: 'payments',
  MEDICAL_RECORDS: 'medical_records',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  PATIENT_VITALS: 'patient_vitals',
  DIAGNOSES: 'diagnoses',
} 