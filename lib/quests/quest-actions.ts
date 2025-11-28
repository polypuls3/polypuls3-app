import { PenTool, Vote, Share2, type LucideIcon } from 'lucide-react'
import type { QuestType } from './types'

export interface QuestAction {
  label: string
  href: string
  icon: LucideIcon
  description: string
}

const QUEST_ACTIONS: Record<QuestType, QuestAction> = {
  poll_creation: {
    label: 'Create Poll',
    href: '/creator/create-poll',
    icon: PenTool,
    description: 'Create a new poll to complete this quest',
  },
  poll_participation: {
    label: 'Vote on Polls',
    href: '/participant',
    icon: Vote,
    description: 'Participate in polls to complete this quest',
  },
  social_referral: {
    label: 'Share Referral',
    href: '/quests/profile',
    icon: Share2,
    description: 'Share your referral link to invite friends',
  },
}

export function getQuestAction(questType: QuestType): QuestAction {
  return QUEST_ACTIONS[questType] || QUEST_ACTIONS.poll_participation
}
