import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import Dashboard from './components/Dashboard'
import Sidebar from './components/Sidebar'
import PatientsList from './components/PatientsList'
import AppointmentsPage from './components/AppointmentsPage'
import LabResultsPage from './components/LabResultsPage'
import PharmaciesPage from './components/PharmaciesPage'
import SubscriptionPage from './components/SubscriptionPage'
import MedicalRecordsPage from './components/MedicalRecordsPage'
import DiagnosesPage from './components/DiagnosesPage'
import EmergencyContactsPage from './components/EmergencyContactsPage'
import { Toaster } from 'react-hot-toast'

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/patients" element={
        <ProtectedRoute>
          <PatientsList />
        </ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute>
          <AppointmentsPage />
        </ProtectedRoute>
      } />
      <Route path="/lab-results" element={
        <ProtectedRoute>
          <LabResultsPage />
        </ProtectedRoute>
      } />
      <Route path="/pharmacies" element={
        <ProtectedRoute>
          <PharmaciesPage />
        </ProtectedRoute>
      } />
      <Route path="/medical-records" element={
        <ProtectedRoute>
          <MedicalRecordsPage />
        </ProtectedRoute>
      } />
      <Route path="/diagnoses" element={
        <ProtectedRoute>
          <DiagnosesPage />
        </ProtectedRoute>
      } />
      <Route path="/emergency-contacts" element={
        <ProtectedRoute>
          <EmergencyContactsPage />
        </ProtectedRoute>
      } />
      <Route path="/subscription" element={
        <ProtectedRoute>
          <SubscriptionPage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App 