import { AuthService } from './auth'

export class AuditService {
  /**
   * Get current user ID for audit trail
   */
  static async getCurrentUserId(): Promise<string | null> {
    try {
      const user = await AuthService.getCurrentUser()
      return user?.id || null
    } catch (error) {
      console.error('Failed to get current user for audit:', error)
      return null
    }
  }

  /**
   * Create audit fields for new records
   */
  static async createAuditFields() {
    const userId = await this.getCurrentUserId()
    return {
      created_by: userId,
      updated_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Create update audit fields for existing records
   */
  static async updateAuditFields() {
    const userId = await this.getCurrentUserId()
    return {
      updated_by: userId,
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Format user name for display
   */
  static formatUserName(user?: { first_name?: string; last_name?: string; email?: string }): string {
    if (!user) return 'Unknown User'
    
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim()
    }
    
    return user.email || 'Unknown User'
  }

  /**
   * Format audit trail message
   */
  static formatAuditMessage(
    action: 'created' | 'updated',
    user?: { first_name?: string; last_name?: string; email?: string },
    timestamp?: string
  ): string {
    const userName = this.formatUserName(user)
    const time = timestamp ? new Date(timestamp).toLocaleString() : 'Unknown time'
    
    return `${action === 'created' ? 'Created' : 'Last updated'} by ${userName} on ${time}`
  }
}