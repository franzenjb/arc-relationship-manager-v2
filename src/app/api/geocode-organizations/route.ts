import { NextRequest, NextResponse } from 'next/server'
import { GeocodingService } from '@/lib/geocoding'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🌍 Starting bulk geocoding of organizations...')
    
    // Get all organizations without counties
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('id, name, address, city, state, zip, county_id')
      .is('county_id', null)
      .not('city', 'is', null)
    
    if (error) {
      throw new Error(`Failed to fetch organizations: ${error.message}`)
    }
    
    if (!orgs || orgs.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No organizations need geocoding',
        processed: 0,
        success: 0,
        failed: []
      })
    }
    
    console.log(`Found ${orgs.length} organizations to geocode`)
    
    let processed = 0
    let successCount = 0
    const failed: string[] = []
    const results: any[] = []
    
    // Process organizations one by one
    for (const org of orgs) {
      processed++
      console.log(`Processing ${processed}/${orgs.length}: ${org.name}`)
      
      try {
        const result = await GeocodingService.geocodeAndAssignCounty(
          org.id,
          org.address,
          org.city,
          org.state,
          org.zip
        )
        
        if (result.success) {
          successCount++
          results.push({
            organization: org.name,
            status: 'success',
            county: result.county?.county,
            state: result.county?.state,
            coordinates: result.coordinates
          })
          console.log(`✅ ${org.name} -> ${result.county?.county}, ${result.county?.state}`)
        } else {
          failed.push(`${org.name} (${org.city}, ${org.state})`)
          results.push({
            organization: org.name,
            status: 'failed',
            reason: 'Could not geocode or find county'
          })
          console.log(`❌ Failed: ${org.name}`)
        }
      } catch (error) {
        failed.push(`${org.name} - Error: ${error}`)
        results.push({
          organization: org.name,
          status: 'error',
          error: String(error)
        })
        console.error(`Error processing ${org.name}:`, error)
      }
      
      // Be nice to the geocoding service - wait 1 second between requests
      if (processed < orgs.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    const summary = {
      success: true,
      processed,
      successCount,
      failedCount: failed.length,
      failed,
      results
    }
    
    console.log('🎉 Geocoding complete:', summary)
    
    return NextResponse.json(summary)
    
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error) 
      }, 
      { status: 500 }
    )
  }
}