import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function EmergencyScreen({ navigation }) {
  const { user, patientProfile } = useAuth();
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyContacts();
  }, [patientProfile]);

  const fetchEmergencyContacts = async () => {
    if (!patientProfile) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('patient_id', patientProfile.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setEmergencyContacts(data || []);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const callEmergencyServices = (number) => {
    Alert.alert(
      'Emergency Call',
      `Call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${number}`) }
      ]
    );
  };

  const callContact = (contact) => {
    Alert.alert(
      'Call Contact',
      `Call ${contact.name} (${contact.phone})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${contact.phone}`) }
      ]
    );
  };

  const sendSMS = (contact) => {
    Alert.alert(
      'Send SMS',
      `Send SMS to ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => Linking.openURL(`sms:${contact.phone}`) }
      ]
    );
  };

  const quickActions = [
    {
      title: 'Call Ambulance',
      icon: 'medical',
      color: '#d32f2f',
      action: () => callEmergencyServices('911'),
      description: 'Emergency medical services'
    },
    {
      title: 'Call Police',
      icon: 'shield',
      color: '#1976d2',
      action: () => callEmergencyServices('911'),
      description: 'Law enforcement'
    },
    {
      title: 'Call Fire',
      icon: 'flame',
      color: '#ff9800',
      action: () => callEmergencyServices('911'),
      description: 'Fire department'
    },
    {
      title: 'Hospital',
      icon: 'medical-outline',
      color: '#4caf50',
      action: () => {
        if (patientProfile?.hospital_id) {
          // Navigate to hospital info or call
          Alert.alert('Hospital', 'Contact your assigned hospital');
        } else {
          Alert.alert('Hospital', 'No hospital assigned. Please contact emergency services.');
        }
      },
      description: 'Your assigned hospital'
    }
  ];

  const emergencyInfo = [
    {
      title: 'Blood Type',
      value: patientProfile?.blood_type || 'Not set',
      icon: 'water',
      color: '#d32f2f'
    },
    {
      title: 'Allergies',
      value: patientProfile?.allergies || 'None recorded',
      icon: 'warning',
      color: '#ff9800'
    },
    {
      title: 'Current Medications',
      value: 'View in Prescriptions',
      icon: 'medical',
      color: '#4caf50'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Emergency Header */}
      <View style={styles.emergencyHeader}>
        <View style={styles.emergencyIcon}>
          <Ionicons name="warning" size={40} color="#d32f2f" />
        </View>
        <Text style={styles.emergencyTitle}>Emergency</Text>
        <Text style={styles.emergencySubtitle}>Quick access to emergency services</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionCard, { borderLeftColor: action.color }]}
              onPress={action.action}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Emergency Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Information</Text>
        <View style={styles.infoContainer}>
          {emergencyInfo.map((info, index) => (
            <View key={index} style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name={info.icon} size={20} color={info.color} />
                <Text style={styles.infoTitle}>{info.title}</Text>
              </View>
              <Text style={styles.infoValue}>{info.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Emergency Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : emergencyContacts.length > 0 ? (
          emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {contact.name}
                  {contact.is_primary && (
                    <Text style={styles.primaryBadge}> Primary</Text>
                  )}
                </Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => callContact(contact)}
                >
                  <Ionicons name="call" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.smsButton]}
                  onPress={() => sendSMS(contact)}
                >
                  <Ionicons name="chatbubble" size={20} color="white" />
                  <Text style={styles.actionButtonText}>SMS</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noContactsContainer}>
            <Ionicons name="person-circle-outline" size={48} color="#ccc" />
            <Text style={styles.noContactsText}>No emergency contacts found</Text>
            <Text style={styles.noContactsSubtext}>
              Add emergency contacts in your profile
            </Text>
            <TouchableOpacity
              style={styles.addContactButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.addContactButtonText}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Emergency Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Instructions</Text>
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
            <Text style={styles.instructionText}>
              Stay calm and assess the situation
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
            <Text style={styles.instructionText}>
              Call emergency services if needed
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
            <Text style={styles.instructionText}>
              Contact your emergency contacts
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
            <Text style={styles.instructionText}>
              Provide your medical information
            </Text>
          </View>
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
  emergencyHeader: {
    backgroundColor: '#d32f2f',
    padding: 20,
    alignItems: 'center',
  },
  emergencyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emergencyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  emergencySubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    marginBottom: 15,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  primaryBadge: {
    fontSize: 12,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#999',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  callButton: {
    backgroundColor: '#4caf50',
  },
  smsButton: {
    backgroundColor: '#2196f3',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noContactsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noContactsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  noContactsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  addContactButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addContactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
}); 