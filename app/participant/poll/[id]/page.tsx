'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Users, Clock, CheckCircle2, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { usePollDetail } from "@/hooks/use-poll-detail"
import { useState, useEffect } from "react"
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi"
import { CONTRACT_CONFIG } from "@/lib/contracts/config"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface PollDetailPageProps {
  params: {
    id: string
  }
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const { poll, optionsWithVotes, userVote, hasVoted, loading, error } = usePollDetail(params.id)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const { isConnected } = useAccount()
  const { toast } = useToast()
  const router = useRouter()

  const { writeContract, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError, error: confirmError } = useWaitForTransactionReceipt({ hash })

  // Helper functions
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isPollExpired = (expiresAt: string) => {
    const now = Math.floor(Date.now() / 1000)
    return parseInt(expiresAt) < now
  }

  const handleVote = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive"
      })
      return
    }

    if (selectedOption === null) {
      toast({
        title: "No option selected",
        description: "Please select an option to vote",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('=== Submitting Vote ===')
      console.log('Contract Address:', CONTRACT_CONFIG.address)
      console.log('Poll ID:', params.id)
      console.log('Selected Option:', selectedOption)
      console.log('Function:', 'respondToPoll')
      console.log('Args:', [BigInt(params.id), BigInt(selectedOption)])

      writeContract({
        ...CONTRACT_CONFIG,
        functionName: 'respondToPoll',
        args: [BigInt(params.id), BigInt(selectedOption)]
      }, {
        onSuccess: () => {
          console.log('Transaction submitted successfully')
          toast({
            title: "Transaction submitted",
            description: "Your vote is being processed...",
          })
        },
        onError: (error) => {
          console.error('Transaction submission error:', error)
          toast({
            title: "Transaction failed",
            description: error.message || "Failed to submit your vote. Please try again.",
            variant: "destructive"
          })
        }
      })
    } catch (err) {
      console.error('Unexpected error submitting vote:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }

  // Handle successful vote
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Vote submitted successfully!",
        description: "Your vote has been recorded on the blockchain. Redirecting...",
      })

      // Reset the transaction state
      reset()

      // Redirect to participant page after short delay
      setTimeout(() => {
        router.push('/participant')
      }, 1500)
    }
  }, [isSuccess, toast, reset, router])

  // Handle transaction confirmation error
  useEffect(() => {
    if (isConfirmError && confirmError) {
      console.error('Transaction confirmation error:', confirmError)
      toast({
        title: "Transaction failed",
        description: confirmError.message || "Your vote transaction failed. Please try again.",
        variant: "destructive"
      })
      reset()
    }
  }, [isConfirmError, confirmError, toast, reset])

  // Handle write contract error
  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError)
      toast({
        title: "Transaction rejected",
        description: writeError.message || "Transaction was rejected. Please try again.",
        variant: "destructive"
      })
    }
  }, [writeError, toast])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="container py-8">
        <Button variant="ghost" className="mb-6 gap-2" asChild>
          <Link href="/participant">
            <ArrowLeft className="h-4 w-4" />
            Back to Polls
          </Link>
        </Button>
        <Card className="border-destructive">
          <CardContent className="pt-6 flex items-center gap-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">
                {error ? `Error: ${error.message}` : 'Poll not found'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This poll may not exist or there was an error loading it.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const expired = isPollExpired(poll.expiresAt)
  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6 gap-2" asChild>
        <Link href="/participant">
          <ArrowLeft className="h-4 w-4" />
          Back to Polls
        </Link>
      </Button>

      {/* Development Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mb-6 border-blue-600/50 bg-blue-600/10">
          <CardContent className="pt-6">
            <p className="text-xs font-mono text-muted-foreground">
              <strong>Contract:</strong> {CONTRACT_CONFIG.address}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Poll Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4 mb-4">
                <Badge variant="secondary">{poll.category || 'Uncategorized'}</Badge>
                <Badge className={expired ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"}>
                  {expired ? 'Expired' : 'Active'}
                </Badge>
              </div>
              <CardTitle className="text-3xl mb-2">{poll.question}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {poll.votingType} • {poll.options.length} options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{parseInt(poll.totalResponses || '0').toLocaleString()} votes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{expired ? 'Ended' : 'Ends'} {formatDate(poll.expiresAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Created by {formatAddress(poll.creator)}</span>
                  </div>
                </div>

                {hasVoted ? (
                  <div className="border border-green-600/50 bg-green-600/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">You have already voted</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You voted for: <span className="font-medium">{poll.options[parseInt(userVote?.optionIndex || '0')]}</span>
                    </p>
                  </div>
                ) : expired ? (
                  <div className="border border-gray-600/50 bg-gray-600/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">This poll has ended</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Voting is no longer available for this poll.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="border-t border-border pt-6">
                      <h3 className="text-lg font-semibold mb-4">Cast Your Vote</h3>
                      <RadioGroup value={selectedOption?.toString()} onValueChange={(val) => setSelectedOption(parseInt(val))} className="space-y-3">
                        {poll.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 rounded-lg border border-border p-4 transition-all hover:border-purple-600/50 hover:bg-muted/50"
                          >
                            <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor={`option-${index}`} className="cursor-pointer">
                                <div className="font-medium">{option}</div>
                              </Label>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleVote}
                      disabled={!isConnected || isWritePending || isConfirming || selectedOption === null}
                    >
                      {isWritePending || isConfirming ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isWritePending ? 'Submitting...' : 'Confirming...'}
                        </>
                      ) : (
                        'Submit Vote'
                      )}
                    </Button>
                    {!isConnected && (
                      <p className="text-sm text-muted-foreground text-center">
                        Connect your wallet to vote
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionsWithVotes.map((option) => (
                <div key={option.index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate">{option.text}</span>
                    <span className="text-muted-foreground">{option.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={option.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground">{option.votes.toLocaleString()} votes</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Poll Info */}
          <Card>
            <CardHeader>
              <CardTitle>Poll Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Creator</div>
                <div className="font-mono text-xs break-all">{poll.creator}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Created</div>
                <div>{formatDateTime(poll.createdAt)}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">{expired ? 'Ended' : 'Ends'}</div>
                <div>{formatDateTime(poll.expiresAt)}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Total Votes</div>
                <div className="font-semibold">{parseInt(poll.totalResponses || '0').toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Poll ID</div>
                <div className="font-mono">#{poll.pollId}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Voting Type</div>
                <div>{poll.votingType}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Blockchain</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-600" />
                  Polygon Amoy
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
