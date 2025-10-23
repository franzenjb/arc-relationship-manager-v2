import { supabase } from './supabase'

export interface ActivityItem {
  id: string
  type: 'organization_added' | 'meeting_scheduled' | 'person_added' | 'meeting_completed'
  title: string
  description: string
  timestamp: string
  organization_name?: string
  person_name?: string
  meeting_date?: string
  icon_color: string
  organization_id?: string
  person_id?: string
  meeting_id?: string
}

export class ActivityService {
  static async getRecentActivity(limit: number = 10, offset: number = 0): Promise<ActivityItem[]> {
    const activities: ActivityItem[] = []

    try {
      // Calculate how many items to fetch from each category
      // We'll fetch more than needed and then trim to limit after sorting
      const itemsPerCategory = Math.ceil((limit + offset) / 3) + 5
      
      // Get recent organizations
      const { data: recentOrgs } = await supabase
        .from('organizations')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(itemsPerCategory)

      // Get recent people
      const { data: recentPeople } = await supabase
        .from('people')
        .select('id, first_name, last_name, created_at, organizations(name)')
        .order('created_at', { ascending: false })
        .limit(itemsPerCategory)

      // Get recent meetings
      const { data: recentMeetings } = await supabase
        .from('meetings')
        .select('id, date, location, summary, created_at, organizations(name)')
        .order('created_at', { ascending: false })
        .limit(itemsPerCategory)

      // Convert organizations to activity items
      recentOrgs?.forEach(org => {
        activities.push({
          id: `org-${org.id}`,
          type: 'organization_added',
          title: 'New organization added',
          description: org.name,
          timestamp: org.created_at,
          organization_name: org.name,
          organization_id: org.id,
          icon_color: 'bg-green-500'
        })
      })

      // Convert people to activity items  
      recentPeople?.forEach(person => {
        activities.push({
          id: `person-${person.id}`,
          type: 'person_added',
          title: 'New contact added',
          description: `${person.first_name} ${person.last_name} at ${(person.organizations as any)?.name || 'Unknown org'}`,
          timestamp: person.created_at,
          person_name: `${person.first_name} ${person.last_name}`,
          person_id: person.id,
          organization_name: (person.organizations as any)?.name,
          icon_color: 'bg-blue-500'
        })
      })

      // Convert meetings to activity items
      recentMeetings?.forEach(meeting => {
        const isUpcoming = new Date(meeting.date) > new Date()
        activities.push({
          id: `meeting-${meeting.id}`,
          type: isUpcoming ? 'meeting_scheduled' : 'meeting_completed',
          title: isUpcoming ? 'Meeting scheduled' : 'Meeting completed',
          description: `${meeting.location} - ${(meeting.organizations as any)?.name}`,
          timestamp: meeting.created_at,
          meeting_date: meeting.date,
          meeting_id: meeting.id,
          organization_name: (meeting.organizations as any)?.name,
          icon_color: isUpcoming ? 'bg-purple-500' : 'bg-gray-500'
        })
      })

      // Sort by timestamp (most recent first) and apply pagination
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      // Apply offset and limit
      return sortedActivities.slice(offset, offset + limit)

    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  static formatTimeAgo(timestamp: string): string {
    const now = new Date()
    const past = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60))
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
    }
  }
}