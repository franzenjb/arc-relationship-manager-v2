import { supabase } from './supabase'
import { Person, SearchFilters } from './types'
import { AuditService } from './audit'
import { getUserRegion, REGIONS } from '@/config/regions'

export class PersonService {
  static async getAll(filters?: SearchFilters): Promise<Person[]> {
    let query = supabase
      .from('people')
      .select('*, organization:org_id(id, name, city, state)')
      .order('updated_at', { ascending: false })

    // Apply region filter - people belong to organizations in specific states
    if (typeof window !== 'undefined') {
      const userRegion = getUserRegion()
      if (userRegion && userRegion !== 'NATIONAL') {
        const regionConfig = REGIONS[userRegion as keyof typeof REGIONS]
        if (regionConfig?.states && regionConfig.states.length > 0) {
          // First get org IDs in the region
          const { data: orgs } = await supabase
            .from('organizations')
            .select('id')
            .in('state', regionConfig.states)
          
          if (orgs) {
            const orgIds = orgs.map(o => o.id)
            if (orgIds.length > 0) {
              query = query.in('org_id', orgIds)
            }
          }
        }
      }
    }

    // Apply search filter
    if (filters?.query) {
      query = query.or(`first_name.ilike.%${filters.query}%,last_name.ilike.%${filters.query}%,title.ilike.%${filters.query}%,email.ilike.%${filters.query}%`)
    }

    // Apply organization filter
    if (filters?.organization_ids?.length) {
      query = query.in('org_id', filters.organization_ids)
    }

    // Apply title filter
    if (filters?.titles?.length) {
      query = query.in('title', filters.titles)
    }

    let { data, error } = await query

    if (error) throw error
    
    // Apply city/state filters on the organization data (post-query filtering)
    if (data && (filters?.cities?.length || filters?.states?.length)) {
      data = data.filter(person => {
        const orgCity = person.organization?.city
        const orgState = person.organization?.state
        
        let matchesCity = true
        let matchesState = true
        
        if (filters?.cities?.length) {
          matchesCity = orgCity ? filters.cities.includes(orgCity) : false
        }
        
        if (filters?.states?.length) {
          matchesState = orgState ? filters.states.includes(orgState) : false
        }
        
        return matchesCity && matchesState
      })
    }

    return data || []
  }

  static async getById(id: string): Promise<Person | null> {
    const { data, error } = await supabase
      .from('people')
      .select('*, organization:org_id(id, name)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    return data
  }

  static async getByOrganization(orgId: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .eq('org_id', orgId)
      .order('last_name')

    if (error) throw error
    return data || []
  }

  static async create(data: Partial<Person>): Promise<Person> {
    const auditFields = await AuditService.createAuditFields()
    const personData = { ...data, ...auditFields }

    const { data: person, error } = await supabase
      .from('people')
      .insert(personData)
      .select(`
        *, 
        organization:org_id(id, name)
      `)
      .single()

    if (error) throw error
    return person
  }

  static async update(id: string, data: Partial<Person>): Promise<Person> {
    const auditFields = await AuditService.updateAuditFields()
    const personData = { ...data, ...auditFields }

    const { data: person, error } = await supabase
      .from('people')
      .update(personData)
      .eq('id', id)
      .select(`
        *, 
        organization:org_id(id, name)
      `)
      .single()

    if (error) throw error
    return person
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async searchByEmail(email: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*, organization:org_id(id, name)')
      .ilike('email', `%${email}%`)
      .limit(10)

    if (error) throw error
    return data || []
  }

  static async searchByName(name: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('people')
      .select('*, organization:org_id(id, name)')
      .or(`first_name.ilike.%${name}%,last_name.ilike.%${name}%`)
      .limit(10)

    if (error) throw error
    return data || []
  }
}