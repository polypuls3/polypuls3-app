'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Target,
  Star,
  CheckCircle2,
  Clock,
  Award,
  Flame,
  Zap,
} from "lucide-react"
import { useQuests, useActiveQuests, useDailyQuests, useWeeklyQuests } from "@/hooks/use-quests"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useQuestsRole } from "@/contexts/quests-role-context"
import { getQuestTypesForRole } from "@/lib/quests/role-mapping"
import { QuestDetailDialog } from "@/components/quests"
import type { QuestWithProgress } from "@/lib/quests/types"

interface QuestCardProps {
  quest: QuestWithProgress
  onClick?: () => void
}

function QuestCard({ quest, onClick }: QuestCardProps) {
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
    <Card
      className={`transition-all cursor-pointer ${isComplete ? 'opacity-60' : 'hover:border-purple-600/50 hover:shadow-md'}`}
      onClick={onClick}
    >
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

interface QuestListProps {
  quests: QuestWithProgress[]
  isLoading: boolean
  onQuestClick: (quest: QuestWithProgress) => void
}

function QuestList({ quests, isLoading, onQuestClick }: QuestListProps) {
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
          <p className="text-muted-foreground">No quests available for your current role.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try switching roles in the sidebar to see different quests.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} onClick={() => onQuestClick(quest)} />
      ))}
    </div>
  )
}

export default function QuestsPage() {
  const { points, streak, isLoading: profileLoading, error: profileError, isInitialized, profile } = useUserProfile()
  const { role } = useQuestsRole()
  const { quests: allQuests, isLoading: questsLoading } = useQuests()
  const { quests: activeQuests } = useActiveQuests()
  const { quests: dailyQuests, isLoading: dailyLoading } = useDailyQuests()
  const { quests: weeklyQuests, isLoading: weeklyLoading } = useWeeklyQuests()

  // Quest detail dialog state
  const [selectedQuest, setSelectedQuest] = useState<QuestWithProgress | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleQuestClick = (quest: QuestWithProgress) => {
    setSelectedQuest(quest)
    setDialogOpen(true)
  }

  // Filter quests by role
  const roleQuestTypes = getQuestTypesForRole(role)

  const filteredAllQuests = useMemo(() =>
    allQuests.filter(q => roleQuestTypes.includes(q.quest_type as any)),
    [allQuests, roleQuestTypes]
  )

  const filteredActiveQuests = useMemo(() =>
    activeQuests.filter(q => roleQuestTypes.includes(q.quest_type as any)),
    [activeQuests, roleQuestTypes]
  )

  const filteredDailyQuests = useMemo(() =>
    dailyQuests.filter(q => roleQuestTypes.includes(q.quest_type as any)),
    [dailyQuests, roleQuestTypes]
  )

  const filteredWeeklyQuests = useMemo(() =>
    weeklyQuests.filter(q => roleQuestTypes.includes(q.quest_type as any)),
    [weeklyQuests, roleQuestTypes]
  )

  const completedCount = filteredAllQuests.filter((q) => q.progress.completedCount > 0).length

  // Show loading while profile is being fetched
  if (profileLoading) {
    return (
      <div className="p-6">
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
      <div className="p-6">
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
      <div className="p-6">
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Target className="h-8 w-8 text-purple-500" />
          Quests
        </h1>
        <p className="text-muted-foreground">
          Complete {role === 'creator' ? 'creator' : 'participant'} quests to earn points and rewards
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{completedCount}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xl font-bold">{filteredActiveQuests.length}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quest Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Active ({filteredActiveQuests.length})
          </TabsTrigger>
          <TabsTrigger value="daily">
            Daily ({filteredDailyQuests.length})
          </TabsTrigger>
          <TabsTrigger value="weekly">
            Weekly ({filteredWeeklyQuests.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({filteredAllQuests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <QuestList quests={filteredActiveQuests} isLoading={questsLoading} onQuestClick={handleQuestClick} />
        </TabsContent>

        <TabsContent value="daily">
          <QuestList quests={filteredDailyQuests} isLoading={dailyLoading} onQuestClick={handleQuestClick} />
        </TabsContent>

        <TabsContent value="weekly">
          <QuestList quests={filteredWeeklyQuests} isLoading={weeklyLoading} onQuestClick={handleQuestClick} />
        </TabsContent>

        <TabsContent value="all">
          <QuestList quests={filteredAllQuests} isLoading={questsLoading} onQuestClick={handleQuestClick} />
        </TabsContent>
      </Tabs>

      {/* Quest Detail Dialog */}
      <QuestDetailDialog
        quest={selectedQuest}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
