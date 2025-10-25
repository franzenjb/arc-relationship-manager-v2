import { NextRequest, NextResponse } from 'next/server'
import { OrganizationService } from '@/lib/organizations'
import { CoordinatesService } from '@/lib/map/coordinates.service'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const testRegion = url.searchParams.get('region') || 'NATIONAL'
    const limit = parseInt(url.searchParams.get('limit') || '5')
    
    console.log(`🗺️ Testing professional geocoding for ${testRegion} region (limit: ${limit})...`)
    
    // Get organizations for the region
    const organizations = await OrganizationService.getAll(undefined, testRegion)
    const testOrgs = organizations.slice(0, limit)
    
    console.log(`📊 Testing with ${testOrgs.length} organizations`)
    
    // Use the professional coordinates service
    const coordinateMap = await CoordinatesService.resolveOrganizationCoordinates(testOrgs)
    
    // Format results for display
    const results = testOrgs.map(org => {
      const coords = coordinateMap.get(org.id)
      return {
        id: org.id,
        name: org.name,
        city: org.city,
        state: org.state,
        address: org.address,
        coordinates: coords ? {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          source: coords.source
        } : null,
        hasCoordinates: !!coords
      }
    })
    
    const successful = results.filter(r => r.hasCoordinates)
    const failed = results.filter(r => !r.hasCoordinates)
    
    return NextResponse.json({
      success: true,
      region: testRegion,
      totalOrganizations: organizations.length,
      testedOrganizations: testOrgs.length,
      successfulGeocode: successful.length,
      failedGeocode: failed.length,
      successRate: `${Math.round((successful.length / testOrgs.length) * 100)}%`,
      results,
      summary: {
        successful: successful.map(r => `${r.name} (${r.city}, ${r.state}) -> ${r.coordinates?.latitude}, ${r.coordinates?.longitude}`),
        failed: failed.map(r => `${r.name} (${r.city || 'No city'}, ${r.state || 'No state'})`)
      }
    })
    
  } catch (error) {
    console.error('❌ Professional geocoding test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        message: 'Professional geocoding test failed'
      }, 
      { status: 500 }
    )
  }
}