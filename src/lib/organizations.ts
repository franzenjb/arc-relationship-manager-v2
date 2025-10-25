import { supabase } from './supabase'
import { Organization, SearchFilters } from './types'
import { AuditService } from './audit'
import { getUserRegion, REGIONS } from '@/config/regions'
import { GeocodingService } from './geocoding'

export class OrganizationService {
  static async getAll(filters?: SearchFilters): Promise<Organization[]> {
    let query = supabase
      .from('organizations')
      .select('*')
      .order('name', { ascending: true })

    // Apply region filter based on logged-in user's region
    if (typeof window !== 'undefined') {
      const userRegion = getUserRegion()
      if (userRegion && userRegion !== 'NATIONAL') {
        const regionConfig = REGIONS[userRegion as keyof typeof REGIONS]
        if (regionConfig?.states && regionConfig.states.length > 0) {
          query = query.in('state', regionConfig.states)
        }
      }
      // NATIONAL sees all data, so no filter needed
    }

    // Apply search filter
    if (filters?.query) {
      query = query.ilike('name', `%${filters.query}%`)
    }

    // Apply city filter
    if (filters?.cities?.length) {
      query = query.in('city', filters.cities)
    }

    // Apply state filter
    if (filters?.states?.length) {
      query = query.in('state', filters.states)
    }

    // Apply mission area filter
    if (filters?.mission_areas?.length) {
      query = query.in('mission_area', filters.mission_areas)
    }

    // Apply organization type filter
    if (filters?.organization_types?.length) {
      query = query.in('organization_type', filters.organization_types)
    }

    // Apply status filter
    if (filters?.status?.length) {
      query = query.in('status', filters.status)
    }

    // Apply tags filter (array contains)
    if (filters?.tags?.length) {
      query = query.overlaps('tags', filters.tags)
    }

    // Apply recent activity filter
    if (filters?.has_recent_activity) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte('updated_at', thirtyDaysAgo)
    }

    const { data, error } = await query

    if (error) throw error
    
    const organizations = data || []

    // Get all unique county IDs from organizations
    const countyIds = [...new Set(organizations
      .map(org => org.county_id)
      .filter(Boolean))]

    // Fetch all county data in a single query
    let countyMap = {}
    if (countyIds.length > 0) {
      const { data: counties } = await supabase
        .from('red_cross_geography')
        .select('id, county, state, chapter, region, division')
        .in('id', countyIds)
      
      if (counties) {
        countyMap = counties.reduce((acc, county) => {
          acc[county.id] = county
          return acc
        }, {})
      }
    }

    // Attach county data to organizations
    const orgsWithCounties = organizations.map(org => ({
      ...org,
      county: org.county_id ? countyMap[org.county_id] : null
    }))

