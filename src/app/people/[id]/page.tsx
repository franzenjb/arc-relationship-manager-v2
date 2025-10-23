'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PersonService } from '@/lib/people'
import { OrganizationService } from '@/lib/organizations'
import { MeetingService } from '@/lib/meetings'
import { Person, Organization, Meeting } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditTrail } from '@/components/ui/audit-trail'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  ArrowLeft,
  Edit,
  MapPin,
  ExternalLink,
  Briefcase,
  Trash2
} from 'lucide-react'

export default function PersonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [person, setPerson] = useState<Person | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const personId = params.id as string

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load person details
        const personData = await PersonService.getById(personId)
        if (!personData) {
          setError('Person not found')
          return
        }
        setPerson(personData)

        // Load associated organization
        if (personData.org_id) {
          const orgData = await OrganizationService.getById(personData.org_id)
          if (orgData) {
            setOrganization(orgData)
          }
        }

        // Load meetings involving this person
        const allMeetings = await MeetingService.getAll()
        const personMeetings = allMeetings.filter(meeting => 
          meeting.attendees && meeting.attendees.includes(personId)
        )
        setMeetings(personMeetings)

      } catch (error) {
        console.error('Error loading person data:', error)
        setError('Failed to load person details')
      } finally {
        setIsLoading(false)
      }
    }

    if (personId) {
      loadData()
    }
  }, [personId])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  const handleDeletePerson = async () => {
    if (!person) return
    
    try {
      setIsDeleting(true)
      await PersonService.delete(person.id)
      router.push('/people')
    } catch (error: any) {
      setError(error.message || 'Failed to delete person')
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (error || !person) {
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
            <p className="text-gray-500">{error || 'The person you are looking for does not exist.'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/people">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to People
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {person.first_name} {person.last_name}
            </h1>
            <p className="text-gray-600">
              {person.title && `${person.title} • `}{organization?.name || 'Unknown Organization'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/people/${personId}/edit`}>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name and Title */}
              <div>
                <p className="text-2xl font-semibold text-gray-900">
                  {person.first_name} {person.last_name}
                </p>
                {person.title && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{person.title}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              {person.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a 
                    href={`mailto:${person.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {person.email}
                  </a>
                </div>
              )}

              {/* Phone */}
              {person.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a 
                    href={`tel:${person.phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {person.phone}
                  </a>
                </div>
              )}

              {/* Organization */}
              {organization && (
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <Link 
                    href={`/organizations/${organization.id}`}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {organization.name}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              )}

              {/* Address */}
              {organization?.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{organization.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Recent Meetings ({meetings.length})
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/meetings/new?personId=${personId}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.slice(0, 5).map((meeting) => {
                    const isUpcoming = new Date(meeting.date) > new Date()
                    return (
                      <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">
                              {new Date(meeting.date).toLocaleDateString()}
                            </p>
                            <Badge variant={isUpcoming ? "default" : "secondary"}>
                              {isUpcoming ? "Upcoming" : "Completed"}
                            </Badge>
                          </div>
                          {meeting.location && (
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {meeting.location}
                            </p>
                          )}
                          {meeting.summary && (
                            <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                              {meeting.summary}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/meetings/${meeting.id}`}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    )
                  })}
                  {meetings.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" asChild>
                        <Link href={`/meetings?person=${personId}`}>
                          View All Meetings ({meetings.length})
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No meetings yet</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href={`/meetings/new?personId=${personId}`}>
                      Schedule First Meeting
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href={`/people/${personId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Contact
                </Link>
              </Button>
              {organization && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/organizations/${organization.id}`}>
                    <Building2 className="h-4 w-4 mr-2" />
                    View Organization
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/meetings/new?personId=${personId}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Link>
              </Button>
              {person.email && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={`mailto:${person.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Contact Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {meetings.length}
                </p>
                <p className="text-sm text-gray-500">Total Meetings</p>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Upcoming:</span>
                  <span className="font-medium">
                    {meetings.filter(m => new Date(m.date) > new Date()).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">
                    {meetings.filter(m => new Date(m.date) <= new Date()).length}
                  </span>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="border-t pt-4">
                <AuditTrail 
                  createdAt={person.created_at}
                  updatedAt={person.updated_at}
                  createdBy={person.created_by}
                  updatedBy={person.updated_by}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeletePerson}
        title="Delete Person"
        description="Are you sure you want to delete this person?"
        itemName={person ? `${person.first_name} ${person.last_name}` : undefined}
        isDeleting={isDeleting}
        type="person"
      />
    </div>
  )
}