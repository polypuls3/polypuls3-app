import type { Quest, QuestProgress as DBQuestProgress } from '@/lib/supabase/types'

export type QuestType = 'poll_participation' | 'poll_creation' | 'social_referral'
export type QuestCategory = 'daily' | 'weekly' | 'monthly' | 'one-time' | 'special'

// Quest requirement types
export type RequirementType =
  | 'vote_count'
  | 'poll_count'
  | 'response_count'
  | 'referral_count'
  | 'unique_categories'
  | 'consecutive_days'
  | 'share_count'

export interface QuestRequirement {
  type: RequirementType
  target: number
  category?: string // For category-specific quests (e.g., 'governance')
  timeframe?: 'day' | 'week' | 'month' | 'all_time'
}

export interface QuestWithProgress extends Quest {
  progress: QuestProgress
}

export interface QuestProgress {
  currentValue: number
  targetValue: number
  percentComplete: number
  isComplete: boolean
  completedCount: number
  lastCompletedAt: string | null
  canComplete: boolean // Whether the quest can be completed again
}

export interface QuestCompletionResult {
  questId: string
  questTitle: string
  pointsEarned: number
  badgeEarned?: {
    id: string
    name: string
    rarity: string
  }
  newTotalPoints: number
  milestonesUnlocked: MilestoneUnlock[]
}

export interface MilestoneUnlock {
  id: string
  name: string
  tier: number
  rewardType: string
  rewardValue: Record<string, unknown>
}

export interface ActivityEvent {
  type: 'poll_vote' | 'poll_create' | 'survey_respond' | 'survey_create' | 'referral' | 'share'
  walletAddress: string
  onChainId?: string
  transactionHash?: string
  metadata?: {
    pollId?: string
    category?: string
    referralCode?: string
  }
}

export interface UserStats {
  totalVotes: number
  totalPollsCreated: number
  totalResponsesReceived: number
  totalReferrals: number
  uniqueCategoriesVoted: number
  currentStreak: number
}

// Helper function to parse quest requirements from JSONB
export function parseRequirements(requirements: unknown): QuestRequirement {
  const req = requirements as Record<string, unknown>
  return {
    type: req.type as RequirementType,
    target: req.target as number,
    category: req.category as string | undefined,
    timeframe: req.timeframe as 'day' | 'week' | 'month' | 'all_time' | undefined,
  }
}

// Helper to calculate progress percentage
export function calculateProgressPercent(current: number, target: number): number {
  if (target <= 0) return 100
  return Math.min(Math.round((current / target) * 100), 100)
}

// Helper to check if quest can be repeated
export function canRepeatQuest(quest: Quest, completedCount: number): boolean {
  // One-time quests can only be completed once
  if (quest.category === 'one-time') {
    return completedCount === 0
  }

  // Daily/weekly/monthly quests can be completed based on max_completions
  if (quest.max_completions !== null) {
    return completedCount < quest.max_completions
  }

  // Repeatable quests (daily, weekly, monthly) with no max_completions
  return true
}

// Helper to check if quest is within time window for daily/weekly/monthly
export function isQuestInTimeWindow(
  quest: Quest,
  lastCompletedAt: string | null
): boolean {
  if (!lastCompletedAt) return true

  const now = new Date()
  const lastCompleted = new Date(lastCompletedAt)

  switch (quest.category) {
    case 'daily': {
      // Reset at midnight UTC
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return lastCompleted < todayStart
    }
    case 'weekly': {
      // Reset on Monday UTC
      const dayOfWeek = now.getUTCDay()
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(now)
      weekStart.setUTCDate(now.getUTCDate() - mondayOffset)
      weekStart.setUTCHours(0, 0, 0, 0)
      return lastCompleted < weekStart
    }
    case 'monthly': {
      // Reset on 1st of month UTC
      const monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1)
      return lastCompleted < monthStart
    }
    default:
      return true
  }
}
