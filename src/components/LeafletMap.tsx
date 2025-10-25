'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Organization, Person } from '@/lib/types'
import { getCurrentRegion, getUserRegion, REGIONS } from '@/config/regions'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false })


interface LeafletMapProps {
  organizations: Organization[]
  people: Person[]
  selectedOrg: Organization | null
  onSelectOrg: (org: Organization) => void
  displayMode: 'organizations' | 'people' | 'both'
}

// City coordinates by region
const CITY_COORDINATES: Record<string, Record<string, [number, number]>> = {
  FLORIDA: {
    'miami': [25.7617, -80.1918],
    'tampa': [27.9506, -82.4572],
    'orlando': [28.5383, -81.3792],
    'jacksonville': [30.3322, -81.6557],
    'tallahassee': [30.4518, -84.27277],
    'fort lauderdale': [26.1224, -80.1373],
    'st. petersburg': [27.7676, -82.6403],
    'saint petersburg': [27.7676, -82.6403],
    'gainesville': [29.6516, -82.3248],
    'west palm beach': [26.7153, -80.0534],
    'palm beach': [26.7153, -80.0534],
    'naples': [26.1420, -81.7948],
    'fort myers': [26.5628, -81.8495],
    'cape coral': [26.5629, -81.9495],
    'pensacola': [30.4213, -87.2169],
    'sarasota': [27.3364, -82.5307],
    'bradenton': [27.4989, -82.5748],
    'clearwater': [27.9659, -82.8001],
    'lakeland': [28.0395, -81.9498],
    'melbourne': [28.0836, -80.6081],
    'cocoa': [28.3861, -80.7420],
    'titusville': [28.6122, -80.8075],
    'key west': [24.5551, -81.7800],
    'marathon': [24.7140, -81.0890],
    'ocala': [29.1872, -82.1401],
    'panama city': [30.1588, -85.6602],
    'st. augustine': [29.9012, -81.3124],
    'sanford': [28.8028, -81.2695],
    'kissimmee': [28.2916, -81.4077],
    'port st. lucie': [27.2730, -80.3582],
    'stuart': [27.1973, -80.2528],
    'vero beach': [27.6386, -80.3977]
  },
  NEBRASKA_IOWA: {
    'omaha': [41.2565, -95.9345],
    'lincoln': [40.8136, -96.7026],
    'bellevue': [41.1544, -95.9146],
    'grand island': [40.9264, -98.3420],
    'kearney': [40.6993, -99.0817],
    'hastings': [40.5862, -98.3889],
    'north platte': [41.1239, -100.7654],
    'columbus': [41.4297, -97.3684],
    'des moines': [41.5868, -93.6250],
    'cedar rapids': [41.9779, -91.6656],
    'davenport': [41.5236, -90.5776],
    'sioux city': [42.4963, -96.4049],
    'iowa city': [41.6611, -91.5302],
    'waterloo': [42.4928, -92.3426],
    'council bluffs': [41.2619, -95.8608],
    'ames': [42.0308, -93.6320],
    'dubuque': [42.5006, -90.6646],
    'ankeny': [41.7317, -93.6001],
    'west des moines': [41.5772, -93.7113],
    'cedar falls': [42.5349, -92.4453]
  },
  NATIONAL: {} // National uses all coordinates
}

// Function to get coordinates for a city
const getCityCoordinates = (cityName: string, regionCode?: string | null): [number, number] | null => {
  const normalizedCity = cityName.toLowerCase().trim()
  
  // Get region-specific coordinates
  const userRegion = regionCode || getUserRegion() || 'FLORIDA'
  let coordsToSearch = CITY_COORDINATES[userRegion] || {}
  
  // If NATIONAL, search all regions
  if (userRegion === 'NATIONAL') {
    coordsToSearch = { ...CITY_COORDINATES.FLORIDA, ...CITY_COORDINATES.NEBRASKA_IOWA }
  }
  
  // Direct match
  if (coordsToSearch[normalizedCity]) {
    return coordsToSearch[normalizedCity]
  }
  
  // Partial match
  for (const [key, coords] of Object.entries(coordsToSearch)) {
    if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
      return coords
    }
  }
  
  return null
}

