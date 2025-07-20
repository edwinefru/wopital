import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { mtnMobileMoneyService } from '../services/mtnMobileMoney';

export default function SubscriptionPage() {
  const { hospital } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch current subscription
      const { data: subs } = await supabase
        .from('hospital_subscriptions')
        .select('*, subscription_plans(name, price, billing_cycle)')
        .eq('hospital_id', hospital?.id)
        .order('created_at', { ascending: false });
      setCurrentSubscription(subs?.[0] || null);
      setHistory(subs || []);
      // Fetch available plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
      setPlans(plansData || []);
    } catch (e) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !phoneNumber) {
      toast.error('Select a plan and enter phone number');
      return;
    }
    try {
      setLoading(true);
      // Start payment process
      const result = await mtnMobileMoneyService.processSubscriptionPayment({
        phoneNumber,
        amount: selectedPlan.price,
        planName: selectedPlan.name,
        entityType: 'hospital',
        entityId: hospital.id
      });
      if (result.success) {
        toast.success('Payment request sent. Please approve on your phone.');
        // Optionally poll/check payment status and update subscription
      } else {
        toast.error('Payment initiation failed.');
      }
      fetchData();
    } catch (e) {
      toast.error('Failed to subscribe & pay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Subscription</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Current Subscription</h2>
            {currentSubscription ? (
              <div className="bg-white rounded shadow p-4 mb-2">
                <div>Plan: <b>{currentSubscription.subscription_plans?.name}</b></div>
                <div>Status: <b>{currentSubscription.status}</b></div>
                <div>Amount Paid: UGX {currentSubscription.amount_paid?.toLocaleString()}</div>
                <div>Next Billing: {currentSubscription.next_billing_date ? new Date(currentSubscription.next_billing_date).toLocaleDateString() : 'N/A'}</div>
              </div>
            ) : (
              <div>No active subscription.</div>
            )}
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map(plan => (
                <div key={plan.id} className={`border rounded p-4 ${selectedPlan?.id === plan.id ? 'border-blue-500' : 'border-gray-200'}`}>
                  <div className="font-bold">{plan.name}</div>
                  <div>Price: UGX {plan.price?.toLocaleString()}</div>
                  <div>Billing: {plan.billing_cycle}</div>
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded" onClick={() => setSelectedPlan(plan)}>
                    {selectedPlan?.id === plan.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <input
                type="tel"
                placeholder="Enter phone number for payment"
                className="border rounded px-2 py-1"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSubscribe}>
                Subscribe & Pay
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Subscription History</h2>
            <div className="bg-white rounded shadow p-4">
              {history.length === 0 ? (
                <div>No subscription history.</div>
              ) : (
                <ul>
                  {history.map(sub => (
                    <li key={sub.id} className="mb-2 border-b pb-2">
                      <div>Plan: {sub.subscription_plans?.name}</div>
                      <div>Status: {sub.status}</div>
                      <div>Amount: UGX {sub.amount_paid?.toLocaleString()}</div>
                      <div>Date: {new Date(sub.created_at).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 