    return orgsWithCounties
  }

  static async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    // Manually fetch county information if county_id exists
    if (data && data.county_id) {
      const { data: countyData } = await supabase
        .from('red_cross_geography')
        .select('id, county, state, chapter, region, division')
        .eq('id', data.county_id)
        .single()
      
      if (countyData) {
        data.county = countyData
      }
    }

    return data
  }

  static async create(data: Partial<Organization>): Promise<Organization> {
    // Add audit fields
    const auditFields = await AuditService.createAuditFields()
    let organizationData = {
      ...data,
      ...auditFields
    }

    // Auto-assign county using geocoding if we have address information
    if (!organizationData.county_id && (organizationData.address || organizationData.city) && organizationData.state) {
      try {
        // First try simple city match
        const county = await this.inferCountyFromCityState(organizationData.city || '', organizationData.state)
        if (county) {
          organizationData.county_id = county.id
        }
        // If no direct match, we'll geocode after organization is created
      } catch (error) {
        console.warn('Failed to auto-assign county:', error)
        // Continue without county assignment
      }
    }

    const { data: org, error } = await supabase
      .from('organizations')
      .insert(organizationData)
      .select('*')
      .single()

    if (error) throw error

    // If no county was assigned and we have address info, try geocoding
    if (!org.county_id && (org.address || org.city) && org.state) {
      console.log(`Attempting to geocode organization: ${org.name}`)
      GeocodingService.geocodeAndAssignCounty(
        org.id,
        org.address,
        org.city,
        org.state,
        org.zip
      ).catch(error => {
        console.warn(`Geocoding failed for ${org.name}:`, error)
      })
    }

    return org
  }

  static async update(id: string, data: Partial<Organization>): Promise<Organization> {
    // Add audit fields
    const auditFields = await AuditService.updateAuditFields()
    let organizationData = {
      ...data,
      ...auditFields
    }

    // Auto-assign county if city/state changed but no county_id provided
    if (!organizationData.county_id && (organizationData.city || organizationData.state)) {
      // Get current org to check if we have the missing city or state
      const current = await this.getById(id)
      const city = organizationData.city || current?.city
      const state = organizationData.state || current?.state
      
      if (city && state) {
        try {
          const county = await this.inferCountyFromCityState(city, state)
          if (county) {
            organizationData.county_id = county.id
          }
        } catch (error) {
          console.warn('Failed to auto-assign county:', error)
          // Continue without county assignment
        }
      }
    }

    const { data: org, error } = await supabase
      .from('organizations')
      .update(organizationData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    // If address changed and no county assigned, try geocoding
    if (!org.county_id && (org.address || org.city) && org.state) {
      console.log(`Attempting to geocode updated organization: ${org.name}`)
      GeocodingService.geocodeAndAssignCounty(
        org.id,
        org.address,
        org.city,
        org.state,
        org.zip
      ).catch(error => {
        console.warn(`Geocoding failed for ${org.name}:`, error)
      })
    }

    return org
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getRegions() {
    // Simplified for now - return sample data
    return [
      { id: '550e8400-e29b-41d4-a716-446655440000', name: 'National Capital & Greater Chesapeake', code: 'NCGC' },
      { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Northern California Coastal', code: 'NCC' },
      { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Southern California', code: 'SCA' },
      { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Texas Gulf Coast', code: 'TGC' }
    ]
  }

  static async getOrganizationsWithRedCross(): Promise<any[]> {
    const orgs = await this.getAll()
    
    // Check if American Red Cross already exists
    const hasRedCross = orgs.some(org => 
      org.name.toLowerCase().includes('american red cross') || 
      org.name.toLowerCase() === 'red cross'
    )
    
    // Only add if it doesn't exist
    if (!hasRedCross) {
      const redCrossOrg = {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'American Red Cross',
        organization_type: 'nonprofit',
        status: 'active'
      }
      return [redCrossOrg, ...orgs]
    }
    
    return orgs
  }

  static async getChaptersByRegion(regionId: string) {
    // Simplified for now - return sample data
    return [
      { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Washington DC Metro', code: 'DCM' },
      { id: '550e8400-e29b-41d4-a716-446655440011', name: 'San Francisco Bay Area', code: 'SFBA' }
    ]
  }

  static async getCountiesByChapter(chapterId: string) {
    // Simplified for now - return sample data
    return [
      { id: '550e8400-e29b-41d4-a716-446655440020', name: 'Montgomery County', state_code: 'MD' },
      { id: '550e8400-e29b-41d4-a716-446655440021', name: 'Fairfax County', state_code: 'VA' }
    ]
  }

  static async getDashboardStats() {
    // Apply region filtering like other methods
    if (typeof window !== 'undefined') {
      const userRegion = getUserRegion()
      if (userRegion && userRegion !== 'NATIONAL') {
        const regionConfig = REGIONS[userRegion as keyof typeof REGIONS]
        if (regionConfig?.states && regionConfig.states.length > 0) {
          // Get region-specific stats
          const [orgCount, peopleCount, meetingCount] = await Promise.all([
            supabase.from('organizations').select('id', { count: 'exact' }).in('state', regionConfig.states),
            // For people and meetings, we need to filter by organization state
            this.getRegionPeopleCount(regionConfig.states),
            this.getRegionMeetingCount(regionConfig.states)
          ])

          return {
            total_organizations: orgCount.count || 0,
            total_people: peopleCount,
            total_meetings: meetingCount,
            recent_activities: 0
          }
        }
      }
    }

    // NATIONAL or no region filtering - get all data
    const [orgCount, peopleCount, meetingCount] = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact' }),
      supabase.from('people').select('id', { count: 'exact' }),
      supabase.from('meetings').select('id', { count: 'exact' })
    ])

    return {
      total_organizations: orgCount.count || 0,
      total_people: peopleCount.count || 0,
      total_meetings: meetingCount.count || 0,
      recent_activities: 0
    }
  }

  static async getRegionPeopleCount(states: string[]): Promise<number> {
    // Get org IDs in the region
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .in('state', states)
    
    if (!orgs || orgs.length === 0) return 0
    
    const orgIds = orgs.map(o => o.id)
    const { count } = await supabase
      .from('people')
      .select('id', { count: 'exact' })
      .in('org_id', orgIds)
    
    return count || 0
  }

  static async getRegionMeetingCount(states: string[]): Promise<number> {
    // Get org IDs in the region
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .in('state', states)
    
    if (!orgs || orgs.length === 0) return 0
    
    const orgIds = orgs.map(o => o.id)
    const { count } = await supabase
      .from('meetings')
      .select('id', { count: 'exact' })
      .in('org_id', orgIds)
    
    return count || 0
  }

  static async searchSimilar(name: string, regionId?: string) {
    // Simple similarity search using ILIKE
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .ilike('name', `%${name}%`)
      .limit(5)

    if (error) throw error
    return data || []
  }

  static async getPeopleByOrganization(organizationId: string) {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('org_id', organizationId)
      .order('first_name', { ascending: true })

    if (error) throw error
    return data || []
  }

  /**
   * Attempt to infer county from city and state
   * This is a simple lookup - in production you might want more sophisticated geocoding
   */
  private static async inferCountyFromCityState(city: string, state: string) {
    // First try exact city match from Red Cross geography table
    const { data: exactMatch } = await supabase
      .from('red_cross_geography')
      .select('*')
      .eq('state', state)
      .ilike('city', city)
      .limit(1)
      .single()

    if (exactMatch) return exactMatch

    // If no exact match, return null - geocoding will handle this
    console.log(`No direct match for ${city}, ${state} - will use geocoding`)
    return null
  }

  /**
   * Get organization with full Red Cross hierarchy
   */
  static async getWithHierarchy(id: string) {
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
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }
}