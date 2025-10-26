import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🗂️ Adding coordinate columns to organizations table...')
    
    // Check if columns already exist by trying to select them
    const { data, error: checkError } = await supabase
      .from('organizations')
      .select('latitude, longitude')
      .limit(1)
    
    if (checkError && checkError.message.includes('column') && checkError.message.includes('does not exist')) {
      console.log('Coordinate columns do not exist, need to add them manually in Supabase dashboard')
      
      return NextResponse.json({
        success: false,
        message: 'Coordinate columns need to be added manually',
        instruction: 'Please add these columns to the organizations table in Supabase:\n- latitude (decimal)\n- longitude (decimal)\n- coordinate_accuracy (text)\n- coordinate_source (text)\n- coordinates_cached_at (timestamptz)',
        sqlToRun: `
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS latitude decimal(10, 8),
ADD COLUMN IF NOT EXISTS longitude decimal(11, 8),
ADD COLUMN IF NOT EXISTS coordinate_accuracy text,
ADD COLUMN IF NOT EXISTS coordinate_source text,
ADD COLUMN IF NOT EXISTS coordinates_cached_at timestamptz;
        `
      })
    } else if (data) {
      return NextResponse.json({
        success: true,
        message: 'Coordinate columns already exist',
        columnsExist: true
      })
    } else {
      throw new Error('Unable to check column existence')
    }
    
  } catch (error) {
    console.error('❌ Column check failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: String(error) 
      }, 
      { status: 500 }
    )
  }
}