'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Database, 
  MapPin, 
  Building, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle
} from 'lucide-react'
import { AuthService } from '@/lib/auth'

// Mock data - in production this would come from the database
const REFERENCE_DATA = {
  regions: [
    { id: '1', name: 'National Capital & Greater Chesapeake', code: 'NCGC', active: true },
    { id: '2', name: 'Northern California Coastal', code: 'NCC', active: true },
    { id: '3', name: 'Southern California', code: 'SCA', active: true },
    { id: '4', name: 'Texas Gulf Coast', code: 'TGC', active: true },
  ],
  mission_areas: [
    { id: 'disaster_relief', name: 'Disaster Relief', description: 'Emergency response and disaster recovery' },
    { id: 'health_safety', name: 'Health & Safety', description: 'Community health and safety programs' },
    { id: 'military_families', name: 'Military Families', description: 'Support for military families and veterans' },
    { id: 'international', name: 'International', description: 'International humanitarian programs' },
    { id: 'blood_services', name: 'Blood Services', description: 'Blood collection and distribution' },
    { id: 'other', name: 'Other', description: 'Other mission areas' },
  ],
  organization_types: [
    { id: 'government', name: 'Government', description: 'Federal, state, and local government agencies' },
    { id: 'nonprofit', name: 'Nonprofit', description: 'Nonprofit organizations and NGOs' },
    { id: 'business', name: 'Business', description: 'Private sector companies and corporations' },
    { id: 'faith_based', name: 'Faith-based', description: 'Religious organizations and faith communities' },
    { id: 'educational', name: 'Educational', description: 'Schools, universities, and educational institutions' },
    { id: 'healthcare', name: 'Healthcare', description: 'Hospitals, clinics, and healthcare providers' },
    { id: 'other', name: 'Other', description: 'Other organization types' },
  ]
}

type ReferenceDataType = 'regions' | 'mission_areas' | 'organization_types'

interface ReferenceItem {
  id: string
  name: string
  code?: string
  description?: string
  active?: boolean
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ReferenceDataType>('regions')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<Partial<ReferenceItem>>({})
  const [isAddingNew, setIsAddingNew] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Temporarily bypass auth check for demo
    // In production, this should check for national_admin role
    setUser({
      id: 'temp-admin',
      email: 'admin@redcross.org',
      profile: {
        role: 'national_admin',
        first_name: 'Admin',
        last_name: 'User'
      }
    })
    setIsLoading(false)
  }, [router])

  const handleEdit = (id: string) => {
    setEditingItem(id)
  }

  const handleSave = (id: string) => {
    // In production, this would save to the database
    console.log('Saving item:', id)
    setEditingItem(null)
  }

  const handleCancel = () => {
    setEditingItem(null)
    setIsAddingNew(false)
    setNewItem({})
  }

  const handleDelete = (id: string) => {
    // In production, this would delete from the database
    if (confirm('Are you sure you want to delete this item?')) {
      console.log('Deleting item:', id)
    }
  }

  const handleAddNew = () => {
    setIsAddingNew(true)
    setNewItem({})
  }

  const handleSaveNew = () => {
    // In production, this would save to the database
    console.log('Adding new item:', newItem)
    setIsAddingNew(false)
    setNewItem({})
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  const currentData = REFERENCE_DATA[activeTab] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-red-600" />
            Administration
          </h1>
          <p className="text-gray-600">Manage reference data and system configuration</p>
        </div>
        <Badge variant="destructive" className="flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Admin Only
        </Badge>
      </div>

      {/* Warning */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Administrative Access
          </CardTitle>
          <CardDescription className="text-amber-700">
            You have administrative privileges. Changes made here affect the entire system and all users.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('regions')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'regions' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="h-4 w-4 inline mr-2" />
          Regions
        </button>
        <button
          onClick={() => setActiveTab('mission_areas')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'mission_areas' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          Mission Areas
        </button>
        <button
          onClick={() => setActiveTab('organization_types')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'organization_types' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building className="h-4 w-4 inline mr-2" />
          Organization Types
        </button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                {activeTab === 'regions' && 'Regions'}
                {activeTab === 'mission_areas' && 'Mission Areas'}
                {activeTab === 'organization_types' && 'Organization Types'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'regions' && 'Manage Red Cross regions and geographic areas'}
                {activeTab === 'mission_areas' && 'Manage mission focus areas for organizations'}
                {activeTab === 'organization_types' && 'Manage organization type categories'}
              </CardDescription>
            </div>
            <Button onClick={handleAddNew} disabled={isAddingNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add New Form */}
            {isAddingNew && (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <Input
                      value={newItem.name || ''}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Enter name"
                    />
                  </div>
                  {activeTab === 'regions' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code *
                      </label>
                      <Input
                        value={newItem.code || ''}
                        onChange={(e) => setNewItem({...newItem, code: e.target.value})}
                        placeholder="Enter code"
                      />
                    </div>
                  )}
                  {(activeTab === 'mission_areas' || activeTab === 'organization_types') && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <Input
                        value={newItem.description || ''}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        placeholder="Enter description"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNew} disabled={!newItem.name}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            )}

            {/* Items List */}
            {currentData.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                {editingItem === item.id ? (
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input defaultValue={item.name} placeholder="Name" />
                    </div>
                    {item.code && (
                      <div>
                        <Input defaultValue={item.code} placeholder="Code" />
                      </div>
                    )}
                    {item.description && (
                      <div className="md:col-span-2">
                        <Input defaultValue={item.description} placeholder="Description" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.code && (
                          <p className="text-sm text-gray-500">Code: {item.code}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      {item.active === false && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {editingItem === item.id ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleSave(item.id)}>
                        <Save className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {currentData.length === 0 && (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No items found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900">Total Organizations</p>
              <p className="text-gray-600">Loading...</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Total People</p>
              <p className="text-gray-600">Loading...</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Total Interactions</p>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}