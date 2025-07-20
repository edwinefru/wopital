import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockUser = {
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
};

const mockPrescriptions = [
  { id: '1', name: 'Amoxicillin', dosage: '500mg', frequency: 'Twice daily', refills: 2 },
  { id: '2', name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', refills: 0 },
];

export default function PrescriptionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
        <Text style={styles.title}>My Prescriptions</Text>
      </View>
      <FlatList
        data={mockPrescriptions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.prescriptionCard}>
            <Ionicons name="medical-outline" size={24} color="#1976d2" style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.prescriptionText}>{item.name} - {item.dosage}</Text>
              <Text style={styles.prescriptionSubText}>{item.frequency}</Text>
              <Text style={styles.prescriptionSubText}>Refills: {item.refills}</Text>
            </View>
          </View>
        )}
        style={{ width: '100%' }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  prescriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  prescriptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  prescriptionSubText: {
    fontSize: 14,
    color: '#666',
  },
}); 