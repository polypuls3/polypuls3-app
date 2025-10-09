'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, CheckCircle2, Users, BarChart3, TrendingUp, Loader2, FileStack } from "lucide-react"
import { useAdminData } from "@/hooks/use-admin-data"
import { useState, useMemo } from "react"
import Link from "next/link"

export default function AdminPage() {
  const { stats, polls, loading, error } = useAdminData()
  const [searchTerm, setSearchTerm] = useState("")

  // Helper functions
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isPollExpired = (expiresAt: string) => {
    const now = Math.floor(Date.now() / 1000)
    return parseInt(expiresAt) < now
  }

  const getPollStatus = (poll: typeof polls[0]) => {
    if (!poll.isActive) return 'inactive'
    if (isPollExpired(poll.expiresAt)) return 'ended'
    return 'active'
  }

  // Filter polls based on search
  const filteredPolls = useMemo(() => {
    return polls.filter(poll =>
      searchTerm === "" ||
      poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [polls, searchTerm])

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading admin data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">Monitor and manage platform activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{stats.totalPolls}</p>
                  <p className="text-sm text-muted-foreground">Total Polls</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600/10">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
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
              <Users className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600/10">
              <FileStack className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Polls Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Polls ({filteredPolls.length})</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search polls..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPolls.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {polls.length === 0 ? "No polls found" : "No polls match your search"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolls.map((poll) => {
                  const status = getPollStatus(poll)
                  return (
                    <TableRow key={poll.id}>
                      <TableCell className="font-medium max-w-md">
                        <div className="truncate">{poll.question}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatAddress(poll.creator)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{poll.category || 'Uncategorized'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "active" ? "default" : "secondary"}
                          className={status === "active" ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>{parseInt(poll.totalResponses || '0').toLocaleString()}</TableCell>
                      <TableCell>{formatDate(poll.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/participant/poll/${poll.pollId}`}>View Poll</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Platform Analytics */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Polls</span>
                  <span className="text-2xl font-bold">{stats.totalPolls}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Polls</span>
                  <span className="text-2xl font-bold">{stats.activePolls}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Projects</span>
                  <span className="text-2xl font-bold">{stats.totalProjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Surveys</span>
                  <span className="text-2xl font-bold">{stats.totalSurveys}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/participant">View All Polls</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/creator">Creator Dashboard</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/creator/create-poll">Create New Poll</Link>
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
              <Link href="/creator/create-project">Create New Project</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
