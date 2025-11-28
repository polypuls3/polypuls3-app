'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Star,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import type { QuestWithProgress } from '@/lib/quests/types'
import { getQuestAction } from '@/lib/quests/quest-actions'

interface QuestDetailDialogProps {
  quest: QuestWithProgress | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getCategoryColor(category: string) {
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

export function QuestDetailDialog({
  quest,
  open,
  onOpenChange,
}: QuestDetailDialogProps) {
  if (!quest) return null

  const isComplete = quest.progress.isComplete
  const action = getQuestAction(quest.quest_type as any)
  const ActionIcon = action.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge className={getCategoryColor(quest.category)} variant="secondary">
              {quest.category}
            </Badge>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold">{quest.point_reward} points</span>
            </div>
          </div>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isComplete && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {quest.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {quest.description}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {quest.progress.currentValue} / {quest.progress.targetValue}
            </span>
          </div>
          <Progress value={quest.progress.percentComplete} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {quest.progress.percentComplete}% complete
          </p>
        </div>

        {/* Completion History */}
        {quest.progress.completedCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Completed {quest.progress.completedCount} time
              {quest.progress.completedCount > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Badge Reward */}
        {quest.badge_reward_id && (
          <div className="flex items-center gap-2 text-sm text-purple-500">
            <Award className="h-4 w-4" />
            <span>Badge reward included</span>
          </div>
        )}

        {/* Reset Info */}
        {!quest.progress.canComplete && !isComplete && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Resets next period</span>
          </div>
        )}

        <Separator />

        {/* Action Button */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{action.description}</p>
          <Button asChild className="w-full" disabled={isComplete}>
            <Link href={action.href} onClick={() => onOpenChange(false)}>
              <ActionIcon className="h-4 w-4 mr-2" />
              {action.label}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
