import { supabase } from '../lib/supabase';

// Stripe configuration for mobile app
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

class PatientStripeService {
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

  // Initialize payment sheet for patient payments
  async initializePaymentSheet(amount, patientId, description) {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          patientId: patientId,
          description: description,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Initialize payment sheet
      const { error } = await this.stripe.initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: 'DigiCare Hospital',
        style: 'alwaysDark',
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        paymentIntentId: data.paymentIntentId,
      };
    } catch (error) {
      console.error('Error initializing payment sheet:', error);
      return { success: false, error: error.message };
    }
  }

  // Present payment sheet
  async presentPaymentSheet() {
    try {
      const { error } = await this.stripe.presentPaymentSheet();

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error presenting payment sheet:', error);
      return { success: false, error: error.message };
    }
  }

  // Get patient's payment history
  async getPaymentHistory(patientId) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        payments: data,
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      return {
        success: false,
        error: error.message,
        payments: [],
      };
    }
  }

  // Get patient's invoices
  async getInvoices(patientId) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        invoices: data,
      };
    } catch (error) {
      console.error('Error getting invoices:', error);
      return {
        success: false,
        error: error.message,
        invoices: [],
      };
    }
  }

  // Pay invoice
  async payInvoice(invoiceId, patientId) {
    try {
      // Get invoice details
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;

      // Initialize payment sheet for invoice
      const paymentResult = await this.initializePaymentSheet(
        invoice.amount,
        patientId,
        `Invoice #${invoice.id}`
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }

      // Present payment sheet
      const presentResult = await this.presentPaymentSheet();

      if (!presentResult.success) {
        throw new Error(presentResult.error);
      }

      // Update invoice status
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error paying invoice:', error);
      return { success: false, error: error.message };
    }
  }

  // Setup patient subscription
  async setupSubscription(patientId, planId) {
    try {
      const response = await fetch('/api/stripe/setup-patient-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId,
          planId: planId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Initialize payment sheet for subscription
      const paymentResult = await this.initializePaymentSheet(
        data.amount,
        patientId,
        `Subscription - ${data.planName}`
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }

      // Present payment sheet
      const presentResult = await this.presentPaymentSheet();

      if (!presentResult.success) {
        throw new Error(presentResult.error);
      }

      // Save subscription to database
      const { error } = await supabase
        .from('patient_subscriptions')
        .insert([
          {
            patient_id: patientId,
            plan_id: planId,
            stripe_subscription_id: data.subscriptionId,
            status: 'active',
            amount: data.amount,
          },
        ]);

      if (error) throw error;

      return { success: true, subscriptionId: data.subscriptionId };
    } catch (error) {
      console.error('Error setting up subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Get patient subscription
  async getSubscription(patientId) {
    try {
      const { data, error } = await supabase
        .from('patient_subscriptions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      return {
        success: true,
        subscription: data,
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      return {
        success: false,
        error: error.message,
        subscription: null,
      };
    }
  }

  // Cancel patient subscription
  async cancelSubscription(patientId) {
    try {
      // Get current subscription
      const subscriptionResult = await this.getSubscription(patientId);

      if (!subscriptionResult.success || !subscriptionResult.subscription) {
        throw new Error('No active subscription found');
      }

      const response = await fetch('/api/stripe/cancel-patient-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscriptionResult.subscription.stripe_subscription_id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Update subscription status in database
      const { error } = await supabase
        .from('patient_subscriptions')
        .update({ status: 'cancelled' })
        .eq('patient_id', patientId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  // Get available subscription plans
  async getSubscriptionPlans() {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('type', 'patient')
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

  // Save payment method for future use
  async savePaymentMethod(patientId) {
    try {
      const response = await fetch('/api/stripe/setup-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      // Initialize payment sheet for setup
      const { error } = await this.stripe.initPaymentSheet({
        setupIntentClientSecret: data.clientSecret,
        merchantDisplayName: 'DigiCare Hospital',
        style: 'alwaysDark',
      });

      if (error) {
        throw error;
      }

      // Present payment sheet
      const presentResult = await this.presentPaymentSheet();

      if (!presentResult.success) {
        throw new Error(presentResult.error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving payment method:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PatientStripeService(); 