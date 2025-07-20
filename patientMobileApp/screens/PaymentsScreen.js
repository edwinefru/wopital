import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockUser = {
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
};

const mockPayments = [
  { id: '1', amount: 150, date: '2024-06-01', status: 'Paid', description: 'Consultation fee' },
  { id: '2', amount: 75, date: '2024-05-15', status: 'Pending', description: 'Lab test fee' },
];

export default function PaymentsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
        <Text style={styles.title}>My Payments</Text>
      </View>
      <FlatList
        data={mockPayments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.paymentCard}>
            <Ionicons name="card-outline" size={24} color="#1976d2" style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.paymentText}>${item.amount} - {item.description}</Text>
              <Text style={styles.paymentSubText}>{item.date}</Text>
              <Text style={styles.paymentSubText}>Status: {item.status}</Text>
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
  paymentCard: {
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
  paymentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  paymentSubText: {
    fontSize: 14,
    color: '#666',
  },
}); 