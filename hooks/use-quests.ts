"use client"

import { useState, useEffect, useCallback } from 'react'
import { useQuestsContext } from '@/contexts/quests-context'
import { supabase } from '@/lib/supabase/client'
import type { Quest, Badge } from '@/lib/supabase/types'
import type { QuestWithProgress, QuestCategory } from '@/lib/quests/types'

interface UseQuestsOptions {
  category?: QuestCategory
  type?: 'poll_participation' | 'poll_creation' | 'social_referral'
}

export function useQuests(options?: UseQuestsOptions) {
  const { userProfile } = useQuestsContext()
  const [quests, setQuests] = useState<QuestWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuests = useCallback(async () => {
    if (!userProfile?.id) {
      setQuests([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/quests?userId=${userProfile.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch quests')
      }

      let data: QuestWithProgress[] = await response.json()

      // Apply filters
      if (options?.category) {
        data = data.filter((q) => q.category === options.category)
      }
      if (options?.type) {
        data = data.filter((q) => q.quest_type === options.type)
      }

      setQuests(data)
    } catch (err) {
      console.error('Error fetching quests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch quests')
    } finally {
      setIsLoading(false)
    }
  }, [userProfile?.id, options?.category, options?.type])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  return {
    quests,
    isLoading,
    error,
    refetch: fetchQuests,
  }
}

export function useActiveQuests() {
  const { quests, isLoading, error, refetch } = useQuests()

  // Filter to quests that are in progress (not complete, can be completed)
  const activeQuests = quests.filter(
    (q) => q.progress.canComplete || (q.progress.percentComplete > 0 && q.progress.percentComplete < 100)
  )

  // Sort by closest to completion
  const sorted = [...activeQuests].sort(
    (a, b) => b.progress.percentComplete - a.progress.percentComplete
  )

  return {
    quests: sorted,
    isLoading,
    error,
    refetch,
  }
}

export function useDailyQuests() {
  return useQuests({ category: 'daily' })
}

export function useWeeklyQuests() {
  return useQuests({ category: 'weekly' })
}

export function useCompletedQuests() {
  const { quests, isLoading, error, refetch } = useQuests()

  const completedQuests = quests.filter(
    (q) => q.progress.completedCount > 0
  )

  return {
    quests: completedQuests,
    isLoading,
    error,
    refetch,
  }
}

export function useQuestsByType(type: 'poll_participation' | 'poll_creation' | 'social_referral') {
  return useQuests({ type })
}

export function useSyncActivity() {
  const { userProfile, refreshProfile } = useQuestsContext()
  const [isSyncing, setIsSyncing] = useState(false)

  const syncActivity = useCallback(async (
    activityType: 'poll_vote' | 'poll_create' | 'survey_respond' | 'survey_create',
    onChainId: string,
    transactionHash?: string,
    metadata?: { category?: string }
  ) => {
    if (!userProfile?.wallet_address) return null

    setIsSyncing(true)

    try {
      const response = await fetch('/api/quests/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: userProfile.wallet_address,
          activityType,
          onChainId,
          transactionHash,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to sync activity')
      }

      const result = await response.json()

      // Refresh profile to get updated points
      await refreshProfile()

      return result
    } catch (err) {
      console.error('Error syncing activity:', err)
      return null
    } finally {
      setIsSyncing(false)
    }
  }, [userProfile?.wallet_address, refreshProfile])

  return {
    syncActivity,
    isSyncing,
  }
}

export function useAllBadges() {
  const { userProfile } = useQuestsContext()
  const [badges, setBadges] = useState<(Badge & { earned: boolean; earnedAt?: string })[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBadges() {
      setIsLoading(true)

      // Fetch all badges
      const { data: allBadges, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: true })

      if (badgesError || !allBadges) {
        console.error('Error fetching badges:', badgesError)
        setIsLoading(false)
        return
      }

      // Fetch user's earned badges
      let earnedBadgeIds: Set<string> = new Set()
      let earnedDates: Map<string, string> = new Map()

      if (userProfile?.id) {
        const { data: userBadges } = await supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', userProfile.id)

        if (userBadges) {
          earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id))
          earnedDates = new Map(userBadges.map((ub) => [ub.badge_id, ub.earned_at]))
        }
      }

      const badgesWithStatus = allBadges.map((badge) => ({
        ...badge,
        earned: earnedBadgeIds.has(badge.id),
        earnedAt: earnedDates.get(badge.id),
      }))

      setBadges(badgesWithStatus)
      setIsLoading(false)
    }

    fetchBadges()
  }, [userProfile?.id])

  return { badges, isLoading }
}
