import axios from 'axios';
import { supabase } from '../lib/supabase';

class MTNMobileMoneyService {
  constructor() {
    this.baseURL = process.env.REACT_APP_MTN_API_URL || 'https://sandbox.momodeveloper.mtn.com';
    this.apiKey = process.env.REACT_APP_MTN_API_KEY;
    this.apiSecret = process.env.REACT_APP_MTN_API_SECRET;
    this.subscriptionKey = process.env.REACT_APP_MTN_SUBSCRIPTION_KEY;
    this.targetEnvironment = process.env.REACT_APP_MTN_ENVIRONMENT || 'sandbox';
  }

  // Get access token
  async getAccessToken() {
    try {
      const response = await axios.post(
        `${this.baseURL}/collection/oauth2/token`,
        {},
        {
          headers: {
            'Authorization': `Basic ${btoa(`${this.apiKey}:${this.apiSecret}`)}`,
            'X-Reference-Id': this.generateReferenceId(),
            'X-Target-Environment': this.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting MTN access token:', error);
      throw error;
    }
  }

  // Generate unique reference ID
  generateReferenceId() {
    return `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Request payment
  async requestPayment(phoneNumber, amount, description, reference) {
    try {
      const accessToken = await this.getAccessToken();
      const referenceId = this.generateReferenceId();

      const paymentData = {
        amount: amount.toString(),
        currency: 'UGX',
        externalId: reference,
        payer: {
          partyIdType: 'MSISDN',
          partyId: phoneNumber
        },
        payerMessage: description,
        payeeNote: description
      };

      const response = await axios.post(
        `${this.baseURL}/collection/v1_0/requesttopay`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Reference-Id': referenceId,
            'X-Target-Environment': this.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Content-Type': 'application/json',
          },
        }
      );

      // Save transaction to database
      await this.saveTransaction({
        transaction_id: referenceId,
        phone_number: phoneNumber,
        amount: amount,
        description: description,
        reference: reference,
        status: 'pending',
        api_response: response.data
      });

      return {
        success: true,
        referenceId,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error requesting MTN payment:', error);
      throw error;
    }
  }

  // Check payment status
  async checkPaymentStatus(referenceId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/collection/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Target-Environment': this.targetEnvironment,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
          },
        }
      );

      const status = response.data.status;
      
      // Update transaction status in database
      await this.updateTransactionStatus(referenceId, status);

      return {
        success: true,
        status,
        data: response.data
      };
    } catch (error) {
      console.error('Error checking MTN payment status:', error);
      throw error;
    }
  }

  // Save transaction to database
  async saveTransaction(transactionData) {
    try {
      const { data, error } = await supabase
        .from('mtn_mobile_money_transactions')
        .insert([transactionData]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving MTN transaction:', error);
      throw error;
    }
  }

  // Update transaction status
  async updateTransactionStatus(referenceId, status) {
    try {
      const { data, error } = await supabase
        .from('mtn_mobile_money_transactions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', referenceId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating MTN transaction status:', error);
      throw error;
    }
  }

  // Get transaction by reference ID
  async getTransaction(referenceId) {
    try {
      const { data, error } = await supabase
        .from('mtn_mobile_money_transactions')
        .select('*')
        .eq('transaction_id', referenceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting MTN transaction:', error);
      throw error;
    }
  }

  // Get all transactions
  async getAllTransactions(limit = 100) {
    try {
      const { data, error } = await supabase
        .from('mtn_mobile_money_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting MTN transactions:', error);
      throw error;
    }
  }

  // Process subscription payment
  async processSubscriptionPayment(subscriptionData) {
    try {
      const { phoneNumber, amount, planName, entityType, entityId } = subscriptionData;
      
      const description = `DigiCare ${planName} subscription`;
      const reference = `${entityType}_${entityId}_${Date.now()}`;

      const paymentResult = await this.requestPayment(
        phoneNumber,
        amount,
        description,
        reference
      );

      return {
        success: true,
        paymentResult,
        reference
      };
    } catch (error) {
      console.error('Error processing subscription payment:', error);
      throw error;
    }
  }
}

export const mtnMobileMoneyService = new MTNMobileMoneyService(); 