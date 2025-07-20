import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const [current, setCurrent] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phone, setPhone] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: subs } = await supabase
        .from('patient_subscriptions')
        .select('*, subscription_plans(name, price, billing_cycle)')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false });
      setCurrent(subs?.[0] || null);
      setHistory(subs || []);
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
      setPlans(plansData || []);
    } finally { setLoading(false); }
  }

  async function handleSubscribe() {
    if (!selectedPlan || !phone) return;
    setLoading(true);
    await supabase.from('patient_subscriptions').insert({
      patient_id: user.id,
      plan_id: selectedPlan.id,
      status: 'pending',
      amount_paid: selectedPlan.price,
    });
    setSelectedPlan(null);
    setPhone('');
    fetchData();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Subscription</Text>
      {loading ? <Text>Loading...</Text> : <>
        <View style={styles.section}>
          <Text style={styles.subheader}>Current Subscription</Text>
          {current ? (
            <View style={styles.card}>
              <Text>Plan: <Text style={styles.bold}>{current.subscription_plans?.name}</Text></Text>
              <Text>Status: <Text style={styles.bold}>{current.status}</Text></Text>
              <Text>Amount Paid: UGX {current.amount_paid?.toLocaleString()}</Text>
              <Text>Next Billing: {current.next_billing_date ? new Date(current.next_billing_date).toLocaleDateString() : 'N/A'}</Text>
            </View>
          ) : <Text>No active subscription.</Text>}
        </View>
        <View style={styles.section}>
          <Text style={styles.subheader}>Available Plans</Text>
          <FlatList
            data={plans}
            keyExtractor={item => item.id+''}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.card, selectedPlan?.id === item.id && styles.selected]} onPress={() => setSelectedPlan(item)}>
                <Text style={styles.bold}>{item.name}</Text>
                <Text>Price: UGX {item.price?.toLocaleString()}</Text>
                <Text>Billing: {item.billing_cycle}</Text>
                <Text>{selectedPlan?.id === item.id ? 'Selected' : 'Tap to select'}</Text>
              </TouchableOpacity>
            )}
            horizontal
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <TextInput
              style={styles.input}
              placeholder="Phone for payment"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Button title="Subscribe" onPress={handleSubscribe} />
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheader}>Subscription History</Text>
          {history.length === 0 ? <Text>No history.</Text> : (
            <FlatList
              data={history}
              keyExtractor={item => item.id+''}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text>Plan: {item.subscription_plans?.name}</Text>
                  <Text>Status: {item.status}</Text>
                  <Text>Amount: UGX {item.amount_paid?.toLocaleString()}</Text>
                  <Text>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
              )}
            />
          )}
        </View>
      </>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subheader: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  section: { marginBottom: 24 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 8 },
  selected: { borderColor: '#007AFF', borderWidth: 2 },
  bold: { fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginRight: 8, flex: 1 },
}); 