import { supabase } from './supabase'
import { Organization, SearchFilters } from './types'
import { AuditService } from './audit'

export class OrganizationService {
  static async getAll(filters?: SearchFilters): Promise<Organization[]> {
    let query = supabase
      .from('organizations')
      .select('*')
      .order('updated_at', { ascending: false })

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
    return data || []
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
    return data
  }

  static async create(data: Partial<Organization>): Promise<Organization> {
    // Add audit fields
    const auditFields = await AuditService.createAuditFields()
    const organizationData = {
      ...data,
      ...auditFields
    }

    const { data: org, error } = await supabase
      .from('organizations')
      .insert(organizationData)
      .select('*')
      .single()

    if (error) throw error
    return org
  }

  static async update(id: string, data: Partial<Organization>): Promise<Organization> {
    // Add audit fields
    const auditFields = await AuditService.updateAuditFields()
    const organizationData = {
      ...data,
      ...auditFields
    }

    const { data: org, error } = await supabase
      .from('organizations')
      .update(organizationData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
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
    const redCrossOrg = {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'American Red Cross',
      organization_type: 'nonprofit',
      status: 'active'
    }
    return [redCrossOrg, ...orgs]
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
    // Get basic statistics from tables
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
}