import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Save, FlaskConical, FileText, User, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const LabResultForm = ({ labResult = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patient_id: null,
    doctor_id: null,
    test_name: '',
    test_date: '',
    result_date: '',
    result_value: '',
    normal_range: '',
    unit: '',
    status: 'normal',
    notes: '',
    file_url: ''
  })
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchData()
    if (labResult) {
      setFormData({
        patient_id: labResult.patient_id || null,
        doctor_id: labResult.doctor_id || null,
        test_name: labResult.test_name || '',
        test_date: labResult.test_date || '',
        result_date: labResult.result_date || '',
        result_value: labResult.result_value || '',
        normal_range: labResult.normal_range || '',
        unit: labResult.unit || '',
        status: labResult.status || 'normal',
        notes: labResult.notes || '',
        file_url: labResult.file_url || ''
      })
    }
  }, [labResult])

  const fetchData = async () => {
    try {
      const [patientsResult, doctorsResult] = await Promise.all([
        supabase.from('patients').select('id, first_name, last_name, email').order('first_name'),
        supabase.from('doctors').select('id, first_name, last_name, specialization').order('first_name')
      ])

      if (patientsResult.error) throw patientsResult.error
      if (doctorsResult.error) throw doctorsResult.error

      setPatients(patientsResult.data || [])
      setDoctors(doctorsResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load form data')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.patient_id) newErrors.patient_id = 'Patient is required'
    if (!formData.doctor_id) newErrors.doctor_id = 'Doctor is required'
    if (!formData.test_name.trim()) newErrors.test_name = 'Test name is required'
    if (!formData.test_date) newErrors.test_date = 'Test date is required'
    if (!formData.result_date) newErrors.result_date = 'Result date is required'
    if (!formData.result_value.trim()) newErrors.result_value = 'Result value is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    try {
      let result
      
      if (labResult) {
        // Update existing lab result
        const { data, error } = await supabase
          .from('lab_results')
          .update(formData)
          .eq('id', labResult.id)
          .select()
        
        if (error) throw error
        result = data[0]
        toast.success('Lab result updated successfully!')
      } else {
        // Create new lab result
        const { data, error } = await supabase
          .from('lab_results')
          .insert([formData])
          .select()
        
        if (error) throw error
        result = data[0]
        toast.success('Lab result created successfully!')
      }

      onSuccess(result)
      onClose()
    } catch (error) {
      console.error('Error saving lab result:', error)
      toast.error(error.message || 'Failed to save lab result')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'abnormal': return 'text-red-600 bg-red-100'
      case 'critical': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FlaskConical className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">
                {labResult ? 'Edit Lab Result' : 'Add New Lab Result'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Patient and Doctor Selection */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Patient & Doctor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient *
                </label>
                <select
                  value={formData.patient_id || ''}
                  onChange={(e) => handleInputChange('patient_id', e.target.value ? parseInt(e.target.value) : null)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.patient_id ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} ({patient.email})
                    </option>
                  ))}
                </select>
                {errors.patient_id && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.patient_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Doctor *
                </label>
                <select
                  value={formData.doctor_id || ''}
                  onChange={(e) => handleInputChange('doctor_id', e.target.value ? parseInt(e.target.value) : null)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.doctor_id ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.first_name} {doctor.last_name} ({doctor.specialization})
                    </option>
                  ))}
                </select>
                {errors.doctor_id && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.doctor_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Test Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FlaskConical className="w-5 h-5 mr-2 text-blue-600" />
              Test Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Test Name *
                </label>
                <input
                  type="text"
                  value={formData.test_name}
                  onChange={(e) => handleInputChange('test_name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.test_name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="e.g., Blood Glucose, Cholesterol"
                />
                {errors.test_name && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.test_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Test Date *
                </label>
                <input
                  type="date"
                  value={formData.test_date}
                  onChange={(e) => handleInputChange('test_date', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.test_date ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.test_date && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.test_date}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600" />
              Test Results
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Result Value *
                </label>
                <input
                  type="text"
                  value={formData.result_value}
                  onChange={(e) => handleInputChange('result_value', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.result_value ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="e.g., 120"
                />
                {errors.result_value && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.result_value}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="e.g., mg/dL"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Normal Range
                </label>
                <input
                  type="text"
                  value={formData.normal_range}
                  onChange={(e) => handleInputChange('normal_range', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="e.g., 70-140"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Result Date *
                </label>
                <input
                  type="date"
                  value={formData.result_date}
                  onChange={(e) => handleInputChange('result_date', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.result_date ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.result_date && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.result_date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
                >
                  <option value="normal">Normal</option>
                  <option value="abnormal">Abnormal</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
              placeholder="Additional notes about the test results..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {labResult ? 'Update Lab Result' : 'Save Lab Result'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LabResultForm 