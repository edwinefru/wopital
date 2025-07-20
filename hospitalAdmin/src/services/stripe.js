import { supabase } from '../lib/supabase';

// Stripe configuration for hospital admin
const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

class HospitalStripeService {
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

  // Create payment intent for patient billing
  async createPaymentIntent(amount, patientId, description) {
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
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return { success: false, error: error.message };
    }
  }

  // Process patient payment
  async processPayment(paymentIntentId, paymentMethodId) {
    try {
      const response = await fetch('/api/stripe/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          paymentMethodId: paymentMethodId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Record payment in database
        const { error } = await supabase
          .from('payments')
          .insert([
            {
              patient_id: data.patientId,
              amount: data.amount,
              payment_method: 'stripe',
              status: 'completed',
              stripe_payment_intent_id: paymentIntentId,
              description: data.description,
            },
          ]);

        if (error) throw error;
      }

      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get patient payment history
  async getPatientPaymentHistory(patientId) {
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

  // Create invoice for patient
  async createInvoice(patientId, items, dueDate) {
    try {
      const response = await fetch('/api/stripe/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId,
          items: items,
          dueDate: dueDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save invoice to database
        const { error } = await supabase
          .from('invoices')
          .insert([
            {
              patient_id: patientId,
              stripe_invoice_id: data.invoiceId,
              amount: data.amount,
              status: 'open',
              due_date: dueDate,
              items: items,
            },
          ]);

        if (error) throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error: error.message };
    }
  }

  // Send invoice to patient
  async sendInvoice(invoiceId) {
    try {
      const response = await fetch('/api/stripe/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoiceId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update invoice status
        const { error } = await supabase
          .from('invoices')
          .update({ status: 'sent' })
          .eq('stripe_invoice_id', invoiceId);

        if (error) throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending invoice:', error);
      return { success: false, error: error.message };
    }
  }

  // Get hospital revenue analytics
  async getRevenueAnalytics(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'completed');

      if (error) throw error;

      // Calculate analytics
      const totalRevenue = data.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const paymentCount = data.length;
      const averagePayment = paymentCount > 0 ? totalRevenue / paymentCount : 0;

      // Group by date
      const dailyRevenue = data.reduce((acc, payment) => {
        const date = new Date(payment.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + parseFloat(payment.amount);
        return acc;
      }, {});

      return {
        success: true,
        analytics: {
          totalRevenue,
          paymentCount,
          averagePayment,
          dailyRevenue,
        },
      };
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      return {
        success: false,
        error: error.message,
        analytics: {},
      };
    }
  }

  // Create refund
  async createRefund(paymentIntentId, amount, reason) {
    try {
      const response = await fetch('/api/stripe/create-refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          amount: amount,
          reason: reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Record refund in database
        const { error } = await supabase
          .from('refunds')
          .insert([
            {
              payment_intent_id: paymentIntentId,
              amount: amount,
              reason: reason,
              stripe_refund_id: data.refundId,
              status: 'completed',
            },
          ]);

        if (error) throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating refund:', error);
      return { success: false, error: error.message };
    }
  }

  // Setup recurring billing for patient
  async setupRecurringBilling(patientId, amount, interval) {
    try {
      const response = await fetch('/api/stripe/setup-recurring-billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId,
          amount: amount,
          interval: interval, // 'month', 'year'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save subscription to database
        const { error } = await supabase
          .from('patient_subscriptions')
          .insert([
            {
              patient_id: patientId,
              stripe_subscription_id: data.subscriptionId,
              amount: amount,
              interval: interval,
              status: 'active',
            },
          ]);

        if (error) throw error;
      }

      return data;
    } catch (error) {
      console.error('Error setting up recurring billing:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new HospitalStripeService(); 