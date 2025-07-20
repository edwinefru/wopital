import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { signupRateLimit, signupBackoff } from '../utils/signupRateLimit';

export default function SignupScreen({ navigation }) {
  const { signUp, error, clearError } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Check rate limiting before attempting signup
    const rateLimitCheck = signupRateLimit.canSignup(email.trim());
    if (!rateLimitCheck.allowed) {
      const timeRemaining = signupRateLimit.formatTimeRemaining(rateLimitCheck.timeUntilReset);
      Alert.alert(
        'Rate Limit Exceeded',
        `Too many signup attempts. Please wait ${timeRemaining} before trying again.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    clearError();

    try {
      const userData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      };

      // Use exponential backoff for signup attempts
      const result = await signupBackoff.retry(
        async () => {
          const { data, error } = await signUp(email.trim(), password, userData);
          if (error) throw error;
          return { data, error: null };
        },
        3, // max attempts
        2000 // base delay
      );

      if (result.error) {
        // Handle rate limit specifically
        if (result.error.message.includes('rate limit') || result.error.message.includes('too many requests')) {
          signupRateLimit.recordAttempt(email.trim(), false);
          Alert.alert(
            'Rate Limit Exceeded',
            'Too many signup attempts. Please wait a few minutes before trying again.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Handle other errors
        let errorMessage = 'Signup failed. Please try again.';
        if (result.error.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (result.error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (result.error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else {
          errorMessage = result.error.message;
        }

        Alert.alert('Signup Failed', errorMessage);
      } else {
        // Success - record successful signup and clear rate limiting
        signupRateLimit.recordAttempt(email.trim(), true);
        Alert.alert('Success', 'Account created successfully! Please check your email to confirm your account.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An unexpected error occurred.';
      if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        signupRateLimit.recordAttempt(email.trim(), false);
        errorMessage = 'Rate limit exceeded. Please wait a few minutes before trying again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to reach the server. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else {
        errorMessage = error.message;
      }

      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Gradient Header */}
        <LinearGradient colors={['#007AFF', '#00C6FB']} style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="person-add" size={60} color="white" />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join DigiCare to manage your health</Text>
        </LinearGradient>

        {/* Signup Form Card */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Sign Up</Text>
          <Text style={styles.formSubtitle}>Create your patient account</Text>

          {/* First Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#666"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          {/* Last Name */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#666"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
          {/* Phone */}
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#666"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 40,
    paddingTop: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: -30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  formContainer: {
    flex: 1,
    padding: 30,
    backgroundColor: 'white',
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#222',
  },
  passwordInput: {
    paddingRight: 36,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  signupButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  signupButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 