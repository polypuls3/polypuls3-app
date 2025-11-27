"use client"

import { useCallback } from 'react'
import { useQuestsContext } from '@/contexts/quests-context'
import { supabase } from '@/lib/supabase/client'
import type { PointTransaction, UserBadge, Badge } from '@/lib/supabase/types'

export function useUserProfile() {
  const { userProfile, isLoading, error, points, streak, refreshProfile, isInitialized } = useQuestsContext()

  return {
    profile: userProfile,
    isLoading,
    error,
    points,
    streak,
    refreshProfile,
    isInitialized,
    walletAddress: userProfile?.wallet_address,
    referralCode: userProfile?.referral_code,
    displayName: userProfile?.display_name,
  }
}

export function usePointsHistory(limit: number = 20) {
  const { userProfile } = useQuestsContext()

  const fetchHistory = useCallback(async (): Promise<PointTransaction[]> => {
    if (!userProfile?.id) return []

    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching points history:', error)
      return []
    }

    return data || []
  }, [userProfile?.id, limit])

  return { fetchHistory }
}

export function useUserBadges() {
  const { userProfile } = useQuestsContext()

  const fetchBadges = useCallback(async (): Promise<(UserBadge & { badge: Badge })[]> => {
    if (!userProfile?.id) return []

    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', userProfile.id)
      .order('earned_at', { ascending: false })

    if (error) {
      console.error('Error fetching user badges:', error)
      return []
    }

    return (data as (UserBadge & { badge: Badge })[]) || []
  }, [userProfile?.id])

  return { fetchBadges }
}

export function useUpdateProfile() {
  const { userProfile, refreshProfile } = useQuestsContext()

  const updateDisplayName = useCallback(async (displayName: string): Promise<boolean> => {
    if (!userProfile?.id) return false

    const { error } = await supabase
      .from('user_profiles')
      .update({ display_name: displayName })
      .eq('id', userProfile.id)

    if (error) {
      console.error('Error updating display name:', error)
      return false
    }

    await refreshProfile()
    return true
  }, [userProfile?.id, refreshProfile])

  const updateAvatar = useCallback(async (avatarUrl: string): Promise<boolean> => {
    if (!userProfile?.id) return false

    const { error } = await supabase
      .from('user_profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userProfile.id)

    if (error) {
      console.error('Error updating avatar:', error)
      return false
    }

    await refreshProfile()
    return true
  }, [userProfile?.id, refreshProfile])

  return { updateDisplayName, updateAvatar }
}

export function useReferral() {
  const { userProfile } = useQuestsContext()

  const applyReferralCode = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!userProfile?.id) {
      return { success: false, message: 'Not logged in' }
    }

    if (userProfile.referred_by) {
      return { success: false, message: 'You have already used a referral code' }
    }

    if (code.toUpperCase() === userProfile.referral_code) {
      return { success: false, message: 'You cannot use your own referral code' }
    }

    // Find the referrer
    const { data: referrer, error: referrerError } = await supabase
      .from('user_profiles')
      .select('id, referral_code')
      .eq('referral_code', code.toUpperCase())
      .single()

    if (referrerError || !referrer) {
      return { success: false, message: 'Invalid referral code' }
    }

    // Update current user's referred_by
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ referred_by: code.toUpperCase() })
      .eq('id', userProfile.id)

    if (updateError) {
      return { success: false, message: 'Failed to apply referral code' }
    }

    // Create referral record
    await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_wallet: userProfile.wallet_address,
        referred_user_id: userProfile.id,
        status: 'pending',
      })

    return { success: true, message: 'Referral code applied successfully!' }
  }, [userProfile])

  const getReferralStats = useCallback(async (): Promise<{
    totalReferrals: number
    completedReferrals: number
    pendingReferrals: number
  }> => {
    if (!userProfile?.id) {
      return { totalReferrals: 0, completedReferrals: 0, pendingReferrals: 0 }
    }

    const { data, error } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_id', userProfile.id)

    if (error || !data) {
      return { totalReferrals: 0, completedReferrals: 0, pendingReferrals: 0 }
    }

    return {
      totalReferrals: data.length,
      completedReferrals: data.filter(r => r.status === 'completed' || r.status === 'rewarded').length,
      pendingReferrals: data.filter(r => r.status === 'pending').length,
    }
  }, [userProfile?.id])

  return {
    referralCode: userProfile?.referral_code,
    hasUsedReferral: !!userProfile?.referred_by,
    applyReferralCode,
    getReferralStats,
  }
}
