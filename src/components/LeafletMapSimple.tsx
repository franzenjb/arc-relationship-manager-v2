'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Organization, Person } from '@/lib/types'
import { CoordinatesService, MapCoordinate } from '@/lib/map/coordinates.service'
import { getUserRegion } from '@/config/regions'
import { REGIONS } from '@/config/regions'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

interface LeafletMapProps {
  organizations: Organization[]
  people: Person[]
  selectedOrg: Organization | null
  onSelectOrg: (org: Organization) => void
  displayMode: 'organizations' | 'people' | 'both'
}

interface MarkerData {
  position: [number, number]
  count: number
  organizations: Organization[]
  people: Person[]
  type: 'organization' | 'person' | 'mixed'
  isSelected: boolean
}

const createCustomIcon = (count: number, isSelected: boolean, markerType: 'organization' | 'person' | 'mixed') => {
  if (typeof window === 'undefined') return null
  
  const L = require('leaflet')
  const size = count > 1 ? Math.min(40, 20 + count * 2) : 24
  
  let bgColor = '#dc2626' // Red for organizations
  if (markerType === 'person') {
    bgColor = '#10b981' // Green for people
  } else if (markerType === 'mixed') {
    bgColor = '#8b5cf6' // Purple for mixed
  }
  
  const borderColor = isSelected ? '#fbbf24' : 'white'
  const borderWidth = isSelected ? '3px' : '2px'
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${bgColor};
        border: ${borderWidth} solid ${borderColor};
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${count > 1 ? count : ''}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

export default function LeafletMapSimple({ 
  organizations = [], 
  people = [], 
  selectedOrg, 
  onSelectOrg, 
  displayMode 
}: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapMarkers, setMapMarkers] = useState<MarkerData[]>([])
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false)
  const [coordinateError, setCoordinateError] = useState<string | null>(null)

  // Get map configuration based on user's region
  const userRegion = getUserRegion()
  const mapConfig = CoordinatesService.getRegionMapConfig(userRegion || 'NATIONAL')

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const resolveCoordinatesAndCreateMarkers = async () => {
      if (organizations.length === 0 && people.length === 0) {
        setMapMarkers([])
        return
      }

      setIsLoadingCoordinates(true)
      setCoordinateError(null)

      try {
        console.log(`🗺️ Resolving coordinates for ${organizations.length} organizations and ${people.length} people...`)
        
        // Resolve coordinates for organizations and people
        const [orgCoordinates, peopleCoordinates] = await Promise.all([
          displayMode === 'organizations' || displayMode === 'both' 
            ? CoordinatesService.resolveOrganizationCoordinates(organizations)
            : Promise.resolve(new Map<string, MapCoordinate>()),
          displayMode === 'people' || displayMode === 'both'
            ? CoordinatesService.resolvePeopleCoordinates(people, organizations)
            : Promise.resolve(new Map<string, MapCoordinate>())
        ])

        // Group entities by coordinates
        const locationGroups = new Map<string, {
          position: [number, number]
          organizations: Organization[]
          people: Person[]
        }>()

        // Add organizations to location groups
        if (displayMode === 'organizations' || displayMode === 'both') {
          for (const org of organizations) {
            const coords = orgCoordinates.get(org.id)
            if (coords) {
              const key = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`
              const position: [number, number] = [coords.latitude, coords.longitude]
              
              if (!locationGroups.has(key)) {
                locationGroups.set(key, {
                  position,
                  organizations: [],
                  people: []
                })
              }
              locationGroups.get(key)!.organizations.push(org)
            }
          }
        }

        // Add people to location groups
        if (displayMode === 'people' || displayMode === 'both') {
          for (const person of people) {
            const coords = peopleCoordinates.get(person.id)
            if (coords) {
              const key = `${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`
              const position: [number, number] = [coords.latitude, coords.longitude]
              
              if (!locationGroups.has(key)) {
                locationGroups.set(key, {
                  position,
                  organizations: [],
                  people: []
                })
              }
              locationGroups.get(key)!.people.push(person)
            }
          }
        }

        // Convert location groups to markers
        const markers: MarkerData[] = Array.from(locationGroups.values()).map(group => {
          const count = group.organizations.length + group.people.length
          const isSelected = selectedOrg && group.organizations.some(org => org.id === selectedOrg.id)
          
          let type: 'organization' | 'person' | 'mixed' = 'organization'
          if (group.organizations.length === 0) {
            type = 'person'
          } else if (group.people.length > 0) {
            type = 'mixed'
          }

          return {
            position: group.position,
            count,
            organizations: group.organizations,
            people: group.people,
            type,
            isSelected: !!isSelected
          }
        })

        console.log(`📍 Created ${markers.length} map markers from ${orgCoordinates.size + peopleCoordinates.size} resolved coordinates`)
        setMapMarkers(markers)

      } catch (error) {
        console.error('Coordinate resolution failed:', error)
        setCoordinateError(error instanceof Error ? error.message : 'Failed to resolve coordinates')
        setMapMarkers([])
      } finally {
        setIsLoadingCoordinates(false)
      }
    }

    resolveCoordinatesAndCreateMarkers()
  }, [organizations, people, selectedOrg, displayMode])

  if (!isClient) {
    return <div className="h-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  }

  return (
    <div className="h-full relative">
      {/* Loading overlay */}
      {isLoadingCoordinates && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            <span className="text-gray-700">Resolving locations...</span>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {coordinateError && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-10">
          <strong className="font-bold">Coordinate Error:</strong>
          <span className="block sm:inline"> {coordinateError}</span>
        </div>
      )}

      <MapContainer
        center={mapConfig.center}
        zoom={mapConfig.zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapMarkers.map((marker, index) => {
          const icon = createCustomIcon(marker.count, marker.isSelected, marker.type)
          if (!icon) return null
          
          return (
            <Marker
              key={index}
              position={marker.position}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (marker.organizations.length > 0) {
                    onSelectOrg(marker.organizations[0])
                  }
                }
              }}
            >
              <Popup>
                <div className="space-y-2">
                  {marker.organizations.map((org: Organization) => (
                    <div key={org.id} className="cursor-pointer hover:text-blue-600" onClick={() => onSelectOrg(org)}>
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-gray-600">{org.city}, {org.state}</div>
                    </div>
                  ))}
                  {marker.people.length > 0 && (
                    <div className="border-t pt-2">
                      <div className="text-sm font-medium text-gray-700">{marker.people.length} People</div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}