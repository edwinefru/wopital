import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadAdminUser(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadAdminUser(session.user.id);
        } else {
          setUser(null);
          setAdminUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadAdminUser = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading admin user:', error);
        // If admin user doesn't exist, sign out
        await signOut();
        toast.error('Access denied. Admin privileges required.');
        return;
      }

      setAdminUser(data);
    } catch (error) {
      console.error('Error loading admin user:', error);
      await signOut();
      toast.error('Access denied. Admin privileges required.');
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      setUser(data.user);
      setAdminUser(adminData);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Failed to sign in');
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email, password, adminData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create admin user record
      const { error: adminError } = await supabase
        .from('platform_admins')
        .insert([
          {
            user_id: data.user.id,
            first_name: adminData.firstName,
            last_name: adminData.lastName,
            email: email,
            role: 'admin',
          },
        ]);

      if (adminError) throw adminError;

      setUser(data.user);
      setAdminUser({
        user_id: data.user.id,
        first_name: adminData.firstName,
        last_name: adminData.lastName,
        email: email,
        role: 'admin',
      });

      toast.success('Admin account created successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Failed to create admin account');
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setAdminUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent!');
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to send reset email');
      return { success: false, error: error.message };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to update password');
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { error } = await supabase
        .from('platform_admins')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setAdminUser({
        ...adminUser,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
      });

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    adminUser,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 