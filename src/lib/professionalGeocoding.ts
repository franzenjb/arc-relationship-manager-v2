// Professional geocoding service using OpenStreetMap Nominatim API
// This replaces the hardcoded coordinate mappings with real geocoding

interface GeocodeResult {
  lat: number
  lon: number
  display_name: string
}

interface CachedCoordinate {
  latitude: number
  longitude: number
  display_name: string
  cached_at: string
}

export class ProfessionalGeocodingService {
  private static cache = new Map<string, CachedCoordinate>()
  private static readonly CACHE_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days
  
  /**
   * Get coordinates for a city, state combination
   * Uses OpenStreetMap Nominatim API with local caching
   */
  static async getCoordinates(city: string, state: string): Promise<[number, number] | null> {
    if (!city || !state) return null
    
    const cacheKey = `${city.toLowerCase().trim()}, ${state.toLowerCase().trim()}`
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached) {
      const age = Date.now() - new Date(cached.cached_at).getTime()
      if (age < this.CACHE_DURATION) {
        return [cached.latitude, cached.longitude]
      }
    }
    
    try {
      // Query Nominatim API
      const query = encodeURIComponent(`${city}, ${state}, United States`)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=us`,
        {
          headers: {
            'User-Agent': 'ARC-Relationship-Manager/1.0'
          }
        }
      )
      
      if (!response.ok) {
        console.warn(`Geocoding API error for ${city}, ${state}: ${response.status}`)
        return null
      }
      
      const results: GeocodeResult[] = await response.json()
      
      if (results.length === 0) {
        console.warn(`No geocoding results found for ${city}, ${state}`)
        return null
      }
      
      const result = results[0]
      const coordinates: [number, number] = [parseFloat(result.lat), parseFloat(result.lon)]
      
      // Cache the result
      this.cache.set(cacheKey, {
        latitude: coordinates[0],
        longitude: coordinates[1],
        display_name: result.display_name,
        cached_at: new Date().toISOString()
      })
      
      console.log(`Geocoded ${city}, ${state} -> ${coordinates[0]}, ${coordinates[1]}`)
      return coordinates
      
    } catch (error) {
      console.error(`Geocoding error for ${city}, ${state}:`, error)
      return null
    }
  }
  
  /**
   * Batch geocode multiple organizations
   * Includes rate limiting to be respectful to the API
   */
  static async batchGeocode(organizations: Array<{city?: string, state?: string}>): Promise<Map<string, [number, number]>> {
    const results = new Map<string, [number, number]>()
    
    for (const org of organizations) {
      if (!org.city || !org.state) continue
      
      const key = `${org.city}, ${org.state}`
      
      // Skip if already processed
      if (results.has(key)) continue
      
      const coords = await this.getCoordinates(org.city, org.state)
      if (coords) {
        results.set(key, coords)
      }
      
      // Rate limiting: wait 100ms between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return results
  }
  
  /**
   * Get default coordinates for a region (fallback when geocoding fails)
   */
  static getRegionCenter(region: string): [number, number] {
    const centers: Record<string, [number, number]> = {
      'FLORIDA': [27.6648, -81.5158],
      'NEBRASKA_IOWA': [41.5, -94.5],
      'NATIONAL': [39.8283, -98.5795] // Geographic center of USA
    }
    
    return centers[region] || centers['NATIONAL']
  }
  
  /**
   * Clear old cache entries
   */
  static clearExpiredCache(): void {
    const now = Date.now()
    
    for (const [key, cached] of this.cache.entries()) {
      const age = now - new Date(cached.cached_at).getTime()
      if (age > this.CACHE_DURATION) {
        this.cache.delete(key)
      }
    }
  }
}