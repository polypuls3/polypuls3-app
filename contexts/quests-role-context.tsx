'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import {
  QuestsRole,
  getDefaultRole,
  getStoredRole,
  storeRole,
} from '@/lib/quests/role-mapping'

interface QuestsRoleContextType {
  role: QuestsRole
  setRole: (role: QuestsRole) => void
  isCreator: boolean
  isParticipant: boolean
}

const QuestsRoleContext = createContext<QuestsRoleContextType | undefined>(undefined)

export function QuestsRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<QuestsRole>(getDefaultRole())
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = getStoredRole()
    if (stored) {
      setRoleState(stored)
    }
    setIsHydrated(true)
  }, [])

  const setRole = useCallback((newRole: QuestsRole) => {
    setRoleState(newRole)
    storeRole(newRole)
  }, [])

  const value: QuestsRoleContextType = {
    role,
    setRole,
    isCreator: role === 'creator',
    isParticipant: role === 'participant',
  }

  // Prevent flash of default content before hydration
  if (!isHydrated) {
    return null
  }

  return (
    <QuestsRoleContext.Provider value={value}>
      {children}
    </QuestsRoleContext.Provider>
  )
}

export function useQuestsRole() {
  const context = useContext(QuestsRoleContext)
  if (context === undefined) {
    throw new Error('useQuestsRole must be used within a QuestsRoleProvider')
  }
  return context
}
