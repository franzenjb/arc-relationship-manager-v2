import { supabase } from './supabase'

export interface StaffMember {
  id: string
  employee_id?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  title?: string
  department?: string
  region_id?: string
  chapter_id?: string
  role?: 'employee' | 'volunteer'
  status: 'active' | 'inactive'
  hire_date?: string
  created_at: string
  updated_at: string
}

export interface MissionArea {
  id: string
  name: string
  category?: string
  description?: string
}

export interface LineOfService {
  id: string
  name: string
  description?: string
}

export interface PartnerType {
  id: string
  name: string
  description?: string
}

export class StaffService {
  static async getAll(): Promise<StaffMember[]> {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .order('last_name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<StaffMember | null> {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  static async getActive(): Promise<StaffMember[]> {
    const { data, error } = await supabase
      .from('staff_members')
      .select('*')
      .eq('status', 'active')
      .order('last_name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getMissionAreas(): Promise<MissionArea[]> {
    const { data, error } = await supabase
      .from('mission_areas')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getLinesOfService(): Promise<LineOfService[]> {
    const { data, error } = await supabase
      .from('lines_of_service')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getPartnerTypes(): Promise<PartnerType[]> {
    const { data, error } = await supabase
      .from('partner_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }
}