import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import PatientStripeService from '../services/stripe';

export default function PaymentScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Get patient ID from user
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        Alert.alert('Error', 'Patient profile not found');
        return;
      }

      const [invoicesData, paymentsData, subscriptionData, plansData] = await Promise.all([
        supabase.from('invoices').select('*').eq('patient_id', patient.id).order('created_at', { ascending: false }),
        supabase.from('payments').select('*').eq('patient_id', patient.id).order('created_at', { ascending: false }),
        supabase.from('patient_subscriptions').select('*').eq('patient_id', patient.id).eq('status', 'active').single(),
        supabase.from('subscription_plans').select('*').eq('type', 'patient').order('price')
      ]);

      setInvoices(invoicesData.data || []);
      setPayments(paymentsData.data || []);
      setSubscription(subscriptionData.data);
      setPlans(plansData.data || []);
    } catch (error) {
      console.error('Error loading payment data:', error);
      Alert.alert('Error', 'Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoice) => {
    try {
      setProcessingPayment(true);
      
      // Get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        Alert.alert('Error', 'Patient profile not found');
        return;
      }

      // Initialize payment sheet
      const paymentResult = await PatientStripeService.initializePaymentSheet(
        invoice.amount,
        patient.id,
        `Invoice #${invoice.id}`
      );

      if (!paymentResult.success) {
        Alert.alert('Error', paymentResult.error);
        return;
      }

      // Present payment sheet
      const presentResult = await PatientStripeService.presentPaymentSheet();

      if (!presentResult.success) {
        Alert.alert('Payment Failed', presentResult.error);
        return;
      }

      // Update invoice status
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoice.id);

      if (error) throw error;

      Alert.alert('Success', 'Payment completed successfully!');
      loadPaymentData();
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSetupSubscription = async (plan) => {
    try {
      setProcessingPayment(true);
      
      // Get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        Alert.alert('Error', 'Patient profile not found');
        return;
      }

      const result = await PatientStripeService.setupSubscription(patient.id, plan.id);

      if (result.success) {
        Alert.alert('Success', 'Subscription setup successfully!');
        loadPaymentData();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('Error setting up subscription:', error);
      Alert.alert('Error', 'Failed to setup subscription');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingPayment(true);
              
              const { data: patient } = await supabase
                .from('patients')
                .select('id')
                .eq('user_id', user.id)
                .single();

              if (!patient) {
                Alert.alert('Error', 'Patient profile not found');
                return;
              }

              const result = await PatientStripeService.cancelSubscription(patient.id);

              if (result.success) {
                Alert.alert('Success', 'Subscription cancelled successfully!');
                loadPaymentData();
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              console.error('Error cancelling subscription:', error);
              Alert.alert('Error', 'Failed to cancel subscription');
            } finally {
              setProcessingPayment(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'overdue': return '#EF4444';
      case 'sent': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading payment information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payments & Billing</Text>
          <Text style={styles.subtitle}>Manage your invoices and subscriptions</Text>
        </View>

        {/* Current Subscription */}
        {subscription && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={20} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Current Subscription</Text>
            </View>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionInfo}>
                <Text style={styles.subscriptionName}>Premium Plan</Text>
                <Text style={styles.subscriptionAmount}>
                  {formatCurrency(subscription.amount)}/{subscription.interval}
                </Text>
                <Text style={styles.subscriptionStatus}>Active</Text>
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Available Plans */}
        {!subscription && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Available Plans</Text>
            </View>
            {plans.map((plan) => (
              <View key={plan.id} style={styles.planCard}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  <Text style={styles.planPrice}>{formatCurrency(plan.price)}/month</Text>
                </View>
                <TouchableOpacity
                  style={styles.subscribeButton}
                  onPress={() => handleSetupSubscription(plan)}
                  disabled={processingPayment}
                >
                  {processingPayment ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.subscribeButtonText}>Subscribe</Text>
                  )}
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Invoices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Invoices</Text>
          </View>
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceInfo}>
                  <Text style={styles.invoiceNumber}>Invoice #{invoice.id}</Text>
                  <Text style={styles.invoiceAmount}>{formatCurrency(invoice.amount)}</Text>
                  <Text style={styles.invoiceDate}>Due: {formatDate(invoice.due_date)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
                      {invoice.status}
                    </Text>
                  </View>
                </View>
                {invoice.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => handlePayInvoice(invoice)}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.payButtonText}>Pay Now</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <FileText size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>No invoices found</Text>
            </View>
          )}
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Payment History</Text>
          </View>
          {payments.length > 0 ? (
            payments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                  <Text style={styles.paymentMethod}>{payment.payment_method}</Text>
                  <Text style={styles.paymentDate}>{formatDate(payment.created_at)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#10B98120' }]}>
                  <Text style={[styles.statusText, { color: '#10B981' }]}>
                    {payment.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>No payment history</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    margin: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subscriptionAmount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  subscriptionStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  planDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  subscribeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  invoiceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  invoiceDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  payButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  paymentDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
}); 