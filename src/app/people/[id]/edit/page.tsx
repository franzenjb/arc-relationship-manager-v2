'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { PersonService } from '@/lib/people'
import { OrganizationService } from '@/lib/organizations'
import { Person, Organization } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  User, 
  ArrowLeft, 
  Save,
  Building2,
  Mail,
  Phone,
  Clock,
  Briefcase
} from 'lucide-react'

function EditPersonPageContent() {
  const router = useRouter()
  const params = useParams()
  const [person, setPerson] = useState<Person | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const personId = params.id as string

  // Form state
  const [formData, setFormData] = useState({
    org_id: '',
    first_name: '',
    last_name: '',
    title: '',
    email: '',
    phone: '',
    notes: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [personData, orgsData] = await Promise.all([
          PersonService.getById(personId),
          OrganizationService.getAll()
        ])

        if (!personData) {
          setError('Person not found')
          return
        }

        setPerson(personData)
        setOrganizations(orgsData)

        // Populate form with existing data
        setFormData({
          org_id: personData.org_id,
          first_name: personData.first_name || '',
          last_name: personData.last_name || '',
          title: personData.title || '',
          email: personData.email || '',
          phone: personData.phone || '',
          notes: personData.notes || ''
        })

      } catch (error: any) {
        setError(error.message || 'Failed to load person data')
      } finally {
        setIsLoading(false)
      }
    }

    if (personId) {
      loadData()
    }
  }, [personId])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.org_id) {
      setError('Please select an organization')
      return
    }

    if (!formData.first_name && !formData.last_name) {
      setError('Please provide at least a first or last name')
      return
    }

    try {
      setIsSubmitting(true)
      
      const personData: Partial<Person> = {
        org_id: formData.org_id,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        title: formData.title || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        notes: formData.notes || undefined
      }

      await PersonService.update(personId, personData)
      
      // Redirect to the person details
      router.push(`/people/${personId}`)
    } catch (error: any) {
      setError(error.message || 'Failed to update person')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !person) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/people">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to People
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Person Not Found</h3>
            <p className="text-gray-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedOrganization = organizations.find(org => org.id === formData.org_id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/people/${personId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contact
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Contact</h1>
            <p className="text-gray-600">Update contact information and details</p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Organization Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization *
                  </label>
                  <select
                    value={formData.org_id}
                    onChange={(e) => handleInputChange('org_id', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select an organization...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} {org.city && `(${org.city}, ${org.state})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Job title or role"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Email address"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Phone number"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about this contact..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" asChild>
                    <Link href={`/people/${personId}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Contact
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Organization Info */}
          {selectedOrganization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium">{selectedOrganization.name}</h3>
                    {selectedOrganization.mission_area && (
                      <p className="text-sm text-gray-500 capitalize">
                        {selectedOrganization.mission_area.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                  
                  {selectedOrganization.city && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-1" />
                      {selectedOrganization.city}, {selectedOrganization.state}
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/organizations/${selectedOrganization.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Summary */}
          {person && (
            <Card>
              <CardHeader>
                <CardTitle>Current Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Current Name</p>
                  <p className="font-medium">
                    {person.first_name} {person.last_name}
                  </p>
                </div>
                
                {person.title && (
                  <div>
                    <p className="text-sm text-gray-600">Current Title</p>
                    <p className="font-medium">{person.title}</p>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Added</p>
                    <p className="text-sm font-medium">
                      {new Date(person.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {person.updated_at !== person.created_at && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium">
                      {new Date(person.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/organizations/new">
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Organization
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/meetings/new">
                  <Building2 className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function EditPersonPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <EditPersonPageContent />
    </Suspense>
  )
}