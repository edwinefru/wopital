import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Plus, Eye, Edit, Filter, Calendar, User, Stethoscope, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const DiagnosesPage = () => {
  const [diagnoses, setDiagnoses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchPatients()
    fetchDoctors()
    fetchDiagnoses()
  }, [])

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email')
        .order('first_name')

      if (error) throw error
      setPatients(data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to load patients')
    }
  }

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, first_name, last_name, specialty')
        .order('first_name')

      if (error) throw error
      setDoctors(data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('Failed to load doctors')
    }
  }

  const fetchDiagnoses = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('diagnoses')
        .select(`
          *,
          patients(first_name, last_name, email),
          doctors(first_name, last_name, specialty)
        `)
        .order('diagnosis_date', { ascending: false })

      if (selectedPatient) {
        query = query.eq('patient_id', selectedPatient)
      }

      if (selectedStatus) {
        query = query.eq('status', selectedStatus)
      }

      if (selectedDoctor) {
        query = query.eq('doctor_id', selectedDoctor)
      }

      const { data, error } = await query

      if (error) throw error
      setDiagnoses(data || [])
    } catch (error) {
      console.error('Error fetching diagnoses:', error)
      toast.error('Failed to load diagnoses')
    } finally {
      setLoading(false)
    }
  }

  const filteredDiagnoses = diagnoses.filter(diagnosis =>
    diagnosis.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diagnosis.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diagnosis.patients?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diagnosis.condition_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diagnosis.icd_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    diagnosis.treatment_notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-red-100 text-red-800' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
    { value: 'chronic', label: 'Chronic', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'monitoring', label: 'Monitoring', color: 'bg-blue-100 text-blue-800' }
  ]

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.value === status)
    return statusOption?.color || 'bg-gray-100 text-gray-800'
  }

  const handleViewDiagnosis = (diagnosis) => {
    setSelectedDiagnosis(diagnosis)
    setShowModal(true)
  }

  const handleEditDiagnosis = (diagnosis) => {
    // In a real app, this would open an edit form
    toast.success(`Editing diagnosis: ${diagnosis.condition_name}`)
  }

  const clearFilters = () => {
    setSelectedPatient('')
    setSelectedStatus('')
    setSelectedDoctor('')
    setSearchTerm('')
    fetchDiagnoses()
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedDiagnosis(null)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Diagnoses</h1>
        <p className="text-gray-600">Manage and track patient diagnoses and conditions</p>
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
                placeholder="Search diagnoses by patient, condition, or ICD code..."
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

          {/* Add Diagnosis Button */}
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Diagnosis
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Patients</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Doctors</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.first_name} {doctor.last_name}
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

      {/* Diagnoses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading diagnoses...</p>
          </div>
        ) : filteredDiagnoses.length === 0 ? (
          <div className="p-8 text-center">
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No diagnoses found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedPatient || selectedStatus || selectedDoctor
                ? 'Try adjusting your search or filters'
                : 'No diagnoses have been recorded yet'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ICD Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Diagnosis Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiagnoses.map((diagnosis) => (
                  <tr key={diagnosis.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {diagnosis.patients?.first_name} {diagnosis.patients?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {diagnosis.patients?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {diagnosis.condition_name}
                      </div>
                      {diagnosis.is_treated && (
                        <div className="text-xs text-green-600 font-medium">
                          ✓ Treated
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {diagnosis.icd_code || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(diagnosis.status)}`}>
                        {statusOptions.find(s => s.value === diagnosis.status)?.label || diagnosis.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(diagnosis.diagnosis_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Dr. {diagnosis.doctors?.first_name} {diagnosis.doctors?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDiagnosis(diagnosis)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditDiagnosis(diagnosis)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit Diagnosis"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
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
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Diagnoses</p>
              <p className="text-2xl font-semibold text-gray-900">{diagnoses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Conditions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {diagnoses.filter(d => d.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Patients with Diagnoses</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(diagnoses.map(d => d.patient_id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {diagnoses.filter(d => {
                  const diagnosisDate = new Date(d.diagnosis_date)
                  const now = new Date()
                  return diagnosisDate.getMonth() === now.getMonth() && 
                         diagnosisDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis Detail Modal */}
      {showModal && selectedDiagnosis && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Diagnosis Details
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
                  <h4 className="font-medium text-gray-900">Patient</h4>
                  <p className="text-gray-600">
                    {selectedDiagnosis.patients?.first_name} {selectedDiagnosis.patients?.last_name}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Condition</h4>
                  <p className="text-gray-600">{selectedDiagnosis.condition_name}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">ICD Code</h4>
                  <p className="text-gray-600">{selectedDiagnosis.icd_code || 'Not specified'}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDiagnosis.status)}`}>
                    {statusOptions.find(s => s.value === selectedDiagnosis.status)?.label || selectedDiagnosis.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Diagnosis Date</h4>
                  <p className="text-gray-600">
                    {new Date(selectedDiagnosis.diagnosis_date).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Diagnosing Doctor</h4>
                  <p className="text-gray-600">
                    Dr. {selectedDiagnosis.doctors?.first_name} {selectedDiagnosis.doctors?.last_name}
                  </p>
                </div>

                {selectedDiagnosis.treatment_notes && (
                  <div>
                    <h4 className="font-medium text-gray-900">Treatment Notes</h4>
                    <p className="text-gray-600">{selectedDiagnosis.treatment_notes}</p>
                  </div>
                )}

                {selectedDiagnosis.follow_up_date && (
                  <div>
                    <h4 className="font-medium text-gray-900">Follow-up Date</h4>
                    <p className="text-gray-600">
                      {new Date(selectedDiagnosis.follow_up_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedDiagnosis.is_treated}
                    readOnly
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-900">
                    Condition has been treated
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEditDiagnosis(selectedDiagnosis)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Diagnosis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiagnosesPage 