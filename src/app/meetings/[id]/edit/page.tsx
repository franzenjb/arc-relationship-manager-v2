'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { OrganizationService } from '@/lib/organizations'
import { MeetingService } from '@/lib/meetings'
import { PersonService } from '@/lib/people'
import { Organization, Meeting, Person } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  ArrowLeft, 
  Save,
  Building2,
  MapPin,
  Clock,
  Users,
  FileText
} from 'lucide-react'

function EditMeetingPageContent() {
  const router = useRouter()
  const params = useParams()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const meetingId = params.id as string

  // Form state
  const [formData, setFormData] = useState({
    org_id: '',
    date: '',
    location: '',
    summary: '',
    follow_up_date: '',
    attendees: [] as string[]
  })

  const [attendeeInput, setAttendeeInput] = useState('')
  const [attendeeSearchQuery, setAttendeeSearchQuery] = useState('')
  const [showAttendeeDropdown, setShowAttendeeDropdown] = useState(false)
  const [selectedAttendees, setSelectedAttendees] = useState<Person[]>([])
  const [customAttendees, setCustomAttendees] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [meetingData, orgsData, peopleData] = await Promise.all([
          MeetingService.getById(meetingId),
          OrganizationService.getAll(),
          PersonService.getAll()
        ])

        if (!meetingData) {
          setError('Meeting not found')
          return
        }

        setMeeting(meetingData)
        setOrganizations(orgsData)
        setPeople(peopleData)

        // Populate form with existing data
        setFormData({
          org_id: meetingData.org_id,
          date: meetingData.date,
          location: meetingData.location || '',
          summary: meetingData.summary || '',
          follow_up_date: meetingData.follow_up_date || '',
          attendees: meetingData.attendees || []
        })

        // Parse attendees - check if they are Person IDs or custom names
        if (meetingData.attendees) {
          const dbPeople: Person[] = []
          const customNames: string[] = []

          for (const attendee of meetingData.attendees) {
            const person = peopleData.find(p => p.id === attendee)
            if (person) {
              dbPeople.push(person)
            } else {
              customNames.push(attendee)
            }
          }

          setSelectedAttendees(dbPeople)
          setCustomAttendees(customNames)
        }

      } catch (error: any) {
        setError(error.message || 'Failed to load meeting data')
      } finally {
        setIsLoading(false)
      }
    }

    if (meetingId) {
      loadData()
    }
  }, [meetingId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.attendee-search-container')) {
        setShowAttendeeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addPersonAttendee = (person: Person) => {
    if (!selectedAttendees.find(a => a.id === person.id)) {
      setSelectedAttendees(prev => [...prev, person])
      setAttendeeSearchQuery('')
      setShowAttendeeDropdown(false)
    }
  }

  const addCustomAttendee = () => {
    if (attendeeInput.trim() && !customAttendees.includes(attendeeInput.trim())) {
      setCustomAttendees(prev => [...prev, attendeeInput.trim()])
      setAttendeeInput('')
    }
  }

  const removePersonAttendee = (personId: string) => {
    setSelectedAttendees(prev => prev.filter(a => a.id !== personId))
  }

  const removeCustomAttendee = (attendee: string) => {
    setCustomAttendees(prev => prev.filter(a => a !== attendee))
  }

  // Filter people based on search query
  const filteredPeople = people.filter(person => {
    const query = attendeeSearchQuery.toLowerCase()
    return (
      person.first_name?.toLowerCase().includes(query) ||
      person.last_name?.toLowerCase().includes(query) ||
      person.email?.toLowerCase().includes(query) ||
      person.organization?.name?.toLowerCase().includes(query)
    )
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.org_id) {
      setError('Please select an organization')
      return
    }

    if (!formData.date) {
      setError('Please select a meeting date')
      return
    }

    try {
      setIsSubmitting(true)
      
      // Auto-add custom attendees to people database (same as create logic)
      const newPersonIds: string[] = []
      for (const attendeeName of customAttendees) {
        try {
          // Check if this person was already in the original meeting to avoid duplicates
          const existingPerson = people.find(p => 
            `${p.first_name} ${p.last_name}`.trim() === attendeeName.trim()
          )
          
          if (!existingPerson) {
            const newPerson = await PersonService.create({
              org_id: formData.org_id,
              first_name: attendeeName.split(' ')[0] || attendeeName,
              last_name: attendeeName.split(' ').slice(1).join(' ') || undefined,
            })
            newPersonIds.push(newPerson.id)
          }
        } catch (error) {
          console.error(`Failed to create person record for ${attendeeName}:`, error)
        }
      }

      // Combine selected people IDs and newly created person IDs
      const allAttendeeIds = [
        ...selectedAttendees.map(person => person.id),
        ...newPersonIds
      ]

      const meetingData: Partial<Meeting> = {
        org_id: formData.org_id,
        date: formData.date,
        location: formData.location || undefined,
        summary: formData.summary || undefined,
        follow_up_date: formData.follow_up_date || undefined,
        attendees: allAttendeeIds.length > 0 ? allAttendeeIds : undefined
      }

      await MeetingService.update(meetingId, meetingData)
      
      // Redirect to the meeting details
      router.push(`/meetings/${meetingId}`)
    } catch (error: any) {
      setError(error.message || 'Failed to update meeting')
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

  if (error && !meeting) {
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
            <Link href={`/meetings/${meetingId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meeting
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Meeting</h1>
            <p className="text-gray-600">Update meeting details and information</p>
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
                <Calendar className="h-5 w-5 mr-2" />
                Meeting Details
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

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Date
                    </label>
                    <Input
                      type="date"
                      value={formData.follow_up_date}
                      onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                      placeholder="Optional follow-up reminder"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Meeting location (office, virtual, etc.)"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Attendees - Same complex logic as create page */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendees
                  </label>
                  <div className="space-y-4">
                    {/* Search for existing people */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Search People in Database
                      </label>
                      <div className="relative attendee-search-container">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          value={attendeeSearchQuery}
                          onChange={(e) => {
                            setAttendeeSearchQuery(e.target.value)
                            setShowAttendeeDropdown(e.target.value.length > 0)
                          }}
                          placeholder="Search by name, email, or organization"
                          className="pl-10"
                          onFocus={() => setShowAttendeeDropdown(attendeeSearchQuery.length > 0)}
                        />
                        
                        {/* Dropdown */}
                        {showAttendeeDropdown && filteredPeople.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredPeople.slice(0, 10).map((person) => (
                              <div
                                key={person.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => addPersonAttendee(person)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {person.first_name} {person.last_name}
                                    </p>
                                    {person.title && (
                                      <p className="text-sm text-gray-600">{person.title}</p>
                                    )}
                                    {person.email && (
                                      <p className="text-sm text-gray-500">{person.email}</p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    {person.organization?.name && (
                                      <p className="text-sm text-gray-600">{person.organization.name}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add custom attendee */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Add New Person (Not in Database)
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            value={attendeeInput}
                            onChange={(e) => setAttendeeInput(e.target.value)}
                            placeholder="Enter full name for new attendee"
                            className="pl-10"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomAttendee()
                              }
                            }}
                          />
                        </div>
                        <Button type="button" onClick={addCustomAttendee} variant="outline">
                          Add New
                        </Button>
                      </div>
                    </div>

                    {/* Selected Attendees */}
                    {(selectedAttendees.length > 0 || customAttendees.length > 0) && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                          Selected Attendees
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {/* Database people */}
                          {selectedAttendees.map((person) => (
                            <span
                              key={person.id}
                              className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                            >
                              {person.first_name} {person.last_name}
                              {person.organization?.name && (
                                <span className="ml-1 text-green-600">({person.organization.name})</span>
                              )}
                              <button
                                type="button"
                                onClick={() => removePersonAttendee(person.id)}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          
                          {/* Custom attendees */}
                          {customAttendees.map((attendee, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {attendee}
                              <span className="ml-1 text-blue-600">(New)</span>
                              <button
                                type="button"
                                onClick={() => removeCustomAttendee(attendee)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Summary
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Key discussion points, decisions made, action items..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-vertical"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" asChild>
                    <Link href={`/meetings/${meetingId}`}>Cancel</Link>
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
                        Update Meeting
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
                      <MapPin className="h-4 w-4 mr-1" />
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
                <Link href="/people/new">
                  <Users className="h-4 w-4 mr-2" />
                  Add Contact
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function EditMeetingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <EditMeetingPageContent />
    </Suspense>
  )
}