import { supabase } from './supabase'
import { Person, SearchFilters } from './types'
import { AuditService } from './audit'
import { getUserRegion, REGIONS } from '@/config/regions'
import { GeocodingService } from './geocoding'

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

    const people = data || []

    // Manually fetch county information for people that have county_id
    const peopleWithCounties = []
    for (const person of people) {
      if (person.county_id) {
        const { data: countyData } = await supabase
          .from('red_cross_geography')
          .select('id, county, state, chapter, region, division')
          .eq('id', person.county_id)
          .single()
        
        if (countyData) {
          person.county = countyData
        }
      }
      peopleWithCounties.push(person)
    }

    return peopleWithCounties
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
    let personData = { ...data, ...auditFields }

    // Auto-assign county using geocoding if we have address information
    if (!personData.county_id && (personData.address || personData.city) && personData.state) {
      try {
        // First try simple city match in Red Cross geography
        const { data: exactMatch } = await supabase
          .from('red_cross_geography')
          .select('*')
          .eq('state', personData.state)
          .ilike('city', personData.city || '')
          .limit(1)
          .single()

        if (exactMatch) {
          personData.county_id = exactMatch.id
        }
        // If no direct match, geocoding will happen after creation
      } catch (error) {
        console.warn('Failed to auto-assign county to person:', error)
      }
    }

    const { data: person, error } = await supabase
      .from('people')
      .insert(personData)
      .select(`
        *, 
        organization:org_id(id, name),
        county:county_id(county, state, region, chapter, division)
      `)
      .single()

    if (error) throw error

    // If no county was assigned and we have address info, try geocoding
    if (!person.county_id && (person.address || person.city) && person.state) {
      console.log(`Attempting to geocode person: ${person.first_name} ${person.last_name}`)
      GeocodingService.geocodeAndAssignCounty(
        person.id,
        person.address,
        person.city,
        person.state,
        person.zip,
        'people'
      ).catch(error => {
        console.warn(`Geocoding failed for person ${person.first_name} ${person.last_name}:`, error)
      })
    }

    return person
  }

  static async update(id: string, data: Partial<Person>): Promise<Person> {
    const auditFields = await AuditService.updateAuditFields()
    let personData = { ...data, ...auditFields }

    // Auto-assign county if address changed but no county assigned
    if (!personData.county_id && (personData.address || personData.city || personData.state)) {
      // Get current person to check if we have the missing address info
      const current = await this.getById(id)
      const address = personData.address || current?.address
      const city = personData.city || current?.city
      const state = personData.state || current?.state
      
      if (city && state) {
        try {
          const { data: exactMatch } = await supabase
            .from('red_cross_geography')
            .select('*')
            .eq('state', state)
            .ilike('city', city)
            .limit(1)
            .single()

          if (exactMatch) {
            personData.county_id = exactMatch.id
          }
        } catch (error) {
          console.warn('Failed to auto-assign county to person:', error)
        }
      }
    }

    const { data: person, error } = await supabase
      .from('people')
      .update(personData)
      .eq('id', id)
      .select(`
        *, 
        organization:org_id(id, name),
        county:county_id(county, state, region, chapter, division)
      `)
      .single()

    if (error) throw error

    // If address changed and no county assigned, try geocoding
    if (!person.county_id && (person.address || person.city) && person.state) {
      console.log(`Attempting to geocode updated person: ${person.first_name} ${person.last_name}`)
      GeocodingService.geocodeAndAssignCounty(
        person.id,
        person.address,
        person.city,
        person.state,
        person.zip,
        'people'
      ).catch(error => {
        console.warn(`Geocoding failed for person ${person.first_name} ${person.last_name}:`, error)
      })
    }

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