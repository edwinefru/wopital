import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Search, Plus, Edit, Eye, Trash2, Building, Phone, Mail, MapPin } from 'lucide-react'
import PharmacyForm from './forms/PharmacyForm'
import toast from 'react-hot-toast'

const PharmaciesPage = () => {
  const [pharmacies, setPharmacies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPharmacy, setSelectedPharmacy] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchPharmacies()
  }, [])

  const fetchPharmacies = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('name')

      if (error) throw error
      setPharmacies(data || [])
    } catch (error) {
      console.error('Error fetching pharmacies:', error)
      toast.error('Failed to load pharmacies')
    } finally {
      setLoading(false)
    }
  }

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.phone?.includes(searchTerm) ||
    pharmacy.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPharmacy = () => {
    setSelectedPharmacy(null)
    setShowModal(true)
  }

  const handleEditPharmacy = (pharmacy) => {
    setSelectedPharmacy(pharmacy)
    setShowModal(true)
  }

  const handleDeletePharmacy = async (pharmacyId) => {
    if (window.confirm('Are you sure you want to delete this pharmacy?')) {
      try {
        const { error } = await supabase
          .from('pharmacies')
          .delete()
          .eq('id', pharmacyId)

        if (error) throw error
        toast.success('Pharmacy deleted successfully!')
        fetchPharmacies()
      } catch (error) {
        console.error('Error deleting pharmacy:', error)
        toast.error('Failed to delete pharmacy')
      }
    }
  }

  const handleFormSuccess = (pharmacy) => {
    fetchPharmacies()
    setShowModal(false)
    setSelectedPharmacy(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedPharmacy(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pharmacies</h1>
        <button 
          onClick={handleAddPharmacy}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Pharmacy
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search pharmacies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Pharmacies Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pharmacy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                License
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPharmacies.map((pharmacy) => (
              <tr key={pharmacy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <Building className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {pharmacy.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pharmacy.pharmacist_in_charge}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-900">{pharmacy.phone}</div>
                      <div className="text-sm text-gray-500">{pharmacy.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <div className="text-sm text-gray-900 truncate max-w-xs">
                      {pharmacy.address}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {pharmacy.license_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPharmacy(pharmacy)}
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit pharmacy"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" title="View details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePharmacy(pharmacy.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete pharmacy"
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

      {/* Pharmacy Count */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredPharmacies.length} of {pharmacies.length} pharmacies
      </div>

      {/* Pharmacy Form Modal */}
      {showModal && (
        <PharmacyForm
          pharmacy={selectedPharmacy}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default PharmaciesPage 