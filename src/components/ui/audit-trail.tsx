'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, User } from 'lucide-react'

interface AuditTrailProps {
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  createdByUser?: UserProfile
  updatedByUser?: UserProfile
}

interface UserProfile {
  first_name?: string
  last_name?: string
  email: string
}

export function AuditTrail({ 
  createdAt, 
  updatedAt, 
  createdBy, 
  updatedBy, 
  createdByUser: propCreatedByUser, 
  updatedByUser: propUpdatedByUser 
}: AuditTrailProps) {
  const [createdByUser, setCreatedByUser] = useState<UserProfile | null>(propCreatedByUser || null)
  const [updatedByUser, setUpdatedByUser] = useState<UserProfile | null>(propUpdatedByUser || null)
  const [isLoading, setIsLoading] = useState(!propCreatedByUser && !propUpdatedByUser)

  useEffect(() => {
    // If user profiles are already provided, use them
    if (propCreatedByUser || propUpdatedByUser) {
      setCreatedByUser(propCreatedByUser || null)
      setUpdatedByUser(propUpdatedByUser || null)
      setIsLoading(false)
      return
    }

    // Otherwise, load user data from IDs
    const loadUserData = async () => {
      const userIds = [createdBy, updatedBy].filter(Boolean)
      if (userIds.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        const { data: users, error } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds)

        if (error) throw error

        const usersMap = new Map(users?.map(user => [user.id, user]) || [])
        
        if (createdBy) {
          setCreatedByUser(usersMap.get(createdBy) || null)
        }
        if (updatedBy) {
          setUpdatedByUser(usersMap.get(updatedBy) || null)
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [createdBy, updatedBy, propCreatedByUser, propUpdatedByUser])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatUserName = (user: UserProfile | null) => {
    if (!user) return 'Unknown user'
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    return user.email
  }

  if (isLoading) {
    return (
      <div className="text-xs text-gray-500 space-y-1">
        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-4 w-36 bg-gray-200 animate-pulse rounded"></div>
      </div>
    )
  }

  const wasUpdated = updatedAt !== createdAt

  return (
    <div className="text-xs text-gray-500 space-y-1">
      <div className="flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        <span>Created: {formatDate(createdAt)}</span>
        {createdByUser && (
          <>
            <span className="mx-1">by</span>
            <User className="h-3 w-3 mr-1" />
            <span className="font-medium">{formatUserName(createdByUser)}</span>
          </>
        )}
      </div>
      
      {wasUpdated && (
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated: {formatDate(updatedAt)}</span>
          {updatedByUser && (
            <>
              <span className="mx-1">by</span>
              <User className="h-3 w-3 mr-1" />
              <span className="font-medium">{formatUserName(updatedByUser)}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}