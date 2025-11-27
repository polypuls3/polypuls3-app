"use client"

import { useState, useEffect, useCallback } from 'react'
import { useQuestsContext } from '@/contexts/quests-context'
import type { ShopItem } from '@/lib/supabase/types'

interface PurchaseResult {
  success: boolean
  error?: string
  redemption?: {
    id: string
    status: string
  }
  newTotalPoints?: number
  item?: {
    id: string
    name: string
    rewardType: string
    rewardData: unknown
  }
}

export function useShop(category?: string) {
  const [items, setItems] = useState<ShopItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const url = category ? `/api/shop?category=${category}` : '/api/shop'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch shop items')
      }

      const data: ShopItem[] = await response.json()
      setItems(data)
    } catch (err) {
      console.error('Error fetching shop items:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch shop items')
    } finally {
      setIsLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
  }
}

export function usePurchaseItem() {
  const { userProfile, refreshProfile } = useQuestsContext()
  const [isPurchasing, setIsPurchasing] = useState(false)

  const purchaseItem = useCallback(async (itemId: string): Promise<PurchaseResult> => {
    if (!userProfile?.id) {
      return { success: false, error: 'Not logged in' }
    }

    setIsPurchasing(true)

    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.id,
          itemId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to purchase item',
        }
      }

      // Refresh profile to get updated points
      await refreshProfile()

      return {
        success: true,
        redemption: result.redemption,
        newTotalPoints: result.newTotalPoints,
        item: result.item,
      }
    } catch (err) {
      console.error('Error purchasing item:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to purchase item',
      }
    } finally {
      setIsPurchasing(false)
    }
  }, [userProfile?.id, refreshProfile])

  return {
    purchaseItem,
    isPurchasing,
  }
}

export function useCanAfford(pointCost: number): boolean {
  const { points } = useQuestsContext()
  return points >= pointCost
}
