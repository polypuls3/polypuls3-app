"use client"

import { useEffect, useCallback } from 'react'
import { useTourContext } from '@/contexts/tour-context'
import { TourRole, TourConfig, isTourCompleted } from '@/lib/tours/types'

interface UseTourOptions {
  role: TourRole
  config: TourConfig
  autoStart?: boolean
}

export function useTour({ role, config, autoStart = true }: UseTourOptions) {
  const {
    isActive,
    currentRole,
    startTour,
    skipTour,
    resetTour,
    isTourCompletedForRole,
  } = useTourContext()

  const isThisTourActive = isActive && currentRole === role
  const hasCompleted = isTourCompletedForRole(role)

  // Auto-start tour for first-time visitors
  useEffect(() => {
    if (autoStart && !hasCompleted && !isActive) {
      // Small delay to ensure page is fully rendered
      const timer = setTimeout(() => {
        startTour(role, config)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [autoStart, hasCompleted, isActive, role, config, startTour])

  const start = useCallback(() => {
    startTour(role, config)
  }, [role, config, startTour])

  const restart = useCallback(() => {
    resetTour(role)
    // Small delay then start
    setTimeout(() => {
      startTour(role, config)
    }, 100)
  }, [role, config, resetTour, startTour])

  return {
    isActive: isThisTourActive,
    hasCompleted,
    start,
    restart,
    skip: skipTour,
  }
}

// Simplified hook for checking tour status without config
export function useTourStatus(role: TourRole) {
  const { isActive, currentRole, isTourCompletedForRole } = useTourContext()

  return {
    isActive: isActive && currentRole === role,
    hasCompleted: isTourCompletedForRole(role),
  }
}
