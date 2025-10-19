'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, CheckCircle2, Users, BarChart3, TrendingUp, Loader2, FileStack, Settings, DollarSign } from "lucide-react"
import { useAdminData } from "@/hooks/use-admin-data"
import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi"
import { formatEther } from "viem"
import { CONTRACT_CONFIG } from "@/lib/contracts/config"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { PollStatus } from "@/lib/graphql/queries"

const POLL_CONTRACT = {
  address: process.env.NEXT_PUBLIC_POLL_CONTRACT_ADDRESS as `0x${string}`,
  abi: [
    {
      inputs: [],
      name: 'platformFeePercentage',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'treasuryAddress',
      outputs: [{ name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
} as const

const TREASURY_CONTRACT = {
  address: process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`,
  abi: [
    {
      inputs: [],
      name: 'getBalance',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalFeesCollected',
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
} as const

export default function AdminPage() {
  const { stats, polls, loading, error } = useAdminData()
  const [searchTerm, setSearchTerm] = useState("")
  const { isConnected, address: connectedAddress } = useAccount()
  const { toast } = useToast()
  const router = useRouter()

  const { writeContract, data: hash, isPending: isWritePending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Read platform settings
  const { data: platformFee } = useReadContract({
    ...POLL_CONTRACT,
    functionName: 'platformFeePercentage',
  })

  const { data: treasuryAddress } = useReadContract({
    ...POLL_CONTRACT,
    functionName: 'treasuryAddress',
  })

  const { data: treasuryBalance } = useReadContract({
    ...TREASURY_CONTRACT,
    functionName: 'getBalance',
  })

  const { data: totalFeesCollected } = useReadContract({
    ...TREASURY_CONTRACT,
    functionName: 'totalFeesCollected',
  })

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success",
        description: "Poll status updated. Refreshing in a few seconds...",
      })
      reset()

      // Wait for subgraph to index the new status (3-5 seconds)
      setTimeout(() => {
        window.location.reload()
      }, 4000)
    }
  }, [isSuccess, toast, reset, router])

  // Helper functions
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatPOL = (wei: string) => {
    const value = BigInt(wei)
    const eth = Number(value) / 1e18
    return eth.toFixed(4)
  }

  const getStatusBadgeVariant = (status: PollStatus) => {
    switch (status) {
      case PollStatus.ACTIVE:
        return { variant: 'default' as const, className: 'bg-green-600 hover:bg-green-700' }
      case PollStatus.CLAIMING_ENABLED:
        return { variant: 'default' as const, className: 'bg-blue-600 hover:bg-blue-700' }
      case PollStatus.ENDED:
        return { variant: 'secondary' as const, className: 'bg-orange-600 hover:bg-orange-700' }
      case PollStatus.CLAIMING_DISABLED:
        return { variant: 'secondary' as const, className: 'bg-gray-600 hover:bg-gray-700' }
      case PollStatus.CLOSED:
        return { variant: 'secondary' as const, className: 'bg-slate-600 hover:bg-slate-700' }
      default:
        return { variant: 'secondary' as const, className: '' }
    }
  }

  const getStatusLabel = (status: PollStatus) => {
    switch (status) {
      case PollStatus.ACTIVE: return 'Active'
      case PollStatus.ENDED: return 'Ended'
      case PollStatus.CLAIMING_ENABLED: return 'Claiming Enabled'
      case PollStatus.CLAIMING_DISABLED: return 'Claiming Disabled'
      case PollStatus.CLOSED: return 'Closed'
      default: return 'Unknown'
    }
  }

  const getStatusActions = (status: PollStatus) => {
    switch (status) {
      case PollStatus.ACTIVE:
        return [{ label: 'End Voting', function: 'endVoting' }]
      case PollStatus.ENDED:
        return [
          { label: 'Enable Claiming', function: 'enableClaiming' },
          { label: 'Disable Claiming', function: 'disableClaiming' },
          { label: 'Close Poll', function: 'closePoll', variant: 'destructive' as const }
        ]
      case PollStatus.CLAIMING_ENABLED:
        return [
          { label: 'Disable Claiming', function: 'disableClaiming' },
          { label: 'Close Poll', function: 'closePoll', variant: 'destructive' as const }
        ]
      case PollStatus.CLAIMING_DISABLED:
        return [
          { label: 'Enable Claiming', function: 'enableClaiming' },
          { label: 'Close Poll', function: 'closePoll', variant: 'destructive' as const }
        ]
      case PollStatus.CLOSED:
        return []
      default:
        return []
    }
  }

  const handleStatusAction = async (pollId: string, functionName: string, actionLabel: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to manage polls",
        variant: "destructive"
      })
      return
    }

    // Find the poll to check creator
    const poll = polls.find(p => p.pollId === pollId)

    console.log('=== Status Action Debug Info ===')
    console.log('Function:', functionName)
    console.log('Poll ID:', pollId)
    console.log('Connected wallet:', connectedAddress)
    console.log('Poll creator:', poll?.creator)
    console.log('Wallet matches creator:', poll?.creator.toLowerCase() === connectedAddress?.toLowerCase())
    console.log('==============================')

    // Check if connected wallet is the poll creator
    if (poll && poll.creator.toLowerCase() !== connectedAddress?.toLowerCase()) {
      toast({
        title: "Permission denied",
        description: `Only the poll creator can manage this poll. Creator: ${poll.creator.slice(0, 6)}...${poll.creator.slice(-4)}`,
        variant: "destructive"
      })
      return
    }

    try {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName,
        args: [BigInt(pollId)]
      }, {
        onSuccess: (hash) => {
          console.log('Transaction hash:', hash)
          toast({
            title: "Transaction submitted",
            description: `${actionLabel}... Hash: ${hash.slice(0, 10)}...`,
          })
        },
        onError: (error) => {
          console.error('Transaction error:', error)
          toast({
            title: "Transaction failed",
            description: error.message || "Failed to update poll status",
            variant: "destructive"
          })
        }
      })
    } catch (err) {
      console.error('Error updating poll status:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update poll status",
        variant: "destructive"
      })
    }
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

      {/* Platform Settings Section */}
      <Card className="mb-8 border-purple-200 dark:border-purple-900">
        <CardHeader className="bg-purple-50 dark:bg-purple-950/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform Settings
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Full Settings
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Platform Fee */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/10">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Fee</p>
                <p className="text-2xl font-bold">
                  {platformFee ? Number(platformFee) / 100 : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {platformFee ? platformFee.toString() : '0'} basis points
                </p>
              </div>
            </div>

            {/* Treasury Balance */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Treasury Balance</p>
                <p className="text-2xl font-bold">
                  {treasuryBalance ? parseFloat(formatEther(treasuryBalance)).toFixed(4) : '0.0000'} POL
                </p>
                <p className="text-xs text-muted-foreground">Available to withdraw</p>
              </div>
            </div>

            {/* Total Fees Collected */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fees Collected</p>
                <p className="text-2xl font-bold">
                  {totalFeesCollected ? parseFloat(formatEther(totalFeesCollected)).toFixed(4) : '0.0000'} POL
                </p>
                <p className="text-xs text-muted-foreground">Lifetime earnings</p>
              </div>
            </div>
          </div>

          {/* Treasury Address Display */}
          <div className="mt-6 p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1">Treasury Contract Address</p>
            <p className="text-xs font-mono break-all">
              {treasuryAddress as string || '0x0000000000000000000000000000000000000000'}
            </p>
          </div>
        </CardContent>
      </Card>

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
            <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Rewards/Fee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolls.map((poll) => {
                  const statusBadge = getStatusBadgeVariant(poll.status)
                  const statusActions = getStatusActions(poll.status)
                  console.log('poll', poll)
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
                          variant={statusBadge.variant}
                          className={statusBadge.className}
                        >
                          {getStatusLabel(poll.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{parseInt(poll.totalResponses || '0').toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div className="font-medium">{formatPOL(poll.rewardPool)} POL</div>
                          <div className="text-muted-foreground">
                            Fee: {formatPOL(poll.platformFeeAmount || '0')} POL
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(poll.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-2">
                          {/* Claim Statistics */}
                          {(poll.status === PollStatus.CLAIMING_ENABLED ||
                            poll.status === PollStatus.CLAIMING_DISABLED ||
                            poll.status === PollStatus.CLOSED) && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">
                                {parseInt(poll.claimedRewards || '0')}/{parseInt(poll.totalResponses || '0')} claimed
                              </span>
                              {' '}
                              <span>
                                ({poll.totalResponses && parseInt(poll.totalResponses) > 0
                                  ? Math.round((1 - parseInt(poll.claimedRewards || '0') / parseInt(poll.totalResponses)) * 100)
                                  : 0}% remaining)
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/participant/poll?id=${poll.pollId}`}>View</Link>
                            </Button>
                            {statusActions.map((action, idx) => (
                              <Button
                                key={idx}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={() => handleStatusAction(poll.pollId, action.function, action.label)}
                                disabled={isWritePending || isConfirming || !isConnected}
                              >
                                {isWritePending || isConfirming ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  action.label
                                )}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
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
              <Link href="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Platform Settings
              </Link>
            </Button>
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
