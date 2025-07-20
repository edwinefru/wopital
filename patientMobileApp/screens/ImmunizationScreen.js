import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockUser = {
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
};

const mockImmunizations = [
  { id: '1', name: 'COVID-19 Vaccine', date: '2024-01-15', status: 'Completed' },
  { id: '2', name: 'Flu Shot', date: '2023-10-20', status: 'Completed' },
];

export default function ImmunizationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
        <Text style={styles.title}>My Immunizations</Text>
      </View>
      <FlatList
        data={mockImmunizations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.immunizationCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#1976d2" style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.immunizationText}>{item.name}</Text>
              <Text style={styles.immunizationSubText}>{item.date}</Text>
              <Text style={styles.immunizationSubText}>Status: {item.status}</Text>
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
  immunizationCard: {
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
  immunizationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  immunizationSubText: {
    fontSize: 14,
    color: '#666',
  },
}); 