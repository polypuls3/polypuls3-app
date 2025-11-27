"use client"

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import {
  TourRole,
  TourState,
  TourConfig,
  isTourCompleted,
  markTourCompleted,
  resetTourCompletion,
} from '@/lib/tours/types'

interface TourContextType {
  // State
  isActive: boolean
  currentRole: TourRole | null
  currentStepIndex: number
  showWelcome: boolean
  currentConfig: TourConfig | null

  // Actions
  startTour: (role: TourRole, config: TourConfig) => void
  nextStep: () => void
  prevStep: () => void
  skipTour: () => void
  completeTour: () => void
  resetTour: (role: TourRole) => void
  dismissWelcome: () => void

  // Helpers
  isTourCompletedForRole: (role: TourRole) => boolean
  totalSteps: number
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TourState>({
    isActive: false,
    currentRole: null,
    currentStepIndex: 0,
    showWelcome: false,
  })
  const [currentConfig, setCurrentConfig] = useState<TourConfig | null>(null)

  const startTour = useCallback((role: TourRole, config: TourConfig) => {
    setCurrentConfig(config)
    setState({
      isActive: true,
      currentRole: role,
      currentStepIndex: 0,
      showWelcome: true,
    })
  }, [])

  const dismissWelcome = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showWelcome: false,
    }))
  }, [])

  const nextStep = useCallback(() => {
    if (!currentConfig) return

    setState((prev) => {
      const nextIndex = prev.currentStepIndex + 1
      if (nextIndex >= currentConfig.steps.length) {
        // Tour complete
        if (prev.currentRole) {
          markTourCompleted(prev.currentRole)
        }
        return {
          isActive: false,
          currentRole: null,
          currentStepIndex: 0,
          showWelcome: false,
        }
      }
      return {
        ...prev,
        currentStepIndex: nextIndex,
      }
    })
  }, [currentConfig])

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }))
  }, [])

  const skipTour = useCallback(() => {
    if (state.currentRole) {
      markTourCompleted(state.currentRole)
    }
    setState({
      isActive: false,
      currentRole: null,
      currentStepIndex: 0,
      showWelcome: false,
    })
    setCurrentConfig(null)
  }, [state.currentRole])

  const completeTour = useCallback(() => {
    if (state.currentRole) {
      markTourCompleted(state.currentRole)
    }
    setState({
      isActive: false,
      currentRole: null,
      currentStepIndex: 0,
      showWelcome: false,
    })
    setCurrentConfig(null)
  }, [state.currentRole])

  const resetTour = useCallback((role: TourRole) => {
    resetTourCompletion(role)
  }, [])

  const isTourCompletedForRole = useCallback((role: TourRole) => {
    return isTourCompleted(role)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    if (!state.isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour()
      } else if (e.key === 'ArrowRight' && !state.showWelcome) {
        nextStep()
      } else if (e.key === 'ArrowLeft' && !state.showWelcome) {
        prevStep()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.isActive, state.showWelcome, nextStep, prevStep, skipTour])

  const value: TourContextType = {
    isActive: state.isActive,
    currentRole: state.currentRole,
    currentStepIndex: state.currentStepIndex,
    showWelcome: state.showWelcome,
    currentConfig,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour,
    dismissWelcome,
    isTourCompletedForRole,
    totalSteps: currentConfig?.steps.length ?? 0,
  }

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTourContext() {
  const context = useContext(TourContext)
  if (context === undefined) {
    throw new Error('useTourContext must be used within a TourProvider')
  }
  return context
}
