'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPortal } from 'react-dom'
import { PersonService } from '@/lib/people'
import { OrganizationService } from '@/lib/organizations'
import { Person, Organization } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationForm } from '@/components/organizations/organization-form'
import { User, Building2, Mail, Phone, FileText, Plus, X } from 'lucide-react'

const personSchema = z.object({
  org_id: z.string().min(1, 'Organization is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type PersonFormData = z.infer<typeof personSchema>

interface PersonFormProps {
  person?: Person
  organizationId?: string
  onSuccess: (person: Person) => void
  onCancel: () => void
}

export function PersonForm({ person, organizationId, onSuccess, onCancel }: PersonFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [error, setError] = useState('')
  const [showCreateOrg, setShowCreateOrg] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      org_id: organizationId || person?.org_id || '',
      first_name: person?.first_name || '',
      last_name: person?.last_name || '',
      title: person?.title || '',
      email: person?.email || '',
      phone: person?.phone || '',
      notes: person?.notes || '',
    }
  })

  const loadOrganizations = async () => {
    try {
      const orgs = await OrganizationService.getOrganizationsWithRedCross()
      setOrganizations(orgs)
    } catch (error) {
      console.error('Failed to load organizations:', error)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [])

  const handleOrganizationCreated = (newOrg: Organization) => {
    // Add the new organization to the list
    setOrganizations(prev => [newOrg, ...prev])
    // Select the new organization
    setValue('org_id', newOrg.id)
    // Close the modal
    setShowCreateOrg(false)
  }

  const onSubmit = async (data: PersonFormData) => {
    try {
      setIsSubmitting(true)
      setError('')

      let result: Person
      if (person) {
        result = await PersonService.update(person.id, data)
      } else {
        result = await PersonService.create(data)
      }

      onSuccess(result)
    } catch (error: any) {
      setError(error.message || 'Failed to save person')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-red-600" />
              {person ? 'Edit Person' : 'Add New Person'}
            </CardTitle>
            <CardDescription>
              Enter the contact details for this person.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Organization Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Organization *
            </label>
            <div className="flex space-x-2">
              <select
                {...register('org_id')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Plus button clicked - opening modal')
                  alert('Button clicked! Opening modal...')
                  setShowCreateOrg(true)
                }}
                className="px-3 shrink-0"
                title="Create new organization"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.org_id && (
              <p className="mt-1 text-sm text-red-600">{errors.org_id.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Can't find the organization? Click the + button to create a new one.
            </p>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                {...register('first_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="John"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                {...register('last_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Smith"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title/Position
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Executive Director"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="john.smith@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Additional notes about this person"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Saving...' : person ? 'Update Person' : 'Create Person'}
            </Button>
          </div>
          </CardContent>
        </Card>
      </form>

      {/* Organization Creation Modal - Using Portal */}
      {/* Debug: showCreateOrg = {showCreateOrg ? 'true' : 'false'} */}
      {showCreateOrg && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-red-600" />
                Create New Organization
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateOrg(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <OrganizationForm
                onSuccess={handleOrganizationCreated}
                onCancel={() => setShowCreateOrg(false)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}