import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ Creating geocoding_cache table...')
    
    // Simple approach - try to query the table first to see if it exists
    const { data: existingData, error: queryError } = await supabase
      .from('geocoding_cache')
      .select('id')
      .limit(1)
    
    if (!queryError) {
      return NextResponse.json({
        success: true,
        message: 'Geocoding cache table already exists',
        tableExists: true
      })
    }
    
    // If table doesn't exist, we'll need to create it manually in Supabase dashboard
    // For now, let's create a simple test to verify our geocoding service works
    
    console.log('Table does not exist. Testing geocoding service without database cache...')
    
    // Test the geocoding service
    const { GeocodingService } = await import('@/lib/geocoding/geocoding.service')
    
    // This will fail gracefully without database cache but test the API
    const testRequest = {
      address: '431 18th Street NW',
      city: 'Washington', 
      state: 'DC',
      country: 'United States'
    }
    
    // Test geocoding without cache (it will try cache but fail gracefully)
    const result = await GeocodingService.geocode(testRequest)
    
    return NextResponse.json({
      success: true,
      message: 'Geocoding service tested successfully (no database cache)',
      tableExists: false,
      testGeocodingResult: result,
      instruction: 'Please create geocoding_cache table manually in Supabase dashboard using the SQL from docs/database/geocoding_cache.sql'
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        message: 'Geocoding test failed'
      }, 
      { status: 500 }
    )
  }
}