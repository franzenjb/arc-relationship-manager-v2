'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MapPin } from 'lucide-react'

interface County {
  id: string
  county: string
  county_long: string
  state: string
  region: string
  chapter: string
  division: string
}

interface CountySelectorProps {
  value?: string
  onValueChange: (countyId: string) => void
  state?: string
  label?: string
  placeholder?: string
  showHierarchy?: boolean
  className?: string
}

export function CountySelector({
  value,
  onValueChange,
  state,
  label = "County",
  placeholder = "Select county...",
  showHierarchy = true,
  className
}: CountySelectorProps) {
  const [counties, setCounties] = useState<County[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null)

  useEffect(() => {
    if (state) {
      loadCountiesByState(state)
    } else {
      setCounties([])
    }
  }, [state])

  useEffect(() => {
    if (value && counties.length > 0) {
      const county = counties.find(c => c.id === value)
      setSelectedCounty(county || null)
    } else {
      setSelectedCounty(null)
    }
  }, [value, counties])

  const loadCountiesByState = async (stateCode: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('red_cross_geography')
        .select('id, county, county_long, state, region, chapter, division')
        .eq('state', stateCode.toUpperCase())
        .order('county')

      if (error) throw error
      setCounties(data || [])
    } catch (error) {
      console.error('Failed to load counties:', error)
      setCounties([])
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (countyId: string) => {
    onValueChange(countyId)
    const county = counties.find(c => c.id === countyId)
    setSelectedCounty(county || null)
  }

  return (
    <div className={className}>
      <Label htmlFor="county-selector" className="text-sm font-medium text-gray-700">
        <MapPin className="inline h-4 w-4 mr-1" />
        {label}
      </Label>
      
      <Select
        value={value || ''}
        onValueChange={handleValueChange}
        disabled={!state || loading}
      >
        <SelectTrigger className="w-full mt-1">
          <SelectValue 
            placeholder={
              !state 
                ? "Select state first..." 
                : loading 
                ? "Loading counties..." 
                : placeholder
            } 
          />
        </SelectTrigger>
        <SelectContent>
          {counties.map((county) => (
            <SelectItem key={county.id} value={county.id}>
              <div className="flex flex-col">
                <span className="font-medium">
                  {county.county_long || county.county}
                </span>
                {showHierarchy && (
                  <span className="text-xs text-gray-500">
                    {county.chapter} • {county.region}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
          {counties.length === 0 && state && !loading && (
            <SelectItem value="no-counties" disabled>
              No counties found for {state}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Show hierarchy info for selected county */}
      {selectedCounty && showHierarchy && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Red Cross Hierarchy
          </h4>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Division:</strong> {selectedCounty.division}</div>
            <div><strong>Region:</strong> {selectedCounty.region}</div>
            <div><strong>Chapter:</strong> {selectedCounty.chapter}</div>
            <div><strong>County:</strong> {selectedCounty.county_long || selectedCounty.county}</div>
          </div>
        </div>
      )}

      {!state && (
        <p className="mt-1 text-sm text-gray-500">
          Please select a state first to load counties
        </p>
      )}
    </div>
  )
}