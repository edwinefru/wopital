import { createClient } from '@supabase/supabase-js'

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://rabeukllyuytkctmnegi.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6em11cHdqYWlmZ2NlaXBjZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTgzNTYsImV4cCI6MjA2NzIzNDM1Nn0.RHXNiJJxRsK4K0kYLmdBNCi0YkQYWHqPOUMMB5FBTU8'

// Log configuration for debugging
console.log('PlatformAdmin Supabase URL:', supabaseUrl)
console.log('PlatformAdmin configured successfully')

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
  PLATFORM_ADMINS: 'platform_admins',
  HOSPITALS: 'hospitals',
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  SUBSCRIPTION_PLANS: 'subscription_plans',
  HOSPITAL_SUBSCRIPTIONS: 'hospital_subscriptions',
  PATIENT_SUBSCRIPTIONS: 'patient_subscriptions',
  HOSPITAL_APPROVAL_REQUESTS: 'hospital_approval_requests',
  MTN_TRANSACTIONS: 'mtn_mobile_money_transactions',
  SYSTEM_SETTINGS: 'system_settings',
  AUDIT_LOGS: 'audit_logs',
  APPOINTMENTS: 'appointments',
  LAB_RESULTS: 'lab_results',
  PRESCRIPTIONS: 'prescriptions',
  PATIENT_VITALS: 'patient_vitals',
} 