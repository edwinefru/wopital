// Test Supabase Storage connection
import { supabase } from './lib/supabase';

export const testStorage = async () => {
  try {
    console.log('Testing Supabase Storage...');
    
    // Test 1: Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return false;
    }
    
    // Test 2: Check if avatars bucket exists
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    if (!avatarsBucket) {
      console.error('Avatars bucket not found!');
      return false;
    }
    
    console.log('Avatars bucket found:', avatarsBucket);
    
    // Test 3: Try to list files in avatars bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('avatars')
      .list();
    
    if (filesError) {
      console.error('Error listing files:', filesError);
      return false;
    }
    
    console.log('Files in avatars bucket:', files);
    
    return true;
  } catch (error) {
    console.error('Storage test failed:', error);
    return false;
  }
}; 