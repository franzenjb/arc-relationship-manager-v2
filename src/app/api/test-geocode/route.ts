import { NextRequest, NextResponse } from 'next/server'
import { GeocodingService } from '@/lib/geocoding'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing single geocoding...')
    
    // Test geocoding Tampa, FL specifically
    const testAddress = 'Tampa, FL'
    
    console.log('1. Testing geocoding service...')
    const coordinates = await GeocodingService.geocodeAddress('', 'Tampa', 'FL', '')
    console.log('Geocoding result:', coordinates)
    
    if (!coordinates) {
      return NextResponse.json({ error: 'Geocoding failed' })
    }
    
    console.log('2. Testing county lookup...')
    const county = await GeocodingService.findCountyByCoordinatesAndName(
      coordinates.latitude,
      coordinates.longitude,
      coordinates.county,
      coordinates.state
    )
    console.log('County result:', county)
    
    console.log('3. Testing full geocode and assign...')
    // Test with a fake organization ID
    const result = await GeocodingService.geocodeAndAssignCounty(
      '51d76ada-3aee-4135-a06e-bfafa896a1b0', // American Red Cross org ID
      '', // address
      'Tampa', // city
      'FL', // state
      '' // zip
    )
    
    return NextResponse.json({
      success: true,
      testAddress,
      coordinates,
      county: county ? {
        id: county.id,
        county: county.county,
        county_long: county.county_long,
        state: county.state,
        region: county.region,
        chapter: county.chapter,
        division: county.division
      } : null,
      finalResult: result
    })
    
  } catch (error) {
    console.error('Test geocoding error:', error)
    return NextResponse.json({ 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}