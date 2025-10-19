'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Clock, CheckCircle2, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePolls } from "@/hooks/use-polls"
import { PollStatus } from "@/lib/graphql/queries"
import { useMemo, useState } from "react"

export default function ParticipantPage() {
  const { polls, userResponses, loading, error } = usePolls()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter to only show polls with ACTIVE status
  const activePolls = useMemo(() => {
    return polls.filter(poll => poll.status === PollStatus.ACTIVE)
  }, [polls])

  // Helper function to check if poll is ending soon (within 24 hours)
  const isEndingSoon = (expiresAt: string) => {
    const now = Math.floor(Date.now() / 1000)
    const expiryTime = parseInt(expiresAt)
    const timeLeft = expiryTime - now
    return timeLeft > 0 && timeLeft < 86400 // 24 hours in seconds
  }

  // Helper function to format timestamp
  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Get unique categories from active polls only
  const categories = useMemo(() => {
    const uniqueCategories = new Set(activePolls.map(poll => poll.category))
    return Array.from(uniqueCategories).filter(cat => cat && cat.trim() !== '')
  }, [activePolls])

  // Filter active polls based on search and category
  const filteredPolls = useMemo(() => {
    return activePolls.filter(poll => {
      const matchesSearch = searchTerm === "" ||
        poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poll.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === null || poll.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [activePolls, searchTerm, selectedCategory])

  // Calculate stats from active polls only
  const stats = useMemo(() => {
    const activePollsCount = activePolls.length
    const userVotes = userResponses.length
    const totalParticipants = activePolls.reduce((sum, poll) => sum + parseInt(poll.totalResponses || '0'), 0)

    return { activePolls: activePollsCount, userVotes, totalParticipants }
  }, [activePolls, userResponses])
  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading polls: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Active Polls</h1>
        <p className="text-muted-foreground text-lg">Participate in community decisions and make your voice heard</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search polls..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "outline" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "outline" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{stats.activePolls}</p>
                  <p className="text-sm text-muted-foreground">Active Polls</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-600/10">
              <CheckCircle2 className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{stats.userVotes}</p>
                  <p className="text-sm text-muted-foreground">Your Votes</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold">
                    {stats.totalParticipants > 1000
                      ? `${(stats.totalParticipants / 1000).toFixed(1)}K`
                      : stats.totalParticipants}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Polls Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPolls.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {activePolls.length === 0
                ? "No active polls available at the moment."
                : "No polls match your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPolls.map((poll) => (
            <Card
              key={poll.id}
              className="group transition-all hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-600/10"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <Badge variant="secondary">{poll.category || 'Uncategorized'}</Badge>
                  {isEndingSoon(poll.expiresAt) && (
                    <Badge variant="destructive" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Ending Soon
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                  {poll.question}
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {poll.options.length} options • {poll.votingType || 'Standard'} voting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{parseInt(poll.totalResponses || '0').toLocaleString()} votes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Ends {formatDate(poll.expiresAt)}</span>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/participant/poll?id=${poll.pollId}`}>Vote Now</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
