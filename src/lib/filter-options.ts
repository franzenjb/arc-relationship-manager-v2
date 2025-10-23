import { supabase } from './supabase'

export interface FilterOptions {
  cities: string[]
  states: string[]
  mission_areas: string[]
  organization_types: string[]
  statuses: string[]
  tags: string[]
  titles: string[]
  organizations: { id: string; name: string }[]
}

export class FilterOptionsService {
  static async getOrganizationFilterOptions(): Promise<FilterOptions> {
    try {
      // Get all organizations to extract unique values
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*')

      if (orgError) throw orgError

      // Get all people to extract titles and organization relationships
      const { data: people, error: peopleError } = await supabase
        .from('people')
        .select('title, org_id, organization:organizations(id, name)')

      if (peopleError) throw peopleError

      // Extract unique values
      const cities = [...new Set(
        organizations
          ?.filter(org => org.city)
          .map(org => org.city)
          .sort() || []
      )]

      const states = [...new Set(
        organizations
          ?.filter(org => org.state)
          .map(org => org.state)
          .sort() || []
      )]

      const mission_areas = [...new Set(
        organizations
          ?.filter(org => org.mission_area)
          .map(org => org.mission_area)
          .sort() || []
      )]

      const organization_types = [...new Set(
        organizations
          ?.filter(org => org.organization_type)
          .map(org => org.organization_type)
          .sort() || []
      )]

      const statuses = [...new Set(
        organizations
          ?.filter(org => org.status)
          .map(org => org.status)
          .sort() || []
      )]

      const tags = [...new Set(
        organizations
          ?.filter(org => org.tags && org.tags.length > 0)
          .flatMap(org => org.tags || [])
          .sort() || []
      )]

      const titles = [...new Set(
        people
          ?.filter(person => person.title)
          .map(person => person.title)
          .sort() || []
      )]

      const organizationsList = organizations
        ?.map(org => ({ id: org.id, name: org.name }))
        .sort((a, b) => a.name.localeCompare(b.name)) || []

      return {
        cities,
        states,
        mission_areas,
        organization_types,
        statuses,
        tags,
        titles,
        organizations: organizationsList
      }
    } catch (error) {
      console.error('Failed to load filter options:', error)
      return {
        cities: [],
        states: [],
        mission_areas: [],
        organization_types: [],
        statuses: [],
        tags: [],
        titles: [],
        organizations: []
      }
    }
  }

  // Helper function to format enum values to display labels
  static formatLabel(value: string): string {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
}