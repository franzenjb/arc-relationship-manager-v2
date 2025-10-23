'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { OrganizationService } from '@/lib/organizations'
import { PersonService } from '@/lib/people'
import { Organization, Person } from '@/lib/types'
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
  
  // UI State
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false)

  // Get organization ID from URL params if specified
  const highlightOrgId = searchParams.get('orgId')

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load organizations
        const orgData = await OrganizationService.getAll()
        const floridaOrgs = orgData.filter(org => 
          org.state === 'FL' || 
          org.state === 'Florida' ||
          org.address?.toLowerCase().includes('florida') ||
          org.address?.toLowerCase().includes(' fl ')
        )
        setOrganizations(floridaOrgs)
        setFilteredOrgs(floridaOrgs)
        
        // Load people
        const peopleData = await PersonService.getAll()
        // Filter people belonging to Florida organizations
        const floridaOrgIds = new Set(floridaOrgs.map(org => org.id))
        const floridaPeople = peopleData.filter(person => floridaOrgIds.has(person.org_id))
        setPeople(floridaPeople)
        setFilteredPeople(floridaPeople)
        
        // If orgId specified in URL, select that organization
        if (highlightOrgId) {
          const highlightOrg = floridaOrgs.find(org => org.id === highlightOrgId)
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

    // Region filter - using real Red Cross regions
    if (filterRegion !== 'all') {
      // Map regions to actual cities in our database (case-insensitive)
      const regionCities: Record<string, string[]> = {
        'north_and_central': [
          'jacksonville', 'tallahassee', 'gainesville', 'pensacola', 'orlando', 'tampa', 
          'st. petersburg', 'saint petersburg', 'clearwater', 'lakeland', 'ocala', 
          'sanford', 'kissimmee', 'melbourne', 'cocoa', 'titusville', 'st. augustine'
        ],
        'south': [
          'miami', 'fort lauderdale', 'west palm beach', 'palm beach', 'naples', 'fort myers',
          'cape coral', 'sarasota', 'bradenton', 'key west', 'marathon', 'port st. lucie', 
          'stuart', 'vero beach'
        ]
      }
      filtered = filtered.filter(org => {
        if (!org.city) return false
        const orgCityLower = org.city.toLowerCase().trim()
        return regionCities[filterRegion]?.some(city => 
          orgCityLower.includes(city) || city.includes(orgCityLower)
        )
      })
    }

    // Chapter filter - using real Red Cross chapters
    if (filterChapter !== 'all') {
      const chapterCities: Record<string, string[]> = {
        'northwest_florida': ['Pensacola', 'Panama City', 'Crestview', 'Fort Walton Beach'],
        'capital_area': ['Tallahassee', 'Quincy', 'Crawfordville'],
        'north_central_florida': ['Gainesville', 'Ocala', 'Lake City', 'Live Oak'],
        'northeast_florida': ['Jacksonville', 'St. Augustine', 'Fernandina Beach'],
        'central_florida_coast': ['Orlando', 'Daytona Beach', 'Sanford', 'Kissimmee'],
        'tampa_bay': ['Tampa', 'St. Petersburg', 'Clearwater', 'Brandon', 'Pinellas Park'],
        'mid_florida': ['Lakeland', 'Sebring', 'Bartow'],
        'palm_beach_to_treasure_coast': ['West Palm Beach', 'Boca Raton', 'Stuart', 'Vero Beach'],
        'southwest_gulf_coast_to_glades': ['Fort Myers', 'Naples', 'Sarasota', 'Bradenton'],
        'broward': ['Fort Lauderdale', 'Hollywood', 'Pompano Beach', 'Sunrise'],
        'greater_miami_to_the_keys': ['Miami', 'Homestead', 'Key West', 'Coral Gables']
      }
      filtered = filtered.filter(org => 
        chapterCities[filterChapter]?.some(city => 
          org.city?.toLowerCase().includes(city.toLowerCase())
        )
      )
    }

    // County filter - this would be much better with a proper county field in the database
    if (filterCounty !== 'all') {
      // Temporary city-based mapping until county field is added
      const countyCities: Record<string, string[]> = {
        'miami_dade': ['Miami', 'Homestead', 'Coral Gables', 'Hialeah', 'Kendall'],
        'broward': ['Fort Lauderdale', 'Hollywood', 'Pompano Beach', 'Sunrise', 'Plantation'],
        'palm_beach': ['West Palm Beach', 'Boca Raton', 'Delray Beach', 'Boynton Beach'],
        'orange': ['Orlando', 'Winter Park', 'Apopka', 'Ocoee'],
        'hillsborough': ['Tampa', 'Plant City', 'Temple Terrace', 'Brandon'],
        'pinellas': ['St. Petersburg', 'Clearwater', 'Largo', 'Pinellas Park'],
        'duval': ['Jacksonville', 'Atlantic Beach', 'Neptune Beach', 'Jacksonville Beach'],
        'leon': ['Tallahassee'],
        'alachua': ['Gainesville'],
        'volusia': ['Daytona Beach', 'DeLand'],
        'brevard': ['Melbourne', 'Cocoa', 'Titusville'],
        'polk': ['Lakeland', 'Bartow'],
        'lee': ['Fort Myers', 'Cape Coral'],
        'collier': ['Naples'],
        'sarasota': ['Sarasota'],
        'manatee': ['Bradenton'],
        'monroe': ['Key West', 'Marathon'],
        'escambia': ['Pensacola'],
        'bay': ['Panama City'],
        'st_johns': ['St. Augustine'],
        'seminole': ['Sanford'],
        'osceola': ['Kissimmee'],
        'marion': ['Ocala'],
        'clay': ['Green Cove Springs'],
        'nassau': ['Fernandina Beach'],
        'flagler': ['Palm Coast'],
        'putnam': ['Palatka'],
        'st_lucie': ['Port St. Lucie'],
        'martin': ['Stuart'],
        'indian_river': ['Vero Beach']
      }
      filtered = filtered.filter(org => 
        countyCities[filterCounty]?.some(city => 
          org.city?.toLowerCase().includes(city.toLowerCase())
        )
      )
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
  
  // Real Florida Red Cross structure from CSV data
  const floridaRegions = [
    { value: 'north_and_central', label: 'North and Central' },
    { value: 'south', label: 'South' }
  ]
  
  const floridaChapters = [
    { value: 'northwest_florida', label: 'Northwest Florida' },
    { value: 'capital_area', label: 'Capital Area' },
    { value: 'north_central_florida', label: 'North Central Florida' },
    { value: 'northeast_florida', label: 'Northeast Florida' },
    { value: 'central_florida_coast', label: 'Central Florida Coast' },
    { value: 'tampa_bay', label: 'Tampa Bay' },
    { value: 'mid_florida', label: 'Mid Florida' },
    { value: 'palm_beach_to_treasure_coast', label: 'Palm Beach to Treasure Coast' },
    { value: 'southwest_gulf_coast_to_glades', label: 'Southwest Gulf Coast to Glades' },
    { value: 'broward', label: 'Broward' },
    { value: 'greater_miami_to_the_keys', label: 'Greater Miami to the Keys' }
  ]
  
  const floridaCounties = [
    { value: 'washington', label: 'Washington County' },
    { value: 'walton', label: 'Walton County' },
    { value: 'wakulla', label: 'Wakulla County' },
    { value: 'volusia', label: 'Volusia County' },
    { value: 'union', label: 'Union County' },
    { value: 'taylor', label: 'Taylor County' },
    { value: 'suwannee', label: 'Suwannee County' },
    { value: 'sumter', label: 'Sumter County' },
    { value: 'st_lucie', label: 'St. Lucie County' },
    { value: 'st_johns', label: 'St. Johns County' },
    { value: 'seminole', label: 'Seminole County' },
    { value: 'sarasota', label: 'Sarasota County' },
    { value: 'santa_rosa', label: 'Santa Rosa County' },
    { value: 'putnam', label: 'Putnam County' },
    { value: 'polk', label: 'Polk County' },
    { value: 'pinellas', label: 'Pinellas County' },
    { value: 'pasco', label: 'Pasco County' },
    { value: 'palm_beach', label: 'Palm Beach County' },
    { value: 'osceola', label: 'Osceola County' },
    { value: 'orange', label: 'Orange County' },
    { value: 'okeechobee', label: 'Okeechobee County' },
    { value: 'okaloosa', label: 'Okaloosa County' },
    { value: 'nassau', label: 'Nassau County' },
    { value: 'monroe', label: 'Monroe County' },
    { value: 'miami_dade', label: 'Miami-Dade County' },
    { value: 'martin', label: 'Martin County' },
    { value: 'marion', label: 'Marion County' },
    { value: 'manatee', label: 'Manatee County' },
    { value: 'madison', label: 'Madison County' },
    { value: 'liberty', label: 'Liberty County' },
    { value: 'levy', label: 'Levy County' },
    { value: 'leon', label: 'Leon County' },
    { value: 'lee', label: 'Lee County' },
    { value: 'lake', label: 'Lake County' },
    { value: 'lafayette', label: 'Lafayette County' },
    { value: 'jefferson', label: 'Jefferson County' },
    { value: 'jackson', label: 'Jackson County' },
    { value: 'indian_river', label: 'Indian River County' },
    { value: 'holmes', label: 'Holmes County' },
    { value: 'hillsborough', label: 'Hillsborough County' },
    { value: 'highlands', label: 'Highlands County' },
    { value: 'hernando', label: 'Hernando County' },
    { value: 'hendry', label: 'Hendry County' },
    { value: 'hardee', label: 'Hardee County' },
    { value: 'hamilton', label: 'Hamilton County' },
    { value: 'gulf', label: 'Gulf County' },
    { value: 'glades', label: 'Glades County' },
    { value: 'gilchrist', label: 'Gilchrist County' },
    { value: 'gadsden', label: 'Gadsden County' },
    { value: 'franklin', label: 'Franklin County' },
    { value: 'flagler', label: 'Flagler County' },
    { value: 'escambia', label: 'Escambia County' },
    { value: 'duval', label: 'Duval County' },
    { value: 'dixie', label: 'Dixie County' },
    { value: 'desoto', label: 'DeSoto County' },
    { value: 'columbia', label: 'Columbia County' },
    { value: 'collier', label: 'Collier County' },
    { value: 'clay', label: 'Clay County' },
    { value: 'citrus', label: 'Citrus County' },
    { value: 'charlotte', label: 'Charlotte County' },
    { value: 'calhoun', label: 'Calhoun County' },
    { value: 'broward', label: 'Broward County' },
    { value: 'brevard', label: 'Brevard County' },
    { value: 'bradford', label: 'Bradford County' },
    { value: 'bay', label: 'Bay County' },
    { value: 'baker', label: 'Baker County' },
    { value: 'alachua', label: 'Alachua County' }
  ]

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
            <h1 className="text-2xl font-bold text-gray-900">Florida Organizations Map</h1>
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
                  {floridaRegions.map((region) => (
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
                  {floridaChapters.map((chapter) => (
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
                  {floridaCounties.map((county) => (
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