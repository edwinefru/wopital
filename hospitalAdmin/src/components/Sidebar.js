import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Users, Calendar, Pill, Activity, LogOut, FileText, Stethoscope, Phone } from 'lucide-react'

function Sidebar() {
  const { signOut, user, hospital } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">DigiCare Admin</h1>
        {hospital && (
          <div className="text-sm text-blue-100">{hospital.name}</div>
        )}
      </div>
      
      <nav className="space-y-2">
        <Link
          to="/dashboard"
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <Activity className="h-5 w-5 mr-3" />
          Dashboard
        </Link>
        <Link
          to="/patients"
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <Users className="h-5 w-5 mr-3" />
          Patients
        </Link>
        <Link
          to="/appointments"
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <Calendar className="h-5 w-5 mr-3" />
          Appointments
        </Link>
        <Link
          to="/lab-results"
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <Activity className="h-5 w-5 mr-3" />
          Lab Results
        </Link>
        <Link
          to="/pharmacies"
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <Pill className="h-5 w-5 mr-3" />
          Pharmacies
        </Link>
        <Link
          to="/medical-records"
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <FileText className="h-5 w-5 mr-3" />
          Medical Records
        </Link>
        <Link
          to="/diagnoses"
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <Stethoscope className="h-5 w-5 mr-3" />
          Diagnoses
        </Link>
        <Link
          to="/emergency-contacts"
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <Phone className="h-5 w-5 mr-3" />
          Emergency Contacts
        </Link>
        <Link
          to="/subscription"
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M2 10h20"/></svg>
          Subscription
        </Link>
      </nav>
      
      <div className="mt-auto pt-8">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar 