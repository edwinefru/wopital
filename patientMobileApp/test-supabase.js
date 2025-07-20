const { createClient } = require('@supabase/supabase-js');

// Use the same credentials as the mobile app
const supabaseUrl = 'https://uzzmupwjaifgceipcfeu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6em11cHdqYWlmZ2NlaXBjZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTgzNTYsImV4cCI6MjA2NzIzNDM1Nn0.RHXNiJJxRsK4K0kYLmdBNCi0YkQYWHqPOUMMB5FBTU8';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase
      .from('doctors')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    console.log('\n2. Testing doctors table...');
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('*')
      .limit(3);
    
    if (doctorsError) {
      console.error('❌ Doctors table error:', doctorsError);
      return false;
    }
    
    console.log('✅ Doctors table accessible');
    console.log('📊 Found', doctors?.length || 0, 'doctors');
    
    if (doctors && doctors.length > 0) {
      console.log('Sample doctors:');
      doctors.forEach((doctor, index) => {
        console.log(`  ${index + 1}. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialty}`);
      });
    }
    
    console.log('\n3. Testing auth...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️ Auth test (expected for unauthenticated user):', authError.message);
    } else {
      console.log('✅ Auth system accessible');
    }
    
    console.log('\n✅ All tests passed! Supabase is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
}

// Run the test
testConnection().then((success) => {
  if (success) {
    console.log('\n🎉 Supabase connection is working!');
    process.exit(0);
  } else {
    console.log('\n💥 Supabase connection failed!');
    process.exit(1);
  }
}); 