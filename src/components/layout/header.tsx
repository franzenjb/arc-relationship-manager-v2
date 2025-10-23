'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Menu, X, LogOut, User, ChevronDown, Wrench } from 'lucide-react'
import Image from 'next/image'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  
  // ALWAYS LOGGED IN - NO LOGOUT
  const user = {
    id: 'demo-user',
    email: 'jeff.franzen2@redcross.org',
    profile: {
      id: 'demo-profile',
      email: 'jeff.franzen2@redcross.org',
      first_name: 'Jeff',
      last_name: 'Franzen',
      role: 'chapter_user',
      notifications_enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
  
  const isLoading = false
  const signOut = async () => {
    // Do nothing - no logout in demo
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const coreNavigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Organizations', href: '/organizations' },
    { name: 'People', href: '/people' },
    { name: 'Interactions', href: '/meetings' },
  ]

  const toolsNavigation = [
    { name: 'Map', href: '/map' },
    { name: 'Search', href: '/search' },
    { name: 'Activity', href: '/activity' },
    { name: 'Tech Stack', href: '/tech-stack' },
  ]

  const adminNavigation = [
    { name: 'Administration', href: '/admin' },
  ]

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8">
                <Image 
                  src="/red-cross-logo.svg" 
                  alt="American Red Cross" 
                  width={32} 
                  height={32}
                  className="w-full h-full"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Relationship Manager
                </h1>
                <p className="text-xs text-gray-500">American Red Cross</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-8">
              {coreNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-600 hover:text-red-600 px-3 py-2 text-sm font-medium">
                    <Wrench className="h-4 w-4 mr-1" />
                    Tools
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-white border border-gray-200 shadow-lg">
                  {toolsNavigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {user?.profile?.role === 'national_admin' && (
                    <>
                      <DropdownMenuItem disabled className="px-3 py-1.5">
                        <div className="h-px bg-gray-200 w-full"></div>
                      </DropdownMenuItem>
                      {adminNavigation.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link href={item.href} className="cursor-pointer text-red-600">
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>

                {/* User Profile */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.profile?.first_name && user.profile?.last_name 
                        ? `${user.profile.first_name} ${user.profile.last_name}`
                        : user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Relationship Manager
                    </p>
                  </div>
                </div>

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {/* Core Navigation */}
              {coreNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Tools Section */}
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tools</p>
              </div>
              {toolsNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-6 py-2 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-md text-sm font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Admin Section */}
              {user?.profile?.role === 'national_admin' && (
                <>
                  <div className="px-3 py-2 mt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</p>
                  </div>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="block px-6 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user.profile?.first_name && user.profile?.last_name 
                      ? `${user.profile.first_name} ${user.profile.last_name}`
                      : user.email}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Relationship Manager
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 mt-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}