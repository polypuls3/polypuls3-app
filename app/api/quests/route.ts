import { NextRequest, NextResponse } from 'next/server'
import { questEngine } from '@/lib/quests/engine'

/**
 * GET /api/quests
 * Fetch all quests with user's progress
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const quests = await questEngine.getQuestsWithProgress(userId)

    return NextResponse.json(quests)
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    )
  }
}
