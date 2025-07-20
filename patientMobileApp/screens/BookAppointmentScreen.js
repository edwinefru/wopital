import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CustomDatePicker from '../components/DatePicker';
import { testSupabaseConnection, addSampleDoctors } from '../test-connection';

const urgencyLevels = [
  { value: 'routine', label: 'Routine', color: '#4caf50' },
  { value: 'urgent', label: 'Urgent', color: '#ff9800' },
  { value: 'critical', label: 'Critical', color: '#f44336' },
  { value: 'emergency', label: 'Emergency', color: '#d32f2f' },
];

const appointmentTypes = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'routine', label: 'Routine Check-up' },
];

export default function BookAppointmentScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patient, setPatient] = useState(null);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showUrgencyDropdown, setShowUrgencyDropdown] = useState(false);
  
  // Form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [urgency, setUrgency] = useState('routine');
  const [type, setType] = useState('consultation');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    console.log('=== BOOK APPOINTMENT SCREEN LOADED ===');
    testSupabaseConnection().then((isConnected) => {
      if (isConnected) {
        fetchDoctors();
      } else {
        console.error('❌ Supabase connection failed');
        Alert.alert('Connection Error', 'Unable to connect to the database. Please check your internet connection.');
      }
    });
    fetchPatient();
    
    // Ensure appointment type is always valid
    const validType = appointmentTypes.find(t => t.value === type);
    if (!validType) {
      const defaultType = appointmentTypes[0].value;
      setType(defaultType);
      console.log('Appointment type was invalid, reset to default:', defaultType);
    } else {
      console.log('Current appointment type:', type);
    }
    
    // Ensure urgency is always valid
    const validUrgency = urgencyLevels.find(u => u.value === urgency);
    if (!validUrgency) {
      setUrgency(urgencyLevels[0].value);
    }
  }, []);

  // Separate effect to handle type changes
  useEffect(() => {
    console.log('Appointment type changed to:', type);
  }, [type]);

  // Monitor selectedDoctor changes
  useEffect(() => {
    console.log('=== SELECTED DOCTOR STATE CHANGED ===');
    console.log('Current selectedDoctor:', selectedDoctor);
    console.log('Current doctorId:', doctorId);
  }, [selectedDoctor, doctorId]);

  // Close dropdown when tapping outside
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setShowDoctorDropdown(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
    };
  }, []);

  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      console.log('=== FETCHING DOCTORS ===');
      console.log('Supabase client:', supabase ? 'Available' : 'Not available');
      
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name, specialty')
        .order('first_name');

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('❌ Error fetching doctors:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setDoctors([]);
        return;
      }

      console.log('✅ Doctors fetched successfully:', data?.length || 0, 'doctors');
      if (data && data.length > 0) {
        console.log('Sample doctor:', data[0]);
      } else {
        console.log('⚠️ No doctors found, adding sample doctors...');
        const added = await addSampleDoctors();
        if (added) {
          // Retry fetching doctors
          const { data: newData, error: newError } = await supabase
            .from('doctors')
            .select('id, first_name, last_name, specialty')
            .order('first_name');
          
          if (!newError && newData) {
            console.log('✅ Sample doctors loaded:', newData.length, 'doctors');
            setDoctors(newData);
            // Don't auto-select the first doctor - let user choose
          }
        }
        return;
      }
      
      setDoctors(data || []);
      
      if (data && data.length > 0) {
        // Don't auto-select the first doctor - let user choose
        console.log('Doctors loaded, but no default selection');
      } else {
        console.log('⚠️ No doctors found in database');
      }
    } catch (error) {
      console.error('❌ Exception fetching doctors:', error);
      console.error('Exception details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
      console.log('=== DOCTOR FETCHING COMPLETE ===');
    }
  };

  const selectDoctor = (doctor) => {
    console.log('=== SELECTING DOCTOR ===');
    console.log('Previous selected doctor:', selectedDoctor);
    console.log('New doctor to select:', doctor);
    
    setSelectedDoctor(doctor);
    setDoctorId(doctor.id);
    
    console.log('Doctor selection updated - new selectedDoctor:', doctor);
    console.log('Doctor ID set to:', doctor.id);
  };

  const clearDoctorSelection = () => {
    console.log('=== CLEARING DOCTOR SELECTION ===');
    setSelectedDoctor(null);
    setDoctorId('');
    setDoctorSearch('');
    setShowDoctorDropdown(true); // Keep dropdown open for new search
    console.log('Doctor selection cleared');
  };

  const fetchPatient = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching patient:', error);
        return;
      }

      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  const validateForm = () => {
    if (!date) {
      Alert.alert('Error', 'Please select a date');
      return false;
    }
    if (!time) {
      Alert.alert('Error', 'Please select a time');
      return false;
    }
    if (!doctorId && doctors.length > 0) {
      Alert.alert('Error', 'Please select a doctor');
      return false;
    }
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the appointment');
      return false;
    }
    return true;
  };

  const handleBook = async () => {
    if (!validateForm()) return;
    if (!patient) {
      Alert.alert('Error', 'Patient profile not found. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      // Convert time to proper format
      const timeString = `${time}:00`;

      const appointmentData = {
        patient_id: patient.id,
        doctor_id: doctorId || null, // Allow null if no doctor selected
        appointment_date: date,
        appointment_time: timeString,
        type: type,
        urgency: urgency,
        reason: reason.trim(),
        notes: notes.trim() || null,
        status: 'scheduled',
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (error) {
        console.error('Error booking appointment:', error);
        Alert.alert('Error', 'Could not book appointment. Please try again.');
        return;
      }

      Alert.alert(
        'Success', 
        'Appointment booked successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Could not book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgencyValue) => {
    const urgencyLevel = urgencyLevels.find(u => u.value === urgencyValue);
    return urgencyLevel ? urgencyLevel.color : '#4caf50';
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowDoctorDropdown(false)}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Book Appointment</Text>
        </View>

        <View style={styles.form}>
          <CustomDatePicker
            label="Appointment Date *"
            value={date}
            onDateChange={setDate}
            placeholder="Select appointment date"
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
            mode="date"
          />

          <CustomDatePicker
            label="Appointment Time *"
            value={time}
            onDateChange={setTime}
            placeholder="Select appointment time"
            mode="time"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Doctor</Text>
            {doctorsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1976d2" />
                <Text style={styles.loadingText}>Loading doctors...</Text>
              </View>
            ) : (
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="person" size={20} color="#666" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Select a doctor..."
                    value={selectedDoctor ? `${selectedDoctor.first_name} ${selectedDoctor.last_name} - ${selectedDoctor.specialty}` : ''}
                    onFocus={() => setShowDoctorDropdown(true)}
                    editable={false}
                  />
                  <TouchableOpacity 
                    onPress={() => setShowDoctorDropdown(!showDoctorDropdown)} 
                    style={styles.clearButton}
                  >
                    <Ionicons name={showDoctorDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                
                {showDoctorDropdown && doctors.length > 0 && (
                  <View style={styles.dropdownContainer}>
                    <View style={styles.dropdownList}>
                      {doctors.map((doctor) => (
                        <TouchableOpacity
                          key={doctor.id.toString()}
                          style={styles.doctorOption}
                          onPress={() => {
                            selectDoctor(doctor);
                            setShowDoctorDropdown(false);
                            console.log('Doctor selected:', `${doctor.first_name} ${doctor.last_name}`);
                          }}
                        >
                          <View style={styles.doctorInfo}>
                            <Text style={styles.doctorName}>
                              {doctor.first_name} {doctor.last_name}
                            </Text>
                            <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                          </View>
                          {selectedDoctor && selectedDoctor.id === doctor.id && (
                            <Ionicons name="checkmark" size={16} color="#4caf50" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
                
                {!doctorsLoading && doctors.length === 0 && (
                  <View style={styles.noDoctorsContainer}>
                    <Text style={styles.noDoctorsText}>
                      No doctors available. Please contact the hospital to book an appointment.
                    </Text>
                    <TouchableOpacity 
                      style={styles.addSampleButton}
                      onPress={async () => {
                        console.log('Adding sample doctors...');
                        const added = await addSampleDoctors();
                        if (added) {
                          fetchDoctors();
                        }
                      }}
                    >
                      <Text style={styles.addSampleButtonText}>Add Sample Doctors</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Appointment Type</Text>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="medical" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Select appointment type..."
                  value={appointmentTypes.find(t => t.value === type)?.label || ''}
                  onFocus={() => setShowTypeDropdown(true)}
                  editable={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowTypeDropdown(!showTypeDropdown)} 
                  style={styles.clearButton}
                >
                  <Ionicons name={showTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              {showTypeDropdown && (
                <View style={styles.dropdownContainer}>
                  <View style={styles.dropdownList}>
                    {appointmentTypes.map((typeOption) => (
                      <TouchableOpacity
                        key={typeOption.value}
                        style={styles.doctorOption}
                        onPress={() => {
                          setType(typeOption.value);
                          setShowTypeDropdown(false);
                          console.log('Appointment type selected:', typeOption.label);
                        }}
                      >
                        <View style={styles.doctorInfo}>
                          <Text style={styles.doctorName}>
                            {typeOption.label}
                          </Text>
                        </View>
                        {type === typeOption.value && (
                          <Ionicons name="checkmark" size={16} color="#4caf50" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
            {/* Debug info */}
            <Text style={styles.debugText}>
              Available types: {appointmentTypes.map(t => t.label).join(', ')}
            </Text>
            <Text style={styles.debugText}>
              Selected type: {type}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Urgency Level</Text>
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="alert-circle" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Select urgency level..."
                  value={urgencyLevels.find(u => u.value === urgency)?.label || ''}
                  onFocus={() => setShowUrgencyDropdown(true)}
                  editable={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowUrgencyDropdown(!showUrgencyDropdown)} 
                  style={styles.clearButton}
                >
                  <Ionicons name={showUrgencyDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              {showUrgencyDropdown && (
                <View style={styles.dropdownContainer}>
                  <View style={styles.dropdownList}>
                    {urgencyLevels.map((level) => (
                      <TouchableOpacity
                        key={level.value}
                        style={styles.doctorOption}
                        onPress={() => {
                          setUrgency(level.value);
                          setShowUrgencyDropdown(false);
                          console.log('Urgency level selected:', level.label);
                        }}
                      >
                        <View style={styles.doctorInfo}>
                          <Text style={styles.doctorName}>
                            {level.label}
                          </Text>
                        </View>
                        <View style={styles.urgencyOptionContainer}>
                          <View style={[styles.urgencyDot, { backgroundColor: level.color }]} />
                          {urgency === level.value && (
                            <Ionicons name="checkmark" size={16} color="#4caf50" />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
            <View style={[styles.urgencyIndicator, { backgroundColor: getUrgencyColor(urgency) }]}>
              <Text style={styles.urgencyText}>
                {urgencyLevels.find(u => u.value === urgency)?.label}
              </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reason for Appointment *</Text>
            <TextInput
              style={[styles.inputField, styles.textArea]}
              placeholder="Please describe your symptoms or reason for the appointment"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.inputField, styles.textArea]}
              placeholder="Any additional information you'd like to share"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity 
            style={[styles.bookButton, loading && styles.bookButtonDisabled]} 
            onPress={handleBook}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.bookButtonText}>Book Appointment</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  noDoctorsContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  noDoctorsText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  urgencyIndicator: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  urgencyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    position: 'relative',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  searchIcon: {
    marginLeft: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
    marginRight: 10,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownList: {
    maxHeight: 200,
  },
  doctorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  selectedDoctorContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  selectedDoctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDoctorText: {
    fontSize: 14,
    color: '#2e7d32',
    marginLeft: 8,
    fontWeight: '500',
  },
  addSampleButton: {
    marginTop: 10,
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addSampleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  urgencyOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}); 