'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { OrganizationService } from '@/lib/organizations'
import { PersonService } from '@/lib/people'
import { Person } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PersonForm } from '@/components/people/person-form'
import { 
  UserCheck, 
  Plus, 
  Trash2, 
  Mail, 
  Phone,
  FileText,
  Users,
  User,
  X
} from 'lucide-react'

interface PeopleRelationshipManagersProps {
  organizationId: string
  managers: string[]
  onUpdate: (managers: string[]) => void
}

export function PeopleRelationshipManagers({ organizationId, managers = [], onUpdate }: PeopleRelationshipManagersProps) {
  const [redCrossPeople, setRedCrossPeople] = useState<Person[]>([])
  const [managerPeople, setManagerPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showCreatePerson, setShowCreatePerson] = useState(false)

  useEffect(() => {
    loadRedCrossPeople()
    loadManagerPeople()
  }, [managers])

  const loadManagerPeople = async () => {
    if (managers.length === 0) {
      setManagerPeople([])
      return
    }
    
    try {
      const managerDetails = await Promise.all(
        managers.map(managerId => PersonService.getById(managerId))
      )
      setManagerPeople(managerDetails.filter(Boolean) as Person[])
    } catch (error: any) {
      console.error('Failed to load manager details:', error)
    }
  }

  const loadRedCrossPeople = async () => {
    try {
      setIsLoading(true)
      // Get all people and filter for Red Cross staff
      const allPeople = await PersonService.getAll()
      // Filter for people associated with American Red Cross organization
      const redCrossOnly = allPeople.filter(person => 
        person.organization?.name?.toLowerCase().includes('red cross') ||
        person.org_id === '00000000-0000-0000-0000-000000000001'
      )
      setRedCrossPeople(redCrossOnly)
    } catch (error: any) {
      setError('Failed to load Red Cross staff')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddManager = async (person: Person) => {
    if (managers.includes(person.id)) {
      setError('This person is already assigned as a relationship manager')
      return
    }

    setIsSaving(true)
    try {
      const updatedManagers = [...managers, person.id]

      await OrganizationService.update(organizationId, {
        relationship_managers: updatedManagers
      })

      onUpdate(updatedManagers)
      setIsAdding(false)
      setError('')
    } catch (error: any) {
      setError(error.message || 'Failed to assign relationship manager')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveManager = async (id: string) => {
    if (!confirm('Are you sure you want to remove this relationship manager?')) {
      return
    }

    setIsSaving(true)
    try {
      const updatedManagers = managers.filter(managerId => managerId !== id)
      
      await OrganizationService.update(organizationId, {
        relationship_managers: updatedManagers
      })

      onUpdate(updatedManagers)
    } catch (error: any) {
      setError(error.message || 'Failed to remove relationship manager')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePersonCreated = async (newPerson: Person) => {
    // Add the new person to our Red Cross people list
    setRedCrossPeople(prev => [newPerson, ...prev])
    
    // Automatically assign them as a relationship manager
    await handleAddManager(newPerson)
    
    // Close the modal
    setShowCreatePerson(false)
  }

  // Get available people (not already assigned)
  const availablePeople = redCrossPeople.filter(person => 
    !managers.includes(person.id)
  )

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <UserCheck className="h-5 w-5 mr-2" />
            Red Cross Relationship Managers ({managers.length})
          </CardTitle>
          <Button 
            size="sm" 
            onClick={() => setIsAdding(!isAdding)} 
            disabled={isSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Assign Manager
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
          {/* Add Manager Form */}
          {isAdding && (
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Select Red Cross Staff</h4>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading Red Cross staff...</p>
                </div>
              ) : availablePeople.length === 0 ? (
                <div className="text-center py-4">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm mb-2">No available Red Cross staff found</p>
                  <p className="text-xs text-gray-400 mb-3">
                    All Red Cross staff are already assigned or none exist yet
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => setShowCreatePerson(true)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Red Cross Staff
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {availablePeople.map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-gray-900">
                            {person.first_name} {person.last_name}
                          </h5>
                          {person.title && (
                            <span className="text-sm text-gray-500">• {person.title}</span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {person.email && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {person.email}
                            </div>
                          )}
                          {person.phone && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="h-3 w-3 mr-1" />
                              {person.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddManager(person)}
                        disabled={isSaving}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Assign
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowCreatePerson(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Staff
                    </Button>
                    <Button variant="outline" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current Managers List */}
          {managerPeople.length === 0 && !isAdding ? (
            <div className="text-center py-6">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-1">No relationship managers assigned</p>
              <p className="text-xs text-gray-400 mb-3">Assign Red Cross staff to manage this relationship</p>
              <Button size="sm" onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign First Manager
              </Button>
            </div>
          ) : (
            managerPeople.map((manager) => (
              <div key={manager.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {manager.first_name} {manager.last_name}
                      </h3>
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
                      {manager.title && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="h-3 w-3 mr-2" />
                          <span>{manager.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveManager(manager.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>

    {/* Create Red Cross Person Modal */}
    {showCreatePerson && typeof window !== 'undefined' && createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-red-600" />
              Create Red Cross Staff Member
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCreatePerson(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6">
            <PersonForm
              organizationId="00000000-0000-0000-0000-000000000001"
              onSuccess={handlePersonCreated}
              onCancel={() => setShowCreatePerson(false)}
            />
          </div>
        </div>
      </div>,
      document.body
    )}
  </>
)
}