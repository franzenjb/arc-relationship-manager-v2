import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get organizations with basic info
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('id, name, city, state, county_id')
      .limit(20)
    
    if (error) {
      throw new Error(`Failed to fetch organizations: ${error.message}`)
    }

    // Get people with basic info  
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id, first_name, last_name, county_id')
      .limit(20)

    if (peopleError) {
      throw new Error(`Failed to fetch people: ${peopleError.message}`)
    }

    // Now get hierarchy info for assigned counties
    const countyIds = [...new Set([
      ...orgs?.filter(o => o.county_id).map(o => o.county_id) || [],
      ...people?.filter(p => p.county_id).map(p => p.county_id) || []
    ])]

    let countyHierarchy = {}
    if (countyIds.length > 0) {
      const { data: counties, error: countyError } = await supabase
        .from('red_cross_geography')
        .select('id, county, state, chapter, region, division')
        .in('id', countyIds)

      if (!countyError && counties) {
        countyHierarchy = counties.reduce((acc, county) => {
          acc[county.id] = county
          return acc
        }, {})
      }
    }

    // Count totals
    const { count: totalOrgs } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    const { count: orgsWithCounties } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
      .not('county_id', 'is', null)

    const { count: totalPeople } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true })

    const { count: peopleWithCounties } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true })
      .not('county_id', 'is', null)

    // Add hierarchy info to samples
    const orgsWithHierarchy = orgs?.map(org => ({
      ...org,
      hierarchy: org.county_id ? countyHierarchy[org.county_id] : null
    }))

    const peopleWithHierarchy = people?.map(person => ({
      ...person,
      hierarchy: person.county_id ? countyHierarchy[person.county_id] : null
    }))

    return NextResponse.json({
      success: true,
      stats: {
        organizations: {
          total: totalOrgs,
          withCounties: orgsWithCounties,
          percentage: totalOrgs ? Math.round((orgsWithCounties || 0) / totalOrgs * 100) : 0
        },
        people: {
          total: totalPeople,
          withCounties: peopleWithCounties,
          percentage: totalPeople ? Math.round((peopleWithCounties || 0) / totalPeople * 100) : 0
        }
      },
      countyIds: countyIds,
      countyHierarchy: countyHierarchy,
      sampleOrganizations: orgsWithHierarchy,
      samplePeople: peopleWithHierarchy
    })
    
  } catch (error) {
    console.error('Check counties API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error) 
      }, 
      { status: 500 }
    )
  }
}