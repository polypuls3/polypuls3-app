import { NextRequest, NextResponse } from 'next/server'
import { questEngine } from '@/lib/quests/engine'
import type { ActivityEvent } from '@/lib/quests/types'

/**
 * POST /api/quests/sync
 * Sync an on-chain activity and update quest progress
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      walletAddress,
      activityType,
      onChainId,
      transactionHash,
      metadata,
    } = body

    if (!walletAddress || !activityType) {
      return NextResponse.json(
        { error: 'walletAddress and activityType are required' },
        { status: 400 }
      )
    }

    // Validate activity type
    const validActivityTypes = [
      'poll_vote',
      'poll_create',
      'survey_respond',
      'survey_create',
      'referral',
      'share',
    ]

    if (!validActivityTypes.includes(activityType)) {
      return NextResponse.json(
        { error: 'Invalid activityType' },
        { status: 400 }
      )
    }

    const event: ActivityEvent = {
      type: activityType,
      walletAddress,
      onChainId,
      transactionHash,
      metadata,
    }

    const completedQuests = await questEngine.processActivity(event)

    return NextResponse.json({
      success: true,
      completedQuests,
      questsCompleted: completedQuests.length,
    })
  } catch (error) {
    console.error('Error syncing activity:', error)
    return NextResponse.json(
      { error: 'Failed to sync activity' },
      { status: 500 }
    )
  }
}
