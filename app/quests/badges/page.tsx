'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Award, Lock } from 'lucide-react'
import { useAllBadges } from '@/hooks/use-quests'

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'common':
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
    case 'uncommon':
      return 'bg-green-500/10 text-green-400 border-green-500/30'
    case 'rare':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    case 'epic':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    case 'legendary':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }
}

export default function BadgesPage() {
  const { badges, isLoading } = useAllBadges()

  const earnedBadges = badges.filter((b) => b.earned)
  const unearnedBadges = badges.filter((b) => !b.earned)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Award className="h-8 w-8 text-purple-500" />
          Badges
        </h1>
        <p className="text-muted-foreground">
          Collect badges by completing quests and achieving milestones
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="pt-6">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Earned Badges */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Earned Badges
              <Badge variant="secondary" className="ml-2">
                {earnedBadges.length}
              </Badge>
            </h2>
            {earnedBadges.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No badges earned yet. Complete quests to earn your first badge!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                {earnedBadges.map((badge) => (
                  <Card
                    key={badge.id}
                    className={`text-center border-2 transition-all hover:scale-105 cursor-pointer ${getRarityColor(badge.rarity)}`}
                  >
                    <CardContent className="pt-6 pb-4">
                      <div className="text-5xl mb-3">{badge.image_url || '🏆'}</div>
                      <p className="font-semibold text-sm mb-1">{badge.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {badge.rarity}
                      </Badge>
                      {badge.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {badge.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Locked Badges */}
          {unearnedBadges.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                <Lock className="h-5 w-5" />
                Locked Badges
                <Badge variant="outline" className="ml-2">
                  {unearnedBadges.length}
                </Badge>
              </h2>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                {unearnedBadges.map((badge) => (
                  <Card key={badge.id} className="text-center opacity-60 hover:opacity-80 transition-opacity">
                    <CardContent className="pt-6 pb-4">
                      <div className="text-5xl mb-3 grayscale">🔒</div>
                      <p className="font-medium text-sm text-muted-foreground mb-1">
                        {badge.name}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {badge.rarity}
                      </Badge>
                      {badge.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {badge.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
