import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🏗️ Setting up geocoding cache table...')
    
    // Create the geocoding_cache table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Geocoding Cache Table
        CREATE TABLE IF NOT EXISTS geocoding_cache (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            cache_key text NOT NULL UNIQUE,
            original_address text NOT NULL,
            latitude decimal(10, 8) NOT NULL,
            longitude decimal(11, 8) NOT NULL,
            formatted_address text NOT NULL,
            accuracy text NOT NULL CHECK (accuracy IN ('EXACT', 'APPROXIMATE', 'FALLBACK')),
            provider text NOT NULL,
            expires_at timestamptz NOT NULL,
            created_at timestamptz DEFAULT now() NOT NULL,
            updated_at timestamptz DEFAULT now() NOT NULL
        );
        
        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_geocoding_cache_key ON geocoding_cache(cache_key);
        CREATE INDEX IF NOT EXISTS idx_geocoding_cache_expires ON geocoding_cache(expires_at);
        CREATE INDEX IF NOT EXISTS idx_geocoding_cache_provider ON geocoding_cache(provider);
      `
    })
    
    if (tableError) {
      console.error('Table creation error:', tableError)
      
      // Try alternative approach - direct SQL execution
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS geocoding_cache (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            cache_key text NOT NULL UNIQUE,
            original_address text NOT NULL,
            latitude decimal(10, 8) NOT NULL,
            longitude decimal(11, 8) NOT NULL,
            formatted_address text NOT NULL,
            accuracy text NOT NULL,
            provider text NOT NULL,
            expires_at timestamptz NOT NULL,
            created_at timestamptz DEFAULT now() NOT NULL,
            updated_at timestamptz DEFAULT now() NOT NULL
        )
      `
      
      const { error: directError } = await supabase.from('_').select('*').limit(0)
      if (directError) {
        // Try to create using raw SQL query
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          },
          body: JSON.stringify({
            sql: createTableSQL
          })
        })
        
        if (!response.ok) {
          throw new Error(`Failed to create table: ${response.statusText}`)
        }
      }
    }
    
    // Test table creation by inserting a test record
    const testResult = {
      cache_key: 'test_key_' + Date.now(),
      original_address: 'Test Address, Test City, Test State',
      latitude: 40.7128,
      longitude: -74.0060,
      formatted_address: 'Test Address, Test City, Test State, United States',
      accuracy: 'EXACT',
      provider: 'test',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('geocoding_cache')
      .insert(testResult)
      .select()
    
    if (insertError) {
      console.error('Test insert error:', insertError)
      throw new Error(`Table exists but insert failed: ${insertError.message}`)
    }
    
    // Clean up test record
    if (insertData && insertData.length > 0) {
      await supabase
        .from('geocoding_cache')
        .delete()
        .eq('id', insertData[0].id)
    }
    
    console.log('✅ Geocoding cache table created successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Geocoding cache table created successfully',
      testInsert: !!insertData
    })
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error),
        message: 'Failed to set up geocoding cache table'
      }, 
      { status: 500 }
    )
  }
}