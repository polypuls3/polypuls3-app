import { createServerClient } from '@/lib/supabase/server'
import type { Quest, UserProfile, Badge } from '@/lib/supabase/types'
import {
  QuestRequirement,
  QuestProgress,
  QuestWithProgress,
  QuestCompletionResult,
  UserStats,
  ActivityEvent,
  parseRequirements,
  calculateProgressPercent,
  canRepeatQuest,
  isQuestInTimeWindow,
} from './types'

/**
 * Quest Engine - Handles quest progress tracking and completion
 */
export class QuestEngine {
  private supabase = createServerClient()

  /**
   * Get all active quests with user's progress
   */
  async getQuestsWithProgress(userId: string): Promise<QuestWithProgress[]> {
    // Fetch all active quests
    const { data: quests, error: questsError } = await this.supabase
      .from('quests')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (questsError || !quests) {
      console.error('Error fetching quests:', questsError)
      return []
    }

    // Fetch user's progress for all quests
    const { data: progressData } = await this.supabase
      .from('user_quest_progress')
      .select('*')
      .eq('user_id', userId)

    const progressMap = new Map(
      progressData?.map((p) => [p.quest_id, p]) || []
    )

    // Fetch user stats for calculating current progress
    const stats = await this.getUserStats(userId)

    // Calculate progress for each quest
    return quests.map((quest) => {
      const userProgress = progressMap.get(quest.id)
      const progress = this.calculateQuestProgress(quest, userProgress, stats)

      return {
        ...quest,
        progress,
      }
    })
  }

  /**
   * Calculate progress for a single quest
   */
  private calculateQuestProgress(
    quest: Quest,
    userProgress: { current_progress: unknown; completed_count: number; last_completed_at: string | null } | undefined,
    stats: UserStats
  ): QuestProgress {
    const requirements = parseRequirements(quest.requirements)
    const completedCount = userProgress?.completed_count || 0
    const lastCompletedAt = userProgress?.last_completed_at || null

    // Check if quest can be completed again
    const canComplete =
      canRepeatQuest(quest, completedCount) &&
      isQuestInTimeWindow(quest, lastCompletedAt)

    // Get current value based on requirement type
    let currentValue = 0

    if (!canComplete) {
      // Already completed this period, show as 100%
      currentValue = requirements.target
    } else {
      currentValue = this.getStatForRequirement(requirements, stats, userProgress)
    }

    const percentComplete = calculateProgressPercent(currentValue, requirements.target)
    const isComplete = currentValue >= requirements.target

    return {
      currentValue,
      targetValue: requirements.target,
      percentComplete,
      isComplete,
      completedCount,
      lastCompletedAt,
      canComplete: canComplete && !isComplete,
    }
  }

  /**
   * Get the stat value for a requirement
   */
  private getStatForRequirement(
    requirements: QuestRequirement,
    stats: UserStats,
    userProgress?: { current_progress: unknown }
  ): number {
    // For time-boxed quests, use the progress stored in current_progress
    if (requirements.timeframe && requirements.timeframe !== 'all_time') {
      const progress = userProgress?.current_progress as Record<string, number> | undefined
      return progress?.count || 0
    }

    // For all-time stats, use the aggregated stats
    switch (requirements.type) {
      case 'vote_count':
        return stats.totalVotes
      case 'poll_count':
        return stats.totalPollsCreated
      case 'response_count':
        return stats.totalResponsesReceived
      case 'referral_count':
        return stats.totalReferrals
      case 'unique_categories':
        return stats.uniqueCategoriesVoted
      case 'consecutive_days':
        return stats.currentStreak
      default:
        return 0
    }
  }

  /**
   * Get aggregated user stats
   */
  async getUserStats(userId: string): Promise<UserStats> {
    // Get user profile for streak
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('current_streak, wallet_address')
      .eq('id', userId)
      .single()

    if (!profile) {
      return {
        totalVotes: 0,
        totalPollsCreated: 0,
        totalResponsesReceived: 0,
        totalReferrals: 0,
        uniqueCategoriesVoted: 0,
        currentStreak: 0,
      }
    }

    // Count activities from on_chain_activity_sync
    const { data: activities } = await this.supabase
      .from('on_chain_activity_sync')
      .select('activity_type, metadata')
      .eq('wallet_address', profile.wallet_address)

    const totalVotes = activities?.filter((a) => a.activity_type === 'poll_vote').length || 0
    const totalPollsCreated = activities?.filter((a) => a.activity_type === 'poll_create').length || 0

    // Count unique categories
    const categories = new Set<string>()
    activities?.forEach((a) => {
      if (a.activity_type === 'poll_vote') {
        const meta = a.metadata as { category?: string } | null
        if (meta?.category) {
          categories.add(meta.category)
        }
      }
    })

    // Count completed referrals
    const { count: referralCount } = await this.supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .in('status', ['completed', 'rewarded'])

    return {
      totalVotes,
      totalPollsCreated,
      totalResponsesReceived: 0, // Would need to query polls for this
      totalReferrals: referralCount || 0,
      uniqueCategoriesVoted: categories.size,
      currentStreak: profile.current_streak,
    }
  }

