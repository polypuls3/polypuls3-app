'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LayoutGrid, PenTool, Vote, Check, ChevronDown } from 'lucide-react'
import { useQuestsRole } from '@/contexts/quests-role-context'
import type { QuestsRole } from '@/lib/quests/role-mapping'
import { useSidebar } from '@/components/ui/sidebar'

const roleConfig = {
  creator: {
    label: 'Creator',
    icon: PenTool,
    description: 'Create polls and surveys',
  },
  participant: {
    label: 'Participant',
    icon: Vote,
    description: 'Vote and earn rewards',
  },
} as const

export function RoleSwitcher() {
  const { role, setRole } = useQuestsRole()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const currentRole = roleConfig[role]
  const CurrentIcon = currentRole.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-2 ${isCollapsed ? 'px-2' : 'px-3'}`}
          size={isCollapsed ? 'icon' : 'default'}
        >
          <LayoutGrid className="h-4 w-4 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left truncate">{currentRole.label}</span>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {(Object.entries(roleConfig) as [QuestsRole, typeof roleConfig.creator][]).map(
          ([key, config]) => {
            const Icon = config.icon
            const isSelected = role === key
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => setRole(key)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">{config.label}</p>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </DropdownMenuItem>
            )
          }
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
