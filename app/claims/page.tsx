'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Gift, CheckCircle2, AlertCircle } from "lucide-react"
import { useClaimsData } from "@/hooks/use-claims-data"
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"
import { CONTRACT_CONFIG } from "@/lib/contracts/config"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { formatEther } from "viem"
import Link from "next/link"

export default function ClaimsPage() {
  const { claimableResponses, loading, error, refetch } = useClaimsData()
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const [claimingPollId, setClaimingPollId] = useState<string | null>(null)

  const { writeContract, data: hash, isPending: isWritePending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Handle successful claim
  useEffect(() => {
    if (isSuccess && claimingPollId) {
      toast({
        title: "Reward claimed successfully!",
        description: "Your reward has been transferred to your wallet. Refreshing...",
      })
      reset()
      setClaimingPollId(null)

      // Wait for subgraph to index the claim (3-4 seconds)
      setTimeout(() => {
        refetch()
      }, 4000)
    }
  }, [isSuccess, toast, reset, refetch, claimingPollId])

  const handleClaim = (pollId: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive"
      })
      return
    }

    try {
      setClaimingPollId(pollId)

      writeContract({
        ...CONTRACT_CONFIG,
        functionName: 'claimPollReward',
        args: [BigInt(pollId)]
      }, {
        onSuccess: (hash) => {
          toast({
            title: "Claim transaction submitted",
            description: `Processing... Hash: ${hash.slice(0, 10)}...`,
          })
        },
        onError: (error) => {
          console.error('Claim error:', error)
          setClaimingPollId(null)
          toast({
            title: "Claim failed",
            description: error.message || "Failed to claim reward",
            variant: "destructive"
          })
        }
      })
    } catch (err) {
      console.error('Error claiming reward:', err)
      setClaimingPollId(null)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to claim reward",
        variant: "destructive"
      })
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (!isConnected) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Claim Rewards</h1>
          <p className="text-muted-foreground text-lg">View and claim your poll participation rewards</p>
        </div>

        <Card className="border-orange-500/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <p className="text-lg font-medium mb-2">Wallet Not Connected</p>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to view and claim your rewards
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Claim Rewards</h1>
          <p className="text-muted-foreground text-lg">View and claim your poll participation rewards</p>
        </div>

        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive">Error loading claims: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Claim Rewards</h1>
        <p className="text-muted-foreground text-lg">View and claim your poll participation rewards</p>
      </div>

      {/* Summary Card */}
      <Card className="mb-8">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600/10">
            <Gift className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <p className="text-2xl font-bold">{claimableResponses.length}</p>
                <p className="text-sm text-muted-foreground">
                  {claimableResponses.length === 1 ? 'Reward Available' : 'Rewards Available'}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Claimable Rewards List */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : claimableResponses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No Rewards Available</p>
              <p className="text-muted-foreground mb-4">
                You don't have any claimable rewards at the moment
              </p>
              <Button variant="outline" asChild>
                <Link href="/participant">Browse Active Polls</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {claimableResponses.map((response) => {
            const poll = response.poll!
            const isClaimingThis = claimingPollId === poll.pollId && (isWritePending || isConfirming)

            return (
              <Card key={response.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{poll.question}</CardTitle>
                      <CardDescription>
                        Voted on {formatDate(response.timestamp)}
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700">
                      Claiming Enabled
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {/* Poll Details */}
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Response:</span>
                        <Badge variant="outline">
                          {poll.options[parseInt(response.optionIndex)]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{poll.category || 'Uncategorized'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Responses:</span>
                        <span className="font-medium">{parseInt(poll.totalResponses).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Reward Amount */}
                    <div className="flex items-center justify-between p-4 bg-purple-600/10 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Reward Amount</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">
                          {formatEther(response.rewardAmount)} POL
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        className="flex-1"
                        size="lg"
                        onClick={() => handleClaim(poll.pollId)}
                        disabled={isClaimingThis || (isWritePending && claimingPollId !== poll.pollId)}
                      >
                        {isClaimingThis ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isConfirming ? 'Confirming...' : 'Claiming...'}
                          </>
                        ) : (
                          <>
                            <Gift className="mr-2 h-4 w-4" />
                            Claim Reward
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <Link href={`/participant/poll/${poll.pollId}`}>View Poll</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
