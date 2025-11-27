import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time'

/**
 * GET /api/leaderboard
 * Fetch leaderboard data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') || 'weekly') as LeaderboardPeriod
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = createServerClient()

    // Get date range based on period
    const now = new Date()
    let startDate: Date | null = null

    switch (period) {
      case 'weekly': {
        const dayOfWeek = now.getUTCDay()
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate = new Date(now)
        startDate.setUTCDate(now.getUTCDate() - mondayOffset)
        startDate.setUTCHours(0, 0, 0, 0)
        break
      }
      case 'monthly': {
        startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1)
        break
      }
      case 'all_time':
      default:
        startDate = null
        break
    }

    let query = supabase
      .from('point_transactions')
      .select(`
        user_id,
        amount,
        user_profiles!inner(
          id,
          wallet_address,
          display_name,
          avatar_url,
          total_points,
          current_streak
        )
      `)
      .gt('amount', 0)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data: transactions, error: txError } = await query

    if (txError) {
      console.error('Error fetching transactions:', txError)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Aggregate points by user
    const userPointsMap = new Map<string, {
      userId: string
      walletAddress: string
      displayName: string | null
      avatarUrl: string | null
      periodPoints: number
      totalPoints: number
      currentStreak: number
    }>()

    transactions?.forEach((tx) => {
      const profile = tx.user_profiles as {
        id: string
        wallet_address: string
        display_name: string | null
        avatar_url: string | null
        total_points: number
        current_streak: number
      }

      const existing = userPointsMap.get(tx.user_id)
      if (existing) {
        existing.periodPoints += tx.amount
      } else {
        userPointsMap.set(tx.user_id, {
          userId: profile.id,
          walletAddress: profile.wallet_address,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          periodPoints: tx.amount,
          totalPoints: profile.total_points,
          currentStreak: profile.current_streak,
        })
      }
    })

    // Convert to array and sort
    const leaderboard = Array.from(userPointsMap.values())
      .sort((a, b) => b.periodPoints - a.periodPoints)
      .slice(offset, offset + limit)
      .map((user, index) => ({
        rank: offset + index + 1,
        ...user,
      }))

    return NextResponse.json({
      period,
      leaderboard,
      total: userPointsMap.size,
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
