import { NextRequest, NextResponse } from 'next/server'
import { OrganizationService } from '@/lib/organizations'
import { getCoordinatesForRegion } from '@/config/regionMapConfig'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const testRegion = url.searchParams.get('region') || 'NATIONAL'
    
    // Override session storage for testing
    const originalWindow = global.window
    global.window = {
      sessionStorage: {
        getItem: (key: string) => {
          if (key === 'userRegion') return testRegion
          return null
        }
      }
    } as any
    
    const organizations = await OrganizationService.getAll(undefined, testRegion)
    
    // Test coordinate lookup for each organization
    const coordinateTests = organizations.map(org => {
      const coords = getCoordinatesForRegion(org.city, testRegion)
      return {
        name: org.name,
        city: org.city,
        state: org.state,
        coordinates: coords,
        hasCoordinates: !!coords
      }
    })
    
    const withCoords = coordinateTests.filter(test => test.hasCoordinates)
    const withoutCoords = coordinateTests.filter(test => !test.hasCoordinates)
    
    // Restore window
    global.window = originalWindow
    
    return NextResponse.json({
      success: true,
      region: testRegion,
      totalOrganizations: organizations.length,
      withCoordinates: withCoords.length,
      withoutCoordinates: withoutCoords.length,
      withCoordinatesOrgs: withCoords,
      withoutCoordinatesOrgs: withoutCoords
    })
    
  } catch (error) {
    console.error('❌ Coordinates test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error) 
      }, 
      { status: 500 }
    )
  }
}