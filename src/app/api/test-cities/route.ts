import { NextRequest, NextResponse } from 'next/server'
import { OrganizationService } from '@/lib/organizations'

export async function GET(request: NextRequest) {
  try {
    // Get all organizations for national view
    const organizations = await OrganizationService.getAll(undefined, 'NATIONAL')
    
    // Group by state and list cities
    const stateInfo = organizations.reduce((acc, org) => {
      const state = org.state || 'Unknown'
      if (!acc[state]) {
        acc[state] = {
          count: 0,
          cities: new Set()
        }
      }
      acc[state].count++
      if (org.city) {
        acc[state].cities.add(org.city)
      }
      return acc
    }, {} as Record<string, { count: number, cities: Set<string> }>)
    
    // Convert sets to arrays for JSON serialization
    const result = Object.entries(stateInfo).reduce((acc, [state, info]) => {
      acc[state] = {
        count: info.count,
        cities: Array.from(info.cities).sort()
      }
      return acc
    }, {} as Record<string, { count: number, cities: string[] }>)
    
    return NextResponse.json({
      success: true,
      totalOrganizations: organizations.length,
      stateInfo: result
    })
    
  } catch (error) {
    console.error('❌ Cities test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error) 
      }, 
      { status: 500 }
    )
  }
}