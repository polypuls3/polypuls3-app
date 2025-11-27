'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  User,
  Star,
  Flame,
  CheckCircle2,
  Trophy,
  Copy,
  ExternalLink,
  Zap,
} from 'lucide-react'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useQuests, useAllBadges } from '@/hooks/use-quests'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const { profile, points, streak, walletAddress, referralCode, isLoading } = useUserProfile()
  const { quests: allQuests, isLoading: questsLoading } = useQuests()
  const { badges } = useAllBadges()
  const { toast } = useToast()

  const completedCount = allQuests.filter((q) => q.progress.completedCount > 0).length
  const earnedBadges = badges.filter((b) => b.earned)

  const referralLink = referralCode
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/quests?ref=${referralCode}`
    : ''

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      })
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-10 w-40 mb-2" />
          <Skeleton className="h-5 w-60" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <User className="h-8 w-8 text-purple-500" />
          Profile
        </h1>
        <p className="text-muted-foreground">
          View your stats, badges, and referral information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
            <CardDescription>Track your quest progress and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10">
                <Star className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{points.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-500/10">
                <Flame className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{streak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Quests Done</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/10">
                <Trophy className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{earnedBadges.length}</p>
                  <p className="text-sm text-muted-foreground">Badges</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>Your connected wallet address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Connected Address</p>
              <p className="font-mono text-sm break-all">{walletAddress || 'Not connected'}</p>
            </div>
            {walletAddress && (
              <Button variant="outline" className="mt-4 w-full" asChild>
                <a
                  href={`https://polygonscan.com/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on PolygonScan
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Referral Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Refer Friends
            </CardTitle>
            <CardDescription>
              Share your referral link and earn points when friends join
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralCode ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Your Referral Code</p>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {referralCode}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Referral Link</p>
                  <div className="flex gap-2">
                    <Input
                      value={referralLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" onClick={copyReferralLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  When someone signs up using your link, you both earn bonus points!
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Complete your first quest to unlock your referral code
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Badges */}
        {earnedBadges.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Recent Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {earnedBadges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                  >
                    <span className="text-2xl">{badge.image_url || '🏆'}</span>
                    <div>
                      <p className="font-medium text-sm">{badge.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {badge.rarity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
