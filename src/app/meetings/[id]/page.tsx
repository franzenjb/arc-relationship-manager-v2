'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MeetingService } from '@/lib/meetings'
import { OrganizationService } from '@/lib/organizations'
import { PersonService } from '@/lib/people'
import { Meeting, Organization, Person } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuditTrail } from '@/components/ui/audit-trail'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Users, 
  ArrowLeft,
  Edit,
  Clock,
  FileText,
  CheckCircle,
  ExternalLink,
  Trash2
} from 'lucide-react'

export default function MeetingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [attendees, setAttendees] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const meetingId = params.id as string

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load meeting details
        const meetingData = await MeetingService.getById(meetingId)
        if (!meetingData) {
          setError('Meeting not found')
          return
        }
        setMeeting(meetingData)

        // Load associated organization
        if (meetingData.org_id) {
          const orgData = await OrganizationService.getById(meetingData.org_id)
          if (orgData) {
            setOrganization(orgData)
          }
        }

        // Load attendees if any
        if (meetingData.attendees && meetingData.attendees.length > 0) {
          const attendeeData = await Promise.all(
            meetingData.attendees.map(async (attendeeId: string) => {
              try {
                return await PersonService.getById(attendeeId)
              } catch (error) {
                console.error(`Failed to load attendee ${attendeeId}:`, error)
                return null
              }
            })
          )
          setAttendees(attendeeData.filter(Boolean) as Person[])
        }

      } catch (error) {
        console.error('Error loading meeting data:', error)
        setError('Failed to load meeting details')
      } finally {
        setIsLoading(false)
      }
    }

    if (meetingId) {
      loadData()
    }
  }, [meetingId])

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

  const handleDeleteMeeting = async () => {
    if (!meeting) return
    
    try {
      setIsDeleting(true)
      await MeetingService.delete(meeting.id)
      router.push('/meetings')
    } catch (error: any) {
      setError(error.message || 'Failed to delete meeting')
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (error || !meeting) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/meetings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meetings
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Meeting Not Found</h3>
            <p className="text-gray-500">{error || 'The meeting you are looking for does not exist.'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isUpcoming = new Date(meeting.date) > new Date()
  const meetingDate = new Date(meeting.date)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/meetings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meetings
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meeting Details</h1>
            <p className="text-gray-600">
              {meetingDate.toLocaleDateString()} • {organization?.name || 'Unknown Organization'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/meetings/${meetingId}/edit`}>
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
          {/* Meeting Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Meeting Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{meetingDate.toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{meetingDate.toLocaleTimeString()}</p>
                  </div>
                </div>
                <Badge variant={isUpcoming ? "default" : "secondary"}>
                  {isUpcoming ? "Upcoming" : "Completed"}
                </Badge>
              </div>

              {/* Location */}
              {meeting.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{meeting.location}</span>
                </div>
              )}

              {/* Organization */}
              {organization && (
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <Link 
                    href={`/organizations/${organization.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {organization.name}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              )}

              {/* Summary */}
              {meeting.summary && (
                <div className="pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Summary</p>
                      <p className="text-sm text-gray-700 mt-1">{meeting.summary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Follow-up Date */}
              {meeting.follow_up_date && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Follow-up:</span>{' '}
                      {new Date(meeting.follow_up_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees */}
          {attendees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Attendees ({attendees.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendees.map((person) => (
                    <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{person.first_name} {person.last_name}</p>
                        {person.title && (
                          <p className="text-sm text-gray-600">{person.title}</p>
                        )}
                        {person.email && (
                          <p className="text-sm text-gray-500">{person.email}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/people/${person.id}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
                <Link href={`/meetings/${meetingId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Meeting
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
                <Link href={`/meetings/new?orgId=${meeting.org_id}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Follow-up
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Meeting Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {attendees.length}
                </p>
                <p className="text-sm text-gray-500">Attendees</p>
              </div>
              
              {/* Audit Trail */}
              <div className="border-t pt-4">
                <AuditTrail 
                  createdAt={meeting.created_at}
                  updatedAt={meeting.updated_at}
                  createdBy={meeting.created_by}
                  updatedBy={meeting.updated_by}
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
        onConfirm={handleDeleteMeeting}
        title="Delete Meeting"
        description="Are you sure you want to delete this meeting?"
        itemName={meeting ? `Meeting on ${new Date(meeting.date).toLocaleDateString()}` : undefined}
        isDeleting={isDeleting}
        type="meeting"
      />
    </div>
  )
}