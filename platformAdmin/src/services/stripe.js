import { supabase } from '../lib/supabase';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.REACT_APP_STRIPE_SECRET_KEY;

class StripeService {
  constructor() {
    this.stripe = null;
    this.initializeStripe();
  }

  async initializeStripe() {
    try {
      const { default: Stripe } = await import('@stripe/stripe-js');
      this.stripe = await Stripe(STRIPE_PUBLISHABLE_KEY);
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  // Create a new subscription for a hospital
  async createSubscription(hospitalId, planId, customerEmail) {
    try {
      // Create Stripe customer
      const customerResponse = await fetch('/api/stripe/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          hospitalId: hospitalId,
        }),
      });

      const customerData = await customerResponse.json();

      if (!customerData.success) {
        throw new Error(customerData.error);
      }

      // Create subscription
      const subscriptionResponse = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerData.customerId,
          priceId: planId,
          hospitalId: hospitalId,
        }),
      });

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionData.success) {
        throw new Error(subscriptionData.error);
      }

      // Update hospital subscription in database
      const { error } = await supabase
        .from('hospital_subscriptions')
        .insert([
          {
            hospital_id: hospitalId,
            stripe_customer_id: customerData.customerId,
            stripe_subscription_id: subscriptionData.subscriptionId,
            plan_id: planId,
            status: 'active',
            current_period_start: new Date(subscriptionData.currentPeriodStart * 1000).toISOString(),
            current_period_end: new Date(subscriptionData.currentPeriodEnd * 1000).toISOString(),
          },
        ]);

      if (error) throw error;

      return {
        success: true,
        subscriptionId: subscriptionData.subscriptionId,
        customerId: customerData.customerId,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const response = await fetch(`/api/stripe/subscription/${subscriptionId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update database
        const { error } = await supabase
          .from('hospital_subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) throw error;
      }

      return data;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Get payment history
  async getPaymentHistory(customerId) {
    try {
      const response = await fetch(`/api/stripe/payment-history/${customerId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting payment history:', error);
      return { success: false, error: error.message };
    }
  }

  // Create checkout session for one-time payments
  async createCheckoutSession(priceId, customerId, successUrl, cancelUrl) {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
          customerId: customerId,
          successUrl: successUrl,
          cancelUrl: cancelUrl,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { success: false, error: error.message };
    }
  }

  // Get subscription plans
  async getSubscriptionPlans() {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');

      if (error) throw error;

      return {
        success: true,
        plans: data,
      };
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      return {
        success: false,
        error: error.message,
        plans: [],
      };
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const response = await fetch('/api/stripe/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionId,
          newPriceId: newPriceId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update database
        const { error } = await supabase
          .from('hospital_subscriptions')
          .update({ plan_id: newPriceId })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new StripeService(); 