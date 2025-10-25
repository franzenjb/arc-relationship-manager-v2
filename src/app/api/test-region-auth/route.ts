import { NextRequest, NextResponse } from 'next/server'
import { OrganizationService } from '@/lib/organizations'
import { getUserRegion, REGIONS } from '@/config/regions'

export async function GET(request: NextRequest) {
  try {
    // Get region from query parameter for testing
    const url = new URL(request.url)
    const testRegion = url.searchParams.get('region')
    
    console.log('🔍 Testing region authentication logic...')
    console.log('Test region:', testRegion)
    
    // Simulate region being in session
    if (testRegion) {
      // Temporarily override for testing
      const originalWindow = global.window
      global.window = {
        sessionStorage: {
          getItem: (key: string) => {
            if (key === 'userRegion') return testRegion
            return null
          }
        }
      } as any
      
      const userRegion = testRegion
      console.log('User region:', userRegion)
      
      if (userRegion && userRegion !== 'NATIONAL') {
        const regionConfig = REGIONS[userRegion as keyof typeof REGIONS]
        console.log('Region config:', regionConfig)
        console.log('States filter:', regionConfig?.states)
        
        if (regionConfig?.states && regionConfig.states.length > 0) {
          console.log(`Would filter organizations by states: ${regionConfig.states.join(', ')}`)
        }
      } else if (userRegion === 'NATIONAL') {
        console.log('NATIONAL user - no state filtering')
      }
      
      // Restore window
      global.window = originalWindow
    }
    
    // Get organizations using the new region parameter
    const organizations = await OrganizationService.getAll(undefined, testRegion || undefined)
    
    // Group by state for analysis
    const orgsByState = organizations.reduce((acc, org) => {
      const state = org.state || 'Unknown'
      if (!acc[state]) acc[state] = 0
      acc[state]++
      return acc
    }, {} as Record<string, number>)
    
    return NextResponse.json({
      success: true,
      testRegion,
      totalOrganizations: organizations.length,
      organizationsByState: orgsByState,
      regionConfigs: {
        FLORIDA: REGIONS.FLORIDA.states,
        NEBRASKA_IOWA: REGIONS.NEBRASKA_IOWA.states,
        NATIONAL: REGIONS.NATIONAL.states
      }
    })
    
  } catch (error) {
    console.error('❌ Region auth test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error) 
      }, 
      { status: 500 }
    )
  }
}