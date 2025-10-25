'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PersonService } from '@/lib/people'
import { Person, SearchFilters } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SimpleFilters } from '@/components/ui/simple-filters'
import { Users, Plus, Mail, Phone, Building2, User, Search, Grid3X3, List, ChevronUp, ChevronDown } from 'lucide-react'

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const loadPeople = async () => {
      try {
        setIsLoading(true)
        const data = await PersonService.getAll(filters)
        setPeople(data)
        setFilteredPeople(data)
      } catch (error: any) {
        setError(error.message || 'Failed to load people')
      } finally {
        setIsLoading(false)
      }
    }

    loadPeople()
  }, [filters])

  // Filter people based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPeople(people)
    } else {
      const filtered = people.filter(person =>
        person.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.organization as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPeople(filtered)
    }
  }, [searchQuery, people])

  // Sort people
  useEffect(() => {
    if (!sortField) return

    const sorted = [...filteredPeople].sort((a, b) => {
      let aValue = ''
      let bValue = ''

      switch (sortField) {
        case 'name':
          aValue = `${a.first_name || ''} ${a.last_name || ''}`
          bValue = `${b.first_name || ''} ${b.last_name || ''}`
          break
        case 'title':
          aValue = a.title || ''
          bValue = b.title || ''
          break
        case 'organization':
          aValue = (a.organization as any)?.name || ''
          bValue = (b.organization as any)?.name || ''
          break
        case 'meetings':
          aValue = (a.meetings?.length || 0).toString()
          bValue = (b.meetings?.length || 0).toString()
          break
        default:
          return 0
      }

      if (sortField === 'meetings') {
        const aNum = parseInt(aValue)
        const bNum = parseInt(bValue)
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
      }

      const comparison = aValue.localeCompare(bValue)
      return sortDirection === 'asc' ? comparison : -comparison
    })

    setFilteredPeople(sorted)
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
        context="people"
      />
      
      <div className={`space-y-6 transition-all duration-200 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600">Manage contacts and key relationships</p>
        </div>
        <Button asChild>
          <Link href="/people/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Person
          </Link>
        </Button>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search people..."
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
            {filteredPeople.length} of {people.length} people
          </p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* People Display */}
      {filteredPeople.length === 0 && searchQuery ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No people found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms.</p>
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      ) : people.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No people yet</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first contact.</p>
            <Button asChild>
              <Link href="/people/new">
                <Plus className="h-4 w-4 mr-2" />
                Add First Person
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person) => (
            <Card key={person.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-gray-400" />
                    <span className="truncate">
                      {person.first_name} {person.last_name}
                    </span>
                  </div>
                </CardTitle>
                {person.title && (
                  <p className="text-sm text-gray-500 truncate">
                    {person.title}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {person.organization && (
                    <div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-2" />
                        <span className="truncate font-medium">{person.organization.name}</span>
                      </div>
                      {(person.organization.address || person.organization.city || person.organization.state) && (
                        <div className="flex items-start text-sm text-gray-500 ml-6">
                          <div className="min-w-0">
                            {person.organization.address && (
                              <div className="truncate">{person.organization.address}</div>
                            )}
                            {(person.organization.city || person.organization.state || person.organization.zip) && (
                              <div className="truncate">
                                {[person.organization.city, person.organization.state, person.organization.zip]
                                  .filter(Boolean)
                                  .join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {person.county && (
                    <div className="flex items-start text-xs text-red-600">
                      <Building2 className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{person.county.region}</div>
                        <div className="truncate">{person.county.chapter}</div>
                        <div className="truncate">{person.county.county} County, {person.county.state}</div>
                      </div>
                    </div>
                  )}
                  {person.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${person.email}`} className="truncate text-blue-600 hover:underline">
                        {person.email}
                      </a>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {person.meetings?.length || 0} meetings
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/people/${person.id}`}>
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
                        <span>Name</span>
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('title')}
                      >
                        <span>Title</span>
                        {sortField === 'title' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('organization')}
                      >
                        <span>Organization</span>
                        {sortField === 'organization' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Red Cross Assignment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">
                      <button
                        className="flex items-center space-x-1 hover:text-blue-600"
                        onClick={() => handleSort('meetings')}
                      >
                        <span>Meetings</span>
                        {sortField === 'meetings' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeople.map((person) => (
                    <tr key={person.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {person.first_name} {person.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {person.title || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {person.organization?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-xs text-red-600">
                        {person.county ? (
                          <div className="space-y-0.5">
                            <div className="font-medium">{person.county.region}</div>
                            <div>{person.county.chapter}</div>
                            <div>{person.county.county} County, {person.county.state}</div>
                          </div>
                        ) : (
                          <div className="text-gray-400 italic">Not assigned</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="space-y-1">
                          {person.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              <a href={`mailto:${person.email}`} className="truncate max-w-32 text-blue-600 hover:underline">
                                {person.email}
                              </a>
                            </div>
                          )}
                          {person.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {person.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {person.meetings?.length || 0} meetings
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/people/${person.id}`}>
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