import { NextRequest, NextResponse } from 'next/server'
import { OrganizationService } from '@/lib/organizations'

export async function GET(request: NextRequest) {
  try {
    const organizations = await OrganizationService.getAll()
    
    // Test the filtering logic for Nebraska Iowa Region
    const filterRegion = 'nebraska_iowa_region'
    const searchTerm = filterRegion.toLowerCase().replace(/_/g, ' ') // "nebraska iowa region"
    
    console.log('Testing filter logic:')
    console.log('filterRegion:', filterRegion)
    console.log('searchTerm:', searchTerm)
    
    const nebraska_iowa_orgs = organizations.filter(org => {
      if (!org.county?.region) {
        console.log(`Org ${org.name} has no county.region`)
        return false
      }
      
      const orgRegion = org.county.region.toLowerCase()
      const matches = orgRegion.includes(searchTerm)
      
      console.log(`Org: ${org.name}`)
      console.log(`  - County Region: "${org.county.region}"`)
      console.log(`  - Lowercase: "${orgRegion}"`)
      console.log(`  - Matches "${searchTerm}": ${matches}`)
      
      return matches
    })
    
    console.log(`Found ${nebraska_iowa_orgs.length} Nebraska Iowa organizations`)
    
    return NextResponse.json({
      success: true,
      filterRegion,
      searchTerm,
      totalOrganizations: organizations.length,
      filteredCount: nebraska_iowa_orgs.length,
      nebraska_iowa_orgs: nebraska_iowa_orgs.map(org => ({
        name: org.name,
        city: org.city,
        state: org.state,
        region: org.county?.region,
        chapter: org.county?.chapter,
        county: org.county?.county
      }))
    })
    
  } catch (error) {
    console.error('Filter test error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}