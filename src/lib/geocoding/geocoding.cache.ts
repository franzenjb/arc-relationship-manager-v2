/**
 * Fast In-Memory Geocoding Cache
 * 
 * Provides instant coordinate lookup for common cities to avoid API delays.
 * This is a performance optimization until the database cache is set up.
 */

export interface CachedCoordinate {
  latitude: number
  longitude: number
  accuracy: 'EXACT' | 'APPROXIMATE' | 'FALLBACK'
  source: string
}

// Pre-computed coordinates for all cities in our database
export const COORDINATE_CACHE: Record<string, CachedCoordinate> = {
  // Florida cities
  'tampa, fl': { latitude: 27.953105, longitude: -82.4507037, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'coral gables, fl': { latitude: 25.7078825, longitude: -80.2854433, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'tallahassee, fl': { latitude: 30.4518, longitude: -84.27277, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'miami, fl': { latitude: 25.7617, longitude: -80.1918, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'big pine key, fl': { latitude: 24.6985, longitude: -81.3668, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'st. augustine, fl': { latitude: 29.9012, longitude: -81.3124, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'juno beach, fl': { latitude: 26.8942, longitude: -80.0581, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'orlando, fl': { latitude: 28.5383, longitude: -81.3792, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'lakeland, fl': { latitude: 28.0395, longitude: -81.9498, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'hollywood, fl': { latitude: 26.0112, longitude: -80.1495, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'gainesville, fl': { latitude: 29.6516, longitude: -82.3248, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'bay lake, fl': { latitude: 28.3852, longitude: -81.5742, accuracy: 'APPROXIMATE', source: 'precomputed' },
  
  // Nebraska cities
  'bellevue, ne': { latitude: 41.136583, longitude: -95.9089957, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'lincoln, ne': { latitude: 40.8121584, longitude: -96.7001144, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'omaha, ne': { latitude: 41.2569361, longitude: -95.9405804, accuracy: 'APPROXIMATE', source: 'precomputed' },
  
  // Iowa cities
  'cedar rapids, ia': { latitude: 42.0032772, longitude: -91.7106529, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'council bluffs, ia': { latitude: 41.2594718, longitude: -95.8506318, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'des moines, ia': { latitude: 41.6149605, longitude: -93.6712262, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'waterloo, ia': { latitude: 42.4928, longitude: -92.3426, accuracy: 'APPROXIMATE', source: 'precomputed' },
  
  // Other states
  'philadelphia, pa': { latitude: 39.9526, longitude: -75.1652, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'baltimore, md': { latitude: 39.2904, longitude: -76.6122, accuracy: 'APPROXIMATE', source: 'precomputed' },
  'arlington, va': { latitude: 38.8816, longitude: -77.0910, accuracy: 'APPROXIMATE', source: 'precomputed' }
}

/**
 * Fast coordinate lookup with fallback to API
 */
export function getCachedCoordinates(city: string, state: string): CachedCoordinate | null {
  const key = `${city.toLowerCase().trim()}, ${state.toLowerCase().trim()}`
  return COORDINATE_CACHE[key] || null
}

/**
 * Add coordinates to cache
 */
export function setCachedCoordinates(city: string, state: string, coords: CachedCoordinate): void {
  const key = `${city.toLowerCase().trim()}, ${state.toLowerCase().trim()}`
  COORDINATE_CACHE[key] = coords
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    totalCached: Object.keys(COORDINATE_CACHE).length,
    cities: Object.keys(COORDINATE_CACHE)
  }
}