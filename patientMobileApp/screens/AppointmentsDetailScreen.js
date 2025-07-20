import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function AppointmentsDetailScreen({ navigation, route }) {
  const { appointment } = route.params;
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    console.log('=== APPOINTMENT DETAIL SCREEN LOADED ===');
    console.log('Route params:', route.params);
    console.log('Appointment data received:', appointment);
  }, [appointment]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'rescheduled': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'scheduled': return '#1976d2';
      default: return '#1976d2';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const handleCall = async (appointment) => {
    try {
      const phoneNumber = appointment.doctors?.phone || '+1234567890';
      const url = `tel:${phoneNumber}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone dialer not available');
      }
    } catch (error) {
      console.error('Call error:', error);
      Alert.alert('Error', 'Could not initiate call');
    }
  };

  const handleReschedule = (appointment) => {
    setShowRescheduleModal(true);
  };

  const confirmReschedule = async () => {
    if (!newDate || !newTime) {
      Alert.alert('Error', 'Please select both date and time');
      return;
    }

    setUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setNewDate('');
      setNewTime('');
    } catch (error) {
      console.error('Reschedule error:', error);
      Alert.alert('Error', 'Could not reschedule appointment');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async (appointment) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setUpdating(true);
            try {
              console.log('Cancelling appointment ID:', appointment.id);
              
              const { data, error } = await supabase
                .from('appointments')
                .update({ 
                  status: 'cancelled',
                  updated_at: new Date().toISOString()
                })
                .eq('id', appointment.id)
                .select()
                .single();

              if (error) {
                console.error('Error cancelling appointment:', error);
                Alert.alert('Error', 'Could not cancel appointment');
                return;
              }

              console.log('Appointment cancelled successfully:', data);
              Alert.alert('Success', 'Appointment cancelled successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack()
                }
              ]);
            } catch (error) {
              console.error('Cancel error:', error);
              Alert.alert('Error', 'Could not cancel appointment');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleConfirm = async (appointment) => {
    setUpdating(true);
    try {
      console.log('Confirming appointment ID:', appointment.id);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id)
        .select()
        .single();

      if (error) {
        console.error('Error confirming appointment:', error);
        Alert.alert('Error', 'Could not confirm appointment');
        return;
      }

      console.log('Appointment confirmed successfully:', data);
      Alert.alert('Success', 'Appointment confirmed successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      console.error('Confirm error:', error);
      Alert.alert('Error', 'Could not confirm appointment');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Text style={styles.title}>Appointment Details</Text>
      </View>

      {/* Debug info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>Has appointment: {!!appointment}</Text>
        {appointment && (
          <Text style={styles.debugText}>Appointment ID: {appointment.id}</Text>
        )}
        {appointment && (
          <Text style={styles.debugText}>Doctor: {appointment.doctors?.first_name} {appointment.doctors?.last_name}</Text>
        )}
      </View>

      {appointment ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Text style={styles.appointmentDate}>
                {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                <Text style={styles.statusText}>{formatStatus(appointment.status)}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="medical" size={16} color="#1976d2" />
              <Text style={styles.doctorName}>
                {appointment.doctors ? 
                  `${appointment.doctors.first_name} ${appointment.doctors.last_name}` : 
                  'Doctor TBD'
                }
              </Text>
            </View>
            
            {appointment.doctors?.specialty && (
              <View style={styles.detailRow}>
                <Ionicons name="briefcase" size={16} color="#666" />
                <Text style={styles.specialty}>{appointment.doctors.specialty}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.appointmentType}>{appointment.type}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="alert-circle" size={16} color="#666" />
              <Text style={styles.urgency}>Urgency: {appointment.urgency}</Text>
            </View>
            
            {appointment.reason && (
              <View style={styles.detailRow}>
                <Ionicons name="chatbubble" size={16} color="#666" />
                <Text style={styles.reason}>{appointment.reason}</Text>
              </View>
            )}
            
            {appointment.notes && (
              <View style={styles.detailRow}>
                <Ionicons name="document-text" size={16} color="#666" />
                <Text style={styles.notes}>{appointment.notes}</Text>
              </View>
            )}
            
            <View style={styles.actionButtons}>
              {appointment.doctors?.phone && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleCall(appointment)}
                  disabled={updating}
                >
                  <Ionicons name="call" size={16} color="#1976d2" />
                  <Text style={styles.actionButtonText}>Call Doctor</Text>
                </TouchableOpacity>
              )}
              
              {appointment.status === 'scheduled' && (
                <>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleReschedule(appointment)}
                    disabled={updating}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#1976d2" />
                    <Text style={styles.actionButtonText}>Reschedule</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleConfirm(appointment)}
                    disabled={updating}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                    <Text style={styles.actionButtonText}>Confirm</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancel(appointment)}
                    disabled={updating}
                  >
                    <Ionicons name="close" size={16} color="#f44336" />
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No appointment data received</Text>
        </View>
      )}

      {/* Reschedule Modal */}
      <Modal visible={showRescheduleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule Appointment</Text>
            <Text style={styles.modalSubtitle}>
              {appointment?.doctors?.first_name} {appointment?.doctors?.last_name} - {appointment?.type}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={newDate}
                onChangeText={setNewDate}
                placeholder="2024-01-25"
                keyboardType="default"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Time (HH:MM AM/PM)</Text>
              <TextInput
                style={styles.input}
                value={newTime}
                onChangeText={setNewTime}
                placeholder="2:30 PM"
                keyboardType="default"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowRescheduleModal(false)}
                disabled={updating}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={confirmReschedule}
                disabled={updating}
              >
                <Text style={styles.confirmModalButtonText}>
                  {updating ? 'Rescheduling...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentType: {
    fontSize: 12,
    color: '#1976d2',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    minWidth: 80,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#1976d2',
    marginLeft: 4,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ffebee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f44336',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  confirmModalButton: {
    backgroundColor: '#4caf50',
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  urgency: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  reason: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  debugContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
}); 