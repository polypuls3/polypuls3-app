"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTourContext } from "@/contexts/tour-context"
import { PenTool, Vote, Settings, Sparkles } from "lucide-react"

const roleIcons = {
  creator: PenTool,
  participant: Vote,
  admin: Settings,
}

export function WelcomeModal() {
  const { showWelcome, currentConfig, dismissWelcome, skipTour } = useTourContext()

  if (!showWelcome || !currentConfig) return null

  const Icon = roleIcons[currentConfig.role] || Sparkles

  return (
    <Dialog open={showWelcome} onOpenChange={(open) => !open && skipTour()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">{currentConfig.welcomeTitle}</DialogTitle>
          <DialogDescription className="text-base">
            {currentConfig.welcomeDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              This tour will guide you through {currentConfig.steps.length} key features.
              You can skip at any time by pressing <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-background rounded border">Esc</kbd> or use arrow keys to navigate.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={skipTour} className="w-full sm:w-auto">
            Skip Tour
          </Button>
          <Button onClick={dismissWelcome} className="w-full sm:w-auto">
            <Sparkles className="mr-2 h-4 w-4" />
            Start Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
