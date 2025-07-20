import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CustomDatePicker from '../components/DatePicker';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, patientProfile, updatePatientProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');

  // Password update state
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // MFA state
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfa_enabled || false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Emergency contact state
  const [emergencyName, setEmergencyName] = useState(patientProfile?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patientProfile?.emergency_contact_phone || '');

  useEffect(() => {
    if (patientProfile) {
      setFirstName(patientProfile.first_name || '');
      setLastName(patientProfile.last_name || '');
      setPhone(patientProfile.phone || '');
      setDateOfBirth(patientProfile.date_of_birth || '');
      setGender(patientProfile.gender || '');
      setBloodType(patientProfile.blood_type || '');
      setEmergencyName(patientProfile.emergency_contact_name || '');
      setEmergencyPhone(patientProfile.emergency_contact_phone || '');
    }
  }, [patientProfile]);

  const handleSave = async () => {
    if (!user || !patientProfile) {
      Alert.alert('Error', 'No patient profile found');
      return;
    }
    setLoading(true);
    try {
      const updates = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        date_of_birth: dateOfBirth,
        gender: gender,
        blood_type: bloodType,
        emergency_contact_name: emergencyName.trim(),
        emergency_contact_phone: emergencyPhone.trim(),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from('patients')
        .update(updates)
        .eq('user_id', user.id);
      if (error) {
        Alert.alert('Error', 'Could not update profile. Please try again.');
        return;
      }
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      Alert.alert('Error', error.message || 'Failed to update password.');
    } else {
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      Alert.alert('Success', 'Password updated successfully!');
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Convert MM/DD/YYYY to YYYY-MM-DD
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
    }
    return dateString;
  };

  // Avatar upload - Simplified version
  const handleAvatarPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5, // Lower quality for smaller file size
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        console.log('Selected image:', image.uri);
        
        // For now, let's just store the local URI temporarily
        // This will work until we fix the storage upload
        const tempAvatarUrl = image.uri;
        
        // Update patient profile with local URI (temporary solution)
        const { error: updateError } = await supabase
          .from('patients')
          .update({ avatar_url: tempAvatarUrl })
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error('Profile update error:', updateError);
          Alert.alert('Error', 'Failed to update profile.');
          return;
        }
        
        Alert.alert('Success', 'Profile picture updated! (Local storage)');
        
        // Refresh profile data
        if (updatePatientProfile) {
          updatePatientProfile();
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', error.message);
    }
  };

  // MFA logic
  const handleEnableMfa = async () => {
    setMfaLoading(true);
    // Send OTP to email
    const { error } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'DigiCare', friendlyName: 'DigiCare MFA' });
    setMfaLoading(false);
    if (error) {
      Alert.alert('Error', error.message || 'Failed to enable MFA.');
    } else {
      setShowOtpInput(true);
    }
  };
  const handleVerifyOtp = async () => {
    setMfaLoading(true);
    const { error } = await supabase.auth.mfa.verify({ factorType: 'totp', code: otp });
    setMfaLoading(false);
    if (error) {
      Alert.alert('Error', error.message || 'Failed to verify OTP.');
    } else {
      setMfaEnabled(true);
      setShowOtpInput(false);
      setOtp('');
      Alert.alert('Success', 'MFA enabled!');
    }
  };
  const handleDisableMfa = async () => {
    setMfaLoading(true);
    const { error } = await supabase.auth.mfa.unenroll();
    setMfaLoading(false);
    if (error) {
      Alert.alert('Error', error.message || 'Failed to disable MFA.');
    } else {
      setMfaEnabled(false);
      Alert.alert('Success', 'MFA disabled.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPick}>
          <Image 
            source={{ uri: patientProfile?.avatar_url || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
            style={styles.avatar} 
          />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>{user?.email}</Text>
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color="#1976d2" />
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={firstName}
            onChangeText={setFirstName}
            editable={isEditing}
            placeholder="First Name"
          />
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color="#1976d2" />
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={lastName}
            onChangeText={setLastName}
            editable={isEditing}
            placeholder="Last Name"
          />
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color="#1976d2" />
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={phone}
            onChangeText={setPhone}
            editable={isEditing}
            placeholder="Phone"
            keyboardType="phone-pad"
          />
        </View>

        {isEditing ? (
          <CustomDatePicker
            label="Date of Birth"
            value={dateOfBirth}
            onDateChange={setDateOfBirth}
            placeholder="Select date of birth"
            maximumDate={new Date()}
            mode="date"
          />
        ) : (
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#1976d2" />
            <Text style={[styles.input, styles.disabledInput]}>
              {formatDateForDisplay(dateOfBirth) || 'Not set'}
            </Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Ionicons name="male-female" size={20} color="#1976d2" />
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={gender}
            onChangeText={setGender}
            editable={isEditing}
            placeholder="Gender"
          />
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="water" size={20} color="#1976d2" />
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={bloodType}
            onChangeText={setBloodType}
            editable={isEditing}
            placeholder="Blood Type (e.g., O+)"
          />
        </View>

        {/* Emergency Contact Fields */}
        <View style={styles.infoRow}>
          <Ionicons name="person-circle" size={20} color="#1976d2" />
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={emergencyName}
            onChangeText={setEmergencyName}
            editable={isEditing}
            placeholder="Emergency Contact Name"
          />
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color="#d32f2f" />
          {isEditing ? (
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              editable={isEditing}
              placeholder="Emergency Contact Phone"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={[styles.input, styles.disabledInput]}>
              {emergencyPhone || 'Not set'}
            </Text>
          )}
        </View>

        {/* App Credit */}
        <View style={styles.creditContainer}>
          <Text style={styles.creditText}>
            App created by Edwin C F of Chenations LLC
          </Text>
        </View>
      </View>

      {/* Edit/Save Profile Link */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        disabled={loading}
      >
        <Text style={styles.linkButtonText}>
          {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
        </Text>
      </TouchableOpacity>

      {/* Change Password Link */}
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setShowPassword(true)}
      >
        <Text style={styles.linkButtonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Password Update Section (as modal or inline) */}
      {showPassword && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={styles.smallButton} onPress={handlePasswordUpdate} disabled={passwordLoading}>
              <Text style={styles.smallButtonText}>{passwordLoading ? 'Updating...' : 'Update'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallButton} onPress={() => setShowPassword(false)}>
              <Text style={styles.smallButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* MFA Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Multi-Factor Authentication (MFA)</Text>
        {mfaEnabled ? (
          <TouchableOpacity style={styles.mfaButton} onPress={handleDisableMfa} disabled={mfaLoading}>
            <Text style={styles.mfaButtonText}>{mfaLoading ? 'Disabling...' : 'Disable MFA'}</Text>
          </TouchableOpacity>
        ) : showOtpInput ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.mfaButton} onPress={handleVerifyOtp} disabled={mfaLoading}>
              <Text style={styles.mfaButtonText}>{mfaLoading ? 'Verifying...' : 'Verify OTP'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.mfaButton} onPress={handleEnableMfa} disabled={mfaLoading}>
            <Text style={styles.mfaButtonText}>{mfaLoading ? 'Enabling...' : 'Enable MFA'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.editButton, { backgroundColor: '#e53935', marginTop: 24 }]}
        onPress={signOut}
      >
        <Text style={styles.editButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#1976d2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  profileInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  disabledInput: {
    color: '#666',
  },
  editButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  editButtonDisabled: {
    backgroundColor: '#ccc',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 16,
  },
  mfaButton: {
    backgroundColor: '#1976d2',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  mfaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkButton: {
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  linkButtonText: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  smallButton: {
    backgroundColor: '#1976d2',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginLeft: 8,
    marginTop: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  linkText: {
    color: '#1976d2',
    textDecorationLine: 'underline',
  },
  creditContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  creditText: {
    color: '#666',
    fontSize: 14,
  },
}); 