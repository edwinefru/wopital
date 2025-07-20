import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Eye, 
  CreditCard,
  Calendar,
  DollarSign,
  Phone,
  Mail
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    loadPatients();
  }, [filter]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('patients')
        .select(`
          *,
          patient_subscriptions(*),
          appointments(count),
          patient_vitals(count)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('subscription_status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const approvePatient = async (patientId) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          is_approved: true,
          subscription_status: 'active',
          approved_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (error) throw error;

      toast.success('Patient approved successfully');
      loadPatients();
    } catch (error) {
      console.error('Error approving patient:', error);
      toast.error('Failed to approve patient');
    }
  };

  const rejectPatient = async (patientId) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          is_approved: false,
          subscription_status: 'rejected',
          approved_at: new Date().toISOString()
        })
        .eq('id', patientId);

      if (error) throw error;

      toast.success('Patient rejected');
      loadPatients();
    } catch (error) {
      console.error('Error rejecting patient:', error);
      toast.error('Failed to reject patient');
    }
  };

  const suspendPatient = async (patientId) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({
          subscription_status: 'suspended'
        })
        .eq('id', patientId);

      if (error) throw error;

      toast.success('Patient suspended');
      loadPatients();
    } catch (error) {
      console.error('Error suspending patient:', error);
      toast.error('Failed to suspend patient');
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

  const PatientModal = ({ patient, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Patient Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">
                {patient.first_name} {patient.last_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{patient.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{patient.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-sm text-gray-900">
                {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{patient.gender || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Blood Type</label>
              <p className="mt-1 text-sm text-gray-900">{patient.blood_type || 'N/A'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{patient.appointments?.[0]?.count || 0}</p>
                <p className="text-sm text-gray-600">Appointments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{patient.patient_vitals?.[0]?.count || 0}</p>
                <p className="text-sm text-gray-600">Vital Records</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {patient.patient_subscriptions?.[0]?.amount_paid || 0}
                </p>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Subscription</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                Status: {getStatusBadge(patient.subscription_status)}
              </p>
              {patient.patient_subscriptions?.[0] && (
                <p className="text-sm text-gray-600 mt-1">
                  Plan: {patient.patient_subscriptions[0].plan_id}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-4 flex space-x-3">
            {patient.subscription_status === 'pending' && (
              <>
                <button
                  onClick={() => approvePatient(patient.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 inline mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => rejectPatient(patient.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4 inline mr-2" />
                  Reject
                </button>
              </>
            )}
            {patient.subscription_status === 'active' && (
              <button
                onClick={() => suspendPatient(patient.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage patient approvals and subscriptions</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Patients</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                </div>
              </div>
              {getStatusBadge(patient.subscription_status)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {patient.phone || 'No phone'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {patient.appointments?.[0]?.count || 0} Appointments
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                UGX {patient.patient_subscriptions?.[0]?.amount_paid?.toLocaleString() || 0}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedPatient(patient);
                  setShowModal(true);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                <Eye className="h-4 w-4 inline mr-1" />
                View Details
              </button>
              {patient.subscription_status === 'pending' && (
                <button
                  onClick={() => approvePatient(patient.id)}
                  className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {patients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">No patients match the current filter criteria.</p>
        </div>
      )}

      {/* Patient Details Modal */}
      {showModal && selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => {
            setShowModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
} 