  /**
   * Process an activity event and update quest progress
   */
  async processActivity(event: ActivityEvent): Promise<QuestCompletionResult[]> {
    // Get user profile
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', event.walletAddress.toLowerCase())
      .single()

    if (!profile) {
      console.error('User profile not found for wallet:', event.walletAddress)
      return []
    }

    // Record the activity
    if (event.onChainId) {
      await this.supabase.from('on_chain_activity_sync').upsert(
        {
          wallet_address: event.walletAddress.toLowerCase(),
          activity_type: event.type,
          on_chain_id: event.onChainId,
          transaction_hash: event.transactionHash,
          metadata: event.metadata,
          processed: false,
        },
        { onConflict: 'wallet_address,activity_type,on_chain_id' }
      )
    }

    // Get relevant quests for this activity type
    const questType = this.mapActivityToQuestType(event.type)
    if (!questType) return []

    const { data: quests } = await this.supabase
      .from('quests')
      .select('*')
      .eq('is_active', true)
      .eq('quest_type', questType)

    if (!quests || quests.length === 0) return []

    const completedQuests: QuestCompletionResult[] = []
    const stats = await this.getUserStats(profile.id)

    for (const quest of quests) {
      const result = await this.updateQuestProgress(profile, quest, stats, event)
      if (result) {
        completedQuests.push(result)
      }
    }

    // Update streak
    await this.updateStreak(profile)

    return completedQuests
  }

  /**
   * Update progress for a single quest
   */
  private async updateQuestProgress(
    profile: UserProfile,
    quest: Quest,
    stats: UserStats,
    event: ActivityEvent
  ): Promise<QuestCompletionResult | null> {
    const requirements = parseRequirements(quest.requirements)

    // Check if this event is relevant to the quest
    if (!this.isEventRelevantToQuest(event, requirements)) {
      return null
    }

    // Get or create progress record
    let { data: progress } = await this.supabase
      .from('user_quest_progress')
      .select('*')
      .eq('user_id', profile.id)
      .eq('quest_id', quest.id)
      .single()

    if (!progress) {
      const { data: newProgress } = await this.supabase
        .from('user_quest_progress')
        .insert({
          user_id: profile.id,
          quest_id: quest.id,
          current_progress: { count: 0 },
          completed_count: 0,
        })
        .select()
        .single()
      progress = newProgress
    }

    if (!progress) return null

    // Check if quest can be completed
    if (
      !canRepeatQuest(quest, progress.completed_count) ||
      !isQuestInTimeWindow(quest, progress.last_completed_at)
    ) {
      return null
    }

    // Update progress count for time-boxed quests
    const currentProgress = progress.current_progress as { count?: number } || {}
    let newCount = (currentProgress.count || 0) + 1

    // For all-time quests, use stats
    if (!requirements.timeframe || requirements.timeframe === 'all_time') {
      newCount = this.getStatForRequirement(requirements, stats) + 1
    }

    // Check if quest is now complete
    if (newCount >= requirements.target) {
      // Complete the quest!
      return await this.completeQuest(profile, quest, progress.completed_count + 1)
    }

    // Update progress
    await this.supabase
      .from('user_quest_progress')
      .update({
        current_progress: { count: newCount },
        updated_at: new Date().toISOString(),
      })
      .eq('id', progress.id)

    return null
  }

