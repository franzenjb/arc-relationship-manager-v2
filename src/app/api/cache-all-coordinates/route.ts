import { NextRequest, NextResponse } from 'next/server'
import { OrganizationService } from '@/lib/organizations'
import { supabase } from '@/lib/supabase'
import { getCachedCoordinates } from '@/lib/geocoding/geocoding.cache'

export async function POST(request: NextRequest) {
  try {
    console.log('🗺️ Pre-caching all organization coordinates...')
    
    // Get all organizations
    const organizations = await OrganizationService.getAll(undefined, 'NATIONAL')
    console.log(`Found ${organizations.length} organizations`)
    
    let updated = 0
    let alreadyCached = 0
    let failed = 0
    
    for (const org of organizations) {
      if (!org.city || !org.state) {
        failed++
        continue
      }
      
      // Check if coordinates already exist
      if (org.latitude && org.longitude) {
        alreadyCached++
        continue
      }
      
      // Get coordinates from precomputed cache
      const coords = getCachedCoordinates(org.city, org.state)
      
      if (coords) {
        // Update organization with coordinates
        const { error } = await supabase
          .from('organizations')
          .update({
            latitude: coords.latitude,
            longitude: coords.longitude,
            coordinate_accuracy: coords.accuracy,
            coordinate_source: coords.source,
            coordinates_cached_at: new Date().toISOString()
          })
          .eq('id', org.id)
        
        if (error) {
          console.error(`Failed to update ${org.name}:`, error)
          failed++
        } else {
          console.log(`✅ Cached coordinates for ${org.name} (${org.city}, ${org.state})`)
          updated++
        }
      } else {
        console.warn(`❌ No coordinates found for ${org.name} (${org.city}, ${org.state})`)
        failed++
      }
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    return NextResponse.json({
      success: true,
      message: 'Coordinate caching complete',
      results: {
        total: organizations.length,
        updated,
        alreadyCached,
        failed
      }
    })
    
  } catch (error) {
    console.error('❌ Coordinate caching failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error) 
      }, 
      { status: 500 }
    )
  }
}