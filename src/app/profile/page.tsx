'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  User, 
  Mail, 
  Shield, 
  Building2, 
  ArrowLeft,
  Save,
  Bell,
  Globe,
  Users
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  role: 'national_admin' | 'regional_lead' | 'chapter_user' | 'read_only'
  region_id?: string
  chapter_id?: string
  first_name?: string
  last_name?: string
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    notifications_enabled: true
  })
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    // For now, set mock profile data since we don't have full auth system
    const mockProfile: UserProfile = {
      id: 'temp-user',
      email: 'jeff.franzen2@redcross.org',
      role: 'chapter_user',
      first_name: 'Jeff',
      last_name: 'Franzen',
      notifications_enabled: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    setProfile(mockProfile)
    setFormData({
      first_name: mockProfile.first_name || '',
      last_name: mockProfile.last_name || '',
      email: mockProfile.email,
      notifications_enabled: mockProfile.notifications_enabled
    })
    setIsLoading(false)
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update the profile state
      if (profile) {
        const updatedProfile = {
          ...profile,
          ...formData,
          updated_at: new Date().toISOString()
        }
        setProfile(updatedProfile)
        setSuccessMessage('Profile updated successfully!')
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate passwords
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match')
      return
    }
    
    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    setIsSaving(true)
    
    try {
      // For now, just simulate password change
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccessMessage('Password changed successfully!')
      setShowPasswordForm(false)
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to change password')
    } finally {
      setIsSaving(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'national_admin':
        return 'National Administrator'
      case 'regional_lead':
        return 'Regional Lead'
      case 'chapter_user':
        return 'Chapter User'
      case 'read_only':
        return 'Read Only'
      default:
        return role
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'national_admin':
        return Globe
      case 'regional_lead':
        return Building2
      case 'chapter_user':
        return Users
      case 'read_only':
        return Shield
      default:
        return User
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'national_admin':
        return 'text-purple-600 bg-purple-100'
      case 'regional_lead':
        return 'text-blue-600 bg-blue-100'
      case 'chapter_user':
        return 'text-green-600 bg-green-100'
      case 'read_only':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
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

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-500">Unable to load your profile information.</p>
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
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10"
                      disabled
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Contact your administrator to change your email address.
                  </p>
                </div>

                {/* Notifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferences
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.notifications_enabled}
                        onChange={(e) => handleInputChange('notifications_enabled', e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Enable email notifications</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" asChild>
                    <Link href="/">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Save className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Password Change Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Change Password
                </div>
                {!showPasswordForm && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Change Password
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            {showPasswordForm && (
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                      placeholder="Enter your current password"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                      placeholder="Enter new password (min 8 characters)"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordData({
                          current_password: '',
                          new_password: '',
                          confirm_password: ''
                        })
                        setError('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profile.role)}`}>
                  {React.createElement(getRoleIcon(profile.role), { className: "h-4 w-4 mr-1" })}
                  {getRoleDisplayName(profile.role)}
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-sm font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm font-medium">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Notifications Status */}
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Bell className={`h-4 w-4 ${profile.notifications_enabled ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm text-gray-600">
                    Notifications {profile.notifications_enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/organizations">
                  <Building2 className="h-4 w-4 mr-2" />
                  View Organizations
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/meetings">
                  <Building2 className="h-4 w-4 mr-2" />
                  View Meetings
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/activity">
                  <Building2 className="h-4 w-4 mr-2" />
                  Activity Feed
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}