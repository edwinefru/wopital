// Debug Login Issue Script
// Run this to identify why login is getting stuck

import { supabase } from './lib/supabase';

export const debugLoginIssue = async (email, password) => {
  console.log('🔍 DEBUG: Starting login issue diagnosis...');
  
  try {
    // Step 1: Test Supabase connection
    console.log('📡 Step 1: Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return { success: false, error: 'Connection failed', details: connectionError };
    }
    console.log('✅ Connection successful');

    // Step 2: Test authentication endpoint
    console.log('🔐 Step 2: Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError);
      return { success: false, error: 'Authentication failed', details: authError };
    }

    console.log('✅ Authentication successful');
    console.log('👤 User ID:', authData.user?.id);
    console.log('📧 Email confirmed:', authData.user?.email_confirmed_at);

    // Step 3: Test profile loading
    console.log('👤 Step 3: Testing profile loading...');
    const { data: profileData, error: profileError } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile loading failed:', profileError);
      return { success: false, error: 'Profile loading failed', details: profileError };
    }

    console.log('✅ Profile loaded successfully');
    console.log('📋 Profile data:', profileData);

    // Step 4: Test admin profile loading
    console.log('👨‍💼 Step 4: Testing admin profile loading...');
    const { data: adminData, error: adminError } = await supabase
      .from('platform_admins')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (adminError && adminError.code !== 'PGRST116') {
      console.error('❌ Admin profile check failed:', adminError);
    } else if (adminData) {
      console.log('✅ Admin profile found:', adminData);
    } else {
      console.log('ℹ️ No admin profile found (this is normal for patients)');
    }

    // Step 5: Test hospital admin profile loading
    console.log('🏥 Step 5: Testing hospital admin profile loading...');
    const { data: hospitalAdminData, error: hospitalAdminError } = await supabase
      .from('hospital_admins')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (hospitalAdminError && hospitalAdminError.code !== 'PGRST116') {
      console.error('❌ Hospital admin profile check failed:', hospitalAdminError);
    } else if (hospitalAdminData) {
      console.log('✅ Hospital admin profile found:', hospitalAdminData);
    } else {
      console.log('ℹ️ No hospital admin profile found (this is normal for patients)');
    }

    // Step 6: Test RLS policies
    console.log('🔒 Step 6: Testing RLS policies...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('user_id', authData.user.id);

    if (rlsError) {
      console.error('❌ RLS policy test failed:', rlsError);
      return { success: false, error: 'RLS policy issue', details: rlsError };
    }

    console.log('✅ RLS policies working correctly');

    // Step 7: Test session persistence
    console.log('💾 Step 7: Testing session persistence...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session test failed:', sessionError);
    } else if (session) {
      console.log('✅ Session persisted correctly');
    } else {
      console.log('⚠️ No session found after login');
    }

    console.log('🎉 DEBUG: All tests passed! Login should work correctly.');
    return { 
      success: true, 
      user: authData.user, 
      profile: profileData,
      session: session 
    };

  } catch (error) {
    console.error('💥 DEBUG: Unexpected error:', error);
    return { success: false, error: 'Unexpected error', details: error };
  }
};

// Test function for common issues
export const testCommonIssues = async () => {
  console.log('🧪 Testing common login issues...');
  
  const testCases = [
    {
      name: 'Test with valid credentials',
      email: 'test1@wopital.com',
      password: 'Test123!'
    },
    {
      name: 'Test with different email domain',
      email: 'test@gmail.com',
      password: 'Test123!'
    },
    {
      name: 'Test with invalid password',
      email: 'test1@wopital.com',
      password: 'WrongPassword123!'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Running: ${testCase.name}`);
    try {
      const result = await debugLoginIssue(testCase.email, testCase.password);
      console.log(`Result: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
      if (!result.success) {
        console.log(`Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}`);
    }
  }
};

// Quick fix suggestions
export const getFixSuggestions = (error) => {
  const suggestions = {
    'Connection failed': [
      'Check internet connection',
      'Verify Supabase URL and key',
      'Check if Supabase is down'
    ],
    'Authentication failed': [
      'Verify email and password',
      'Check if email is confirmed',
      'Try different email domain',
      'Clear app cache and restart'
    ],
    'Profile loading failed': [
      'Check if user profile exists in database',
      'Verify RLS policies',
      'Check database permissions'
    ],
    'RLS policy issue': [
      'Run RLS policy setup scripts',
      'Check user permissions',
      'Verify table policies'
    ],
    'Session persistence': [
      'Check authentication settings',
      'Verify redirect URLs',
      'Clear browser/app cache'
    ]
  };

  return suggestions[error] || ['Unknown error - check console logs'];
}; 