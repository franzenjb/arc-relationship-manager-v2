'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Search, Menu, X, LogOut, MapPin } from 'lucide-react'
import Image from 'next/image'
import { getUserRegion, clearUserRegion } from '@/lib/auth'
import { REGIONS } from '@/config/regions'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentRegion, setCurrentRegion] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const region = getUserRegion()
    setCurrentRegion(region)
  }, [])

  const coreNavigation = [
    { name: 'Dashboard', href: '/', active: true },
    { name: 'Organizations', href: '/organizations', active: true },
    { name: 'People', href: '/people', active: true },
    { name: 'Meetings', href: '/meetings', active: true },
    { name: 'Map', href: '/map', active: true },
    { name: 'Activity', href: '/activity', active: true },
    { name: 'Tech Stack', href: '/tech-stack', active: true }
  ]

  const handleLogout = () => {
    clearUserRegion()
    router.push('/login')
  }

  const getRegionDisplay = () => {
    if (!currentRegion) return null
    const regionConfig = REGIONS[currentRegion as keyof typeof REGIONS]
    return regionConfig?.name || currentRegion
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/login" className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                ARC
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Relationship Manager
                </div>
                <div className="text-xs text-gray-500">American Red Cross</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {coreNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Region Indicator */}
            {currentRegion && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 text-red-700 rounded-md">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{getRegionDisplay()}</span>
              </div>
            )}
            
            {/* Logout Button */}
            {currentRegion && (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            {coreNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Region & Logout */}
            {currentRegion && (
              <>
                <div className="mx-3 my-2 px-3 py-1 bg-red-50 text-red-700 rounded-md flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">{getRegionDisplay()}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </div>
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}