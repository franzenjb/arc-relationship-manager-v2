import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test basic queries to understand the schema
    
    // Check organizations table
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, county_id')
      .limit(3)
    
    if (orgError) {
      return NextResponse.json({ error: `Organizations error: ${orgError.message}` })
    }

    // Check red_cross_geography table
    const { data: counties, error: countyError } = await supabase
      .from('red_cross_geography')
      .select('id, county, state, chapter, region, division')
      .limit(3)
    
    if (countyError) {
      return NextResponse.json({ error: `Counties error: ${countyError.message}` })
    }

    // Check if any organizations have county_id that matches red_cross_geography.id
    const orgWithCounty = orgs?.find(org => org.county_id)
    let countyMatch = null
    
    if (orgWithCounty) {
      const { data: matchedCounty } = await supabase
        .from('red_cross_geography')
        .select('*')
        .eq('id', orgWithCounty.county_id)
        .single()
      
      countyMatch = matchedCounty
    }

    return NextResponse.json({
      success: true,
      organizations: orgs,
      counties: counties,
      testOrgWithCounty: orgWithCounty,
      matchedCounty: countyMatch
    })
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}