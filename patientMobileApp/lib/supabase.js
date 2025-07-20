import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://rabeukllyuytkctmnegi.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhYmV1a2xseXV5dGtjdG1uZWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDM3ODQsImV4cCI6MjA2ODUxOTc4NH0.ZPUCV7sXvCfncTwUEYiSEFZz7ZUdg1waDoFnyX1axsM';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase configured successfully');

// Create Supabase client with proper configuration
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
});

// Database table names
export const TABLES = {
  USERS: 'users',
  PATIENTS: 'patients',
  HOSPITALS: 'hospitals',
  DOCTORS: 'doctors',
  APPOINTMENTS: 'appointments',
  APPOINTMENT_ACTIONS: 'appointment_actions',
  PRESCRIPTIONS: 'prescriptions',
  MEDICATIONS: 'medications',
  IMMUNIZATIONS: 'immunizations',
  PAYMENTS: 'payments',
  MEDICAL_RECORDS: 'medical_records',
  LAB_RESULTS: 'lab_results',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  PATIENT_VITALS: 'patient_vitals',
  DIAGNOSES: 'diagnoses',
};

// Auth helper functions with proper error handling
export const auth = {
  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;
      
      // Create patient profile after successful signup
      if (data.user) {
        await createPatientProfile(data.user.id, userData);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error };
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Signin error:', error);
      return { data: null, error };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Signout error:', error);
      return { error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { data: { user }, error: null };
    } catch (error) {
      console.error('Get user error:', error);
      return { data: { user: null }, error };
    }
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('Auth state change error:', error);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error };
    }
  },
};

// Database helper functions
export const database = {
  // Create patient profile
  createPatientProfile: async (userId, patientData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PATIENTS)
        .insert([
          {
            user_id: userId,
            first_name: patientData.first_name || '',
            last_name: patientData.last_name || '',
            phone: patientData.phone || '',
            date_of_birth: patientData.date_of_birth || null,
            gender: patientData.gender || null,
            blood_type: patientData.blood_type || null,
            emergency_contact: patientData.emergency_contact || null,
            hospital_id: patientData.hospital_id || null,
          },
        ])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create patient profile error:', error);
      return { data: null, error };
    }
  },

  // Get patient profile
  getPatientProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PATIENTS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get patient profile error:', error);
      return { data: null, error };
    }
  },

  // Get appointments
  getAppointments: async (patientId, status = null) => {
    try {
      let query = supabase
        .from(TABLES.APPOINTMENTS)
        .select(`
          *,
          doctors:doctor_id(*),
          hospitals:hospital_id(*)
        `)
        .eq('patient_id', patientId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('appointment_date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get appointments error:', error);
      return { data: null, error };
    }
  },

  // Create appointment
  createAppointment: async (appointmentData) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.APPOINTMENTS)
        .insert([appointmentData])
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Create appointment error:', error);
      return { data: null, error };
    }
  },

  // Get doctors
  getDoctors: async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.DOCTORS)
        .select('*')
        .order('first_name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get doctors error:', error);
      return { data: null, error };
    }
  },

  // Get hospitals
  getHospitals: async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.HOSPITALS)
        .select('*')
        .order('name');

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get hospitals error:', error);
      return { data: null, error };
    }
  },

  // Get lab results
  getLabResults: async (patientId) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.LAB_RESULTS)
        .select('*')
        .eq('patient_id', patientId)
        .order('test_date', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get lab results error:', error);
      return { data: null, error };
    }
  },

  // Get patient vitals
  getPatientVitals: async (patientId, limit = 10) => {
    try {
      const { data, error } = await supabase
        .from(TABLES.PATIENT_VITALS)
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Get patient vitals error:', error);
      return { data: null, error };
    }
  },
};

// Helper function to create patient profile
const createPatientProfile = async (userId, userData) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          user_id: userId,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          date_of_birth: userData.date_of_birth || null,
          gender: userData.gender || null,
          blood_type: userData.blood_type || null,
          emergency_contact: userData.emergency_contact || null,
          hospital_id: userData.hospital_id || null,
        },
      ])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Create patient profile error:', error);
    return { data: null, error };
  }
}; 