'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Organization, Person } from '@/lib/types'
import { getCoordinatesForRegion } from '@/config/regionMapConfig'
import { getUserRegion } from '@/lib/auth'
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

const getCoordinates = (city?: string): [number, number] | null => {
  return getCoordinatesForRegion(city)
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
  const [mapMarkers, setMapMarkers] = useState<any[]>([])

  // Fixed map settings - no auto-zoom
  // Get map center based on user's region
  const userRegion = getUserRegion()
  const regionConfig = userRegion ? REGIONS[userRegion as keyof typeof REGIONS] : null
  const mapCenter: [number, number] = regionConfig?.map?.center || [39.8283, -98.5795] // Default to US center
  const mapZoom: number = regionConfig?.map?.zoom || 4

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const markers: any[] = []
    const cityGroups: Record<string, any> = {}

    // Group organizations by city
    if (displayMode === 'organizations' || displayMode === 'both') {
      organizations.forEach(org => {
        const coords = getCoordinates(org.city)
        if (coords) {
          const key = `${coords[0]}-${coords[1]}`
          if (!cityGroups[key]) {
            cityGroups[key] = {
              position: coords,
              organizations: [],
              people: [],
              type: 'organization' as const
            }
          }
          cityGroups[key].organizations.push(org)
        }
      })
    }

    // Group people by their organization's city
    if (displayMode === 'people' || displayMode === 'both') {
      people.forEach(person => {
        const org = organizations.find(o => o.id === person.org_id)
        const coords = getCoordinates(org?.city)
        if (coords) {
          const key = `${coords[0]}-${coords[1]}`
          if (!cityGroups[key]) {
            cityGroups[key] = {
              position: coords,
              organizations: [],
              people: [],
              type: 'person' as const
            }
          }
          cityGroups[key].people.push(person)
          if (cityGroups[key].organizations.length === 0) {
            cityGroups[key].type = 'person'
          } else {
            cityGroups[key].type = 'mixed'
          }
        }
      })
    }

    // Create markers from city groups
    Object.values(cityGroups).forEach(group => {
      const count = group.organizations.length + group.people.length
      const isSelected = selectedOrg && group.organizations.some((org: Organization) => org.id === selectedOrg.id)
      
      markers.push({
        position: group.position,
        count,
        organizations: group.organizations,
        people: group.people,
        type: group.type,
        isSelected: !!isSelected
      })
    })

    setMapMarkers(markers)
  }, [organizations, people, selectedOrg, displayMode])

  if (!isClient) {
    return <div className="h-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  }

  return (
    <div className="h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
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