import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Calendar, 
  RefreshCw, 
  Eye, 
  Copy,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader,
  Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function SubscriptionKeyManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, expiring, expired
  const [generatingKey, setGeneratingKey] = useState(false);
  const [renewing, setRenewing] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, [filter]);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('hospitals')
        .select(`
          *,
          hospital_subscription_keys(*),
          hospital_subscriptions(*),
          doctors(count),
          patients(count)
        `)
        .order('created_at', { ascending: false });

      if (filter === 'active') {
        query = query.eq('subscription_status', 'active');
      } else if (filter === 'expiring') {
        query = query.lt('subscription_expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
                   .gte('subscription_expires_at', new Date().toISOString());
      } else if (filter === 'expired') {
        query = query.lt('subscription_expires_at', new Date().toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      setHospitals(data || []);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const generateSubscriptionKey = async (hospitalId) => {
    try {
      setGeneratingKey(true);
      
      const { data, error } = await supabase.rpc('create_hospital_subscription', {
        p_hospital_id: hospitalId,
        p_plan_id: 'basic', // Default plan
        p_duration_months: 1,
        p_created_by: null // Will be set by admin user
      });

      if (error) throw error;

      toast.success('Subscription key generated successfully');
      loadHospitals();
    } catch (error) {
      console.error('Error generating subscription key:', error);
      toast.error('Failed to generate subscription key');
    } finally {
      setGeneratingKey(false);
    }
  };

  const renewSubscription = async (hospitalId, months = 1) => {
    try {
      setRenewing(true);
      
      // Get current subscription
      const hospital = hospitals.find(h => h.id === hospitalId);
      if (!hospital) throw new Error('Hospital not found');

      const newExpiryDate = new Date(hospital.subscription_expires_at);
      newExpiryDate.setMonth(newExpiryDate.getMonth() + months);

      // Update hospital subscription
      const { error } = await supabase
        .from('hospitals')
        .update({
          subscription_expires_at: newExpiryDate.toISOString(),
          subscription_renewal_date: newExpiryDate.toISOString(),
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', hospitalId);

      if (error) throw error;

      // Update subscription key
      const { error: keyError } = await supabase
        .from('hospital_subscription_keys')
        .update({
          expires_at: newExpiryDate.toISOString(),
          renewed_at: new Date().toISOString(),
          status: 'active'
        })
        .eq('hospital_id', hospitalId)
        .eq('status', 'active');

      if (keyError) throw keyError;

      toast.success('Subscription renewed successfully');
      loadHospitals();
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast.error('Failed to renew subscription');
    } finally {
      setRenewing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Subscription key copied to clipboard');
  };

  const getStatusBadge = (hospital) => {
    const now = new Date();
    const expiryDate = new Date(hospital.subscription_expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (hospital.subscription_status === 'active') {
      if (daysUntilExpiry <= 0) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </span>
        );
      } else if (daysUntilExpiry <= 7) {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expiring Soon
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      }
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  const HospitalModal = ({ hospital, onClose }) => {
    const [renewalMonths, setRenewalMonths] = useState(1);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Subscription Details</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                <p className="mt-1 text-sm text-gray-900">{hospital.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(hospital)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subscription Key</label>
                <div className="mt-1 flex items-center space-x-2">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {hospital.subscription_key || 'No key generated'}
                  </code>
                  {hospital.subscription_key && (
                    <button
                      onClick={() => copyToClipboard(hospital.subscription_key)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expires</label>
                <p className="mt-1 text-sm text-gray-900">
                  {hospital.subscription_expires_at 
                    ? new Date(hospital.subscription_expires_at).toLocaleDateString()
                    : 'No expiration date'
                  }
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{hospital.doctors?.[0]?.count || 0}</p>
                  <p className="text-sm text-gray-600">Doctors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{hospital.patients?.[0]?.count || 0}</p>
                  <p className="text-sm text-gray-600">Patients</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {getDaysUntilExpiry(hospital.subscription_expires_at)}
                  </p>
                  <p className="text-sm text-gray-600">Days Left</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
              <div className="space-y-3">
                {!hospital.subscription_key && (
                  <button
                    onClick={() => generateSubscriptionKey(hospital.id)}
                    disabled={generatingKey}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {generatingKey ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Subscription Key
                      </>
                    )}
                  </button>
                )}

                {hospital.subscription_key && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <select
                        value={renewalMonths}
                        onChange={(e) => setRenewalMonths(parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1 Month</option>
                        <option value={3}>3 Months</option>
                        <option value={6}>6 Months</option>
                        <option value={12}>1 Year</option>
                      </select>
                      <button
                        onClick={() => renewSubscription(hospital.id, renewalMonths)}
                        disabled={renewing}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {renewing ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Renewing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Renew Subscription
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Key Management</h1>
          <p className="text-gray-600">Manage hospital subscription keys and renewal dates</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Hospitals</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <div key={hospital.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Key className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                  <p className="text-sm text-gray-600">{hospital.email}</p>
                </div>
              </div>
              {getStatusBadge(hospital)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Key className="h-4 w-4 mr-2" />
                {hospital.subscription_key ? (
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {hospital.subscription_key.substring(0, 12)}...
                  </span>
                ) : (
                  <span className="text-red-600">No key generated</span>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {hospital.subscription_expires_at 
                  ? `${new Date(hospital.subscription_expires_at).toLocaleDateString()} (${getDaysUntilExpiry(hospital.subscription_expires_at)} days)`
                  : 'No expiration date'
                }
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {hospital.doctors?.[0]?.count || 0} doctors, {hospital.patients?.[0]?.count || 0} patients
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedHospital(hospital);
                  setShowModal(true);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-4 w-4 inline mr-1" />
                Manage
              </button>
              {!hospital.subscription_key && (
                <button
                  onClick={() => generateSubscriptionKey(hospital.id)}
                  disabled={generatingKey}
                  className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {hospitals.length === 0 && (
        <div className="text-center py-12">
          <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
          <p className="text-gray-600">No hospitals match the current filter criteria.</p>
        </div>
      )}

      {/* Hospital Details Modal */}
      {showModal && selectedHospital && (
        <HospitalModal
          hospital={selectedHospital}
          onClose={() => {
            setShowModal(false);
            setSelectedHospital(null);
          }}
        />
      )}
    </div>
  );
} 