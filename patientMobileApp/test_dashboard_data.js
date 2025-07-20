// Test script to verify dashboard data loading
// Run this in the browser console or as a standalone test

import { supabase } from './lib/supabase.js';

async function testDashboardData() {
  console.log('=== Testing Dashboard Data Loading ===');
  
  try {
    // 1. Test user lookup
    console.log('1. Looking up test1@wopital.com user...');
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('User error:', userError);
      return;
    }
    
    console.log('User found:', user.user?.email);
    
    // 2. Test patient profile lookup
    console.log('2. Looking up patient profile...');
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.user.id)
      .single();
    
    if (patientError) {
      console.error('Patient error:', patientError);
      return;
    }
    
    console.log('Patient profile found:', patient);
    
    // 3. Test appointments
    console.log('3. Looking up appointments...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patient.id);
    
    if (appointmentsError) {
      console.log('Appointments error (table might not exist):', appointmentsError.message);
    } else {
      console.log('Appointments found:', appointments?.length || 0);
    }
    
    // 4. Test prescriptions
    console.log('4. Looking up prescriptions...');
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patient.id)
      .eq('status', 'active');
    
    if (prescriptionsError) {
      console.log('Prescriptions error (table might not exist):', prescriptionsError.message);
    } else {
      console.log('Active prescriptions found:', prescriptions?.length || 0);
    }
    
    // 5. Test vitals
    console.log('5. Looking up vitals...');
    const { data: vitals, error: vitalsError } = await supabase
      .from('patient_vitals')
      .select('*')
      .eq('patient_id', patient.id)
      .order('recorded_date', { ascending: false })
      .limit(1);
    
    if (vitalsError) {
      console.log('Vitals error (table might not exist):', vitalsError.message);
    } else {
      console.log('Latest vitals found:', vitals?.length || 0);
      if (vitals && vitals.length > 0) {
        console.log('Latest vitals:', vitals[0]);
      }
    }
    
    console.log('=== Test Complete ===');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Export for use in other files
export { testDashboardData };

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testDashboardData = testDashboardData;
} else {
  // Node.js environment
  testDashboardData();
} 