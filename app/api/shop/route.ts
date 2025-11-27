import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/shop
 * Fetch all available shop items
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const supabase = createServerClient()

    let query = supabase
      .from('shop_items')
      .select('*')
      .eq('is_active', true)
      .order('point_cost', { ascending: true })

    if (category) {
      query = query.eq('category', category)
    }

    const { data: items, error } = await query

    if (error) {
      console.error('Error fetching shop items:', error)
      return NextResponse.json(
        { error: 'Failed to fetch shop items' },
        { status: 500 }
      )
    }

    // Filter out items with 0 stock
    const availableItems = items?.filter(
      (item) => item.stock_quantity === null || item.stock_quantity > 0
    )

    return NextResponse.json(availableItems || [])
  } catch (error) {
    console.error('Error fetching shop items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shop items' },
      { status: 500 }
    )
  }
}
