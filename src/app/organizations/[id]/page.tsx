'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { OrganizationService } from '@/lib/organizations'
import { PersonService } from '@/lib/people'
import { MeetingService } from '@/lib/meetings'
import { Organization, Person, Meeting } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditTrail } from '@/components/ui/audit-trail'
import { PeopleRelationshipManagers } from '@/components/organizations/people-relationship-managers'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Users, 
  Calendar, 
  Plus,
  ArrowLeft,
  Edit,
  ExternalLink,
  Trash2
} from 'lucide-react'

export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const orgId = params.id as string

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load organization details
        const orgData = await OrganizationService.getById(orgId)
        if (!orgData) {
          setError('Organization not found')
          return
        }
        setOrganization(orgData)

        // Load associated people and meetings
        const [peopleData, meetingsData] = await Promise.all([
          PersonService.getByOrganization(orgId),
          MeetingService.getByOrganization(orgId)
        ])
        
        setPeople(peopleData)
        setMeetings(meetingsData)
      } catch (error: any) {
        setError(error.message || 'Failed to load organization details')
      } finally {
        setIsLoading(false)
      }
    }

    if (orgId) {
      loadData()
    }
  }, [orgId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {error || 'Organization not found'}
        </h2>
        <p className="text-gray-500 mb-4">
          The organization you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/organizations">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Link>
        </Button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDeleteOrganization = async () => {
    if (!organization) return
    
    try {
      setIsDeleting(true)
      await OrganizationService.delete(organization.id)
      router.push('/organizations')
    } catch (error: any) {
      setError(error.message || 'Failed to delete organization')
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/organizations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-gray-600">
              {organization.mission_area && (
                <span className="capitalize">
                  {organization.mission_area.replace('_', ' ')} • 
                </span>
              )}
              {organization.organization_type && (
                <span className="capitalize ml-1">
                  {organization.organization_type.replace('_', ' ')}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/organizations/${organization.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <span className={`px-3 py-1 text-sm rounded-full ${
            organization.status === 'active' ? 'bg-green-100 text-green-800' :
            organization.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {organization.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Relationship Managers */}
          <PeopleRelationshipManagers 
            organizationId={organization.id}
            managers={organization.relationship_managers || []}
            onUpdate={(managers) => {
              setOrganization(prev => prev ? {...prev, relationship_managers: managers} : null)
            }}
          />
          
          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Location */}
              {organization.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">
                      {organization.address}
                      {organization.city && organization.state && (
                        <>
                          <br />
                          {organization.city}, {organization.state} {organization.zip}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Red Cross Hierarchy */}
              {organization.county && (
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Red Cross Assignment</p>
                    <div className="text-gray-600 space-y-1">
                      <p><span className="font-medium">Division:</span> {organization.county.division}</p>
                      <p><span className="font-medium">Region:</span> {organization.county.region}</p>
                      <p><span className="font-medium">Chapter:</span> {organization.county.chapter}</p>
                      <p><span className="font-medium">County:</span> {organization.county.county}, {organization.county.state}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Website */}
              {organization.website && (
                <div className="flex items-start space-x-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {organization.website}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}

              {/* Phone */}
              {organization.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href={`tel:${organization.phone}`} className="text-blue-600 hover:text-blue-800">
                      {organization.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Notes */}
              {organization.notes && (
                <div>
                  <p className="font-medium mb-2">Notes</p>
                  <p className="text-gray-600 whitespace-pre-wrap">{organization.notes}</p>
                </div>
              )}

              {/* Tags */}
              {organization.tags && organization.tags.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {organization.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit Trail */}
              <div className="border-t pt-4">
                <AuditTrail 
                  createdAt={organization.created_at}
                  updatedAt={organization.updated_at}
                  createdBy={organization.created_by}
                  updatedBy={organization.updated_by}
                  createdByUser={organization.created_by_user}
                  updatedByUser={organization.updated_by_user}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Meetings ({meetings.length})
                </div>
                <Button size="sm" asChild>
                  <Link href={`/meetings/new?orgId=${organization.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Meeting
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No meetings recorded yet</p>
                  <Button size="sm" className="mt-2" asChild>
                    <Link href={`/meetings/new?orgId=${organization.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Meeting
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.slice(0, 5).map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatDate(meeting.date)}</p>
                        {meeting.location && (
                          <p className="text-sm text-gray-500">{meeting.location}</p>
                        )}
                        {meeting.summary && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{meeting.summary}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/meetings/${meeting.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                  {meetings.length > 5 && (
                    <Button variant="ghost" className="w-full" asChild>
                      <Link href={`/meetings?orgId=${organization.id}`}>
                        View all {meetings.length} meetings
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Key Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Key Contacts ({people.length})
                </div>
                <Button size="sm" asChild>
                  <Link href={`/people/new?orgId=${organization.id}`}>
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {people.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm mb-1">No contacts added yet</p>
                  <p className="text-xs text-gray-400 mb-3">Add people first, then set a primary contact</p>
                  <Button size="sm" className="mt-2" asChild>
                    <Link href={`/people/new?orgId=${organization.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Contact
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {people.map((person) => (
                    <div key={person.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {person.first_name} {person.last_name}
                        </p>
                        {person.title && (
                          <p className="text-sm text-gray-500">{person.title}</p>
                        )}
                        {person.email && (
                          <a 
                            href={`mailto:${person.email}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {person.email}
                          </a>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/people/${person.id}`}>View</Link>
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href={`/people?orgId=${organization.id}`}>
                      View all contacts
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/meetings/new?orgId=${organization.id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/people/new?orgId=${organization.id}`}>
                  <Users className="h-4 w-4 mr-2" />
                  Add Contact
                </Link>
              </Button>
              {organization.address && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/map?orgId=${organization.id}`}>
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteOrganization}
        title="Delete Organization"
        description="Are you sure you want to delete this organization?"
        itemName={organization?.name}
        isDeleting={isDeleting}
        type="organization"
      />
    </div>
  )
}