import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen({ navigation }) {
  const { user, loading } = useAuth();
  const [patientProfile, setPatientProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    appointments: 0,
    nextAppointment: null,
    lastAppointment: null,
    prescriptions: 0,
    immunizations: 0,
    vitals: 'Normal'
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get patient name from profile or user data
  let patientName = 'Patient';
  if (patientProfile) {
    patientName = `${patientProfile.first_name} ${patientProfile.last_name}`;
  } else if (user?.user_metadata?.first_name) {
    // Fallback to user metadata if profile not loaded yet
    patientName = `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`;
  }
  
  const profileImage = patientProfile?.avatar_url || null;

  useEffect(() => {
    if (user && !loading) {
      fetchPatientProfile();
    }
  }, [user, loading]);

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchPatientProfile();
      }
    }, [user])
  );

  const fetchPatientProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching patient profile for user:', user.id);
      
      const { data: profile, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching patient profile:', error);
        return;
      }
      
      if (profile) {
        console.log('Patient profile found:', profile);
        setPatientProfile(profile);
        fetchDashboardData(profile);
      } else {
        console.log('No patient profile found for user');
      }
    } catch (error) {
      console.error('Error in fetchPatientProfile:', error);
    }
  };

  const fetchDashboardData = async (profile) => {
    if (!profile) return;
    
    setDataLoading(true);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Dashboard data fetch timeout - using default values');
      setDashboardData({
        appointments: 0,
        nextAppointment: 'No upcoming appointments',
        lastAppointment: 'None',
        prescriptions: 0,
        immunizations: 0,
        vitals: 'Normal'
      });
      setDataLoading(false);
    }, 10000); // 10 second timeout
    
    try {
      console.log('Fetching dashboard data for patient:', profile.id);
      
      // Initialize with default values
      let dashboardData = {
        appointments: 0,
        nextAppointment: 'No upcoming appointments',
        lastAppointment: 'None',
        prescriptions: 0,
        immunizations: 0,
        vitals: 'Normal'
      };

      // Try to fetch appointments (handle gracefully if table doesn't exist)
      try {
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            *,
            doctors (
              first_name,
              last_name,
              specialization
            )
          `)
          .eq('patient_id', profile.id)
          .order('appointment_date', { ascending: true });
        
        if (!appointmentsError && appointments) {
          console.log('Appointments found:', appointments.length);
          
          // Count total appointments
          dashboardData.appointments = appointments.length;
          
          // Find next appointment
          const now = new Date();
          const upcomingAppointments = appointments.filter(apt => 
            new Date(apt.appointment_date) > now && apt.status === 'scheduled'
          );
          
          if (upcomingAppointments.length > 0) {
            const nextApt = upcomingAppointments[0];
            const doctorName = nextApt.doctors ? 
              `${nextApt.doctors.first_name} ${nextApt.doctors.last_name}` : 
              'Doctor';
            dashboardData.nextAppointment = `${formatDate(nextApt.appointment_date)} with ${doctorName}`;
          }
          
          // Find last appointment
          const pastAppointments = appointments.filter(apt => 
            new Date(apt.appointment_date) <= now && apt.status === 'completed'
          );
          
          if (pastAppointments.length > 0) {
            const lastApt = pastAppointments[pastAppointments.length - 1];
            dashboardData.lastAppointment = formatDate(lastApt.appointment_date);
          }
        }
      } catch (error) {
        console.log('Appointments table not available or error:', error.message);
      }

      // Try to fetch prescriptions
      try {
        const { data: prescriptions, error: prescriptionsError } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_id', profile.id)
          .eq('status', 'active');
        
        if (!prescriptionsError && prescriptions) {
          console.log('Active prescriptions found:', prescriptions.length);
          dashboardData.prescriptions = prescriptions.length;
        }
      } catch (error) {
        console.log('Prescriptions table not available or error:', error.message);
      }

      // Try to fetch vitals
      try {
        const { data: vitals, error: vitalsError } = await supabase
          .from('patient_vitals')
          .select('*')
          .eq('patient_id', profile.id)
          .order('recorded_date', { ascending: false })
          .limit(1);
        
        if (!vitalsError && vitals && vitals.length > 0) {
          const latestVitals = vitals[0];
          const bp = latestVitals.blood_pressure_systolic;
          if (bp < 120) {
            dashboardData.vitals = 'Excellent';
          } else if (bp < 140) {
            dashboardData.vitals = 'Good';
          } else {
            dashboardData.vitals = 'Needs Attention';
          }
        }
      } catch (error) {
        console.log('Vitals table not available or error:', error.message);
      }

      clearTimeout(timeoutId);
      setDashboardData(dashboardData);
      setDataLoading(false);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      clearTimeout(timeoutId);
      setDataLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatNextAppointment = (appointment) => {
    if (!appointment || appointment === 'No upcoming appointments') {
      return 'No upcoming appointments';
    }
    return appointment;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await fetchPatientProfile();
    }
    setRefreshing(false);
  };

  if (loading || dataLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#007AFF" />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="calendar" size={24} color="#007AFF" />
          </View>
          <Text style={styles.statNumber}>{dashboardData.appointments}</Text>
          <Text style={styles.statLabel}>Appointments</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <MaterialCommunityIcons name="pill" size={24} color="#28a745" />
          </View>
          <Text style={styles.statNumber}>{dashboardData.prescriptions}</Text>
          <Text style={styles.statLabel}>Active Rx</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <FontAwesome5 name="heartbeat" size={24} color="#dc3545" />
          </View>
          <Text style={styles.statVitals}>{dashboardData.vitals}</Text>
          <Text style={styles.statLabel}>Vitals</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('BookAppointment')}
          >
            <Ionicons name="add-circle" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Book Appointment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('PatientVitals')}
          >
            <Ionicons name="fitness" size={24} color="#28a745" />
            <Text style={styles.actionButtonText}>View Vitals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Prescriptions')}
          >
            <MaterialCommunityIcons name="pill" size={24} color="#ffc107" />
            <Text style={styles.actionButtonText}>Medications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Emergency')}
          >
            <Ionicons name="warning" size={24} color="#dc3545" />
            <Text style={styles.actionButtonText}>Emergency</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Appointment */}
      <View style={styles.appointmentContainer}>
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        <View style={styles.appointmentCard}>
          <Ionicons name="calendar" size={24} color="#007AFF" />
          <Text style={styles.appointmentText}>
            {formatNextAppointment(dashboardData.nextAppointment)}
          </Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>
            Last appointment: {dashboardData.lastAppointment}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statVitals: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1976d2',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#e0f2f7',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  actionButtonText: {
    fontSize: 14,
    color: '#1976d2',
    marginTop: 8,
  },
  appointmentContainer: {
    marginBottom: 20,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  appointmentText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  activityText: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 