import { supabase } from './supabase'

export interface GeocodingResult {
  latitude: number
  longitude: number
  county?: string
  state?: string
  city?: string
  formatted_address?: string
}

export class GeocodingService {
  /**
   * Geocode an address using a free geocoding service
   * Falls back to multiple services for reliability
   */
  static async geocodeAddress(address: string, city?: string, state?: string, zip?: string): Promise<GeocodingResult | null> {
    // Build full address string
    const fullAddress = this.buildAddressString(address, city, state, zip)
    
    // Try multiple geocoding services
    const geocoders = [
      () => this.geocodeWithNominatim(fullAddress),
      () => this.geocodeWithMapbox(fullAddress), // If we add API key later
    ]
    
    for (const geocoder of geocoders) {
      try {
        const result = await geocoder()
        if (result) {
          console.log(`✅ Geocoded: ${fullAddress} -> ${result.latitude}, ${result.longitude}`)
          return result
        }
      } catch (error) {
        console.warn(`Geocoding attempt failed:`, error)
        continue
      }
    }
    
    console.warn(`❌ Could not geocode address: ${fullAddress}`)
    return null
  }

  /**
   * Find the Red Cross county that contains the given coordinates and geocoded county name
   */
  static async findCountyByCoordinatesAndName(latitude: number, longitude: number, geocodedCounty?: string, geocodedState?: string): Promise<any | null> {
    // First, try to match by county name if we have it from geocoding
    if (geocodedCounty && geocodedState) {
      // Clean up the county name (remove "County" suffix)
      const cleanCounty = geocodedCounty.replace(/\s+County\s*$/i, '').trim()
      
      const { data: exactMatch } = await supabase
        .from('red_cross_geography')
        .select('*')
        .eq('state', this.normalizeState(geocodedState))
        .or(`county.ilike.%${cleanCounty}%,county_long.ilike.%${geocodedCounty}%`)
        .limit(1)
        .single()
      
      if (exactMatch) {
        console.log(`✅ Found county match: ${cleanCounty} -> ${exactMatch.county}, ${exactMatch.state}`)
        return exactMatch
      }
    }
    
    // If no county name match, fall back to coordinate-based state lookup
    const state = this.getStateFromCoordinates(latitude, longitude)
    if (!state) {
      console.warn(`Could not determine state from coordinates: ${latitude}, ${longitude}`)
      return null
    }
    
    // Get the first county in the state as fallback
    const { data: counties, error } = await supabase
      .from('red_cross_geography')
      .select('*')
      .eq('state', state)
      .limit(1)
    
    if (error || !counties || counties.length === 0) {
      console.warn(`No counties found for state: ${state}`)
      return null
    }
    
    console.log(`⚠️ Using fallback county for ${state}: ${counties[0].county}`)
    return counties[0]
  }

  /**
   * Geocode address and assign county to organization
   */
  static async geocodeAndAssignCounty(organizationId: string, address?: string, city?: string, state?: string, zip?: string): Promise<{success: boolean, county?: any, coordinates?: GeocodingResult}> {
    if (!address && !city) {
      return { success: false }
    }
    
    try {
      // Geocode the address
      const coordinates = await this.geocodeAddress(address || '', city, state, zip)
      if (!coordinates) {
        return { success: false }
      }
      
      // Find the county using both coordinates and geocoded county name
      const county = await this.findCountyByCoordinatesAndName(
        coordinates.latitude, 
        coordinates.longitude,
        coordinates.county,
        coordinates.state
      )
      if (!county) {
        return { success: false, coordinates }
      }
      
      // Update the organization with county assignment
      const { error } = await supabase
        .from('organizations')
        .update({ 
          county_id: county.id
          // Note: latitude/longitude columns need to be added to the database schema
        })
        .eq('id', organizationId)
      
      if (error) {
        console.error('Failed to update organization with county:', error)
        return { success: false, coordinates, county }
      }
      
      console.log(`✅ Assigned ${county.county}, ${county.state} to organization`)
      return { success: true, county, coordinates }
      
    } catch (error) {
      console.error('Geocoding and assignment failed:', error)
      return { success: false }
    }
  }

  /**
   * Geocode using OpenStreetMap Nominatim (free service)
   */
  private static async geocodeWithNominatim(address: string): Promise<GeocodingResult | null> {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodedAddress}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ARC-Relationship-Manager/1.0'
      }
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    if (!data || data.length === 0) return null
    
    const result = data[0]
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      county: result.address?.county,
      state: result.address?.state,
      city: result.address?.city || result.address?.town || result.address?.village,
      formatted_address: result.display_name
    }
  }

  /**
   * Future: Geocode using Mapbox (requires API key)
   */
  private static async geocodeWithMapbox(address: string): Promise<GeocodingResult | null> {
    // TODO: Implement if we get a Mapbox API key
    return null
  }

  /**
   * Build a complete address string
   */
  private static buildAddressString(address?: string, city?: string, state?: string, zip?: string): string {
    const parts = [address, city, state, zip].filter(Boolean)
    return parts.join(', ')
  }

  /**
   * Normalize state name to abbreviation
   */
  private static normalizeState(stateName: string): string {
    const stateMap: Record<string, string> = {
      'florida': 'FL',
      'nebraska': 'NE', 
      'iowa': 'IA',
      'texas': 'TX',
      'pennsylvania': 'PA',
      'maryland': 'MD',
      'virginia': 'VA'
    }
    
    const normalized = stateName.toLowerCase().trim()
    return stateMap[normalized] || stateName.toUpperCase()
  }

  /**
   * Simple coordinate-to-state mapping
   * TODO: Replace with proper geospatial lookup
   */
  private static getStateFromCoordinates(lat: number, lng: number): string | null {
    // Very rough coordinate ranges - should be replaced with proper spatial data
    if (lat >= 25 && lat <= 31 && lng >= -87 && lng <= -80) return 'FL'
    if (lat >= 40 && lat <= 43 && lng >= -104 && lng <= -95.5) return 'NE'
    if (lat >= 40.5 && lat <= 43.5 && lng >= -96.5 && lng <= -90) return 'IA'
    if (lat >= 25 && lat <= 37 && lng >= -107 && lng <= -93) return 'TX'
    if (lat >= 39 && lat <= 40 && lng >= -79 && lng <= -75) return 'PA'
    if (lat >= 39 && lat <= 40 && lng >= -79 && lng <= -75) return 'MD'
    if (lat >= 38 && lat <= 39.5 && lng >= -78 && lng <= -76) return 'VA'
    
    return null
  }

  /**
   * Bulk geocode all organizations that don't have counties assigned
   */
  static async bulkGeocodeOrganizations(): Promise<{processed: number, success: number, failed: string[]}> {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('id, name, address, city, state, zip, county_id')
      .is('county_id', null)
      .not('city', 'is', null)
    
    if (error || !orgs) {
      throw new Error(`Failed to fetch organizations: ${error?.message}`)
    }
    
    let processed = 0
    let success = 0
    const failed: string[] = []
    
    for (const org of orgs) {
      processed++
      console.log(`Processing ${processed}/${orgs.length}: ${org.name}`)
      
      const result = await this.geocodeAndAssignCounty(
        org.id,
        org.address,
        org.city,
        org.state,
        org.zip
      )
      
      if (result.success) {
        success++
      } else {
        failed.push(`${org.name} (${org.city}, ${org.state})`)
      }
      
      // Be nice to the geocoding service
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    return { processed, success, failed }
  }
}