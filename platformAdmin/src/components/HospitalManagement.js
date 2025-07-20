import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  CreditCard,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function HospitalManagement() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

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
          hospital_subscriptions(*),
          doctors(count),
          appointments(count)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('subscription_status', filter);
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

  const approveHospital = async (hospitalId) => {
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({
          is_approved: true,
          subscription_status: 'active',
          approved_at: new Date().toISOString()
        })
        .eq('id', hospitalId);

      if (error) throw error;

      toast.success('Hospital approved successfully');
      loadHospitals();
    } catch (error) {
      console.error('Error approving hospital:', error);
      toast.error('Failed to approve hospital');
    }
  };

  const rejectHospital = async (hospitalId, reason) => {
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({
          is_approved: false,
          subscription_status: 'rejected',
          approved_at: new Date().toISOString()
        })
        .eq('id', hospitalId);

      if (error) throw error;

      toast.success('Hospital rejected');
      loadHospitals();
    } catch (error) {
      console.error('Error rejecting hospital:', error);
      toast.error('Failed to reject hospital');
    }
  };

  const suspendHospital = async (hospitalId) => {
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({
          subscription_status: 'suspended'
        })
        .eq('id', hospitalId);

      if (error) throw error;

      toast.success('Hospital suspended');
      loadHospitals();
    } catch (error) {
      console.error('Error suspending hospital:', error);
      toast.error('Failed to suspend hospital');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      suspended: { color: 'bg-red-100 text-red-800', text: 'Suspended' },
      rejected: { color: 'bg-gray-100 text-gray-800', text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const HospitalModal = ({ hospital, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Hospital Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{hospital.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{hospital.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{hospital.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-sm text-gray-900">{hospital.address}</p>
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
                <p className="text-2xl font-bold text-green-600">{hospital.appointments?.[0]?.count || 0}</p>
                <p className="text-sm text-gray-600">Appointments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {hospital.hospital_subscriptions?.[0]?.amount_paid || 0}
                </p>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Subscription</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Status: {getStatusBadge(hospital.subscription_status)}
              </p>
              {hospital.hospital_subscriptions?.[0] && (
                <p className="text-sm text-gray-600 mt-1">
                  Plan: {hospital.hospital_subscriptions[0].plan_id}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 flex space-x-3">
            {hospital.subscription_status === 'pending' && (
              <>
                <button
                  onClick={() => approveHospital(hospital.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => rejectHospital(hospital.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4 inline mr-2" />
                  Reject
                </button>
              </>
            )}
            {hospital.subscription_status === 'active' && (
              <button
                onClick={() => suspendHospital(hospital.id)}
                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Suspend
              </button>
            )}
          </div>
        </div>
      </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Management</h1>
          <p className="text-gray-600">Manage hospital approvals and subscriptions</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Hospitals</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
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
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                  <p className="text-sm text-gray-600">{hospital.email}</p>
                </div>
              </div>
              {getStatusBadge(hospital.subscription_status)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {hospital.doctors?.[0]?.count || 0} Doctors
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {hospital.appointments?.[0]?.count || 0} Appointments
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                UGX {hospital.hospital_subscriptions?.[0]?.amount_paid?.toLocaleString() || 0}
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
                View Details
              </button>
              {hospital.subscription_status === 'pending' && (
                <button
                  onClick={() => approveHospital(hospital.id)}
                  className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {hospitals.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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