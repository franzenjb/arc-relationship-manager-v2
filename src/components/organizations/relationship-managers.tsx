'use client'

import { useState, useEffect } from 'react'
import { RelationshipManagerService } from '@/lib/relationship-managers'
import { RelationshipManager } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Mail, 
  Phone,
  FileText,
  Users
} from 'lucide-react'

interface RelationshipManagersProps {
  organizationId: string
}

export function RelationshipManagers({ organizationId }: RelationshipManagersProps) {
  const [managers, setManagers] = useState<RelationshipManager[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  const [tableExists, setTableExists] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  useEffect(() => {
    loadManagers()
  }, [organizationId])

  const loadManagers = async () => {
    try {
      setIsLoading(true)
      const data = await RelationshipManagerService.getByOrganization(organizationId)
      setManagers(data)
      setTableExists(true)
    } catch (error: any) {
      if (error.message.includes('table needs to be created') || error.message.includes('not yet available')) {
        setTableExists(false)
        setError('')
      } else {
        setError(error.message || 'Failed to load relationship managers')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ name: '', email: '', phone: '', notes: '' })
  }

  const handleEdit = (manager: RelationshipManager) => {
    setEditingId(manager.id)
    setFormData({
      name: manager.name,
      email: manager.email || '',
      phone: manager.phone || '',
      notes: manager.notes || ''
    })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    try {
      if (editingId) {
        await RelationshipManagerService.update(editingId, {
          ...formData,
          name: formData.name.trim()
        })
      } else {
        await RelationshipManagerService.create({
          organization_id: organizationId,
          ...formData,
          name: formData.name.trim()
        })
      }
      
      await loadManagers()
      setEditingId(null)
      setIsAdding(false)
      setError('')
    } catch (error: any) {
      if (error.message.includes('table needs to be created') || error.message.includes('not yet available')) {
        // Silently fail and hide the feature
        setTableExists(false)
        setIsAdding(false)
        setEditingId(null)
      } else {
        setError(error.message || 'Failed to save relationship manager')
      }
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setError('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this relationship manager?')) {
      return
    }

    try {
      await RelationshipManagerService.delete(id)
      await loadManagers()
    } catch (error: any) {
      setError(error.message || 'Failed to delete relationship manager')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Red Cross Relationship Managers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Hide feature entirely if table doesn't exist
  if (!tableExists) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Red Cross Relationship Managers ({managers.length})
          </CardTitle>
          {tableExists && (
            <Button size="sm" onClick={handleAdd} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Add Manager
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Add New Form */}
          {isAdding && (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john.smith@redcross.org"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="e.g., Texas region lead"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formData.name.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Add Manager
                </Button>
              </div>
            </div>
          )}

          {/* Managers List */}
          {managers.length === 0 && !isAdding ? (
            <div className="text-center py-6">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-1">No relationship managers assigned</p>
              <p className="text-xs text-gray-400 mb-3">Assign Red Cross staff to manage this relationship</p>
              <Button size="sm" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Manager
              </Button>
            </div>
          ) : (
            managers.map((manager) => (
              <div key={manager.id} className="border rounded-lg p-4">
                {editingId === manager.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <Input
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={!formData.name.trim()}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{manager.name}</h3>
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Red Cross Staff
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        {manager.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-2" />
                            <a href={`mailto:${manager.email}`} className="hover:text-red-600">
                              {manager.email}
                            </a>
                          </div>
                        )}
                        {manager.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-2" />
                            <a href={`tel:${manager.phone}`} className="hover:text-red-600">
                              {manager.phone}
                            </a>
                          </div>
                        )}
                        {manager.notes && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FileText className="h-3 w-3 mr-2" />
                            <span>{manager.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(manager)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(manager.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}