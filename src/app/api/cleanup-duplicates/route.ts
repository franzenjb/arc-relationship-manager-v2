import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // IDs of known duplicates to delete
    const duplicateIds = [
      '70536a63-08e2-4a60-a65b-1391a7366a0f', // Florida Div duplicate
      '7c0532e9-6b5b-4532-8ddb-ed022b6a6fe5',  // Tampa General duplicate  
      '4cbdc4fd-5d4b-434a-9ed3-fe9c9955a136'   // United Way duplicate
    ]

    const results = []

    for (const id of duplicateIds) {
      // First check if it exists
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', id)
        .single()

      if (!org) {
        results.push({ id, status: 'not_found' })
        continue
      }

      // Try to delete
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id)

      if (error) {
        results.push({ id, name: org.name, status: 'error', error: error.message })
      } else {
        results.push({ id, name: org.name, status: 'deleted' })
      }
    }

    // Get final count
    const { count } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      results,
      finalCount: count,
      message: `Cleanup complete. ${results.filter(r => r.status === 'deleted').length} duplicates removed.`
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}