import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const mockUser = {
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
};

const urgencyColors = {
  routine: '#4caf50',
  urgent: '#ff9800',
  critical: '#f44336',
  emergency: '#d32f2f',
};

const urgencyLabels = {
  routine: 'Routine',
  urgent: 'Urgent',
  critical: 'Critical',
  emergency: 'Emergency',
};

export default function AppointmentsScreen({ navigation }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatient();
  }, [user]);

  useEffect(() => {
    if (patient) {
      fetchAppointments();
    }
  }, [patient]);

  const fetchPatient = async () => {
    setLoading(true);
    setError(null);
    if (!user) {
      setError('User not found. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error || !data) {
        setError('No patient profile found for this user. Please contact support or sign up as a patient.');
        setPatient(null);
        setLoading(false);
        return;
      }
      setPatient(data);
    } catch (err) {
      setError('Error fetching patient profile.');
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    if (!patient) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctors (
            first_name,
            last_name,
            specialty,
            phone
          )
        `)
        .eq('patient_id', patient.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      if (error) {
        setError('Error fetching appointments.');
        setAppointments([]);
        setLoading(false);
        return;
      }
      setAppointments(data || []);
    } catch (err) {
      setError('Error fetching appointments.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'rescheduled': return '#ff9800';
      case 'confirmed': return '#2196f3';
      default: return '#1976d2';
    }
  };

  const renderAppointment = ({ item }) => {
    const doctor = item.doctors;
    const urgencyColor = urgencyColors[item.urgency] || '#4caf50';
    const urgencyLabel = urgencyLabels[item.urgency] || 'Routine';
    return (
      <TouchableOpacity 
        style={styles.appointmentCard}
        onPress={() => navigation.navigate('AppointmentsDetail', { appointment: item })}
      >
        <View style={styles.appointmentHeader}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.appointmentDate}>
              {formatDate(item.appointment_date)}
            </Text>
            <Text style={styles.appointmentTime}>
              {formatTime(item.appointment_time)}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor }]}> 
              <Text style={styles.urgencyText}>{urgencyLabel}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}> 
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>
        <View style={styles.doctorInfo}>
          <Ionicons name="medical" size={16} color="#1976d2" />
          <Text style={styles.doctorName}>
            {doctor ? `${doctor.first_name} ${doctor.last_name}` : 'Doctor TBD'}
          </Text>
        </View>
        {doctor?.specialty && (
          <View style={styles.specialtyContainer}>
            <Ionicons name="briefcase" size={14} color="#666" />
            <Text style={styles.specialty}>{doctor.specialty}</Text>
          </View>
        )}
        <View style={styles.typeContainer}>
          <Ionicons name="calendar" size={14} color="#666" />
          <Text style={styles.appointmentType}>{item.type}</Text>
        </View>
        {item.reason && (
          <View style={styles.reasonContainer}>
            <Ionicons name="chatbubble" size={14} color="#666" />
            <Text style={styles.reason} numberOfLines={2}>
              {item.reason}
            </Text>
          </View>
        )}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AppointmentsDetail', { appointment: item })}
          >
            <Ionicons name="eye" size={16} color="#1976d2" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('BookAppointment')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color="#f44336" />
        <Text style={styles.loadingText}>{error}</Text>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('BookAppointment')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
        <Text style={styles.title}>My Appointments</Text>
      </View>
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No appointments found</Text>
            <Text style={styles.emptySubtext}>
              Book your first appointment to get started
            </Text>
          </View>
        }
      />
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('BookAppointment')}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  listContainer: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  appointmentTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  urgencyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  specialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentType: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reason: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    flex: 1,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#1976d2',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
}); 