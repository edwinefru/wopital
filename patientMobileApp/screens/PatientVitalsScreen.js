import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockVitals = {
  bloodPressure: { systolic: 120, diastolic: 80, status: 'Normal' },
  heartRate: { value: 72, status: 'Normal' },
  temperature: { value: 98.6, status: 'Normal' },
  oxygenSaturation: { value: 98, status: 'Normal' },
  weight: { value: 65, unit: 'kg', status: 'Normal' },
  height: { value: 165, unit: 'cm' },
  bmi: { value: 23.9, status: 'Normal' },
  lastUpdated: '2024-01-15 10:30 AM'
};

const mockDiagnosis = {
  recent: [
    {
      id: 1,
      condition: 'Hypertension',
      date: '2024-01-10',
      treated: true,
      doctor: 'Dr. Smith',
      notes: 'Controlled with medication'
    },
    {
      id: 2,
      condition: 'Type 2 Diabetes',
      date: '2023-12-15',
      treated: true,
      doctor: 'Dr. Johnson',
      notes: 'Well managed with diet and medication'
    },
    {
      id: 3,
      condition: 'Seasonal Allergy',
      date: '2024-01-05',
      treated: false,
      doctor: 'Dr. Williams',
      notes: 'Mild symptoms, monitoring'
    }
  ]
};

export default function PatientVitalsScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patient Vitals</Text>
        <Text style={styles.subtitle}>Last updated: {mockVitals.lastUpdated}</Text>
      </View>

      <View style={styles.vitalsSection}>
        <Text style={styles.sectionTitle}>Current Vitals</Text>
        
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalCard}>
            <Ionicons name="heart" size={24} color="#1976d2" />
            <Text style={styles.vitalLabel}>Blood Pressure</Text>
            <Text style={styles.vitalValue}>{mockVitals.bloodPressure.systolic}/{mockVitals.bloodPressure.diastolic} mmHg</Text>
            <Text style={styles.vitalStatus}>{mockVitals.bloodPressure.status}</Text>
          </View>

          <View style={styles.vitalCard}>
            <Ionicons name="pulse" size={24} color="#1976d2" />
            <Text style={styles.vitalLabel}>Heart Rate</Text>
            <Text style={styles.vitalValue}>{mockVitals.heartRate.value} bpm</Text>
            <Text style={styles.vitalStatus}>{mockVitals.heartRate.status}</Text>
          </View>

          <View style={styles.vitalCard}>
            <Ionicons name="thermometer" size={24} color="#1976d2" />
            <Text style={styles.vitalLabel}>Temperature</Text>
            <Text style={styles.vitalValue}>{mockVitals.temperature.value}°F</Text>
            <Text style={styles.vitalStatus}>{mockVitals.temperature.status}</Text>
          </View>

          <View style={styles.vitalCard}>
            <Ionicons name="water" size={24} color="#1976d2" />
            <Text style={styles.vitalLabel}>Oxygen Saturation</Text>
            <Text style={styles.vitalValue}>{mockVitals.oxygenSaturation.value}%</Text>
            <Text style={styles.vitalStatus}>{mockVitals.oxygenSaturation.status}</Text>
          </View>

          <View style={styles.vitalCard}>
            <Ionicons name="scale" size={24} color="#1976d2" />
            <Text style={styles.vitalLabel}>Weight</Text>
            <Text style={styles.vitalValue}>{mockVitals.weight.value} {mockVitals.weight.unit}</Text>
            <Text style={styles.vitalStatus}>{mockVitals.weight.status}</Text>
          </View>

          <View style={styles.vitalCard}>
            <Ionicons name="resize" size={24} color="#1976d2" />
            <Text style={styles.vitalLabel}>Height</Text>
            <Text style={styles.vitalValue}>{mockVitals.height.value} {mockVitals.height.unit}</Text>
          </View>

          <View style={styles.vitalCard}>
            <Ionicons name="analytics" size={24} color="#1976d2" />
            <Text style={styles.vitalLabel}>BMI</Text>
            <Text style={styles.vitalValue}>{mockVitals.bmi.value}</Text>
            <Text style={styles.vitalStatus}>{mockVitals.bmi.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.diagnosisSection}>
        <Text style={styles.sectionTitle}>Recent Diagnoses</Text>
        {mockDiagnosis.recent.map((diagnosis) => (
          <View key={diagnosis.id} style={styles.diagnosisCard}>
            <View style={styles.diagnosisHeader}>
              <Text style={styles.diagnosisCondition}>{diagnosis.condition}</Text>
              <View style={[styles.statusBadge, { backgroundColor: diagnosis.treated ? '#4CAF50' : '#FF9800' }]}>
                <Text style={styles.statusText}>{diagnosis.treated ? 'Treated' : 'Active'}</Text>
              </View>
            </View>
            <Text style={styles.diagnosisDate}>{diagnosis.date}</Text>
            <Text style={styles.diagnosisDoctor}>Doctor: {diagnosis.doctor}</Text>
            <Text style={styles.diagnosisNotes}>{diagnosis.notes}</Text>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  vitalsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  vitalLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    textAlign: 'center',
  },
  vitalStatus: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
  },
  diagnosisSection: {
    padding: 20,
  },
  diagnosisCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diagnosisCondition: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  diagnosisDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  diagnosisDoctor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  diagnosisNotes: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
}); 