import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Plus, Edit, Eye, Trash2, FlaskConical, FileText, User, Calendar } from 'lucide-react'
import LabResultForm from './forms/LabResultForm'
import toast from 'react-hot-toast'

const LabResultsPage = () => {
  const [labResults, setLabResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedLabResult, setSelectedLabResult] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchLabResults()
  }, [])

  const fetchLabResults = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('lab_results')
        .select(`
          *,
          patients(first_name, last_name, email),
          doctors(first_name, last_name, specialization)
        `)
        .order('test_date', { ascending: false })

      if (error) throw error
      setLabResults(data || [])
    } catch (error) {
      console.error('Error fetching lab results:', error)
      toast.error('Failed to load lab results')
    } finally {
      setLoading(false)
    }
  }

  const filteredLabResults = labResults.filter(result => {
    const matchesSearch = 
      result.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.test_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.doctors?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.doctors?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleAddLabResult = () => {
    setSelectedLabResult(null)
    setShowModal(true)
  }

  const handleEditLabResult = (labResult) => {
    setSelectedLabResult(labResult)
    setShowModal(true)
  }

  const handleDeleteLabResult = async (labResultId) => {
    if (window.confirm('Are you sure you want to delete this lab result?')) {
      try {
        const { error } = await supabase
          .from('lab_results')
          .delete()
          .eq('id', labResultId)

        if (error) throw error
        toast.success('Lab result deleted successfully!')
        fetchLabResults()
      } catch (error) {
        console.error('Error deleting lab result:', error)
        toast.error('Failed to delete lab result')
      }
    }
  }

  const handleFormSuccess = (labResult) => {
    fetchLabResults()
    setShowModal(false)
    setSelectedLabResult(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedLabResult(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800'
      case 'abnormal': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6">
      {/* Header with Plus Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Lab Results Management
          </h1>
          <p className="text-gray-600 mt-2">Manage and track patient laboratory results</p>
        </div>
        
        {/* Beautiful Plus Button */}
        <button
          onClick={handleAddLabResult}
          className="group relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <svg className="relative w-8 h-8 text-white transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search lab results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            >
              <option value="all">All Results</option>
              <option value="normal">Normal</option>
              <option value="abnormal">Abnormal</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lab Results Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Patient & Doctor</th>
                <th className="px-6 py-4 text-left font-semibold">Test Information</th>
                <th className="px-6 py-4 text-left font-semibold">Results</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLabResults.map((result, index) => (
                <tr key={result.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {result.patients?.first_name?.[0]}{result.patients?.last_name?.[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {result.patients?.first_name} {result.patients?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Dr. {result.doctors?.first_name} {result.doctors?.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {result.test_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(result.test_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {result.result_value} {result.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      Normal: {result.normal_range}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditLabResult(result)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLabResult(result.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <LabResultForm
          labResult={selectedLabResult}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default LabResultsPage 