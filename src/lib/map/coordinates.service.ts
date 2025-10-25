/**
 * Professional Map Coordinates Service
 * 
 * Enterprise-grade coordinate resolution for mapping applications.
 * Integrates with the professional geocoding service to provide
 * accurate coordinates for organizations and people.
 * 
 * Features:
 * - Batch coordinate resolution
 * - Intelligent caching
 * - Error handling and fallbacks
 * - Performance monitoring
 * - Type safety
 * 
 * @author ARC Development Team
 * @version 1.0.0
 */

import { GeocodingService, GeocodeRequest, GeocodeResult } from '../geocoding/geocoding.service'
import { Organization, Person } from '../types'

export interface MapCoordinate {
  latitude: number
  longitude: number
  accuracy: 'EXACT' | 'APPROXIMATE' | 'FALLBACK'
  source: string
}

export interface LocationEntity {
  id: string
  name: string
  address?: string
  city?: string
  state?: string
  type: 'organization' | 'person'
}

/**
 * Professional coordinates service for mapping
 */
export class CoordinatesService {
  
  /**
   * Get coordinates for a single location
   */
  static async getCoordinates(
    address: string, 
    city: string, 
    state: string
  ): Promise<MapCoordinate | null> {
    
    if (!city || !state) {
      console.warn('City and state are required for coordinate lookup')
      return null
    }
    
    try {
      const request: GeocodeRequest = {
        address: address || city,
        city,
        state,
        country: 'United States'
      }
      
      const result = await GeocodingService.geocode(request)
      
      if (!result) {
        return null
      }
      
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: result.accuracy,
        source: result.cached ? `${result.provider} (cached)` : result.provider
      }
      
    } catch (error) {
      console.error(`Coordinate lookup failed for ${city}, ${state}:`, error)
      return null
    }
  }
  
  /**
   * Batch resolve coordinates for multiple organizations
   */
  static async resolveOrganizationCoordinates(
    organizations: Organization[]
  ): Promise<Map<string, MapCoordinate>> {
    
    const coordinateMap = new Map<string, MapCoordinate>()
    
    // Convert organizations to geocoding requests
    const requests: (GeocodeRequest & { orgId: string })[] = organizations
      .filter(org => org.city && org.state)
      .map(org => ({
        orgId: org.id,
        address: org.address || org.city!,
        city: org.city!,
        state: org.state!,
        country: 'United States'
      }))
    
    if (requests.length === 0) {
      console.warn('No valid organizations for coordinate resolution')
      return coordinateMap
    }
    
    console.log(`Resolving coordinates for ${requests.length} organizations...`)
    
    // Batch geocode unique locations
    const geocodeRequests = this.deduplicateByLocation(requests)
    const geocodeResults = await GeocodingService.batchGeocode(geocodeRequests)
    
    // Map results back to organizations
    for (const request of requests) {
      const locationKey = `${request.city}, ${request.state}`
      const result = geocodeResults.get(locationKey)
      
      if (result) {
        coordinateMap.set(request.orgId, {
          latitude: result.latitude,
          longitude: result.longitude,
          accuracy: result.accuracy,
          source: result.cached ? `${result.provider} (cached)` : result.provider
        })
      }
    }
    
    console.log(`Resolved coordinates for ${coordinateMap.size}/${organizations.length} organizations`)
    return coordinateMap
  }
  
  /**
   * Resolve coordinates for people based on their organization locations
   */
  static async resolvePeopleCoordinates(
    people: Person[],
    organizations: Organization[]
  ): Promise<Map<string, MapCoordinate>> {
    
    const coordinateMap = new Map<string, MapCoordinate>()
    const orgMap = new Map(organizations.map(org => [org.id, org]))
    
    // First resolve organization coordinates
    const orgCoordinates = await this.resolveOrganizationCoordinates(organizations)
    
    // Map people to their organization coordinates
    for (const person of people) {
      if (!person.org_id) continue
      
      const org = orgMap.get(person.org_id)
      if (!org) continue
      
      const coords = orgCoordinates.get(org.id)
      if (coords) {
        coordinateMap.set(person.id, coords)
      }
    }
    
    return coordinateMap
  }
  
  /**
   * Get region-appropriate map bounds and center
   */
  static getRegionMapConfig(region: string): {
    center: [number, number]
    zoom: number
    bounds?: {
      north: number
      south: number
      east: number
      west: number
    }
  } {
    
    const configs: Record<string, any> = {
      'FLORIDA': {
        center: [27.6648, -81.5158] as [number, number],
        zoom: 7,
        bounds: {
          north: 31.0,
          south: 24.5,
          east: -79.5,
          west: -87.6
        }
      },
      'NEBRASKA_IOWA': {
        center: [41.5, -94.5] as [number, number],
        zoom: 7,
        bounds: {
          north: 43.6,
          south: 40.3,
          east: -90.0,
          west: -97.0
        }
      },
      'NATIONAL': {
        center: [39.8283, -98.5795] as [number, number],
        zoom: 4,
        bounds: {
          north: 49.0,
          south: 24.5,
          east: -66.9,
          west: -125.0
        }
      }
    }
    
    return configs[region] || configs['NATIONAL']
  }
  
  /**
   * Deduplicate requests by location to avoid redundant geocoding
   */
  private static deduplicateByLocation(
    requests: (GeocodeRequest & { orgId: string })[]
  ): GeocodeRequest[] {
    
    const seen = new Set<string>()
    const unique: GeocodeRequest[] = []
    
    for (const request of requests) {
      const locationKey = `${request.city}, ${request.state}`.toLowerCase()
      
      if (!seen.has(locationKey)) {
        seen.add(locationKey)
        unique.push({
          address: request.address,
          city: request.city,
          state: request.state,
          country: request.country
        })
      }
    }
    
    return unique
  }
  
  /**
   * Health check for coordinate resolution service
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    details: Record<string, any>
  }> {
    
    try {
      // Test geocoding with a known location
      const testResult = await this.getCoordinates(
        '431 18th Street NW',
        'Washington',
        'DC'
      )
      
      const isHealthy = testResult !== null
      
      return {
        status: isHealthy ? 'healthy' : 'degraded',
        details: {
          geocoding_available: isHealthy,
          test_coordinates: testResult,
          timestamp: new Date().toISOString()
        }
      }
      
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: String(error),
          timestamp: new Date().toISOString()
        }
      }
    }
  }
}