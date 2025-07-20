import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AdminDashboardScreen() {
  const { user, adminUser } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingAppointments: 0,
    todayAppointments: 0,
    activeDoctors: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data based on user role
      if (adminUser?.role === 'platform_admin') {
        await loadPlatformAdminData();
      } else {
        await loadHospitalAdminData();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadPlatformAdminData = async () => {
    // Platform admin sees system-wide stats
    const [hospitalsData, appointmentsData, doctorsData] = await Promise.all([
      supabase.from('hospitals').select('*'),
      supabase.from('appointments').select('*'),
      supabase.from('doctors').select('*'),
    ]);

    const hospitals = hospitalsData.data || [];
    const appointments = appointmentsData.data || [];
    const doctors = doctorsData.data || [];

    setStats({
      totalPatients: appointments.length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length,
      todayAppointments: appointments.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.appointment_date).toDateString() === today;
      }).length,
      activeDoctors: doctors.filter(d => d.status === 'active').length,
      revenue: hospitals.length * 1000, // Simplified calculation
    });

    // Recent activity
    const recent = appointments
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    setRecentActivity(recent);
  };

  const loadHospitalAdminData = async () => {
    // Hospital admin sees hospital-specific stats
    const [appointmentsData, doctorsData, patientsData] = await Promise.all([
      supabase.from('appointments').select('*').eq('hospital_id', adminUser?.hospital_id),
      supabase.from('doctors').select('*').eq('hospital_id', adminUser?.hospital_id),
      supabase.from('patients').select('*').eq('hospital_id', adminUser?.hospital_id),
    ]);

    const appointments = appointmentsData.data || [];
    const doctors = doctorsData.data || [];
    const patients = patientsData.data || [];

    setStats({
      totalPatients: patients.length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length,
      todayAppointments: appointments.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.appointment_date).toDateString() === today;
      }).length,
      activeDoctors: doctors.filter(d => d.status === 'active').length,
      revenue: appointments.filter(a => a.status === 'completed').length * 50, // Simplified
    });

    // Recent activity
    const recent = appointments
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    setRecentActivity(recent);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statContent}>
        <View>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const ActivityCard = ({ activity }) => (
    <View style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityTitle}>
          {activity.patient_name || 'Patient'} - {activity.appointment_type}
        </Text>
        <Text style={styles.activityTime}>
          {new Date(activity.created_at).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.activityStatus}>
        Status: {activity.status}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
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
        <Text style={styles.headerTitle}>
          {adminUser?.role === 'platform_admin' ? 'Platform Admin' : 'Hospital Admin'} Dashboard
        </Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {adminUser?.first_name || 'Admin'}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon="people"
          color="#007AFF"
        />
        <StatCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          icon="time"
          color="#FF9500"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon="calendar"
          color="#34C759"
        />
        <StatCard
          title="Active Doctors"
          value={stats.activeDoctors}
          icon="medical"
          color="#AF52DE"
        />
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <View style={styles.revenueContent}>
          <Text style={styles.revenueTitle}>Total Revenue</Text>
          <Text style={styles.revenueValue}>${stats.revenue.toLocaleString()}</Text>
        </View>
        <Ionicons name="trending-up" size={32} color="#34C759" />
      </View>

      {/* Recent Activity */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {recentActivity.map((activity, index) => (
          <ActivityCard key={index} activity={activity} />
        ))}
        {recentActivity.length === 0 && (
          <Text style={styles.noActivity}>No recent activity</Text>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Add Doctor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar" size={24} color="#34C759" />
            <Text style={styles.actionText}>View Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings" size={24} color="#FF9500" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 10,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '47%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenueCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  revenueContent: {
    flex: 1,
  },
  revenueTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34C759',
  },
  activitySection: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  activityCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  activityStatus: {
    fontSize: 12,
    color: '#007AFF',
  },
  noActivity: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  quickActions: {
    margin: 15,
    marginBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
}); 