  /**
   * Complete a quest and award rewards
   */
  async completeQuest(
    profile: UserProfile,
    quest: Quest,
    newCompletedCount: number
  ): Promise<QuestCompletionResult> {
    const now = new Date().toISOString()

    // Update quest progress
    await this.supabase
      .from('user_quest_progress')
      .upsert({
        user_id: profile.id,
        quest_id: quest.id,
        current_progress: { count: 0 }, // Reset for next period
        completed_count: newCompletedCount,
        last_completed_at: now,
        updated_at: now,
      }, { onConflict: 'user_id,quest_id' })

    // Award points
    await this.supabase.from('point_transactions').insert({
      user_id: profile.id,
      amount: quest.point_reward,
      transaction_type: 'quest_completion',
      reference_type: 'quest',
      reference_id: quest.id,
      description: `Completed quest: ${quest.title}`,
    })

    // Update user total points
    const newTotalPoints = profile.total_points + quest.point_reward
    await this.supabase
      .from('user_profiles')
      .update({ total_points: newTotalPoints, updated_at: now })
      .eq('id', profile.id)

    // Award badge if applicable
    let badgeEarned: { id: string; name: string; rarity: string } | undefined
    if (quest.badge_reward_id) {
      const { data: badge } = await this.supabase
        .from('badges')
        .select('*')
        .eq('id', quest.badge_reward_id)
        .single()

      if (badge) {
        await this.supabase.from('user_badges').upsert(
          {
            user_id: profile.id,
            badge_id: badge.id,
          },
          { onConflict: 'user_id,badge_id' }
        )
        badgeEarned = {
          id: badge.id,
          name: badge.name,
          rarity: badge.rarity,
        }
      }
    }

    // Check for milestone unlocks
    const milestonesUnlocked = await this.checkMilestones(profile.id, newTotalPoints)

    return {
      questId: quest.id,
      questTitle: quest.title,
      pointsEarned: quest.point_reward,
      badgeEarned,
      newTotalPoints,
      milestonesUnlocked,
    }
  }

  /**
   * Check and unlock new milestones
   */
  private async checkMilestones(userId: string, totalPoints: number) {
    const { data: milestones } = await this.supabase
      .from('milestones')
      .select('*')
      .eq('is_active', true)
      .lte('threshold', totalPoints)
      .order('threshold', { ascending: true })

    if (!milestones) return []

    const { data: achieved } = await this.supabase
      .from('user_milestones')
      .select('milestone_id')
      .eq('user_id', userId)

    const achievedIds = new Set(achieved?.map((a) => a.milestone_id) || [])
    const newMilestones = milestones.filter((m) => !achievedIds.has(m.id))

    // Record new milestones
    for (const milestone of newMilestones) {
      await this.supabase.from('user_milestones').insert({
        user_id: userId,
        milestone_id: milestone.id,
      })
    }

    return newMilestones.map((m) => ({
      id: m.id,
      name: m.name,
      tier: m.tier,
      rewardType: m.reward_type,
      rewardValue: m.reward_value as Record<string, unknown>,
    }))
  }

  /**
   * Update user streak
   */
  private async updateStreak(profile: UserProfile) {
    const today = new Date().toISOString().split('T')[0]
    const lastActivity = profile.last_activity_date

    if (lastActivity === today) {
      // Already active today, no change
      return
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newStreak: number
    if (lastActivity === yesterdayStr) {
      // Consecutive day
      newStreak = profile.current_streak + 1
    } else {
      // Streak broken
      newStreak = 1
    }

    const longestStreak = Math.max(profile.longest_streak, newStreak)

    await this.supabase
      .from('user_profiles')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    // Award streak bonus points
    const bonus = this.calculateStreakBonus(newStreak)
    if (bonus > 0) {
      await this.supabase.from('point_transactions').insert({
        user_id: profile.id,
        amount: bonus,
        transaction_type: 'streak_bonus',
        reference_type: 'streak',
        description: `${newStreak}-day streak bonus`,
      })

      await this.supabase
        .from('user_profiles')
        .update({
          total_points: profile.total_points + bonus,
        })
        .eq('id', profile.id)
    }
  }

  /**
   * Calculate streak bonus points
   */
  private calculateStreakBonus(streakDays: number): number {
    if (streakDays < 3) return 0
    if (streakDays < 7) return 5
    if (streakDays < 14) return 10
    if (streakDays < 30) return 15
    return 25
  }

  /**
   * Map activity type to quest type
   */
  private mapActivityToQuestType(
    activityType: string
  ): 'poll_participation' | 'poll_creation' | 'social_referral' | null {
    switch (activityType) {
      case 'poll_vote':
      case 'survey_respond':
        return 'poll_participation'
      case 'poll_create':
      case 'survey_create':
        return 'poll_creation'
      case 'referral':
        return 'social_referral'
      default:
        return null
    }
  }

  /**
   * Check if an event is relevant to a quest requirement
   */
  private isEventRelevantToQuest(
    event: ActivityEvent,
    requirements: QuestRequirement
  ): boolean {
    // Check category filter
    if (requirements.category && event.metadata?.category !== requirements.category) {
      return false
    }

    // Map event type to requirement type
    const eventToRequirement: Record<string, string[]> = {
      poll_vote: ['vote_count', 'unique_categories'],
      poll_create: ['poll_count'],
      survey_respond: ['vote_count'],
      survey_create: ['poll_count'],
      referral: ['referral_count'],
      share: ['share_count'],
    }

    const validRequirements = eventToRequirement[event.type] || []
    return validRequirements.includes(requirements.type)
  }
}

// Export singleton instance for API routes
export const questEngine = new QuestEngine()
