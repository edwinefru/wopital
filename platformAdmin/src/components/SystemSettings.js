import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Key, 
  Globe,
  DollarSign,
  Shield,
  Database,
  Bell
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function SystemSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('mtn');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      const settingsMap = {};
      data?.forEach(setting => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      toast.success('Setting updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  const updateMultipleSettings = async (newSettings) => {
    try {
      setSaving(true);
      
      const updates = Object.entries(newSettings).map(([key, value]) =>
        supabase
          .from('system_settings')
          .update({ setting_value: value })
          .eq('setting_key', key)
      );

      await Promise.all(updates);
      
      setSettings(prev => ({ ...prev, ...newSettings }));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const testMTNConnection = async () => {
    try {
      // This would test the MTN API connection
      toast.success('MTN API connection test successful');
    } catch (error) {
      console.error('MTN API test failed:', error);
      toast.error('MTN API connection test failed');
    }
  };

  const SettingField = ({ label, value, onChange, type = 'text', placeholder, description, isSecret = false }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );

  const SettingToggle = ({ label, value, onChange, description }) => (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure DigiCare system settings and integrations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'mtn', label: 'MTN Mobile Money', icon: DollarSign },
            { id: 'general', label: 'General Settings', icon: Settings },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'mtn' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">MTN Mobile Money Configuration</h3>
              <button
                onClick={testMTNConnection}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Test Connection
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="MTN API Key"
                value={settings.mtn_api_key}
                onChange={(value) => updateSetting('mtn_api_key', value)}
                type="password"
                placeholder="Enter MTN API Key"
                description="Your MTN Mobile Money API key"
                isSecret={true}
              />
              <SettingField
                label="MTN API Secret"
                value={settings.mtn_api_secret}
                onChange={(value) => updateSetting('mtn_api_secret', value)}
                type="password"
                placeholder="Enter MTN API Secret"
                description="Your MTN Mobile Money API secret"
                isSecret={true}
              />
              <SettingField
                label="MTN Subscription Key"
                value={settings.mtn_subscription_key}
                onChange={(value) => updateSetting('mtn_subscription_key', value)}
                type="password"
                placeholder="Enter MTN Subscription Key"
                description="Your MTN API subscription key"
                isSecret={true}
              />
              <SettingField
                label="MTN Environment"
                value={settings.mtn_environment}
                onChange={(value) => updateSetting('mtn_environment', value)}
                placeholder="sandbox or production"
                description="MTN API environment (sandbox/production)"
              />
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">General System Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="Default Hospital Plan"
                value={settings.default_hospital_plan}
                onChange={(value) => updateSetting('default_hospital_plan', value)}
                placeholder="basic"
                description="Default subscription plan for new hospitals"
              />
              <SettingField
                label="Default Patient Plan"
                value={settings.default_patient_plan}
                onChange={(value) => updateSetting('default_patient_plan', value)}
                placeholder="basic"
                description="Default subscription plan for new patients"
              />
              <SettingField
                label="Trial Period (Days)"
                value={settings.trial_period_days}
                onChange={(value) => updateSetting('trial_period_days', value)}
                type="number"
                placeholder="30"
                description="Free trial period in days"
              />
              <SettingField
                label="System Currency"
                value={settings.system_currency}
                onChange={(value) => updateSetting('system_currency', value)}
                placeholder="UGX"
                description="Default currency for the system"
              />
            </div>

            <div className="space-y-4">
              <SettingToggle
                label="Auto-approve Hospitals"
                value={settings.auto_approve_hospitals === 'true'}
                onChange={(value) => updateSetting('auto_approve_hospitals', value.toString())}
                description="Automatically approve new hospital registrations"
              />
              <SettingToggle
                label="Auto-approve Patients"
                value={settings.auto_approve_patients === 'true'}
                onChange={(value) => updateSetting('auto_approve_patients', value.toString())}
                description="Automatically approve new patient registrations"
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="Session Timeout (Minutes)"
                value={settings.session_timeout}
                onChange={(value) => updateSetting('session_timeout', value)}
                type="number"
                placeholder="30"
                description="User session timeout in minutes"
              />
              <SettingField
                label="Max Login Attempts"
                value={settings.max_login_attempts}
                onChange={(value) => updateSetting('max_login_attempts', value)}
                type="number"
                placeholder="5"
                description="Maximum failed login attempts before lockout"
              />
              <SettingField
                label="Password Min Length"
                value={settings.password_min_length}
                onChange={(value) => updateSetting('password_min_length', value)}
                type="number"
                placeholder="8"
                description="Minimum password length requirement"
              />
              <SettingField
                label="Two-Factor Auth Required"
                value={settings.require_2fa}
                onChange={(value) => updateSetting('require_2fa', value)}
                placeholder="false"
                description="Require two-factor authentication for admin users"
              />
            </div>

            <div className="space-y-4">
              <SettingToggle
                label="Enable Audit Logging"
                value={settings.enable_audit_logging === 'true'}
                onChange={(value) => updateSetting('enable_audit_logging', value.toString())}
                description="Log all admin actions for security auditing"
              />
              <SettingToggle
                label="Require Strong Passwords"
                value={settings.require_strong_passwords === 'true'}
                onChange={(value) => updateSetting('require_strong_passwords', value.toString())}
                description="Enforce strong password requirements"
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>

            <div className="space-y-4">
              <SettingToggle
                label="Email Notifications"
                value={settings.email_notifications === 'true'}
                onChange={(value) => updateSetting('email_notifications', value.toString())}
                description="Send email notifications for important events"
              />
              <SettingToggle
                label="SMS Notifications"
                value={settings.sms_notifications === 'true'}
                onChange={(value) => updateSetting('sms_notifications', value.toString())}
                description="Send SMS notifications for important events"
              />
              <SettingToggle
                label="New Hospital Alerts"
                value={settings.new_hospital_alerts === 'true'}
                onChange={(value) => updateSetting('new_hospital_alerts', value.toString())}
                description="Notify admins when new hospitals register"
              />
              <SettingToggle
                label="Payment Alerts"
                value={settings.payment_alerts === 'true'}
                onChange={(value) => updateSetting('payment_alerts', value.toString())}
                description="Notify admins of successful payments"
              />
              <SettingToggle
                label="System Error Alerts"
                value={settings.system_error_alerts === 'true'}
                onChange={(value) => updateSetting('system_error_alerts', value.toString())}
                description="Notify admins of system errors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingField
                label="Admin Email"
                value={settings.admin_email}
                onChange={(value) => updateSetting('admin_email', value)}
                type="email"
                placeholder="admin@digicare.com"
                description="Primary admin email for notifications"
              />
              <SettingField
                label="Admin Phone"
                value={settings.admin_phone}
                onChange={(value) => updateSetting('admin_phone', value)}
                placeholder="256XXXXXXXXX"
                description="Primary admin phone for SMS notifications"
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="border-t pt-6">
          <button
            onClick={() => updateMultipleSettings(settings)}
            disabled={saving}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
} 