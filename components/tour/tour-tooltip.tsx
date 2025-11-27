"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTourContext } from "@/contexts/tour-context"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import type { TourStep, TooltipPosition } from "@/lib/tours/types"

interface TourTooltipProps {
  step: TourStep
  targetRect: DOMRect | null
  position: TooltipPosition
}

export function TourTooltip({ step, targetRect, position }: TourTooltipProps) {
  const { currentStepIndex, totalSteps, nextStep, prevStep, skipTour } = useTourContext()

  if (!targetRect) return null

  // Calculate tooltip position
  const tooltipStyle = calculatePosition(targetRect, position)

  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === totalSteps - 1

  return (
    <div className="fixed z-[10001] animate-in fade-in-0 zoom-in-95 duration-200" style={tooltipStyle}>
      <Card className="w-80 shadow-xl border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{step.title}</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-0">
          <span className="text-xs text-muted-foreground">
            {currentStepIndex + 1} of {totalSteps}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={nextStep}>
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function calculatePosition(
  targetRect: DOMRect,
  position: TooltipPosition
): React.CSSProperties {
  const padding = 16
  const tooltipWidth = 320

  // Viewport dimensions
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0

  let top: number
  let left: number

  switch (position) {
    case 'top':
      top = targetRect.top - padding
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      // Transform will move it above
      break
    case 'bottom':
      top = targetRect.bottom + padding
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2
      break
    case 'left':
      top = targetRect.top + targetRect.height / 2
      left = targetRect.left - tooltipWidth - padding
      break
    case 'right':
      top = targetRect.top + targetRect.height / 2
      left = targetRect.right + padding
      break
    default:
      top = targetRect.bottom + padding
      left = targetRect.left
  }

  // Ensure tooltip stays within viewport
  left = Math.max(padding, Math.min(left, viewportWidth - tooltipWidth - padding))
  top = Math.max(padding, Math.min(top, viewportHeight - 200))

  const style: React.CSSProperties = {
    top: `${top}px`,
    left: `${left}px`,
  }

  // Add transform for top/left positions
  if (position === 'top') {
    style.transform = 'translateY(-100%)'
  } else if (position === 'left' || position === 'right') {
    style.transform = 'translateY(-50%)'
  }

  return style
}
