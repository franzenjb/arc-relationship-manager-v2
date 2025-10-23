import { supabase } from './supabase'

export interface GeographicHierarchy {
  id: string
  county_name: string
  state_code: string
  state_name: string
  fips_code?: string
  region_name?: string
  chapter_name?: string
  country: string
  created_at: string
  updated_at: string
}

export class GeographicService {
  // Get all regions
  static async getRegions(): Promise<{ value: string; label: string }[]> {
    const { data, error } = await supabase
      .from('geographic_hierarchy')
      .select('region_name')
      .not('region_name', 'is', null)
      .order('region_name')

    if (error) {
      console.error('Error fetching regions:', error)
      return []
    }

    const uniqueRegions = [...new Set(data.map(item => item.region_name))]
    return uniqueRegions.map(region => ({
      value: region.toLowerCase().replace(/\s+/g, '_'),
      label: region
    }))
  }

  // Get all chapters
  static async getChapters(): Promise<{ value: string; label: string }[]> {
    const { data, error } = await supabase
      .from('geographic_hierarchy')
      .select('chapter_name')
      .not('chapter_name', 'is', null)
      .order('chapter_name')

    if (error) {
      console.error('Error fetching chapters:', error)
      return []
    }

    const uniqueChapters = [...new Set(data.map(item => item.chapter_name))]
    return uniqueChapters.map(chapter => ({
      value: chapter.toLowerCase().replace(/\s+/g, '_'),
      label: chapter
    }))
  }

  // Get all counties
  static async getCounties(): Promise<{ value: string; label: string }[]> {
    const { data, error } = await supabase
      .from('geographic_hierarchy')
      .select('county_name, state_code')
      .order('county_name')

    if (error) {
      console.error('Error fetching counties:', error)
      return []
    }

    return data.map(county => ({
      value: county.county_name.toLowerCase().replace(/\s+/g, '_'),
      label: `${county.county_name}, ${county.state_code}`
    }))
  }

  // Get counties by state
  static async getCountiesByState(stateCode: string): Promise<{ value: string; label: string }[]> {
    const { data, error } = await supabase
      .from('geographic_hierarchy')
      .select('county_name')
      .eq('state_code', stateCode)
      .order('county_name')

    if (error) {
      console.error('Error fetching counties by state:', error)
      return []
    }

    return data.map(county => ({
      value: county.county_name.toLowerCase().replace(/\s+/g, '_'),
      label: county.county_name
    }))
  }

  // Get states
  static async getStates(): Promise<{ value: string; label: string }[]> {
    const { data, error } = await supabase
      .from('geographic_hierarchy')
      .select('state_code, state_name')
      .order('state_name')

    if (error) {
      console.error('Error fetching states:', error)
      return []
    }

    const uniqueStates = data.reduce((acc, state) => {
      if (!acc.some(s => s.state_code === state.state_code)) {
        acc.push(state)
      }
      return acc
    }, [] as typeof data)

    return uniqueStates.map(state => ({
      value: state.state_code,
      label: state.state_name
    }))
  }

  // Filter organizations by geographic criteria
  static async filterOrganizations(filters: {
    region?: string
    chapter?: string
    county?: string
    state?: string
  }) {
    let query = supabase
      .from('organizations')
      .select(`
        *,
        county:geographic_hierarchy(
          county_name,
          state_code,
          state_name,
          region_name,
          chapter_name
        )
      `)

    // Add geographic filters through joins
    if (filters.region) {
      query = query.eq('county.region_name', filters.region)
    }
    if (filters.chapter) {
      query = query.eq('county.chapter_name', filters.chapter)
    }
    if (filters.county) {
      query = query.eq('county.county_name', filters.county)
    }
    if (filters.state) {
      query = query.eq('county.state_code', filters.state)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error filtering organizations:', error)
      return []
    }

    return data || []
  }
}