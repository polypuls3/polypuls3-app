"use client"

import { useEffect, useState } from "react"
import { useTourContext } from "@/contexts/tour-context"
import { TourTooltip } from "./tour-tooltip"
import type { TooltipPosition } from "@/lib/tours/types"

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

export function TourSpotlight() {
  const { isActive, showWelcome, currentConfig, currentStepIndex } = useTourContext()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null)

  const currentStep = currentConfig?.steps[currentStepIndex]

  useEffect(() => {
    if (!isActive || showWelcome || !currentStep) {
      setTargetRect(null)
      setSpotlightRect(null)
      return
    }

    const findAndHighlightTarget = () => {
      const target = document.querySelector(currentStep.targetSelector)

      if (!target) {
        // If element not found and step is optional, could skip
        // For now, just clear the highlight
        if (currentStep.optional) {
          setTargetRect(null)
          setSpotlightRect(null)
        }
        return
      }

      const rect = target.getBoundingClientRect()
      setTargetRect(rect)

      // Add padding around the spotlight
      const padding = 8
      setSpotlightRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      })

      // Scroll element into view if needed
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    // Initial find
    findAndHighlightTarget()

    // Re-calculate on resize/scroll
    const handleReposition = () => {
      findAndHighlightTarget()
    }

    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    // Use MutationObserver to detect DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(findAndHighlightTarget, 100)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
      observer.disconnect()
    }
  }, [isActive, showWelcome, currentStep, currentStepIndex])

  if (!isActive || showWelcome || !currentStep) return null

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div className="fixed inset-0 z-[10000] pointer-events-none">
        {spotlightRect ? (
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'auto' }}
          >
            <defs>
              <mask id="spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={spotlightRect.left}
                  y={spotlightRect.top}
                  width={spotlightRect.width}
                  height={spotlightRect.height}
                  rx="8"
                  ry="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.75)"
              mask="url(#spotlight-mask)"
              className="transition-all duration-300"
            />
          </svg>
        ) : (
          <div className="absolute inset-0 bg-black/75 transition-opacity duration-300" />
        )}

        {/* Spotlight border/glow effect */}
        {spotlightRect && (
          <div
            className="absolute rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-transparent transition-all duration-300 pointer-events-none"
            style={{
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <TourTooltip
        step={currentStep}
        targetRect={targetRect}
        position={currentStep.position as TooltipPosition}
      />
    </>
  )
}
