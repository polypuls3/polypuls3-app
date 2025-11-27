import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * POST /api/shop/purchase
 * Purchase a shop item with points
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, itemId } = body

    if (!userId || !itemId) {
      return NextResponse.json(
        { error: 'userId and itemId are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, total_points')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get shop item
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .eq('is_active', true)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found or not available' },
        { status: 404 }
      )
    }

    // Check stock
    if (item.stock_quantity !== null && item.stock_quantity <= 0) {
      return NextResponse.json(
        { error: 'Item is out of stock' },
        { status: 400 }
      )
    }

    // Check if user has enough points
    if (profile.total_points < item.point_cost) {
      return NextResponse.json(
        { error: 'Insufficient points', required: item.point_cost, available: profile.total_points },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Deduct points
    const newTotalPoints = profile.total_points - item.point_cost
    await supabase
      .from('user_profiles')
      .update({ total_points: newTotalPoints, updated_at: now })
      .eq('id', userId)

    // Record transaction
    await supabase.from('point_transactions').insert({
      user_id: userId,
      amount: -item.point_cost,
      transaction_type: 'shop_purchase',
      reference_type: 'shop_item',
      reference_id: itemId,
      description: `Purchased: ${item.name}`,
    })

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from('reward_redemptions')
      .insert({
        user_id: userId,
        item_id: itemId,
        points_spent: item.point_cost,
        status: item.reward_type === 'digital' ? 'completed' : 'pending',
        reward_data: item.reward_data,
      })
      .select()
      .single()

    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError)
      // Rollback points (best effort)
      await supabase
        .from('user_profiles')
        .update({ total_points: profile.total_points })
        .eq('id', userId)

      return NextResponse.json(
        { error: 'Failed to process purchase' },
        { status: 500 }
      )
    }

    // Decrease stock if applicable
    if (item.stock_quantity !== null) {
      await supabase
        .from('shop_items')
        .update({ stock_quantity: item.stock_quantity - 1 })
        .eq('id', itemId)
    }

    return NextResponse.json({
      success: true,
      redemption,
      newTotalPoints,
      item: {
        id: item.id,
        name: item.name,
        rewardType: item.reward_type,
        rewardData: item.reward_data,
      },
    })
  } catch (error) {
    console.error('Error processing purchase:', error)
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    )
  }
}
