'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MeetingService } from '@/lib/meetings'
import { Meeting } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Calendar, Plus, MapPin, Building2, Clock, AlertCircle, Search, Grid3X3, List, ChevronUp, ChevronDown } from 'lucide-react'

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [followUps, setFollowUps] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meetingsData, followUpsData] = await Promise.all([
          MeetingService.getAll(),
          MeetingService.getFollowUps()
        ])
        setMeetings(meetingsData)
        setFilteredMeetings(meetingsData)
        setFollowUps(followUpsData)
      } catch (error: any) {
        setError(error.message || 'Failed to load meetings')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter meetings based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMeetings(meetings)
    } else {
      const filtered = meetings.filter(meeting =>
        meeting.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        new Date(meeting.date).toLocaleDateString().toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredMeetings(filtered)
    }
  }, [searchQuery, meetings])

  // Sort meetings
  useEffect(() => {
    if (!sortField) return

    const sorted = [...filteredMeetings].sort((a, b) => {
      let aValue = ''
      let bValue = ''

      switch (sortField) {
        case 'date':
          return sortDirection === 'asc' 
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'organization':
          aValue = a.organization?.name || ''
          bValue = b.organization?.name || ''
          break
        case 'location':
          aValue = a.location || ''
          bValue = b.location || ''
          break
        case 'attendees':
          aValue = (a.attendees?.length || 0).toString()
          bValue = (b.attendees?.length || 0).toString()
          break
        case 'followup':
          if (!a.follow_up_date && !b.follow_up_date) return 0
          if (!a.follow_up_date) return 1
          if (!b.follow_up_date) return -1
          return sortDirection === 'asc'
            ? new Date(a.follow_up_date).getTime() - new Date(b.follow_up_date).getTime()
            : new Date(b.follow_up_date).getTime() - new Date(a.follow_up_date).getTime()
        default:
          return 0
      }

      if (sortField === 'attendees') {
        const aNum = parseInt(aValue)
        const bNum = parseInt(bValue)
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
      }

      const comparison = aValue.localeCompare(bValue)
      return sortDirection === 'asc' ? comparison : -comparison
    })

    setFilteredMeetings(sorted)
  }, [sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interactions</h1>
          <p className="text-gray-600">Track interactions and follow-up actions</p>
        </div>
        <Button asChild>
          <Link href="/meetings/new">
            <Plus className="h-4 w-4 mr-2" />
            Log Interaction
          </Link>
        </Button>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search interactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            {filteredMeetings.length} of {meetings.length} interactions
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Follow-ups Alert */}
      {followUps.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertCircle className="h-5 w-5 mr-2" />
              Follow-ups Due ({followUps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {followUps.slice(0, 3).map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{meeting.organization?.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isOverdue(meeting.follow_up_date!) ? "destructive" : "secondary"}>
                      {formatDate(meeting.follow_up_date!)}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/meetings/${meeting.id}`}>Review</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {followUps.length > 3 && (
                <p className="text-sm text-orange-600">...and {followUps.length - 3} more</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meetings Display */}
      {filteredMeetings.length === 0 && searchQuery ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms.</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : meetings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your relationship interactions and coordination sessions.</p>
            <Button asChild>
              <Link href="/meetings/new">
                <Plus className="h-4 w-4 mr-2" />
                Log First Interaction
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="text-sm font-medium">
                      {formatDate(meeting.date)}
                    </span>
                  </div>
                  {meeting.follow_up_date && (
                    <Badge variant={isOverdue(meeting.follow_up_date) ? "destructive" : "secondary"} className="text-xs">
                      Follow-up Due
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {meeting.organization && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="truncate">{meeting.organization.name}</span>
                    </div>
                  )}
                  {meeting.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{meeting.location}</span>
                    </div>
                  )}
                  {meeting.follow_up_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Follow-up: {formatDate(meeting.follow_up_date)}</span>
                    </div>
                  )}
                  {meeting.summary && (
                    <p className="text-sm text-gray-700 line-clamp-2 mt-2">
                      {meeting.summary}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {meeting.attendees?.length || 0} attendees
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/meetings/${meeting.id}`}>
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('date')}
                      >
                        <span>Date</span>
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('organization')}
                      >
                        <span>Organization</span>
                        {sortField === 'organization' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('location')}
                      >
                        <span>Location</span>
                        {sortField === 'location' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Summary</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('followup')}
                      >
                        <span>Follow-up</span>
                        {sortField === 'followup' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('attendees')}
                      >
                        <span>Attendees</span>
                        {sortField === 'attendees' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.map((meeting) => (
                    <tr key={meeting.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <div className="font-medium text-gray-900">
                            {formatDate(meeting.date)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {meeting.organization?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {meeting.location || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="max-w-48 truncate">
                          {meeting.summary || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {meeting.follow_up_date ? (
                          <Badge variant={isOverdue(meeting.follow_up_date) ? "destructive" : "secondary"} className="text-xs">
                            {formatDate(meeting.follow_up_date)}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {meeting.attendees?.length || 0} people
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/meetings/${meeting.id}`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}