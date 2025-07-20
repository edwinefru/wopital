const { createClient } = require('@supabase/supabase-js');

// Use the same credentials as the mobile app
const supabaseUrl = 'https://uzzmupwjaifgceipcfeu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6em11cHdqYWlmZ2NlaXBjZmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTgzNTYsImV4cCI6MjA2NzIzNDM1Nn0.RHXNiJJxRsK4K0kYLmdBNCi0YkQYWHqPOUMMB5FBTU8';

const supabase = createClient(supabaseUrl, supabaseKey);

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
  },
  {
    first_name: 'Dr. Lisa',
    last_name: 'Martinez',
    specialty: 'Pediatrics',
    email: 'lisa.martinez@hospital.com',
    phone: '+1234567894'
  },
  {
    first_name: 'Dr. James',
    last_name: 'Thompson',
    specialty: 'Neurology',
    email: 'james.thompson@hospital.com',
    phone: '+1234567895'
  }
];

async function addSampleDoctors() {
  try {
    console.log('Adding sample doctors to the database...');
    
    const { data, error } = await supabase
      .from('doctors')
      .insert(sampleDoctors)
      .select();
    
    if (error) {
      console.error('❌ Error adding doctors:', error);
      return false;
    }
    
    console.log('✅ Successfully added', data.length, 'doctors:');
    data.forEach((doctor, index) => {
      console.log(`  ${index + 1}. ${doctor.first_name} ${doctor.last_name} - ${doctor.specialty}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Exception adding doctors:', error);
    return false;
  }
}

// Run the script
addSampleDoctors().then((success) => {
  if (success) {
    console.log('\n🎉 Sample doctors added successfully!');
    process.exit(0);
  } else {
    console.log('\n💥 Failed to add sample doctors!');
    process.exit(1);
  }
}); 