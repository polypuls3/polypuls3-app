"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HelpCircle, PenTool, Vote, Settings } from "lucide-react"
import { useTourContext } from "@/contexts/tour-context"
import { creatorTourConfig, participantTourConfig, adminTourConfig } from "@/lib/tours"
import { usePathname, useRouter } from "next/navigation"

export function TourHelpButton() {
  const { startTour, resetTour, isActive } = useTourContext()
  const pathname = usePathname()
  const router = useRouter()

  const handleStartTour = (role: 'creator' | 'participant' | 'admin') => {
    // Reset completion status first
    resetTour(role)

    // Navigate to the appropriate page if not already there
    const targetPath = role === 'creator' ? '/creator' : role === 'participant' ? '/participant' : '/admin'

    if (pathname !== targetPath) {
      router.push(targetPath)
      // Small delay to allow navigation before starting tour
      setTimeout(() => {
        const config = role === 'creator' ? creatorTourConfig : role === 'participant' ? participantTourConfig : adminTourConfig
        startTour(role, config)
      }, 500)
    } else {
      const config = role === 'creator' ? creatorTourConfig : role === 'participant' ? participantTourConfig : adminTourConfig
      startTour(role, config)
    }
  }

  // Don't show button if tour is active
  if (isActive) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help & Tours</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Guided Tours</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleStartTour('creator')} className="cursor-pointer">
          <PenTool className="mr-2 h-4 w-4" />
          Creator Tour
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStartTour('participant')} className="cursor-pointer">
          <Vote className="mr-2 h-4 w-4" />
          Participant Tour
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStartTour('admin')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Admin Tour
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
