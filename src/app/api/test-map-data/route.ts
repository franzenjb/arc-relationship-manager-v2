import { NextRequest, NextResponse } from 'next/server'
import { OrganizationService } from '@/lib/organizations'

export async function GET(request: NextRequest) {
  try {
    console.log('🗺️ Testing map data loading...')
    
    // Get organizations like the map would
    const organizations = await OrganizationService.getAll()
    
    console.log(`📊 Loaded ${organizations.length} organizations`)
    
    // Check how many have addresses and counties
    const withAddresses = organizations.filter(org => org.address && org.city && org.state)
    const withCounties = organizations.filter(org => org.county)
    
    console.log(`📍 ${withAddresses.length} orgs have addresses`)
    console.log(`🏛️ ${withCounties.length} orgs have county data`)
    
    // Return sample data for verification
    const sampleOrgs = organizations.slice(0, 5).map(org => ({
      id: org.id,
      name: org.name,
      address: org.address,
      city: org.city,
      state: org.state,
      hasCounty: !!org.county,
      county: org.county ? {
        county: org.county.county,
        state: org.county.state,
        region: org.county.region,
        chapter: org.county.chapter
      } : null
    }))
    
    return NextResponse.json({
      success: true,
      totalOrganizations: organizations.length,
      withAddresses: withAddresses.length,
      withCounties: withCounties.length,
      sampleOrganizations: sampleOrgs
    })
    
  } catch (error) {
    console.error('❌ Map data test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error) 
      }, 
      { status: 500 }
    )
  }
}