/**
 * Comprehensive validation utilities for the application
 */

export class ValidationService {
  /**
   * Check if email already exists in the database
   */
  static async isEmailUnique(email: string, excludePersonId?: string): Promise<boolean> {
    const { supabase } = await import('./supabase')
    
    let query = supabase
      .from('people')
      .select('id')
      .ilike('email', email)
    
    if (excludePersonId) {
      query = query.neq('id', excludePersonId)
    }
    
    const { data } = await query
    return !data || data.length === 0
  }

  /**
   * Validate that follow-up date is after meeting date
   */
  static validateMeetingDates(meetingDate: string, followUpDate?: string): string | null {
    if (!followUpDate) return null
    
    const meeting = new Date(meetingDate)
    const followUp = new Date(followUpDate)
    
    if (followUp <= meeting) {
      return 'Follow-up date must be after the meeting date'
    }
    
    return null
  }

  /**
   * Validate meeting is not too far in the past
   */
  static validatePastMeetingDate(meetingDate: string, maxYearsAgo = 5): string | null {
    const meeting = new Date(meetingDate)
    const maxPastDate = new Date()
    maxPastDate.setFullYear(maxPastDate.getFullYear() - maxYearsAgo)
    
    if (meeting < maxPastDate) {
      return `Meeting date cannot be more than ${maxYearsAgo} years in the past`
    }
    
    return null
  }

  /**
   * Validate meeting is not too far in the future
   */
  static validateFutureMeetingDate(meetingDate: string, maxYearsAhead = 1): string | null {
    const meeting = new Date(meetingDate)
    const maxFutureDate = new Date()
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + maxYearsAhead)
    
    if (meeting > maxFutureDate) {
      return `Meeting date cannot be more than ${maxYearsAhead} year(s) in the future`
    }
    
    return null
  }

  /**
   * Validate phone number format
   */
  static formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX if 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    
    // Return original if not 10 digits
    return phone
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Check if organization has required fields
   */
  static validateOrganization(org: any): string[] {
    const errors: string[] = []
    
    if (!org.name?.trim()) {
      errors.push('Organization name is required')
    }
    
    // Optional: Require at least city or state
    if (!org.city?.trim() && !org.state?.trim()) {
      errors.push('At least city or state is required for organization')
    }
    
    return errors
  }

  /**
   * Check if person has required fields
   */
  static validatePerson(person: any): string[] {
    const errors: string[] = []
    
    if (!person.first_name?.trim() && !person.last_name?.trim()) {
      errors.push('At least first name or last name is required')
    }
    
    if (person.email && !this.validateEmail(person.email)) {
      errors.push('Invalid email format')
    }
    
    return errors
  }

  /**
   * Check if meeting has minimum required data
   */
  static validateMeeting(meeting: any): string[] {
    const errors: string[] = []
    
    if (!meeting.org_id) {
      errors.push('Organization is required for meeting')
    }
    
    if (!meeting.date) {
      errors.push('Meeting date is required')
    }
    
    // Check date validations
    if (meeting.date) {
      const pastError = this.validatePastMeetingDate(meeting.date)
      if (pastError) errors.push(pastError)
      
      const futureError = this.validateFutureMeetingDate(meeting.date)
      if (futureError) errors.push(futureError)
      
      if (meeting.follow_up_date) {
        const dateError = this.validateMeetingDates(meeting.date, meeting.follow_up_date)
        if (dateError) errors.push(dateError)
      }
    }
    
    // Optional: Require at least summary or attendees
    if (!meeting.summary?.trim() && (!meeting.attendees || meeting.attendees.length === 0)) {
      errors.push('Please add meeting notes or attendees')
    }
    
    return errors
  }
}