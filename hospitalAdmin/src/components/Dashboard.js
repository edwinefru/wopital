import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Calendar, 
  Pill, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Stethoscope,
  Building,
  FileText,
  Heart,
  Clock,
  CheckCircle,
  DollarSign,
  CreditCard
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const Dashboard = () => {
  const { adminProfile } = useAuth()
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalDoctors: 0,
    totalMedications: 0,
    recentAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    expiringSubscriptions: 0
  })
  const [patientStats, setPatientStats] = useState([])
  const [appointmentTrends, setAppointmentTrends] = useState([])
  const [recentPatients, setRecentPatients] = useState([])
  const [urgentAlerts, setUrgentAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch hospital-specific data
      const [
        patientsData,
        appointmentsData,
        doctorsData,
        medicationsData,
        subscriptionsData,
        transactionsData,
        labResultsData,
        prescriptionsData
      ] = await Promise.all([
        supabase.from('patients').select('*'),
        supabase.from('appointments').select('*'),
        supabase.from('doctors').select('*'),
        supabase.from('medications').select('*'),
        supabase.from('hospital_subscriptions').select('*'),
        supabase.from('stripe_transactions').select('*'),
        supabase.from('lab_results').select('*'),
        supabase.from('prescriptions').select('*')
      ])

      const patients = patientsData.data || []
      const appointments = appointmentsData.data || []
      const doctors = doctorsData.data || []
      const medications = medicationsData.data || []
      const subscriptions = subscriptionsData.data || []
      const transactions = transactionsData.data || []
      const labResults = labResultsData.data || []
      const prescriptions = prescriptionsData.data || []

      // Process appointment status counts
      const statusCounts = appointments.reduce((acc, appointment) => {
        acc[appointment.status] = (acc[appointment.status] || 0) + 1
        return acc
      }, {})

      // Calculate revenue
      const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
      const monthlyRevenue = totalRevenue * 0.3

      // Process patient demographics
      const patientDemographics = patients.reduce((acc, patient) => {
        const age = patient.date_of_birth ? 
          new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 0
        if (age < 18) acc.children++
        else if (age < 65) acc.adults++
        else acc.seniors++
        return acc
      }, { children: 0, adults: 0, seniors: 0 })

      const patientChartData = [
        { name: 'Children', value: patientDemographics.children, color: '#0088FE' },
        { name: 'Adults', value: patientDemographics.adults, color: '#00C49F' },
        { name: 'Seniors', value: patientDemographics.seniors, color: '#FFBB28' }
      ]

      // Process appointment trends (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      }).reverse()

      const trendsData = last7Days.map(date => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        appointments: appointments.filter(apt => 
          apt.appointment_date === date
        ).length
      }))

      // Recent patients
      const recent = patients
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)

      // Urgent alerts (lab results, prescriptions, etc.)
      const alerts = [
        ...labResults.filter(lab => lab.status === 'critical').slice(0, 3),
        ...prescriptions.filter(pres => pres.status === 'pending').slice(0, 2)
      ]

      setStats({
        totalPatients: patients.length,
        totalAppointments: appointments.length,
        totalDoctors: doctors.length,
        totalMedications: medications.length,
        recentAppointments: statusCounts?.scheduled || 0,
        pendingAppointments: statusCounts?.pending || 0,
        completedAppointments: statusCounts?.completed || 0,
        cancelledAppointments: statusCounts?.cancelled || 0,
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        expiringSubscriptions: subscriptions.filter(s => {
          const expiryDate = new Date(s.expires_at)
          const thirtyDaysFromNow = new Date()
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
          return expiryDate <= thirtyDaysFromNow && s.status === 'active'
        }).length
      })

      setPatientStats(patientChartData)
      setAppointmentTrends(trendsData)
      setRecentPatients(recent)
      setUrgentAlerts(alerts)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white mb-8">
        <h1 className="text-3xl font-bold">Hospital Management Dashboard</h1>
        <p className="text-green-100">Welcome back, {adminProfile?.first_name || 'Admin'}</p>
        <p className="text-green-100 text-sm">Manage patients, appointments, and medical records</p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              <p className="text-xs text-gray-500">Registered patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              <p className="text-xs text-gray-500">All appointments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
              <p className="text-xs text-gray-500">Medical staff</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Status and Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-xl font-bold text-blue-600">{stats.recentAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-green-600">{stats.completedAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-red-600">{stats.cancelledAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Patient Demographics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Demographics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={patientStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {patientStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="appointments" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Patients and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {recentPatients.map((patient, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{patient.first_name} {patient.last_name}</h4>
                  <p className="text-sm text-gray-600">{patient.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-sm font-medium">{new Date(patient.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Urgent Alerts</h3>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {urgentAlerts.length > 0 ? (
              urgentAlerts.map((alert, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-800">
                        {alert.status === 'critical' ? 'Critical Lab Result' : 'Pending Prescription'}
                      </h4>
                      <p className="text-sm text-red-700">Patient ID: {alert.patient_id}</p>
                    </div>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No urgent alerts</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <button className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-sm font-medium">Add Patient</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="h-6 w-6 text-green-500 mb-2" />
            <span className="text-sm font-medium">Schedule Appointment</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-6 w-6 text-purple-500 mb-2" />
            <span className="text-sm font-medium">View Records</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <CreditCard className="h-6 w-6 text-orange-500 mb-2" />
            <span className="text-sm font-medium">Manage Billing</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Activity className="h-6 w-6 text-red-500 mb-2" />
            <span className="text-sm font-medium">Reports</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 