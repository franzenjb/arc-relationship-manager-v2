'use client'

import { useState } from 'react'
import { OrganizationService } from '@/lib/organizations'
import { RelationshipManagerInfo } from '@/lib/types'
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

interface SimpleRelationshipManagersProps {
  organizationId: string
  managers: RelationshipManagerInfo[]
  onUpdate: (managers: RelationshipManagerInfo[]) => void
}

export function SimpleRelationshipManagers({ organizationId, managers = [], onUpdate }: SimpleRelationshipManagersProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({ name: '', email: '', phone: '', notes: '' })
    setError('')
  }

  const handleEdit = (manager: RelationshipManagerInfo) => {
    setEditingId(manager.id)
    setFormData({
      name: manager.name,
      email: manager.email || '',
      phone: manager.phone || '',
      notes: manager.notes || ''
    })
    setError('')
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return
    }

    setIsSaving(true)
    try {
      let updatedManagers: RelationshipManagerInfo[]

      if (editingId) {
        // Update existing manager
        updatedManagers = managers.map(m => 
          m.id === editingId 
            ? { ...m, ...formData, name: formData.name.trim() }
            : m
        )
      } else {
        // Add new manager
        const newManager: RelationshipManagerInfo = {
          id: `rm-${Date.now()}`,
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          notes: formData.notes.trim() || undefined
        }
        updatedManagers = [...managers, newManager]
      }

      // Update the organization with new managers list
      await OrganizationService.update(organizationId, {
        relationship_managers: updatedManagers
      })

      onUpdate(updatedManagers)
      setEditingId(null)
      setIsAdding(false)
      setError('')
    } catch (error: any) {
      setError(error.message || 'Failed to save relationship manager')
    } finally {
      setIsSaving(false)
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

    setIsSaving(true)
    try {
      const updatedManagers = managers.filter(m => m.id !== id)
      
      await OrganizationService.update(organizationId, {
        relationship_managers: updatedManagers
      })

      onUpdate(updatedManagers)
    } catch (error: any) {
      setError(error.message || 'Failed to delete relationship manager')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Red Cross Relationship Managers ({managers.length})
          </CardTitle>
          <Button size="sm" onClick={handleAdd} disabled={isAdding || isSaving}>
            <Plus className="h-4 w-4 mr-2" />
            Add Manager
          </Button>
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
                    placeholder="e.g., North and Central Florida"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formData.name.trim() || isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Add Manager'}
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
                      <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={!formData.name.trim() || isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
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
                      <Button variant="outline" size="sm" onClick={() => handleEdit(manager)} disabled={isSaving}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(manager.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={isSaving}
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