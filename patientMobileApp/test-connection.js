// Test Supabase connection
import { supabase } from './lib/supabase';

export const testSupabaseConnection = async () => {
  console.log('=== TESTING SUPABASE CONNECTION ===');
  console.log('Testing connection to:', supabase.supabaseUrl);
  
  try {
    // Test basic connection with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 10000)
    );
    
    const connectionPromise = supabase
      .from('doctors')
      .select('count')
      .limit(1);
    
    const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test doctors table
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*')
      .limit(5);
    
    if (doctorsError) {
      console.error('❌ Doctors table test failed:', doctorsError);
      return false;
    }
    
    console.log('✅ Doctors table accessible');
    console.log('📊 Found', doctors?.length || 0, 'doctors');
    
    if (doctors && doctors.length > 0) {
      console.log('Sample doctors:');
      doctors.forEach((doctor, index) => {
        console.log(`${index + 1}. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialty}`);
      });
    } else {
      console.log('⚠️ No doctors found in database');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection test exception:', error);
    console.error('Exception details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.message.includes('timeout')) {
      console.error('❌ Network timeout - check your internet connection');
    } else if (error.message.includes('fetch')) {
      console.error('❌ Network error - check your internet connection and Supabase URL');
    }
    
    return false;
  }
};

// Add sample doctors if none exist
export const addSampleDoctors = async () => {
  console.log('=== ADDING SAMPLE DOCTORS ===');
  
  const sampleDoctors = [
    {
      first_name: 'Dr. Sarah',
      last_name: 'Johnson',
      specialty: 'Cardiology',
      email: 'sarah.johnson@hospital.com',
      phone: '+1234567890'
    },
    {
      first_name: 'Dr. Michael',
      last_name: 'Chen',
      specialty: 'Dermatology',
      email: 'michael.chen@hospital.com',
      phone: '+1234567891'
    },
    {
      first_name: 'Dr. Emily',
      last_name: 'Davis',
      specialty: 'General Medicine',
      email: 'emily.davis@hospital.com',
      phone: '+1234567892'
    },
    {
      first_name: 'Dr. Robert',
      last_name: 'Wilson',
      specialty: 'Orthopedics',
      email: 'robert.wilson@hospital.com',
      phone: '+1234567893'
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('doctors')
      .insert(sampleDoctors)
      .select();
    
    if (error) {
      console.error('❌ Error adding sample doctors:', error);
      return false;
    }
    
    console.log('✅ Sample doctors added successfully:', data?.length || 0, 'doctors');
    return true;
  } catch (error) {
    console.error('❌ Exception adding sample doctors:', error);
    return false;
  }
}; 