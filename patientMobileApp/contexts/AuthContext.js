import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AuthProvider: Initializing...');
    
    // Check for existing session
    const checkUser = async () => {
      try {
        console.log('AuthProvider: Checking for existing user session...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('AuthProvider: Error getting user:', error);
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('AuthProvider: User check result:', user ? 'User found' : 'No user');
        
        if (user) {
          setUser(user);
        }
      } catch (error) {
        console.log('AuthProvider: No existing user session or error:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
        console.log('AuthProvider: Initial loading complete');
      }
    };

    checkUser();

    // Listen for auth changes
    console.log('AuthProvider: Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider: Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        console.log('AuthProvider: User authenticated:', session.user.id);
        setUser(session.user);
      } else {
        console.log('AuthProvider: User signed out or no session');
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      setError(null);
      console.log('signIn: Attempting to sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('signIn: Supabase auth error:', error);
        throw error;
      }
      
      console.log('signIn: Sign in successful:', data.user?.id);
      setUser(data.user);
      
      return { data, error: null };
    } catch (error) {
      console.error('signIn: Catch error:', error);
      
      // Provide more specific error messages
      let errorMessage = error.message;
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before signing in.';
      } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        errorMessage = 'Rate limit exceeded. Please wait a few minutes before trying again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      return { data: null, error: { ...error, message: errorMessage } };
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      setError(null);
      console.log('signUp: Attempting to sign up with:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        console.error('signUp: Supabase auth error:', error);
        throw error;
      }
      
      console.log('signUp: Sign up successful:', data.user?.id);
      
      if (data.user) {
        setUser(data.user);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('signUp: Catch error:', error);
      setError(error.message);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      console.log('signOut: Attempting to sign out');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('signOut: Error:', error);
        throw error;
      }
      
      console.log('signOut: Sign out successful');
      setUser(null);
    } catch (error) {
      console.error('signOut: Catch error:', error);
      setError(error.message);
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      console.log('resetPassword: Attempting to reset password for:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('resetPassword: Error:', error);
        throw error;
      }
      
      console.log('resetPassword: Password reset email sent successfully');
    } catch (error) {
      console.error('resetPassword: Catch error:', error);
      setError(error.message);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 