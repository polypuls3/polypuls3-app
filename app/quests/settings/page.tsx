'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Bell,
  Eye,
  RotateCcw,
  Download,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { resetTourCompletion } from '@/lib/tours/types'
import { ROLE_STORAGE_KEY } from '@/lib/quests/role-mapping'

export default function SettingsPage() {
  const { toast } = useToast()
  const [showNotifications, setShowNotifications] = useState(true)
  const [showProgressAnimations, setShowProgressAnimations] = useState(true)
  const [showCompletedQuests, setShowCompletedQuests] = useState(true)

  const handleResetTour = () => {
    // Reset all tour completion statuses
    resetTourCompletion('creator')
    resetTourCompletion('participant')
    resetTourCompletion('admin')
    toast({
      title: 'Tours Reset',
      description: 'Guided tours have been reset. They will show again on relevant pages.',
    })
  }

  const handleExportData = () => {
    // Create a simple export of localStorage quest-related data
    const questData = {
      role: localStorage.getItem(ROLE_STORAGE_KEY),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(questData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'polypulse-quests-data.json'
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Data Exported',
      description: 'Your quest preferences have been exported.',
    })
  }

  const handleClearPreferences = () => {
    localStorage.removeItem(ROLE_STORAGE_KEY)
    toast({
      title: 'Preferences Cleared',
      description: 'Your quest preferences have been reset to defaults.',
    })
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Settings className="h-8 w-8 text-purple-500" />
          Settings
        </h1>
        <p className="text-muted-foreground">
          Customize your quests experience
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive quest updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="quest-notifications">Quest Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when you complete a quest
                </p>
              </div>
              <Switch
                id="quest-notifications"
                checked={showNotifications}
                onCheckedChange={setShowNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Display
            </CardTitle>
            <CardDescription>
              Customize how quests are displayed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="progress-animations">Progress Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Show animations when progress updates
                </p>
              </div>
              <Switch
                id="progress-animations"
                checked={showProgressAnimations}
                onCheckedChange={setShowProgressAnimations}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="completed-quests">Show Completed Quests</Label>
                <p className="text-sm text-muted-foreground">
                  Display completed quests in the quest list
                </p>
              </div>
              <Switch
                id="completed-quests"
                checked={showCompletedQuests}
                onCheckedChange={setShowCompletedQuests}
              />
            </div>
          </CardContent>
        </Card>

        {/* Guided Tours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Guided Tours
            </CardTitle>
            <CardDescription>
              Reset guided tours to see them again
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleResetTour}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Tours
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export or clear your quest preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Preferences
              </Button>
              <Button variant="outline" onClick={handleClearPreferences} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Preferences
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Note: Quest progress is stored on-chain and in our database. Clearing preferences only resets local settings like your role preference.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
