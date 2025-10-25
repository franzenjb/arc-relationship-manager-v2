'use client'

import { useEffect, useState } from 'react'
import { ActivityService, ActivityItem } from '@/lib/activity'
import { OrganizationService } from '@/lib/organizations'
import { Organization } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Activity, RefreshCw, ExternalLink, Filter, Search } from 'lucide-react'
import Link from 'next/link'

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const ITEMS_PER_PAGE = 20
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterOrganization, setFilterOrganization] = useState<string>('all')
  const [filterDateRange, setFilterDateRange] = useState<string>('all')

  useEffect(() => {
    loadActivities()
    loadOrganizations()
  }, [])

  const loadActivities = async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
      setOffset(0)
    }
    
    try {
      const activity = await ActivityService.getRecentActivity(ITEMS_PER_PAGE, loadMore ? offset : 0)
      
      if (loadMore) {
        setActivities(prev => [...prev, ...activity])
      } else {
        setActivities(activity)
      }
      
      setHasMore(activity.length === ITEMS_PER_PAGE)
      
      if (loadMore) {
        setOffset(prev => prev + ITEMS_PER_PAGE)
      } else {
        setOffset(ITEMS_PER_PAGE)
      }
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }
  
  const loadMoreActivities = () => {
    if (!isLoadingMore && hasMore) {
      loadActivities(true)
    }
  }

  const loadOrganizations = async () => {
    try {
      const data = await OrganizationService.getAll()
      setOrganizations(data)
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  // Filter activities based on current filter state
  useEffect(() => {
    let filtered = [...activities]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.organization_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(activity => activity.type === filterType)
    }

    // Organization filter
    if (filterOrganization !== 'all') {
      filtered = filtered.filter(activity => activity.organization_id === filterOrganization)
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filterDateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(activity => new Date(activity.timestamp) >= filterDate)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(activity => new Date(activity.timestamp) >= filterDate)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(activity => new Date(activity.timestamp) >= filterDate)
          break
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3)
          filtered = filtered.filter(activity => new Date(activity.timestamp) >= filterDate)
          break
      }
    }

    setFilteredActivities(filtered)
  }, [activities, searchQuery, filterType, filterOrganization, filterDateRange])

  const refreshActivities = () => {
    loadActivities()
  }

  const getNavigationPath = (activity: ActivityItem): string | null => {
    switch (activity.type) {
      case 'organization_added':
        return activity.organization_id ? `/organizations/${activity.organization_id}` : null
      case 'person_added':
        return activity.person_id ? `/people/${activity.person_id}` : null
      case 'meeting_scheduled':
      case 'meeting_completed':
        return activity.meeting_id ? `/meetings/${activity.meeting_id}` : null
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
            <p className="text-gray-600">All system activity and updates</p>
          </div>
        </div>
        <Button onClick={refreshActivities} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="organization_added">Organizations Added</option>
                <option value="person_added">Contacts Added</option>
                <option value="meeting_scheduled">Meetings Scheduled</option>
                <option value="meeting_completed">Meetings Completed</option>
              </select>
            </div>

            {/* Organization Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <select
                value={filterOrganization}
                onChange={(e) => setFilterOrganization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
              </select>
            </div>
          </div>
          
          {/* Reset Button */}
          <div className="flex justify-end mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('')
                setFilterType('all')
                setFilterOrganization('all')
                setFilterDateRange('all')
              }}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Reset Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-red-600" />
            Recent Activity ({filteredActivities.length} of {activities.length} items)
          </CardTitle>
          <CardDescription>
            Comprehensive activity log for your partnerships
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredActivities.length > 0 ? (
            <div className="space-y-6">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  {/* Timeline line */}
                  {index < filteredActivities.length - 1 && (
                    <div className="absolute left-6 top-8 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`w-6 h-6 ${activity.icon_color} rounded-full mt-1 flex-shrink-0 flex items-center justify-center relative z-10`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-base font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-4 mt-3">
                            <p className="text-xs text-gray-500">
                              {ActivityService.formatTimeAgo(activity.timestamp)}
                            </p>
                            {activity.organization_name && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {activity.organization_name}
                              </span>
                            )}
                            {activity.meeting_date && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {new Date(activity.meeting_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* View Button and Timestamp */}
                        <div className="flex items-center space-x-2 ml-4">
                          {getNavigationPath(activity) && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={getNavigationPath(activity)!}>
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-500">Activity will appear here as you use the system.</p>
            </div>
          )}
          
          {/* Load More Button */}
          {filteredActivities.length > 0 && hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMoreActivities}
                disabled={isLoadingMore}
                variant="outline"
                className="min-w-[200px]"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Activities
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm text-gray-600">Organizations Added</p>
                <p className="text-lg font-semibold">
                  {activities.filter(a => a.type === 'organization_added').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm text-gray-600">Contacts Added</p>
                <p className="text-lg font-semibold">
                  {activities.filter(a => a.type === 'person_added').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm text-gray-600">Meetings Scheduled</p>
                <p className="text-lg font-semibold">
                  {activities.filter(a => a.type === 'meeting_scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm text-gray-600">Meetings Completed</p>
                <p className="text-lg font-semibold">
                  {activities.filter(a => a.type === 'meeting_completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}