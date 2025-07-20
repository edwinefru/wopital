// Debug Login Issues - Mobile App
// Run this in your mobile app to debug login problems

import { supabase } from './lib/supabase';

export const debugLogin = async (email, password) => {
  console.log('🔍 === DEBUGGING LOGIN ISSUE ===');
  console.log('Email:', email);
  console.log('Supabase URL:', supabase.supabaseUrl);
  
  try {
    // Step 1: Test basic connection
    console.log('\n📡 Step 1: Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('doctors')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError);
      return { success: false, error: 'Connection failed: ' + testError.message };
    }
    
    console.log('✅ Basic connection successful');
    
    // Step 2: Test auth configuration
    console.log('\n🔐 Step 2: Testing auth configuration...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('ℹ️ No current user (expected):', userError.message);
    } else if (user) {
      console.log('⚠️ User already logged in:', user.id);
    }
    
    console.log('✅ Auth configuration working');
    
    // Step 3: Test sign in
    console.log('\n🚪 Step 3: Testing sign in...');
    console.log('Attempting to sign in...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Sign in failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      
      // Provide specific error messages
      let userMessage = 'Login failed';
      if (error.message.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        userMessage = 'Please confirm your email address';
      } else if (error.message.includes('rate limit')) {
        userMessage = 'Too many login attempts. Please wait.';
      } else if (error.message.includes('network')) {
        userMessage = 'Network error. Check your connection.';
      }
      
      return { success: false, error: userMessage };
    }
    
    console.log('✅ Sign in successful!');
    console.log('User ID:', data.user.id);
    console.log('User email:', data.user.email);
    
    // Step 4: Test profile loading
    console.log('\n👤 Step 4: Testing profile loading...');
    
    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (adminData) {
      console.log('✅ Admin profile found:', adminData);
      return { success: true, user: data.user, profile: adminData, type: 'admin' };
    }
    
    // Check if user is hospital admin
    const { data: hospitalAdminData, error: hospitalAdminError } = await supabase
      .from('hospital_admins')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (hospitalAdminData) {
      console.log('✅ Hospital admin profile found:', hospitalAdminData);
      return { success: true, user: data.user, profile: hospitalAdminData, type: 'hospital_admin' };
    }
    
    // Check if user is patient
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
    
    if (patientData) {
      console.log('✅ Patient profile found:', patientData);
      return { success: true, user: data.user, profile: patientData, type: 'patient' };
    }
    
    console.log('⚠️ No profile found for user');
    console.log('Creating patient profile...');
    
    // Create patient profile
    const { data: newProfile, error: createError } = await supabase
      .from('patients')
      .insert([
        {
          user_id: data.user.id,
          first_name: 'New',
          last_name: 'Patient',
          email: data.user.email
        }
      ])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Failed to create profile:', createError);
      return { success: true, user: data.user, profile: null, type: 'new_user' };
    }
    
    console.log('✅ Patient profile created:', newProfile);
    return { success: true, user: data.user, profile: newProfile, type: 'patient' };
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return { success: false, error: 'Unexpected error: ' + error.message };
  }
};

// Test function to check if user exists
export const checkUserExists = async (email) => {
  console.log('🔍 Checking if user exists:', email);
  
  try {
    // Try to sign in with a dummy password to see if user exists
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'dummy_password_123'
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log('✅ User exists but password is wrong');
        return { exists: true, message: 'User exists' };
      } else if (error.message.includes('Email not confirmed')) {
        console.log('✅ User exists but email not confirmed');
        return { exists: true, message: 'User exists but email not confirmed' };
      } else {
        console.log('❌ User does not exist or other error:', error.message);
        return { exists: false, message: error.message };
      }
    }
    
    return { exists: true, message: 'User exists and password is correct' };
  } catch (error) {
    console.error('❌ Error checking user:', error);
    return { exists: false, message: error.message };
  }
};

// Create test user function
export const createTestUser = async (email, password) => {
  console.log('👤 Creating test user:', email);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });
    
    if (error) {
      console.error('❌ Failed to create user:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ User created successfully:', data.user.id);
    
    // Create patient profile
    const { data: profile, error: profileError } = await supabase
      .from('patients')
      .insert([
        {
          user_id: data.user.id,
          first_name: 'Test',
          last_name: 'User',
          email: email
        }
      ])
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Failed to create profile:', profileError);
      return { success: true, user: data.user, profile: null };
    }
    
    console.log('✅ Profile created successfully:', profile);
    return { success: true, user: data.user, profile };
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return { success: false, error: error.message };
  }
}; 