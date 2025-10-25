import { supabase } from './supabase'

export interface RedCrossGeography {
  id: string
  geo_id: string
  fips?: string
  county: string
  county_long?: string
  county_st?: string
  county_st_long?: string
  state: string
  
  // Red Cross hierarchy
  division: string
  division_code?: string
  region: string
  region_code?: string
  chapter: string
  chapter_code?: string
  
  // Chapter contact info
  address?: string
  address_2?: string
  city?: string
  zip?: string
  phone?: string
  time_zone?: string
  fema_region?: string
}

export class GeographyService {
  /**
   * Find Red Cross hierarchy for a given county and state
   */
  static async findByCountyState(county: string, state: string): Promise<RedCrossGeography | null> {
    const { data, error } = await supabase
      .from('red_cross_geography')
      .select('*')
      .eq('county', county)
      .eq('state', state)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  /**
   * Get all unique divisions for national view
   */
  static async getAllDivisions(): Promise<Array<{value: string, label: string}>> {
    const { data, error } = await supabase
      .from('red_cross_geography')
      .select('division')
      .order('division')

    if (error) throw error
    
    const unique = [...new Set(data?.map(d => d.division) || [])]
    return unique.map(division => ({
      value: division.toLowerCase().replace(/\s+/g, '_'),
      label: division
    }))
  }

  /**
   * Get all unique regions for national view
   */
  static async getAllRegions(): Promise<Array<{value: string, label: string}>> {
    const { data, error } = await supabase
      .from('red_cross_geography')
      .select('region')
      .order('region')

    if (error) throw error
    
    const unique = [...new Set(data?.map(r => r.region) || [])]
    return unique.map(region => ({
      value: region.toLowerCase().replace(/\s+/g, '_'),
      label: region
    }))
  }

  /**
   * Get all unique chapters for national view
   */
  static async getAllChapters(): Promise<Array<{value: string, label: string}>> {
    const { data, error } = await supabase
      .from('red_cross_geography')
      .select('chapter')
      .order('chapter')

    if (error) throw error
    
    const unique = [...new Set(data?.map(c => c.chapter) || [])]
    return unique.map(chapter => ({
      value: chapter.toLowerCase().replace(/\s+/g, '_'),
      label: chapter
    }))
  }

  /**
   * Get all counties for a specific state
   */
  static async getCountiesByState(state: string): Promise<Array<{value: string, label: string}>> {
    const { data, error } = await supabase
      .from('red_cross_geography')
      .select('county')
      .eq('state', state)
      .order('county')

    if (error) throw error
    
    return data?.map(c => ({
      value: c.county.toLowerCase().replace(/\s+/g, '_'),
      label: c.county
    })) || []
  }

  /**
   * Get regions filtered by current user's access level
   */
  static async getRegionsForUser(userRegion: string): Promise<Array<{value: string, label: string}>> {
    if (userRegion === 'NATIONAL') {
      return this.getAllRegions()
    }
    
    // For specific regions, get only their regions
    const regionStates = this.getStatesForRegion(userRegion)
    if (regionStates.length === 0) return []

    const { data, error } = await supabase
      .from('red_cross_geography')
      .select('region')
      .in('state', regionStates)
      .order('region')

    if (error) throw error
    
    const unique = [...new Set(data?.map(r => r.region) || [])]
    return unique.map(region => ({
      value: region.toLowerCase().replace(/\s+/g, '_'),
      label: region
    }))
  }

  /**
   * Get chapters filtered by current user's access level
   */
  static async getChaptersForUser(userRegion: string): Promise<Array<{value: string, label: string}>> {
    if (userRegion === 'NATIONAL') {
      return this.getAllChapters()
    }
    
    // For specific regions, get only their chapters
    const regionStates = this.getStatesForRegion(userRegion)
    if (regionStates.length === 0) return []

    const { data, error } = await supabase
      .from('red_cross_geography')
      .select('chapter')
      .in('state', regionStates)
      .order('chapter')

    if (error) throw error
    
    const unique = [...new Set(data?.map(c => c.chapter) || [])]
    return unique.map(chapter => ({
      value: chapter.toLowerCase().replace(/\s+/g, '_'),
      label: chapter
    }))
  }

  /**
   * Get states for a region configuration
   */
  private static getStatesForRegion(userRegion: string): string[] {
    switch (userRegion) {
      case 'FLORIDA':
        return ['FL']
      case 'NEBRASKA_IOWA':
        return ['NE', 'IA']
      case 'NATIONAL':
        return [] // Empty means all states
      default:
        return []
    }
  }

  /**
   * Auto-assign Red Cross hierarchy based on organization address
   */
  static async assignHierarchyToOrganization(organizationId: string, county: string, state: string): Promise<void> {
    // Look up the geography record
    const geography = await this.findByCountyState(county, state)
    if (!geography) {
      throw new Error(`No Red Cross geography found for ${county}, ${state}`)
    }

    // Update the organization with hierarchy info
    const { error } = await supabase
      .from('organizations')
      .update({
        county_id: geography.id,
        // We could also store these directly on organizations table if needed
        // division: geography.division,
        // region: geography.region,
        // chapter: geography.chapter
      })
      .eq('id', organizationId)

    if (error) throw error
  }

  /**
   * Get organization with full Red Cross hierarchy
   */
  static async getOrganizationWithHierarchy(organizationId: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        geography:county_id (
          county,
          state,
          division,
          region,
          chapter,
          division_code,
          region_code,
          chapter_code
        )
      `)
      .eq('id', organizationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }
}