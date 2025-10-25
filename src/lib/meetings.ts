import { supabase } from './supabase'
import { Meeting, SearchFilters } from './types'
import { AuditService } from './audit'
import { getUserRegion, REGIONS } from '@/config/regions'

export class MeetingService {
  static async getAll(filters?: SearchFilters): Promise<Meeting[]> {
    let query = supabase
      .from('meetings')
      .select('*, organization:org_id(id, name, state)')
      .order('date', { ascending: false })

    // Apply region filter - meetings belong to organizations in specific states
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

    // Apply search filter - removed textSearch (no search_vector column)

    // Apply organization filter
    if (filters?.organization_ids?.length) {
      query = query.in('org_id', filters.organization_ids)
    }

    // Apply date range filter
    if (filters?.date_from) {
      query = query.gte('date', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('date', filters.date_to)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async getById(id: string): Promise<Meeting | null> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*, organization:org_id(id, name)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }
    
    // Fetch attendees from junction table
    if (data) {
      const { data: attendees } = await supabase
        .from('meeting_attendees')
        .select('person_id')
        .eq('meeting_id', id)
      
      if (attendees) {
        data.attendees = attendees.map(a => a.person_id)
      }
    }
    
    return data
  }

  static async getByOrganization(orgId: string): Promise<Meeting[]> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*, organization:org_id(id, name)')
      .eq('org_id', orgId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getUpcoming(limit = 10): Promise<Meeting[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('meetings')
      .select('*, organization:org_id(id, name)')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  static async getFollowUps(): Promise<Meeting[]> {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('meetings')
      .select('*, organization:org_id(id, name)')
      .not('follow_up_date', 'is', null)
      .lte('follow_up_date', today)
      .order('follow_up_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async create(data: Partial<Meeting>): Promise<Meeting> {
    const auditFields = await AuditService.createAuditFields()
    
    // Extract attendees from data (they go in junction table, not meetings table)
    const { attendees, ...meetingDataWithoutAttendees } = data
    const meetingData = { ...meetingDataWithoutAttendees, ...auditFields }

    // Create the meeting first
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert(meetingData)
      .select(`
        *, 
        organization:org_id(id, name)
      `)
      .single()

    if (error) throw error

    // If attendees were provided, add them to the junction table
    if (meeting && attendees && attendees.length > 0) {
      const attendeeRecords = attendees.map(personId => ({
        meeting_id: meeting.id,
        person_id: personId,
        created_by: auditFields.created_by
      }))

      const { error: attendeeError } = await supabase
        .from('meeting_attendees')
        .insert(attendeeRecords)

      if (attendeeError) {
        console.error('Failed to add attendees:', attendeeError)
        // Don't throw - meeting was created successfully
      }
    }

    return meeting
  }

  static async update(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const auditFields = await AuditService.updateAuditFields()
    
    // Extract attendees from data (they go in junction table, not meetings table)
    const { attendees, ...meetingDataWithoutAttendees } = data
    const meetingData = { ...meetingDataWithoutAttendees, ...auditFields }

    const { data: meeting, error } = await supabase
      .from('meetings')
      .update(meetingData)
      .eq('id', id)
      .select(`
        *, 
        organization:org_id(id, name)
      `)
      .single()

    if (error) throw error
    
    // If attendees were provided, update them in the junction table
    if (meeting && attendees !== undefined) {
      // First delete existing attendees
      await supabase
        .from('meeting_attendees')
        .delete()
        .eq('meeting_id', id)
      
      // Then add new attendees if any
      if (attendees.length > 0) {
        const attendeeRecords = attendees.map(personId => ({
          meeting_id: id,
          person_id: personId,
          created_by: auditFields.updated_by
        }))

        const { error: attendeeError } = await supabase
          .from('meeting_attendees')
          .insert(attendeeRecords)

        if (attendeeError) {
          console.error('Failed to update attendees:', attendeeError)
        }
      }
    }
    
    return meeting
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}