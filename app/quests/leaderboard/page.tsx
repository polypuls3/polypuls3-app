'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Star,
  ArrowLeft,
  TrendingUp,
} from "lucide-react"
import { useLeaderboard, useUserRank } from "@/hooks/use-leaderboard"
import { useUserProfile } from "@/hooks/use-user-profile"
import Link from "next/link"

type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time'

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function RankIcon({ rank }: { rank: number }) {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-amber-400" />
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />
    case 3:
      return <Medal className="h-6 w-6 text-amber-700" />
    default:
      return (
        <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-semibold">
          {rank}
        </span>
      )
  }
}

function LeaderboardTable({ period }: { period: LeaderboardPeriod }) {
  const { leaderboard, isLoading, total } = useLeaderboard(period, 50)
  const { walletAddress } = useUserProfile()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No leaderboard data available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to earn points and claim the top spot!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {leaderboard.map((entry) => {
        const isCurrentUser = walletAddress?.toLowerCase() === entry.walletAddress.toLowerCase()

        return (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
              isCurrentUser
                ? 'bg-purple-500/10 border border-purple-500/30'
                : entry.rank <= 3
                ? 'bg-amber-500/5'
                : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <RankIcon rank={entry.rank} />

            <Avatar className="h-10 w-10">
              <AvatarImage src={entry.avatarUrl || undefined} />
              <AvatarFallback>
                {entry.displayName?.[0] || entry.walletAddress.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {entry.displayName || formatAddress(entry.walletAddress)}
                {isCurrentUser && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    You
                  </Badge>
                )}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>{entry.currentStreak} day streak</span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 font-semibold text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{entry.periodPoints.toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {entry.totalPoints.toLocaleString()} total
              </p>
            </div>
          </div>
        )
      })}

      {total > leaderboard.length && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Showing top {leaderboard.length} of {total} participants
        </p>
      )}
    </div>
  )
}

function UserRankCard() {
  const { walletAddress, points, streak } = useUserProfile()
  const weeklyRank = useUserRank(walletAddress, 'weekly')
  const monthlyRank = useUserRank(walletAddress, 'monthly')
  const allTimeRank = useUserRank(walletAddress, 'all_time')

  if (!walletAddress) {
    return null
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Your Rankings
        </CardTitle>
        <CardDescription>Your position across different leaderboards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="text-center p-4 rounded-lg bg-blue-500/10">
            <p className="text-sm text-muted-foreground mb-1">Weekly</p>
            <p className="text-2xl font-bold">
              {weeklyRank.isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto" />
              ) : weeklyRank.rank ? (
                `#${weeklyRank.rank}`
              ) : (
                'Unranked'
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {weeklyRank.points.toLocaleString()} pts
            </p>
          </div>

          <div className="text-center p-4 rounded-lg bg-purple-500/10">
            <p className="text-sm text-muted-foreground mb-1">Monthly</p>
            <p className="text-2xl font-bold">
              {monthlyRank.isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto" />
              ) : monthlyRank.rank ? (
                `#${monthlyRank.rank}`
              ) : (
                'Unranked'
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyRank.points.toLocaleString()} pts
            </p>
          </div>

          <div className="text-center p-4 rounded-lg bg-amber-500/10">
            <p className="text-sm text-muted-foreground mb-1">All Time</p>
            <p className="text-2xl font-bold">
              {allTimeRank.isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto" />
              ) : allTimeRank.rank ? (
                `#${allTimeRank.rank}`
              ) : (
                'Unranked'
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {points.toLocaleString()} total pts
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LeaderboardPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/quests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quests
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Leaderboard</h1>
        <p className="text-muted-foreground text-lg">
          See who's earning the most points in the community
        </p>
      </div>

      <UserRankCard />

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="all_time">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <LeaderboardTable period="weekly" />
        </TabsContent>

        <TabsContent value="monthly">
          <LeaderboardTable period="monthly" />
        </TabsContent>

        <TabsContent value="all_time">
          <LeaderboardTable period="all_time" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
