'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OrganizationService } from '@/lib/organizations'
import { ActivityService, ActivityItem } from '@/lib/activity'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Building2, Calendar, TrendingUp, Activity, MapPin, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total_organizations: 0,
    total_people: 0,
    total_meetings: 0,
    recent_activities: 0
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const router = useRouter()

  useEffect(() => {
    // ALWAYS LOGGED IN
    setUser({
      id: 'temp-user',
      email: 'jeff.franzen2@redcross.org',
      profile: {
        id: 'temp-profile',
        email: 'jeff.franzen2@redcross.org',
        first_name: 'Jeff',
        last_name: 'Franzen',
        role: 'chapter_user',
        notifications_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
    
    // Load real statistics and activity from database
    Promise.all([
      loadDashboardStats(),
      loadRecentActivity()
    ]).then(() => {
      setIsLoading(false)
    })
  }, [router])

  const loadDashboardStats = async () => {
    try {
      console.log('🔄 Loading dashboard stats...')
      const dashboardStats = await OrganizationService.getDashboardStats()
      console.log('📊 Received stats:', dashboardStats)
      setStats(dashboardStats)
      console.log('✅ Stats updated in React state')
    } catch (error) {
      console.error('❌ Error loading dashboard stats:', error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      console.log('🔄 Loading recent activity...')
      const activity = await ActivityService.getRecentActivity(8)
      console.log('📈 Received activity:', activity)
      setRecentActivity(activity)
      console.log('✅ Activity updated in React state')
    } catch (error) {
      console.error('❌ Error loading recent activity:', error)
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  // Real data from database
  const dashboardCards = [
    {
      title: "Total Organizations",
      value: stats.total_organizations.toString(),
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "Florida partnerships"
    },
    {
      title: "People",
      value: stats.total_people.toString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "Key contacts"
    },
    {
      title: "Interactions",
      value: stats.total_meetings.toString(),
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "Coordination sessions"
    },
    {
      title: "Follow-ups Due",
      value: "5",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "Action items"
    }
  ]

  const quickActions = [
    {
      title: "Add Organization",
      description: "Register a new partner organization",
      href: "/organizations/new",
      icon: Building2,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Log Interaction",
      description: "Record a new interaction or contact",
      href: "/meetings/new",
      icon: Calendar,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Search Contacts",
      description: "Find organizations and people",
      href: "/search",
      icon: Users,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "View Map",
      description: "See organizations by location",
      href: "/map",
      icon: MapPin,
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ]


  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.profile?.first_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening in your region today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${stat.bgColor} mr-4`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions - 1/3 width */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-red-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to help you manage relationships efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start text-left"
                      asChild
                    >
                      <Link href={action.href}>
                        <div className="flex items-center w-full mb-2">
                          <Icon className="h-5 w-5 mr-2 text-gray-600" />
                          <span className="font-semibold text-gray-900">{action.title}</span>
                        </div>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates in your region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4">
                      <div className={`w-3 h-3 ${activity.icon_color} rounded-full mt-2 flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs text-gray-400">
                            {ActivityService.formatTimeAgo(activity.timestamp)}
                          </p>
                          {activity.organization_name && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {activity.organization_name}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* View Button */}
                      <div className="flex-shrink-0">
                        {getNavigationPath(activity) && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={getNavigationPath(activity)!}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
              <Button variant="ghost" className="w-full mt-6" asChild>
                <Link href="/activity">View all activity</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Setup Notice for New Users */}
      {user.profile?.role === 'chapter_user' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Complete Your Setup</CardTitle>
            <CardDescription className="text-amber-700">
              To get the most out of the system, make sure your profile and region are configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/profile">Update Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Project Status Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Project Status</CardTitle>
          <CardDescription>
            Check deployment status and launch the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" asChild className="flex-1">
              <Link 
                href="https://vercel.com/jbf-2539-e1ec6bfb/arc-relationship-manager" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                → VIEW DEPLOY ←
              </Link>
            </Button>
            <Button asChild className="flex-1 bg-red-600 hover:bg-red-700">
              <Link 
                href="https://arc-relationship-manager.vercel.app/" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                → LAUNCH APP ←
              </Link>
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Check if deployment is live (green ✓ = ready) before launching
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
