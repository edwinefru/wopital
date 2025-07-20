import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Plus, Eye, Download, Filter, Calendar, User, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const MedicalRecordsPage = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [patients, setPatients] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchPatients()
    fetchRecords()
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

  const fetchRecords = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('medical_records')
        .select(`
          *,
          patients(first_name, last_name, email),
          doctors(first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      if (selectedPatient) {
        query = query.eq('patient_id', selectedPatient)
      }

      if (selectedType) {
        query = query.eq('record_type', selectedType)
      }

      const { data, error } = await query

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
      toast.error('Failed to load medical records')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = records.filter(record =>
    record.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patients?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const recordTypes = [
    { value: 'lab_result', label: 'Lab Results' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'procedure', label: 'Procedure Notes' },
    { value: 'consultation', label: 'Consultation Notes' },
    { value: 'surgery', label: 'Surgery Notes' },
    { value: 'discharge', label: 'Discharge Summary' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'vaccination', label: 'Vaccination Record' },
    { value: 'allergy', label: 'Allergy Information' },
    { value: 'other', label: 'Other' }
  ]

  const getRecordTypeColor = (type) => {
    const colors = {
      lab_result: 'bg-blue-100 text-blue-800',
      imaging: 'bg-purple-100 text-purple-800',
      procedure: 'bg-green-100 text-green-800',
      consultation: 'bg-yellow-100 text-yellow-800',
      surgery: 'bg-red-100 text-red-800',
      discharge: 'bg-indigo-100 text-indigo-800',
      prescription: 'bg-pink-100 text-pink-800',
      vaccination: 'bg-teal-100 text-teal-800',
      allergy: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.other
  }

  const getRecordTypeIcon = (type) => {
    const icons = {
      lab_result: 'FlaskConical',
      imaging: 'Camera',
      procedure: 'Stethoscope',
      consultation: 'UserCheck',
      surgery: 'Scissors',
      discharge: 'FileText',
      prescription: 'Pill',
      vaccination: 'Shield',
      allergy: 'AlertTriangle',
      other: 'File'
    }
    return icons[type] || 'File'
  }

  const handleViewRecord = (record) => {
    // In a real app, this would open a modal or navigate to a detail view
    toast.success(`Viewing record: ${record.title}`)
  }

  const handleDownloadRecord = (record) => {
    // In a real app, this would trigger a download
    toast.success(`Downloading record: ${record.title}`)
  }

  const clearFilters = () => {
    setSelectedPatient('')
    setSelectedType('')
    setSearchTerm('')
    fetchRecords()
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Medical Records</h1>
        <p className="text-gray-600">Manage and access patient medical records</p>
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
                placeholder="Search records by patient name, email, or record title..."
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

          {/* Add Record Button */}
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Record
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Record Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {recordTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
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

      {/* Records List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading medical records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedPatient || selectedType 
                ? 'Try adjusting your search or filters'
                : 'No medical records have been added yet'
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
                    Record
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.patients?.first_name} {record.patients?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.patients?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {record.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecordTypeColor(record.record_type)}`}>
                        {recordTypes.find(t => t.value === record.record_type)?.label || record.record_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.record_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.doctors?.first_name} {record.doctors?.last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewRecord(record)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Record"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadRecord(record)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Download Record"
                        >
                          <Download className="h-4 w-4" />
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
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Records</p>
              <p className="text-2xl font-semibold text-gray-900">{records.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {records.filter(r => {
                  const recordDate = new Date(r.record_date)
                  const now = new Date()
                  return recordDate.getMonth() === now.getMonth() && 
                         recordDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Patients</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(records.map(r => r.patient_id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Record Types</p>
              <p className="text-2xl font-semibold text-gray-900">
                {new Set(records.map(r => r.record_type)).size}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalRecordsPage 