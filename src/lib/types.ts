// Counties are the main geographic unit
// They contain chapter, region, and division information
export interface County {
  id: string
  name: string
  state_code: string
  fips_code?: string
  
  // Geographic hierarchy fields
  chapter?: string
  chapter_code?: string
  region?: string
  region_code?: string
  division?: string
  division_code?: string
  
  created_at: string
  updated_at?: string
}

export interface Organization {
  id: string
  name: string
  description?: string
  mission_area?: 'disaster_relief' | 'health_safety' | 'military_families' | 'international' | 'blood_services' | 'other'
  organization_type?: 'government' | 'nonprofit' | 'business' | 'faith_based' | 'educational' | 'healthcare' | 'other'
  
  // Geographic assignment
  region_id?: string
  chapter_id?: string
  county_id?: string
  
  // Location data
  address?: string
  city?: string
  state?: string
  zip?: string
  
  // Contact info
  website?: string
  phone?: string
  
  // Red Cross relationship fields
  relationship_manager_id?: string
  alternate_relationship_manager_id?: string
  partner_type?: string
  last_contact_date?: string
  goals?: string
  
  // Mission areas (many-to-many)
  mission_areas?: string[]
  
  // Lines of Service (many-to-many)
  lines_of_service?: string[]
  
  // Metadata
  tags?: string[]
  notes?: string
  status: 'active' | 'inactive' | 'prospect'
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  
  // Relations
  county?: County
  people?: Person[]
  meetings?: Meeting[]
  relationship_manager?: StaffMember
  alternate_relationship_manager?: StaffMember
  created_by_user?: UserProfile
  updated_by_user?: UserProfile
}

export interface Person {
  id: string
  org_id: string
  first_name?: string
  last_name?: string
  title?: string
  email?: string
  phone?: string
  
  // Address information (for sole proprietors)
  address?: string
  city?: string
  state?: string
  zip?: string
  county_id?: string
  
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  
  // Relations
  organization?: Organization
  county?: County
  meetings?: Meeting[]
  created_by_user?: UserProfile
  updated_by_user?: UserProfile
}

export interface Meeting {
  id: string
  org_id: string
  meeting_name?: string
  description?: string
  summary?: string  // Brief summary of meeting outcomes
  date: string
  next_meeting_date?: string
  location?: string
  notes?: string
  agenda?: string
  lead_organization_id?: string
  primary_external_poc_id?: string
  county_id?: string
  
  // Attendees
  attendees?: string[]
  rc_attendees?: string[]  // Red Cross staff member IDs
  other_organizations?: string[]  // Other organization IDs
  
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  
  // Relations
  organization?: Organization
  lead_organization?: Organization
  primary_external_poc?: Person
  county?: County
  attachments?: Attachment[]
  created_by_user?: UserProfile
  updated_by_user?: UserProfile
}

export interface Attachment {
  id: string
  meeting_id: string
  storage_path: string
  file_name?: string
  mime_type?: string
  uploaded_by?: string
  created_at: string
  
  // Relations
  meeting?: Meeting
}

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

export interface UserProfile {
  id: string
  email: string
  role: 'national_admin' | 'regional_lead' | 'chapter_user' | 'read_only'
  region_id?: string
  chapter_id?: string
  first_name?: string
  last_name?: string
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface RelationshipManagerInfo {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
}

export interface RelationshipManager {
  id: string
  organization_id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface ActivityLog {
  id: string
  actor_user_id: string
  entity_type: 'organization' | 'person' | 'meeting' | 'attachment' | 'relationship_manager'
  entity_id: string
  action: 'created' | 'updated' | 'deleted'
  payload?: Record<string, any>
  timestamp: string
}

// Search and filtering types
export interface SearchFilters {
  query?: string
  region_ids?: string[]
  chapter_ids?: string[]
  organization_ids?: string[]
  mission_areas?: Organization['mission_area'][]
  organization_types?: Organization['organization_type'][]
  status?: Organization['status'][]
  has_recent_activity?: boolean
  has_upcoming_followups?: boolean
  tags?: string[]
  cities?: string[]
  states?: string[]
  titles?: string[]
  date_from?: string
  date_to?: string
}

export interface DashboardStats {
  total_organizations: number
  total_people: number
  total_meetings: number
  pending_followups: number
  recent_activity_count: number
  organizations_by_mission_area: Record<string, number>
  meetings_this_month: number
  new_organizations_this_month: number
}