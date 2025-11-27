"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/supabase/types'

interface QuestsContextType {
  userProfile: UserProfile | null
  isLoading: boolean
  error: string | null
  points: number
  streak: number
  refreshProfile: () => Promise<void>
  isInitialized: boolean
}

const QuestsContext = createContext<QuestsContextType | undefined>(undefined)

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function QuestsProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const fetchOrCreateProfile = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return

    console.log('[QuestsContext] Fetching profile for wallet:', walletAddress)
    setIsLoading(true)
    setError(null)

    try {
      // First try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single()

      console.log('[QuestsContext] Fetch result:', { existingProfile, fetchError })

      if (existingProfile) {
        console.log('[QuestsContext] Found existing profile:', existingProfile.id)
        setUserProfile(existingProfile)
        setIsInitialized(true)
        setIsLoading(false)
        return
      }

      // If not found (PGRST116 = no rows returned), create new profile
      if (fetchError && fetchError.code === 'PGRST116') {
        console.log('[QuestsContext] No profile found, creating new one...')
        const referralCode = generateReferralCode()

        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            wallet_address: walletAddress.toLowerCase(),
            referral_code: referralCode,
            total_points: 0,
            current_streak: 0,
            longest_streak: 0,
          })
          .select()
          .single()

        console.log('[QuestsContext] Insert result:', { newProfile, insertError })

        if (insertError) {
          // Handle race condition - profile might have been created by another request
          if (insertError.code === '23505') { // unique_violation
            console.log('[QuestsContext] Race condition, retrying fetch...')
            const { data: retryProfile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('wallet_address', walletAddress.toLowerCase())
              .single()

            if (retryProfile) {
              setUserProfile(retryProfile)
              setIsInitialized(true)
              setIsLoading(false)
              return
            }
          }
          throw insertError
        }

        console.log('[QuestsContext] Created new profile:', newProfile?.id)
        setUserProfile(newProfile)
        setIsInitialized(true)
      } else if (fetchError) {
        console.error('[QuestsContext] Fetch error:', fetchError)
        throw fetchError
      }
    } catch (err) {
      console.error('[QuestsContext] Error fetching/creating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile')
      setIsInitialized(true) // Mark as initialized even on error so we don't keep retrying
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (address) {
      await fetchOrCreateProfile(address)
    }
  }, [address, fetchOrCreateProfile])

  // Initialize profile when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      fetchOrCreateProfile(address)
    } else {
      setUserProfile(null)
      setIsInitialized(false)
    }
  }, [isConnected, address, fetchOrCreateProfile])

  // Subscribe to real-time updates for user profile
  useEffect(() => {
    if (!userProfile?.id) return

    const channel = supabase
      .channel(`profile-${userProfile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${userProfile.id}`,
        },
        (payload) => {
          setUserProfile(payload.new as UserProfile)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userProfile?.id])

  const value: QuestsContextType = {
    userProfile,
    isLoading,
    error,
    points: userProfile?.total_points ?? 0,
    streak: userProfile?.current_streak ?? 0,
    refreshProfile,
    isInitialized,
  }

  return (
    <QuestsContext.Provider value={value}>
      {children}
    </QuestsContext.Provider>
  )
}

export function useQuestsContext() {
  const context = useContext(QuestsContext)
  if (context === undefined) {
    throw new Error('useQuestsContext must be used within a QuestsProvider')
  }
  return context
}
