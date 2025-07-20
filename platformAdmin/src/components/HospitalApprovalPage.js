import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Check, X, Eye, Filter, Building2, Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const HospitalApprovalPage = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('hospitals')
        .select(`
          *,
          hospital_admins(
            user_id,
            users(email, user_metadata)
          )
        `)
        .order('created_at', { ascending: false })

      if (selectedStatus) {
        query = query.eq('status', selectedStatus)
      }

      const { data, error } = await query

      if (error) throw error
      setHospitals(data || [])
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      toast.error('Failed to load hospitals')
    } finally {
      setLoading(false)
    }
  }

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusOptions = [
    { value: 'pending_approval', label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'suspended', label: 'Suspended', color: 'bg-gray-100 text-gray-800' }
  ]

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.value === status)
    return statusOption?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_approval':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <Check className="h-4 w-4" />
      case 'rejected':
        return <X className="h-4 w-4" />
      case 'suspended':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleApproveHospital = async (hospitalId) => {
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', hospitalId)

      if (error) throw error

      toast.success('Hospital approved successfully')
      fetchHospitals()
    } catch (error) {
      console.error('Error approving hospital:', error)
      toast.error('Failed to approve hospital')
    }
  }

  const handleRejectHospital = async (hospitalId, reason) => {
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', hospitalId)

      if (error) throw error

      toast.success('Hospital rejected successfully')
      fetchHospitals()
    } catch (error) {
      console.error('Error rejecting hospital:', error)
      toast.error('Failed to reject hospital')
    }
  }

  const handleSuspendHospital = async (hospitalId, reason) => {
    try {
      const { error } = await supabase
        .from('hospitals')
        .update({ 
          status: 'suspended',
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', hospitalId)

      if (error) throw error

      toast.success('Hospital suspended successfully')
      fetchHospitals()
    } catch (error) {
      console.error('Error suspending hospital:', error)
      toast.error('Failed to suspend hospital')
    }
  }

  const handleViewHospital = (hospital) => {
    setSelectedHospital(hospital)
    setShowModal(true)
  }

  const clearFilters = () => {
    setSelectedStatus('')
    setSearchTerm('')
    fetchHospitals()
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedHospital(null)
  }

  const getDaysSinceCreated = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now - created)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hospital Approval Management</h1>
        <p className="text-gray-600">Review and manage hospital registration requests</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search hospitals by name, email, phone, or license number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hospitals List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hospitals...</p>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedStatus
                ? 'Try adjusting your search or filters'
                : 'No hospitals have been registered yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHospitals.map((hospital) => (
                  <tr key={hospital.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {hospital.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {hospital.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{hospital.email}</div>
                      <div className="text-sm text-gray-500">{hospital.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {hospital.license_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(hospital.status)}`}>
                        {getStatusIcon(hospital.status)}
                        <span className="ml-1">
                          {statusOptions.find(s => s.value === hospital.status)?.label || hospital.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDaysSinceCreated(hospital.created_at)} days ago
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewHospital(hospital)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {hospital.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => handleApproveHospital(hospital.id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Approve Hospital"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectHospital(hospital.id, 'Rejected by admin')}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Reject Hospital"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {hospital.status === 'approved' && (
                          <button
                            onClick={() => handleSuspendHospital(hospital.id, 'Suspended by admin')}
                            className="text-orange-600 hover:text-orange-900 p-1"
                            title="Suspend Hospital"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Hospitals</p>
              <p className="text-2xl font-semibold text-gray-900">{hospitals.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-semibold text-gray-900">
                {hospitals.filter(h => h.status === 'pending_approval').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {hospitals.filter(h => h.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejected/Suspended</p>
              <p className="text-2xl font-semibold text-gray-900">
                {hospitals.filter(h => h.status === 'rejected' || h.status === 'suspended').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Detail Modal */}
      {showModal && selectedHospital && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Hospital Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Hospital Name</h4>
                  <p className="text-gray-600">{selectedHospital.name}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Address</h4>
                  <p className="text-gray-600">{selectedHospital.address}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <p className="text-gray-600">Email: {selectedHospital.email}</p>
                  <p className="text-gray-600">Phone: {selectedHospital.phone}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">License Number</h4>
                  <p className="text-gray-600">{selectedHospital.license_number}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedHospital.status)}`}>
                    {getStatusIcon(selectedHospital.status)}
                    <span className="ml-1">
                      {statusOptions.find(s => s.value === selectedHospital.status)?.label || selectedHospital.status}
                    </span>
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Registration Date</h4>
                  <p className="text-gray-600">
                    {new Date(selectedHospital.created_at).toLocaleDateString()}
                  </p>
                </div>

                {selectedHospital.hospital_admins && selectedHospital.hospital_admins.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900">Admin Contact</h4>
                    <p className="text-gray-600">
                      {selectedHospital.hospital_admins[0]?.users?.email}
                    </p>
                  </div>
                )}

                {selectedHospital.rejection_reason && (
                  <div>
                    <h4 className="font-medium text-gray-900">Rejection Reason</h4>
                    <p className="text-gray-600">{selectedHospital.rejection_reason}</p>
                  </div>
                )}

                {selectedHospital.suspension_reason && (
                  <div>
                    <h4 className="font-medium text-gray-900">Suspension Reason</h4>
                    <p className="text-gray-600">{selectedHospital.suspension_reason}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedHospital.status === 'pending_approval' && (
                  <>
                    <button
                      onClick={() => handleApproveHospital(selectedHospital.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectHospital(selectedHospital.id, 'Rejected by admin')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HospitalApprovalPage 