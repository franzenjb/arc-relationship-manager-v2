import { supabase } from './supabase'
import { RelationshipManager } from './types'

export class RelationshipManagerService {
  static async getByOrganization(organizationId: string): Promise<RelationshipManager[]> {
    try {
      const { data, error } = await supabase
        .from('relationship_managers')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true })

      if (error) {
        // If table doesn't exist, return empty array for now
        if (error.message.includes('relationship_managers') && error.message.includes('does not exist')) {
          console.warn('Relationship managers table does not exist yet. Please run migration 005.')
          return []
        }
        throw error
      }
      return data || []
    } catch (error: any) {
      console.error('Error loading relationship managers:', error)
      return []
    }
  }

  static async create(data: Partial<RelationshipManager>): Promise<RelationshipManager> {
    try {
      const { data: manager, error } = await supabase
        .from('relationship_managers')
        .insert(data)
        .select('*')
        .single()

      if (error) {
        if (error.message.includes('relationship_managers') && error.message.includes('does not exist')) {
          throw new Error('Relationship managers feature is not yet available. The database table needs to be created.')
        }
        throw error
      }
      return manager
    } catch (error: any) {
      if (error.message.includes('schema cache')) {
        throw new Error('Relationship managers feature is not yet available. The database table needs to be created.')
      }
      throw error
    }
  }

  static async update(id: string, data: Partial<RelationshipManager>): Promise<RelationshipManager> {
    try {
      const { data: manager, error } = await supabase
        .from('relationship_managers')
        .update(data)
        .eq('id', id)
        .select('*')
        .single()

      if (error) {
        if (error.message.includes('relationship_managers') && error.message.includes('does not exist')) {
          throw new Error('Relationship managers feature is not yet available. The database table needs to be created.')
        }
        throw error
      }
      return manager
    } catch (error: any) {
      if (error.message.includes('schema cache')) {
        throw new Error('Relationship managers feature is not yet available. The database table needs to be created.')
      }
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('relationship_managers')
        .delete()
        .eq('id', id)

      if (error) {
        if (error.message.includes('relationship_managers') && error.message.includes('does not exist')) {
          throw new Error('Relationship managers feature is not yet available. The database table needs to be created.')
        }
        throw error
      }
    } catch (error: any) {
      if (error.message.includes('schema cache')) {
        throw new Error('Relationship managers feature is not yet available. The database table needs to be created.')
      }
      throw error
    }
  }

  static async getById(id: string): Promise<RelationshipManager | null> {
    try {
      const { data, error } = await supabase
        .from('relationship_managers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        if (error.message.includes('relationship_managers') && error.message.includes('does not exist')) {
          return null
        }
        throw error
      }
      return data
    } catch (error: any) {
      if (error.message.includes('schema cache')) {
        return null
      }
      throw error
    }
  }
}