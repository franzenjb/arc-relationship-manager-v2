'use client'

import { useState, useEffect } from 'react'
import { SearchFilters } from '@/lib/types'
import { FilterOptionsService, FilterOptions } from '@/lib/filter-options'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, X, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface SimpleFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  isOpen: boolean
  onToggle: () => void
  context: 'organizations' | 'people'
}

export function SimpleFilters({ filters, onFiltersChange, isOpen, onToggle, context }: SimpleFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    cities: [],
    states: [],
    mission_areas: [],
    organization_types: [],
    statuses: [],
    tags: [],
    titles: [],
    organizations: []
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      setIsLoading(true)
      const options = await FilterOptionsService.getOrganizationFilterOptions()
      setFilterOptions(options)
    } catch (error) {
      console.error('Failed to load filter options:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.query) count++
    if (filters.cities?.length) count++
    if (filters.states?.length) count++
    if (filters.mission_areas?.length) count++
    if (filters.organization_types?.length) count++
    if (filters.status?.length) count++
    if (filters.tags?.length) count++
    if (filters.titles?.length) count++
    if (filters.organization_ids?.length) count++
    if (filters.has_recent_activity) count++
    if (filters.has_upcoming_followups) count++
    return count
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed left-4 top-20 z-40 bg-white shadow-lg"
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <Filter className="h-4 w-4 ml-1" />
        {getActiveFilterCount() > 0 && (
          <span className="ml-1 bg-red-100 text-red-800 text-xs px-1 rounded">
            {getActiveFilterCount()}
          </span>
        )}
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r z-30 transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-72 overflow-y-auto`}>
        
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
              Clear All ({getActiveFilterCount()})
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="p-4 space-y-4">
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <Input
              placeholder="Search..."
              value={filters.query || ''}
              onChange={(e) => updateFilters({ query: e.target.value || undefined })}
            />
          </div>

          {/* Geographic Filters */}
          {filterOptions.cities.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Cities</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filterOptions.cities.map((city) => (
                  <label key={city} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.cities?.includes(city) || false}
                      onChange={(e) => {
                        const current = filters.cities || []
                        const updated = e.target.checked
                          ? [...current, city]
                          : current.filter(c => c !== city)
                        updateFilters({ cities: updated.length > 0 ? updated : undefined })
                      }}
                    />
                    {city}
                  </label>
                ))}
              </div>
            </div>
          )}

          {filterOptions.states.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">States</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {filterOptions.states.map((state) => (
                  <label key={state} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.states?.includes(state) || false}
                      onChange={(e) => {
                        const current = filters.states || []
                        const updated = e.target.checked
                          ? [...current, state]
                          : current.filter(s => s !== state)
                        updateFilters({ states: updated.length > 0 ? updated : undefined })
                      }}
                    />
                    {state}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Organization-specific filters */}
          {context === 'organizations' && (
            <>
              {filterOptions.mission_areas.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Mission Areas</label>
                  <div className="space-y-1">
                    {filterOptions.mission_areas.map((mission) => (
                      <label key={mission} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filters.mission_areas?.includes(mission as any) || false}
                          onChange={(e) => {
                            const current = filters.mission_areas || []
                            const updated = e.target.checked
                              ? [...current, mission as any]
                              : current.filter(m => m !== mission)
                            updateFilters({ mission_areas: updated.length > 0 ? updated : undefined })
                          }}
                        />
                        {FilterOptionsService.formatLabel(mission)}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {filterOptions.organization_types.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Types</label>
                  <div className="space-y-1">
                    {filterOptions.organization_types.map((type) => (
                      <label key={type} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filters.organization_types?.includes(type as any) || false}
                          onChange={(e) => {
                            const current = filters.organization_types || []
                            const updated = e.target.checked
                              ? [...current, type as any]
                              : current.filter(t => t !== type)
                            updateFilters({ organization_types: updated.length > 0 ? updated : undefined })
                          }}
                        />
                        {FilterOptionsService.formatLabel(type)}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {filterOptions.statuses.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <div className="space-y-1">
                    {filterOptions.statuses.map((status) => (
                      <label key={status} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filters.status?.includes(status as any) || false}
                          onChange={(e) => {
                            const current = filters.status || []
                            const updated = e.target.checked
                              ? [...current, status as any]
                              : current.filter(s => s !== status)
                            updateFilters({ status: updated.length > 0 ? updated : undefined })
                          }}
                        />
                        {FilterOptionsService.formatLabel(status)}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {filterOptions.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filterOptions.tags.map((tag) => (
                      <label key={tag} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filters.tags?.includes(tag) || false}
                          onChange={(e) => {
                            const current = filters.tags || []
                            const updated = e.target.checked
                              ? [...current, tag]
                              : current.filter(t => t !== tag)
                            updateFilters({ tags: updated.length > 0 ? updated : undefined })
                          }}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* People-specific filters */}
          {context === 'people' && (
            <>
              {filterOptions.titles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Job Titles</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filterOptions.titles.map((title) => (
                      <label key={title} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filters.titles?.includes(title) || false}
                          onChange={(e) => {
                            const current = filters.titles || []
                            const updated = e.target.checked
                              ? [...current, title]
                              : current.filter(t => t !== title)
                            updateFilters({ titles: updated.length > 0 ? updated : undefined })
                          }}
                        />
                        {title}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {filterOptions.organizations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Organizations</label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filterOptions.organizations.map((org) => (
                      <label key={org.id} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={filters.organization_ids?.includes(org.id) || false}
                          onChange={(e) => {
                            const current = filters.organization_ids || []
                            const updated = e.target.checked
                              ? [...current, org.id]
                              : current.filter(id => id !== org.id)
                            updateFilters({ organization_ids: updated.length > 0 ? updated : undefined })
                          }}
                        />
                        {org.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Activity */}
          <div>
            <label className="block text-sm font-medium mb-2">Activity</label>
            <div className="space-y-1">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filters.has_recent_activity || false}
                  onChange={(e) => updateFilters({ 
                    has_recent_activity: e.target.checked || undefined 
                  })}
                />
                Recent activity (30 days)
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={filters.has_upcoming_followups || false}
                  onChange={(e) => updateFilters({ 
                    has_upcoming_followups: e.target.checked || undefined 
                  })}
                />
                Upcoming follow-ups
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}