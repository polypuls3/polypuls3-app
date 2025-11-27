"use client"

import { TourSpotlight } from "./tour-spotlight"
import { WelcomeModal } from "./welcome-modal"
import { useTourContext } from "@/contexts/tour-context"

export function TourOverlay() {
  const { isActive } = useTourContext()

  if (!isActive) return null

  return (
    <>
      <WelcomeModal />
      <TourSpotlight />
    </>
  )
}
