import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import AppointmentsScreen from './screens/AppointmentsScreen';
import PrescriptionsScreen from './screens/PrescriptionsScreen';
import ImmunizationScreen from './screens/ImmunizationScreen';
import PaymentsScreen from './screens/PaymentsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import BookAppointmentScreen from './screens/BookAppointmentScreen';
import AppointmentsDetailScreen from './screens/AppointmentsDetailScreen';
import PatientVitalsScreen from './screens/PatientVitalsScreen';
import PrescriptionsDetailScreen from './screens/PrescriptionsDetailScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function MainTabs() {
  const { adminUser } = useAuth();
  const isAdmin = adminUser?.role === 'hospital_admin' || adminUser?.role === 'platform_admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Appointments') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Prescriptions') {
            iconName = focused ? 'medical' : 'medical-outline';
          } else if (route.name === 'Immunization') {
            iconName = focused ? 'shield-checkmark' : 'shield-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Emergency') {
            iconName = focused ? 'warning' : 'warning-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Subscription') {
            iconName = focused ? 'gift' : 'gift-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={isAdmin ? AdminDashboardScreen : DashboardScreen}
        options={{ title: isAdmin ? 'Admin Dashboard' : 'Wopital' }}
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen}
        options={{ title: 'Appointments' }}
      />
      <Tab.Screen 
        name="Prescriptions" 
        component={PrescriptionsScreen}
        options={{ title: 'Prescriptions' }}
      />
      <Tab.Screen 
        name="Immunization" 
        component={ImmunizationScreen}
        options={{ title: 'Immunization' }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <Tab.Screen 
        name="Emergency" 
        component={EmergencyScreen}
        options={{ title: 'Emergency' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Tab.Screen 
        name="Subscription" 
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Loading Wopital...</Text>
    </View>
  );
}

function NavigationContent() {
  const { user, loading, error } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    Alert.alert('Error', error);
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <RootStack.Screen name="Main" component={MainTabs} />
          <RootStack.Screen 
            name="BookAppointment" 
            component={BookAppointmentScreen}
            options={{ 
              headerShown: true, 
              title: 'Book Appointment',
              presentation: 'modal'
            }}
          />
          <RootStack.Screen 
            name="AppointmentsDetail" 
            component={AppointmentsDetailScreen}
            options={{ 
              headerShown: true, 
              title: 'Appointment Details'
            }}
          />
          <RootStack.Screen 
            name="PatientVitals" 
            component={PatientVitalsScreen}
            options={{ 
              headerShown: true, 
              title: 'Patient Vitals & Diagnosis'
            }}
          />
          <RootStack.Screen 
            name="PrescriptionsDetail" 
            component={PrescriptionsDetailScreen}
            options={{ 
              headerShown: true, 
              title: 'Prescriptions'
            }}
          />
        </>
      ) : (
        <>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <NavigationContent />
      </NavigationContainer>
    </AuthProvider>
  );
}
