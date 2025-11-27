"use client"

import { useState, useEffect, useCallback } from 'react'

type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time'

interface LeaderboardEntry {
  rank: number
  userId: string
  walletAddress: string
  displayName: string | null
  avatarUrl: string | null
  periodPoints: number
  totalPoints: number
  currentStreak: number
}

interface LeaderboardData {
  period: LeaderboardPeriod
  leaderboard: LeaderboardEntry[]
  total: number
}

export function useLeaderboard(period: LeaderboardPeriod = 'weekly', limit: number = 50) {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/leaderboard?period=${period}&limit=${limit}`)
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }

      const leaderboardData: LeaderboardData = await response.json()
      setData(leaderboardData)
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
    } finally {
      setIsLoading(false)
    }
  }, [period, limit])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    data,
    leaderboard: data?.leaderboard || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch: fetchLeaderboard,
  }
}

export function useUserRank(walletAddress: string | undefined, period: LeaderboardPeriod = 'weekly') {
  const { leaderboard, isLoading } = useLeaderboard(period, 100)

  const userEntry = walletAddress
    ? leaderboard.find(
        (entry) => entry.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      )
    : null

  return {
    rank: userEntry?.rank || null,
    points: userEntry?.periodPoints || 0,
    isLoading,
    isRanked: !!userEntry,
  }
}
