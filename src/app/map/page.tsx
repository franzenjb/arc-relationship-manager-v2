'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { OrganizationService } from '@/lib/organizations'
import { PersonService } from '@/lib/people'
import { Organization, Person } from '@/lib/types'
import { getUserRegion, REGIONS } from '@/config/regions'
import { getFiltersForRegion } from '@/config/regionMapConfig'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Building2, 
  Filter, 
  Search,
  ArrowLeft,
  Globe,
  Phone,
  ExternalLink,
  X,
  Settings,
  Users,
  Eye
} from 'lucide-react'
import LeafletMapSimple from '@/components/LeafletMapSimple'

function MapPageContent() {
  const searchParams = useSearchParams()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [mapDisplayMode, setMapDisplayMode] = useState<'organizations' | 'people' | 'both'>('organizations')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'prospect'>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterRegion, setFilterRegion] = useState<string>('all')
  const [filterChapter, setFilterChapter] = useState<string>('all')
  const [filterCounty, setFilterCounty] = useState<string>('all')
  const [filterCity, setFilterCity] = useState<string>('all')
  
  // Get user's region for dynamic title
  const userRegion = getUserRegion()
  const regionConfig = userRegion ? REGIONS[userRegion as keyof typeof REGIONS] : null
  const regionName = regionConfig?.name || 'All'
  
  // UI State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false)

  // Get organization ID from URL params if specified
  const highlightOrgId = searchParams.get('orgId')

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user's region to pass to services
        const currentUserRegion = getUserRegion()
        
        // Load organizations - filtered by region
        const orgData = await OrganizationService.getAll(undefined, currentUserRegion)
        setOrganizations(orgData)
        setFilteredOrgs(orgData)
        
        // Load people - filtered by region
        const peopleData = await PersonService.getAll(undefined, currentUserRegion)
        setPeople(peopleData)
        setFilteredPeople(peopleData)
        
        // If orgId specified in URL, select that organization
        if (highlightOrgId) {
          const highlightOrg = orgData.find(org => org.id === highlightOrgId)
          if (highlightOrg) {
            setSelectedOrg(highlightOrg)
          }
        }
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [highlightOrgId])

  // Filter organizations based on search and filters
  useEffect(() => {
    let filtered = organizations

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.mission_area?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(org => org.status === filterStatus)
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(org => org.organization_type === filterType)
    }

    // Region filter - using actual Red Cross hierarchy
    if (filterRegion !== 'all') {
      filtered = filtered.filter(org => {
        if (!org.county?.region) return false
        return org.county.region.toLowerCase().includes(filterRegion.toLowerCase().replace(/_/g, ' '))
      })
    }

    // Chapter filter - using actual Red Cross hierarchy
    if (filterChapter !== 'all') {
      filtered = filtered.filter(org => {
        if (!org.county?.chapter) return false
        return org.county.chapter.toLowerCase().includes(filterChapter.toLowerCase().replace(/_/g, ' '))
      })
    }

    // County filter - using actual county assignments!
    if (filterCounty !== 'all') {
      filtered = filtered.filter(org => {
        if (!org.county?.county) return false
        return org.county.county.toLowerCase().includes(filterCounty.toLowerCase().replace(/_/g, ' '))
      })
    }

    // City filter
    if (filterCity !== 'all') {
      filtered = filtered.filter(org => 
        org.city?.toLowerCase() === filterCity.toLowerCase()
      )
    }

    setFilteredOrgs(filtered)

    // Apply same filters to people based on their organization
    const filteredOrgIds = new Set(filtered.map(org => org.id))
    let filteredPeopleList = people.filter(person => filteredOrgIds.has(person.org_id))

    // Additional people-specific search
    if (searchQuery) {
      filteredPeopleList = filteredPeopleList.filter(person =>
        person.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredPeople(filteredPeopleList)
  }, [organizations, people, searchQuery, filterStatus, filterType, filterRegion, filterChapter, filterCounty, filterCity])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
          <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    )
  }

  const uniqueTypes = [...new Set(organizations.map(org => org.organization_type).filter(Boolean))]
  const uniqueCities = [...new Set(organizations.map(org => org.city).filter(Boolean))].sort()
  
  // Get region-specific filters
  const regionFilters = getFiltersForRegion()
  const regionRegions = regionFilters.regions
  const regionChapters = regionFilters.chapters  
  const regionCounties = regionFilters.counties

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{regionName} Organizations Map</h1>
            <p className="text-gray-600">
              Showing {filteredOrgs.length} of {organizations.length} organizations
            </p>
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
        {/* Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[800px] w-full">
                <LeafletMapSimple 
                organizations={filteredOrgs}
                people={filteredPeople}
                selectedOrg={selectedOrg}
                onSelectOrg={setSelectedOrg}
                displayMode={mapDisplayMode}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Click markers to view details. 
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>Organizations
                  <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>People  
                  <span className="w-2 h-2 bg-purple-500 rounded-full ml-2"></span>Mixed
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Organization Details / List */}
        <div className="space-y-4">
          {/* Filters Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setFilterStatus('all')
                    setFilterType('all')
                    setFilterRegion('all')
                    setFilterChapter('all')
                    setFilterCounty('all')
                    setFilterCity('all')
                    setMapDisplayMode('organizations')
                    setSelectedOrg(null)
                  }}
                  className="text-xs"
                >
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Map Display Mode Toggle */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">View Mode</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setMapDisplayMode('organizations')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      mapDisplayMode === 'organizations' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Organizations
                  </button>
                  <button
                    onClick={() => setMapDisplayMode('people')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      mapDisplayMode === 'people' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    People
                  </button>
                  <button
                    onClick={() => setMapDisplayMode('both')}
                    className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                      mapDisplayMode === 'both' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Both
                  </button>
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'prospect')}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Regions</option>
                  {regionRegions.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chapter</label>
                <select
                  value={filterChapter}
                  onChange={(e) => setFilterChapter(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Chapters</option>
                  {regionChapters.map((chapter) => (
                    <option key={chapter.value} value={chapter.value}>
                      {chapter.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* County Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">County</label>
                <select
                  value={filterCounty}
                  onChange={(e) => setFilterCounty(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Counties</option>
                  {regionCounties.map((county) => (
                    <option key={county.value} value={county.value}>
                      {county.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">All Cities</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Organization Details / List */}
          {selectedOrg ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{selectedOrg.name}</span>
                  <Badge variant={selectedOrg.status === 'active' ? 'default' : 'secondary'}>
                    {selectedOrg.status}
                  </Badge>
                </CardTitle>
                {selectedOrg.mission_area && (
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedOrg.mission_area.replace('_', ' ')}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location */}
                {selectedOrg.city && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        {selectedOrg.address && (
                          <>
                            {selectedOrg.address}<br />
                          </>
                        )}
                        {selectedOrg.city}, {selectedOrg.state} {selectedOrg.zip}
                      </p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {selectedOrg.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <a 
                      href={selectedOrg.website.startsWith('http') ? selectedOrg.website : `https://${selectedOrg.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {selectedOrg.website}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                )}

                {/* Phone */}
                {selectedOrg.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${selectedOrg.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                      {selectedOrg.phone}
                    </a>
                  </div>
                )}

                {/* Stats */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{selectedOrg.people?.length || 0}</p>
                      <p className="text-xs text-gray-500">People</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{selectedOrg.meetings?.length || 0}</p>
                      <p className="text-xs text-gray-500">Meetings</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full" asChild>
                    <Link href={`/organizations/${selectedOrg.id}`}>
                      <Building2 className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Organizations List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredOrgs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No organizations found matching your filters.
                    </p>
                  ) : (
                    filteredOrgs.map((org) => (
                      <div
                        key={org.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedOrg(org)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{org.name}</p>
                            {org.city && (
                              <p className="text-xs text-gray-500">{org.city}, {org.state}</p>
                            )}
                          </div>
                          <Badge 
                            variant={org.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {org.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {filteredOrgs.length > 0 && (
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Click on an organization to view details
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <MapPageContent />
    </Suspense>
  )
}