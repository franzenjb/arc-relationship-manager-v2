'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { OrganizationService } from '@/lib/organizations'
import { Organization, SearchFilters } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SimpleFilters } from '@/components/ui/simple-filters'
import { Building2, Plus, MapPin, Globe, Phone, Search, Grid3X3, List, Filter, ChevronUp, ChevronDown } from 'lucide-react'

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setIsLoading(true)
        const data = await OrganizationService.getAll(filters)
        setOrganizations(data)
        setFilteredOrganizations(data)
      } catch (error: any) {
        setError(error.message || 'Failed to load organizations')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrganizations()
  }, [filters])

  // Filter organizations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrganizations(organizations)
    } else {
      const filtered = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.mission_area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.organization_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.state?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredOrganizations(filtered)
    }
  }, [searchQuery, organizations])

  // Sort organizations
  useEffect(() => {
    if (!sortField) return

    const sorted = [...filteredOrganizations].sort((a, b) => {
      let aValue = ''
      let bValue = ''

      switch (sortField) {
        case 'name':
          aValue = a.name || ''
          bValue = b.name || ''
          break
        case 'type':
          aValue = a.organization_type || ''
          bValue = b.organization_type || ''
          break
        case 'location':
          aValue = `${a.city || ''}, ${a.state || ''}`
          bValue = `${b.city || ''}, ${b.state || ''}`
          break
        case 'status':
          aValue = a.status || ''
          bValue = b.status || ''
          break
        case 'people':
          aValue = (a.people?.length || 0).toString()
          bValue = (b.people?.length || 0).toString()
          break
        default:
          return 0
      }

      if (sortField === 'people') {
        const aNum = parseInt(aValue)
        const bNum = parseInt(bValue)
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
      }

      const comparison = aValue.localeCompare(bValue)
      return sortDirection === 'asc' ? comparison : -comparison
    })

    setFilteredOrganizations(sorted)
  }, [sortField, sortDirection])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
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
    <>
      <SimpleFilters
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        context="organizations"
      />
      
      <div className={`space-y-6 transition-all duration-200 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600">Manage partner organizations and stakeholders</p>
        </div>
        <Button asChild>
          <Link href="/organizations/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Link>
        </Button>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search organizations..."
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
            {filteredOrganizations.length} of {organizations.length} organizations
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Organizations Display */}
      {filteredOrganizations.length === 0 && searchQuery ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms.</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : organizations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first partner organization.</p>
            <Button asChild>
              <Link href="/organizations/new">
                <Plus className="h-4 w-4 mr-2" />
                Add First Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="truncate">{org.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    org.status === 'active' ? 'bg-green-100 text-green-800' :
                    org.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {org.status}
                  </span>
                </CardTitle>
                {org.mission_area && (
                  <p className="text-sm text-gray-500 capitalize">
                    {org.mission_area.replace('_', ' ')}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(org.address || org.city || org.state) && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        {org.address && <div className="truncate">{org.address}</div>}
                        {(org.city || org.state || org.zip) && (
                          <div className="truncate">
                            {[org.city, org.state, org.zip].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {org.county && (
                    <div className="flex items-start text-xs text-red-600">
                      <Building2 className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{org.county.region}</div>
                        <div className="truncate">{org.county.chapter}</div>
                        <div className="truncate">{org.county.county} County, {org.county.state}</div>
                      </div>
                    </div>
                  )}
                  {org.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2" />
                      <span className="truncate">{org.website}</span>
                    </div>
                  )}
                  {org.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{org.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-4 text-xs text-gray-500">
                    <span>{org.people?.length || 0} people</span>
                    <span>{org.meetings?.length || 0} meetings</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/organizations/${org.id}`}>
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
                        onClick={() => handleSort('name')}
                      >
                        <span>Organization</span>
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('type')}
                      >
                        <span>Type</span>
                        {sortField === 'type' && (
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Red Cross Assignment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('status')}
                      >
                        <span>Status</span>
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('people')}
                      >
                        <span>People</span>
                        {sortField === 'people' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{org.name}</div>
                          {org.mission_area && (
                            <div className="text-sm text-gray-500 capitalize">
                              {org.mission_area.replace('_', ' ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 capitalize">
                        {org.organization_type?.replace('_', ' ') || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {org.city && org.state ? `${org.city}, ${org.state}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-xs text-red-600">
                        {org.county ? (
                          <div className="space-y-0.5">
                            <div className="font-medium">{org.county.region}</div>
                            <div>{org.county.chapter}</div>
                            <div>{org.county.county} County, {org.county.state}</div>
                          </div>
                        ) : (
                          <div className="text-gray-400 italic">Not assigned</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {org.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {org.phone}
                            </div>
                          )}
                          {org.website && (
                            <div className="flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-32">
                                {org.website.replace('https://', '').replace('http://', '')}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          org.status === 'active' ? 'bg-green-100 text-green-800' :
                          org.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          <div>{org.people?.length || 0} contacts</div>
                          <div className="text-gray-500">{org.meetings?.length || 0} meetings</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/organizations/${org.id}`}>
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
    </>
  )
}