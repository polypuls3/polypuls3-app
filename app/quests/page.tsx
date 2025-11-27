'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Trophy,
  Target,
  Flame,
  Star,
  Gift,
  CheckCircle2,
  Clock,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react"
import { useQuests, useActiveQuests, useDailyQuests, useWeeklyQuests, useAllBadges } from "@/hooks/use-quests"
import { useUserProfile } from "@/hooks/use-user-profile"
import type { QuestWithProgress } from "@/lib/quests/types"
import Link from "next/link"

function QuestCard({ quest }: { quest: QuestWithProgress }) {
  const isComplete = quest.progress.isComplete
  const canComplete = quest.progress.canComplete

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily':
        return 'bg-blue-500/10 text-blue-500'
      case 'weekly':
        return 'bg-purple-500/10 text-purple-500'
      case 'monthly':
        return 'bg-pink-500/10 text-pink-500'
      case 'one-time':
        return 'bg-amber-500/10 text-amber-500'
      case 'special':
        return 'bg-emerald-500/10 text-emerald-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <Card className={`transition-all ${isComplete ? 'opacity-60' : 'hover:border-purple-600/50'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge className={getCategoryColor(quest.category)} variant="secondary">
            {quest.category}
          </Badge>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">{quest.point_reward}</span>
          </div>
        </div>
        <CardTitle className="text-lg flex items-center gap-2">
          {isComplete && <CheckCircle2 className="h-5 w-5 text-green-500" />}
          {quest.title}
        </CardTitle>
        <CardDescription>{quest.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {quest.progress.currentValue} / {quest.progress.targetValue}
            </span>
          </div>
          <Progress value={quest.progress.percentComplete} className="h-2" />
          {quest.progress.completedCount > 0 && (
            <p className="text-xs text-muted-foreground">
              Completed {quest.progress.completedCount} time{quest.progress.completedCount > 1 ? 's' : ''}
            </p>
          )}
          {quest.badge_reward_id && (
            <div className="flex items-center gap-1 text-xs text-purple-500">
              <Award className="h-3 w-3" />
              <span>Badge reward included</span>
            </div>
          )}
          {!canComplete && !isComplete && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Resets next period
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function QuestList({ quests, isLoading }: { quests: QuestWithProgress[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (quests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No quests available in this category.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} />
      ))}
    </div>
  )
}

function BadgeDisplay() {
  const { badges, isLoading } = useAllBadges()

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
      case 'uncommon':
        return 'bg-green-500/10 text-green-400 border-green-500/30'
      case 'rare':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'epic':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      case 'legendary':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="text-center">
            <CardContent className="pt-6">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const earnedBadges = badges.filter((b) => b.earned)
  const unearnedBadges = badges.filter((b) => !b.earned)

  return (
    <div className="space-y-6">
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Earned Badges ({earnedBadges.length})
          </h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {earnedBadges.map((badge) => (
              <Card key={badge.id} className={`text-center border-2 ${getRarityColor(badge.rarity)}`}>
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{badge.image_url || '🏆'}</div>
                  <p className="font-medium text-sm">{badge.name}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {badge.rarity}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {unearnedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
            Locked Badges ({unearnedBadges.length})
          </h3>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {unearnedBadges.map((badge) => (
              <Card key={badge.id} className="text-center opacity-50">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2 grayscale">🔒</div>
                  <p className="font-medium text-sm text-muted-foreground">{badge.name}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {badge.rarity}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function QuestsPage() {
  const { profile, points, streak, isLoading: profileLoading, error: profileError, isInitialized } = useUserProfile()
  const { quests: allQuests, isLoading: questsLoading } = useQuests()
  const { quests: activeQuests } = useActiveQuests()
  const { quests: dailyQuests, isLoading: dailyLoading } = useDailyQuests()
  const { quests: weeklyQuests, isLoading: weeklyLoading } = useWeeklyQuests()

  const completedCount = allQuests.filter((q) => q.progress.completedCount > 0).length

  // Show loading while profile is being fetched
  if (profileLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if profile fetch failed
  if (profileError) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-4">{profileError}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show connect wallet message if no profile after initialization
  if (!profile && isInitialized === false) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Connect your wallet to start earning points and completing quests.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Quests & Rewards</h1>
        <p className="text-muted-foreground text-lg">
          Complete quests to earn points, badges, and exclusive rewards
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              {profileLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{points.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              {profileLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{streak} days</p>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              {questsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Quests Completed</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              {questsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{activeQuests.length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button asChild variant="outline">
          <Link href="/quests/leaderboard">
            <TrendingUp className="mr-2 h-4 w-4" />
            Leaderboard
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/quests/shop">
            <Gift className="mr-2 h-4 w-4" />
            Rewards Shop
          </Link>
        </Button>
      </div>

      {/* Quest Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeQuests.length})
          </TabsTrigger>
          <TabsTrigger value="daily">
            Daily ({dailyQuests.length})
          </TabsTrigger>
          <TabsTrigger value="weekly">
            Weekly ({weeklyQuests.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Quests ({allQuests.length})
          </TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <QuestList quests={activeQuests} isLoading={questsLoading} />
        </TabsContent>

        <TabsContent value="daily">
          <QuestList quests={dailyQuests} isLoading={dailyLoading} />
        </TabsContent>

        <TabsContent value="weekly">
          <QuestList quests={weeklyQuests} isLoading={weeklyLoading} />
        </TabsContent>

        <TabsContent value="all">
          <QuestList quests={allQuests} isLoading={questsLoading} />
        </TabsContent>

        <TabsContent value="badges">
          <BadgeDisplay />
        </TabsContent>
      </Tabs>
    </div>
  )
}
