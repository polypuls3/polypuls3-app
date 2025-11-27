'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Gift,
  Star,
  ArrowLeft,
  Coins,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Package,
  Loader2,
} from "lucide-react"
import { useShop, usePurchaseItem, useCanAfford } from "@/hooks/use-shop"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useToast } from "@/hooks/use-toast"
import type { ShopItem } from "@/lib/supabase/types"
import Link from "next/link"

function ShopItemCard({
  item,
  onPurchase,
}: {
  item: ShopItem
  onPurchase: (item: ShopItem) => void
}) {
  const canAfford = useCanAfford(item.point_cost)
  const isLimited = item.stock_quantity !== null
  const isOutOfStock = isLimited && item.stock_quantity === 0

  const getRewardTypeIcon = () => {
    switch (item.reward_type) {
      case 'pulse_token':
        return <Coins className="h-6 w-6 text-purple-500" />
      case 'digital':
        return <Sparkles className="h-6 w-6 text-pink-500" />
      case 'physical':
        return <Package className="h-6 w-6 text-amber-500" />
      default:
        return <Gift className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <Card className={`transition-all ${isOutOfStock ? 'opacity-50' : 'hover:border-purple-600/50'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          {getRewardTypeIcon()}
          {isLimited && (
            <Badge variant="secondary" className="text-xs">
              {item.stock_quantity} left
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-lg font-semibold text-amber-500">
            <Star className="h-5 w-5 fill-current" />
            <span>{item.point_cost.toLocaleString()}</span>
          </div>
          <Badge variant="outline" className="capitalize">
            {item.reward_type.replace('_', ' ')}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!canAfford || isOutOfStock}
          onClick={() => onPurchase(item)}
        >
          {isOutOfStock ? (
            'Out of Stock'
          ) : !canAfford ? (
            'Not Enough Points'
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Redeem
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

function PurchaseDialog({
  item,
  isOpen,
  onClose,
  onConfirm,
  isPurchasing,
}: {
  item: ShopItem | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isPurchasing: boolean
}) {
  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            You are about to redeem this reward with your points.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <Gift className="h-10 w-10 text-purple-500" />
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cost</span>
              <div className="flex items-center gap-1 font-semibold text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{item.point_cost.toLocaleString()} points</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPurchasing}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPurchasing}>
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Purchase
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ShopPage() {
  const { profile, points, isLoading: profileLoading } = useUserProfile()
  const { items, isLoading: shopLoading, refetch } = useShop()
  const { purchaseItem, isPurchasing } = usePurchaseItem()
  const { toast } = useToast()

  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handlePurchaseClick = (item: ShopItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedItem) return

    const result = await purchaseItem(selectedItem.id)

    if (result.success) {
      toast({
        title: 'Purchase Successful!',
        description: `You've redeemed ${selectedItem.name}`,
      })
      setIsDialogOpen(false)
      setSelectedItem(null)
      refetch()
    } else {
      toast({
        title: 'Purchase Failed',
        description: result.error || 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  if (!profile && !profileLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Connect your wallet to access the rewards shop.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pulseItems = items.filter((i) => i.reward_type === 'pulse_token')
  const digitalItems = items.filter((i) => i.reward_type === 'digital')
  const physicalItems = items.filter((i) => i.reward_type === 'physical')

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/quests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quests
          </Link>
        </Button>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Rewards Shop</h1>
        <p className="text-muted-foreground text-lg">
          Redeem your points for exclusive rewards
        </p>
      </div>

      {/* Points Balance */}
      <Card className="mb-8">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
              <Star className="h-6 w-6 text-amber-500 fill-current" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Balance</p>
              {profileLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold">{points.toLocaleString()} points</p>
              )}
            </div>
          </div>
          <Button asChild variant="outline">
            <Link href="/quests">
              Earn More Points
            </Link>
          </Button>
        </CardContent>
      </Card>

      {shopLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-6 mb-2" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-24" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No rewards available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later for exciting new rewards!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {/* PULSE Token Rewards */}
          {pulseItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Coins className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-semibold">PULSE Tokens</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pulseItems.map((item) => (
                  <ShopItemCard key={item.id} item={item} onPurchase={handlePurchaseClick} />
                ))}
              </div>
            </section>
          )}

          {/* Digital Rewards */}
          {digitalItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-semibold">Digital Rewards</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {digitalItems.map((item) => (
                  <ShopItemCard key={item.id} item={item} onPurchase={handlePurchaseClick} />
                ))}
              </div>
            </section>
          )}

          {/* Physical Rewards */}
          {physicalItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Package className="h-6 w-6 text-amber-500" />
                <h2 className="text-2xl font-semibold">Physical Rewards</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {physicalItems.map((item) => (
                  <ShopItemCard key={item.id} item={item} onPurchase={handlePurchaseClick} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <PurchaseDialog
        item={selectedItem}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmPurchase}
        isPurchasing={isPurchasing}
      />
    </div>
  )
}
