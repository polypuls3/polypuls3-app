export type TourRole = 'creator' | 'participant' | 'admin'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

export interface TourStep {
  id: string
  targetSelector: string // CSS selector for element to highlight (data-tour attribute)
  title: string
  description: string
  position: TooltipPosition
  optional?: boolean // If true, skip if element not found
}

export interface TourConfig {
  role: TourRole
  welcomeTitle: string
  welcomeDescription: string
  welcomeIcon: string // Lucide icon name
  steps: TourStep[]
}

export interface TourState {
  isActive: boolean
  currentRole: TourRole | null
  currentStepIndex: number
  showWelcome: boolean
}

export const TOUR_STORAGE_PREFIX = 'polypulse-tour-completed-'

export function getTourStorageKey(role: TourRole): string {
  return `${TOUR_STORAGE_PREFIX}${role}`
}

export function isTourCompleted(role: TourRole): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(getTourStorageKey(role)) === 'true'
}

export function markTourCompleted(role: TourRole): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getTourStorageKey(role), 'true')
}

export function resetTourCompletion(role: TourRole): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(getTourStorageKey(role))
}
