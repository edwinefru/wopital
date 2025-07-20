import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const mockPrescriptions = {
  active: [
    {
      id: 1,
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      prescribedDate: '2024-01-05',
      endDate: '2024-04-05',
      doctor: 'Dr. Sarah Johnson',
      purpose: 'Blood pressure control',
      instructions: 'Take in the morning with food',
      refills: 2,
      pharmacy: 'CVS Pharmacy',
      status: 'Active'
    },
    {
      id: 2,
      medication: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      prescribedDate: '2023-12-15',
      endDate: '2024-03-15',
      doctor: 'Dr. Michael Chen',
      purpose: 'Diabetes management',
      instructions: 'Take with meals',
      refills: 1,
      pharmacy: 'Walgreens',
      status: 'Active'
    }
  ],
  completed: [
    {
      id: 3,
      medication: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Three times daily',
      prescribedDate: '2023-11-20',
      endDate: '2023-12-05',
      doctor: 'Dr. Emily Davis',
      purpose: 'Bacterial infection',
      instructions: 'Take with food',
      refills: 0,
      pharmacy: 'CVS Pharmacy',
      status: 'Completed'
    }
  ]
};

export default function PrescriptionsDetailScreen({ navigation }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#4caf50';
      case 'Completed': return '#666';
      case 'Discontinued': return '#f44336';
      default: return '#1976d2';
    }
  };

  const getRefillColor = (refills) => {
    if (refills === 0) return '#f44336';
    if (refills <= 1) return '#ff9800';
    return '#4caf50';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1976d2" />
          <Text style={styles.backButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Prescriptions</Text>
      </View>

      {/* Active Prescriptions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Prescriptions</Text>
        <Text style={styles.sectionSubtitle}>{mockPrescriptions.active.length} medications active</Text>
        
        {mockPrescriptions.active.map((prescription) => (
          <View key={prescription.id} style={styles.prescriptionCard}>
            <View style={styles.prescriptionHeader}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{prescription.medication}</Text>
                <Text style={styles.dosage}>{prescription.dosage} - {prescription.frequency}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prescription.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(prescription.status) }]}>
                  {prescription.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="medical" size={16} color="#666" />
              <Text style={styles.detailText}>{prescription.purpose}</Text>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.detailText}>Dr. {prescription.doctor}</Text>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>Prescribed: {prescription.prescribedDate}</Text>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.detailText}>Until: {prescription.endDate}</Text>
            </View>
            
            <View style={styles.detailsRow}>
              <MaterialCommunityIcons name="pill" size={16} color="#666" />
              <Text style={styles.detailText}>{prescription.instructions}</Text>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="business" size={16} color="#666" />
              <Text style={styles.detailText}>{prescription.pharmacy}</Text>
            </View>
            
            <View style={styles.refillSection}>
              <Text style={styles.refillLabel}>Refills remaining:</Text>
              <Text style={[styles.refillCount, { color: getRefillColor(prescription.refills) }]}>
                {prescription.refills}
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="refresh" size={16} color="#1976d2" />
                <Text style={styles.actionButtonText}>Request Refill</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="call" size={16} color="#1976d2" />
                <Text style={styles.actionButtonText}>Call Pharmacy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="information-circle" size={16} color="#1976d2" />
                <Text style={styles.actionButtonText}>Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Completed Prescriptions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Completed Prescriptions</Text>
        <Text style={styles.sectionSubtitle}>{mockPrescriptions.completed.length} medications completed</Text>
        
        {mockPrescriptions.completed.map((prescription) => (
          <View key={prescription.id} style={styles.prescriptionCard}>
            <View style={styles.prescriptionHeader}>
              <View style={styles.medicationInfo}>
                <Text style={styles.medicationName}>{prescription.medication}</Text>
                <Text style={styles.dosage}>{prescription.dosage} - {prescription.frequency}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prescription.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(prescription.status) }]}>
                  {prescription.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="medical" size={16} color="#666" />
              <Text style={styles.detailText}>{prescription.purpose}</Text>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.detailText}>Dr. {prescription.doctor}</Text>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>Prescribed: {prescription.prescribedDate}</Text>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.detailText}>Completed: {prescription.endDate}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1976d2',
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  prescriptionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  refillSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  refillLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  refillCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#1976d2',
    marginLeft: 4,
  },
}); 