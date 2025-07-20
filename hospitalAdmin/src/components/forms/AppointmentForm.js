import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Save, Calendar, Clock, User, Stethoscope, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const AppointmentForm = ({ appointment = null, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patient_id: null,
    doctor_id: null,
    hospital_id: null,
    appointment_date: '',
    appointment_time: '',
    type: 'consultation',
    reason: '',
    urgency: 'normal',
    status: 'scheduled',
    notes: ''
  })
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchData()
    if (appointment) {
      setFormData({
        patient_id: appointment.patient_id || null,
        doctor_id: appointment.doctor_id || null,
        hospital_id: appointment.hospital_id || null,
        appointment_date: appointment.appointment_date || '',
        appointment_time: appointment.appointment_time || '',
        type: appointment.type || 'consultation',
        reason: appointment.reason || '',
        urgency: appointment.urgency || 'normal',
        status: appointment.status || 'scheduled',
        notes: appointment.notes || ''
      })
    }
  }, [appointment])

  const fetchData = async () => {
    try {
      const [patientsResult, doctorsResult, hospitalsResult] = await Promise.all([
        supabase.from('patients').select('id, first_name, last_name, email').order('first_name'),
        supabase.from('doctors').select('id, first_name, last_name, specialization').order('first_name'),
        supabase.from('hospitals').select('id, name').order('name')
      ])

      if (patientsResult.error) throw patientsResult.error
      if (doctorsResult.error) throw doctorsResult.error
      if (hospitalsResult.error) throw hospitalsResult.error

      setPatients(patientsResult.data || [])
      setDoctors(doctorsResult.data || [])
      setHospitals(hospitalsResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load form data')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.patient_id) newErrors.patient_id = 'Patient is required'
    if (!formData.doctor_id) newErrors.doctor_id = 'Doctor is required'
    if (!formData.hospital_id) newErrors.hospital_id = 'Hospital is required'
    if (!formData.appointment_date) newErrors.appointment_date = 'Appointment date is required'
    if (!formData.appointment_time) newErrors.appointment_time = 'Appointment time is required'
    if (!formData.type) newErrors.type = 'Appointment type is required'
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required'

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
      
      if (appointment) {
        // Update existing appointment
        const { data, error } = await supabase
          .from('appointments')
          .update(formData)
          .eq('id', appointment.id)
          .select()
        
        if (error) throw error
        result = data[0]
        toast.success('Appointment updated successfully!')
      } else {
        // Create new appointment
        const { data, error } = await supabase
          .from('appointments')
          .insert([formData])
          .select()
        
        if (error) throw error
        result = data[0]
        toast.success('Appointment created successfully!')
      }

      onSuccess(result)
      onClose()
    } catch (error) {
      console.error('Error saving appointment:', error)
      toast.error(error.message || 'Failed to save appointment')
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

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'normal': return 'text-blue-600 bg-blue-100'
      case 'high': return 'text-yellow-600 bg-yellow-100'
      case 'urgent': return 'text-red-600 bg-red-100'
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
              <Calendar className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold">
                {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
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

          {/* Hospital and Schedule */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
              Hospital & Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hospital *
                </label>
                <select
                  value={formData.hospital_id || ''}
                  onChange={(e) => handleInputChange('hospital_id', e.target.value ? parseInt(e.target.value) : null)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.hospital_id ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="">Select a hospital</option>
                  {hospitals.map(hospital => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
                {errors.hospital_id && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.hospital_id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.appointment_date ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.appointment_date && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.appointment_date}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Time *
                </label>
                <input
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.appointment_time ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.appointment_time && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.appointment_time}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.type ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <option value="consultation">Consultation</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine">Routine Check-up</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.type}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-purple-600" />
              Appointment Details
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Visit *
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="e.g., Annual checkup, Follow-up consultation"
                />
                {errors.reason && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.reason}
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
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-gray-400"
                  placeholder="Additional notes about the appointment..."
                />
              </div>
            </div>
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
                  {appointment ? 'Update Appointment' : 'Schedule Appointment'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AppointmentForm 