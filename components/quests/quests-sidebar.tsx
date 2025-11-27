'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  Target,
  TrendingUp,
  Gift,
  Award,
  User,
  Settings,
} from 'lucide-react'
import { RoleSwitcher } from './role-switcher'

const navItems = [
  {
    title: 'Quests',
    href: '/quests',
    icon: Target,
  },
  {
    title: 'Leaderboard',
    href: '/quests/leaderboard',
    icon: TrendingUp,
  },
  {
    title: 'Shop',
    href: '/quests/shop',
    icon: Gift,
  },
  {
    title: 'Badges',
    href: '/quests/badges',
    icon: Award,
  },
  {
    title: 'Profile',
    href: '/quests/profile',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/quests/settings',
    icon: Settings,
  },
]

export function QuestsSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r top-16 h-[calc(100vh-4rem)]">
      <SidebarHeader className="p-3">
        <RoleSwitcher />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