// Custom marker icon using CSS
const createDivIcon = (count: number, markerType: 'organization' | 'person' | 'mixed', isSelected: boolean = false) => {
  if (typeof window === 'undefined') return null
  
  const L = require('leaflet')
  
  // Different styles for marker types and selection state
  const size = isSelected ? 32 : (count > 1 ? 24 : 16)
  
  // Color scheme based on marker type
  let bgColor = '#dc2626' // Default red for organizations
  if (markerType === 'person') {
    bgColor = isSelected ? '#059669' : '#10b981' // Green for people
  } else if (markerType === 'mixed') {
    bgColor = isSelected ? '#7c3aed' : '#8b5cf6' // Purple for mixed
  } else {
    bgColor = isSelected ? '#dc2626' : (count > 1 ? '#2563eb' : '#dc2626') // Red/blue for organizations
  }
  
  const borderColor = isSelected ? '#fbbf24' : 'white'
  const borderWidth = isSelected ? '3px' : '2px'
  const boxShadow = isSelected 
    ? '0 4px 8px rgba(0,0,0,0.4), 0 0 0 2px #fbbf24' 
    : '0 2px 4px rgba(0,0,0,0.3)'
  
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
        font-size: ${isSelected ? '14px' : '12px'};
        font-weight: bold;
        color: white;
        box-shadow: ${boxShadow};
        animation: ${isSelected ? 'pulse 2s infinite' : 'none'};
      ">
        ${count > 1 ? count : (isSelected ? '★' : (markerType === 'person' ? '👤' : (markerType === 'mixed' ? '◉' : '●')))}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

// Component to handle map resizing
function MapResizeHandler() {
  const map = useMap()
  
  useEffect(() => {
    // Trigger map resize after a short delay to ensure container is fully rendered
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [map])
  
  return null
}

export default function LeafletMap({ organizations, people, selectedOrg, onSelectOrg, displayMode }: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [mapMarkers, setMapMarkers] = useState<Array<{
    position: [number, number]
    organizations: Organization[]
    people: Person[]
    city: string
    type: 'organization' | 'person' | 'mixed'
  }>>([])
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null)
  
  // Get region-specific map configuration
  const userRegion = getUserRegion() || 'FLORIDA'
  const regionConfig = REGIONS[userRegion as keyof typeof REGIONS] || REGIONS.FLORIDA
  const [mapCenter, setMapCenter] = useState<[number, number]>(regionConfig.map.center)
  const [mapZoom, setMapZoom] = useState<number>(regionConfig.map.zoom)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Group data by city coordinates based on display mode
    const cityGroups: Record<string, { organizations: Organization[], people: Person[], city: string }> = {}
    
    // Add organizations if showing organizations or both
    if (displayMode === 'organizations' || displayMode === 'both') {
      organizations.forEach(org => {
        if (org.city) {
          const coords = getCityCoordinates(org.city)
          if (coords) {
            const key = `${coords[0]},${coords[1]}`
            if (!cityGroups[key]) {
              cityGroups[key] = { organizations: [], people: [], city: org.city }
            }
            cityGroups[key].organizations.push(org)
          }
        }
      })
    }
    
    // Add people if showing people or both (people get coordinates from their organization)
    if (displayMode === 'people' || displayMode === 'both') {
      people.forEach(person => {
        // Find the person's organization to get the city
        const personOrg = organizations.find(org => org.id === person.org_id)
        if (personOrg?.city) {
          const coords = getCityCoordinates(personOrg.city)
          if (coords) {
            const key = `${coords[0]},${coords[1]}`
            if (!cityGroups[key]) {
              cityGroups[key] = { organizations: [], people: [], city: personOrg.city }
            }
            cityGroups[key].people.push(person)
          }
        }
      })
    }
    
    // Convert to marker format
    const markers = Object.entries(cityGroups).map(([coordKey, group]) => {
      const [lat, lng] = coordKey.split(',').map(Number)
      
      // Determine marker type
      let markerType: 'organization' | 'person' | 'mixed' = 'organization'
      if (group.organizations.length > 0 && group.people.length > 0) {
        markerType = 'mixed'
      } else if (group.people.length > 0) {
        markerType = 'person'
      }
      
      return {
        position: [lat, lng] as [number, number],
        organizations: group.organizations,
        people: group.people,
        city: group.city,
        type: markerType
      }
    })
    
    setMapMarkers(markers)
    
    // Calculate bounds for auto-zoom
    if (markers.length > 0) {
      const lats = markers.map(m => m.position[0])
      const lngs = markers.map(m => m.position[1])
      
      const minLat = Math.min(...lats)
      const maxLat = Math.max(...lats)
      const minLng = Math.min(...lngs)
      const maxLng = Math.max(...lngs)
      
      // Add padding to bounds
      const latPadding = (maxLat - minLat) * 0.1
      const lngPadding = (maxLng - minLng) * 0.1
      
      if (markers.length === 1) {
        // Single marker - zoom to city level
        setMapCenter(markers[0].position)
        setMapZoom(10)
        setMapBounds(null)
      } else {
        // Multiple markers - fit bounds
        const bounds: [[number, number], [number, number]] = [
          [minLat - latPadding, minLng - lngPadding],
          [maxLat + latPadding, maxLng + lngPadding]
        ]
        setMapBounds(bounds)
      }
    } else {
      // No organizations - use region-specific default view
      setMapCenter(regionConfig.map.center)
      setMapZoom(regionConfig.map.zoom)
      setMapBounds(null)
    }
  }, [organizations, people, displayMode, regionConfig])

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border">
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: 1 !important;
        }
        .leaflet-popup-tip {
          background: #dc2626 !important;
          border: none !important;
        }
        .custom-popup .leaflet-popup-close-button {
          color: white !important;
          font-size: 18px !important;
          padding: 8px !important;
          top: 8px !important;
          right: 8px !important;
        }
        .custom-popup .leaflet-popup-close-button:hover {
          background-color: rgba(255,255,255,0.2) !important;
          border-radius: 4px !important;
        }
      `}</style>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}-${mapBounds ? 'bounds' : 'center'}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Handle bounds updates */}
        <MapBoundsHandler bounds={mapBounds} />
        
        {mapMarkers.map((marker, index) => {
          const isSelected = selectedOrg && marker.organizations.some(org => org.id === selectedOrg.id)
          const totalCount = marker.organizations.length + marker.people.length
          const icon = createDivIcon(totalCount, marker.type, !!isSelected)
          
          return (
            <Marker
              key={index}
              position={marker.position}
              icon={icon}
              eventHandlers={{
                click: () => {
                  onSelectOrg(marker.organizations[0])
                }
              }}
            >
              <Popup className="custom-popup">
                <div className="p-0 m-0">
                  <div className="bg-white rounded-lg shadow-lg border-0 min-w-[240px] max-w-[280px]">
                    {/* Header */}
                    <div className="bg-red-600 text-white px-3 py-2 rounded-t-lg">
                      <h3 className="font-bold text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {marker.city}
                      </h3>
                    </div>
                    
                    {/* Content */}
                    <div className="p-3">
                      <div className="space-y-2">
                        {/* Show Organizations */}
                        {marker.organizations.slice(0, 2).map(org => (
                          <div key={`org-${org.id}`} className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
                            <a 
                              href={`/organizations/${org.id}`}
                              className="block hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`/organizations/${org.id}`, '_blank')
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-red-600">🏢</span>
                                <p className="font-semibold text-gray-900 text-sm hover:text-red-600">{org.name}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1 ml-5">
                                {org.mission_area && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                    {org.mission_area.replace('_', ' ')}
                                  </span>
                                )}
                                {org.organization_type && (
                                  <span className="text-gray-500 text-xs capitalize">{org.organization_type}</span>
                                )}
                              </div>
                            </a>
                          </div>
                        ))}
                        
                        {/* Show People */}
                        {marker.people.slice(0, 2).map(person => (
                          <div key={`person-${person.id}`} className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
                            <a 
                              href={`/people/${person.id}`}
                              className="block hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`/people/${person.id}`, '_blank')
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-green-600">👤</span>
                                <p className="font-semibold text-gray-900 text-sm hover:text-green-600">
                                  {person.first_name} {person.last_name}
                                </p>
                              </div>
                              <div className="ml-5">
                                {person.title && (
                                  <p className="text-gray-500 text-xs">{person.title}</p>
                                )}
                                {person.email && (
                                  <p className="text-gray-500 text-xs">{person.email}</p>
                                )}
                              </div>
                            </a>
                          </div>
                        ))}
                        
                        {/* Show counts for remaining items */}
                        {(marker.organizations.length > 2 || marker.people.length > 2) && (
                          <div className="text-center pt-1">
                            <p className="text-xs text-gray-500">
                              {marker.organizations.length > 2 && `+${marker.organizations.length - 2} more organizations`}
                              {marker.organizations.length > 2 && marker.people.length > 2 && ', '}
                              {marker.people.length > 2 && `+${marker.people.length - 2} more people`}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* View All Button - show if multiple items */}
                      {(marker.organizations.length + marker.people.length > 1) && (
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <button 
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-1.5 px-3 rounded text-xs transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation()
                              // Navigate to search page with city filter
                              const cityParam = encodeURIComponent(marker.city.toLowerCase())
                              window.open(`/search?city=${cityParam}`, '_blank')
                            }}
                          >
                            View All in {marker.city}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
        
        {/* Map resize handler */}
        <MapResizeHandler />
      </MapContainer>
    </div>
  )
}

// Component to handle map bounds updates
function MapBoundsHandler({ bounds }: { bounds: [[number, number], [number, number]] | null }) {
  const [mapInstance, setMapInstance] = useState<any>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-leaflet').then(({ useMap }) => {
        // This will be handled by the parent component
      })
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && bounds) {
      // Map bounds are now handled by the MapContainer key prop
      // which forces re-render with new bounds
    }
  }, [bounds])

  return null
}