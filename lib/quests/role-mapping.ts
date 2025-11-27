import type { QuestType } from './types'

export type QuestsRole = 'creator' | 'participant'

// Map quest types to roles
export const CREATOR_QUEST_TYPES: QuestType[] = ['poll_creation']
export const PARTICIPANT_QUEST_TYPES: QuestType[] = ['poll_participation', 'social_referral']

// Storage key for role persistence
export const ROLE_STORAGE_KEY = 'polypulse-quests-role'

// Get quest types for a specific role
export function getQuestTypesForRole(role: QuestsRole): QuestType[] {
  return role === 'creator' ? CREATOR_QUEST_TYPES : PARTICIPANT_QUEST_TYPES
}

// Check if a quest type belongs to a role
export function isQuestTypeForRole(questType: QuestType, role: QuestsRole): boolean {
  const roleTypes = getQuestTypesForRole(role)
  return roleTypes.includes(questType)
}

// Get the default role
export function getDefaultRole(): QuestsRole {
  return 'participant'
}

// Get stored role from localStorage
export function getStoredRole(): QuestsRole | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(ROLE_STORAGE_KEY)
  if (stored === 'creator' || stored === 'participant') {
    return stored
  }
  return null
}

// Store role to localStorage
export function storeRole(role: QuestsRole): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ROLE_STORAGE_KEY, role)
}
