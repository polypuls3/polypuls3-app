'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { QuestsSidebar } from '@/components/quests'
import { QuestsRoleProvider } from '@/contexts/quests-role-context'
import { Separator } from '@/components/ui/separator'

export default function QuestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QuestsRoleProvider>
      <SidebarProvider>
        <QuestsSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium">Quests</span>
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </QuestsRoleProvider>
  )
}
