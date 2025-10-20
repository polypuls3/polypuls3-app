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
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useReadContract } from "wagmi"
import { readContract } from "@wagmi/core"
import { config } from "@/components/providers/wallet"
import { CONTRACT_CONFIG } from "@/lib/contracts/config"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useChainGuard } from "@/hooks/use-chain-guard"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PollDetailPageProps {
  searchParams: {
    id?: string
  }
}

export default function PollDetailPage({ searchParams }: PollDetailPageProps) {
  const pollId = searchParams.id
  const { poll, optionsWithVotes, userVote, hasVoted, loading, error } = usePollDetail(pollId || '')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const { isConnected, address } = useAccount()
  const { toast } = useToast()
  const router = useRouter()
  const chainGuard = useChainGuard()

  const { writeContract, data: hash, isPending: isWritePending, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, isError: isConfirmError, error: confirmError } = useWaitForTransactionReceipt({ hash })

  // Read poll status from contract for validation
  const { data: contractPollStatus, refetch: refetchPollStatus } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getPollStatus',
    args: pollId ? [BigInt(pollId)] : undefined,
    query: {
      enabled: !!pollId,
    }
  })

  // Map status number to name
  const getStatusName = (statusNum: number | undefined): string => {
    const statuses = ['ACTIVE', 'ENDED', 'CLAIMING_ENABLED', 'CLAIMING_DISABLED', 'CLOSED']
    return statusNum !== undefined ? statuses[statusNum] : 'UNKNOWN'
  }

  // Get user-friendly status message
  const getStatusMessage = (statusNum: number | undefined): string => {
    if (statusNum === undefined) return 'Unable to verify poll status'

    switch (statusNum) {
      case 0: return 'Poll is active and accepting votes'
      case 1: return 'Voting has ended for this poll. Creator needs to enable claiming or close the poll.'
      case 2: return 'This poll is in claiming phase. Voting is no longer available.'
      case 3: return 'This poll has claiming disabled. Voting is no longer available.'
      case 4: return 'This poll is closed. Voting is no longer available.'
      default: return 'Unknown poll status'
    }
  }

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
    if (!pollId) {
      toast({
        title: "Invalid poll ID",
        description: "No poll ID provided",
        variant: "destructive"
      })
      return
    }

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

    // Check if on correct chain
    if (chainGuard.isWrongChain) {
      toast({
        title: "Wrong Network",
        description: `Please switch to ${chainGuard.requiredChainName} to vote`,
        variant: "destructive"
      })

      try {
        await chainGuard.switchToRequiredChain()
        toast({
          title: "Network Switched",
          description: `Successfully switched to ${chainGuard.requiredChainName}`,
        })
      } catch (error) {
        console.error("Failed to switch chain:", error)
        return
      }
    }

    // ===== PRE-VOTE VALIDATION: Check poll status from contract =====
    try {
      console.log('=== Pre-Vote Validation ===')

      // Refetch latest status from contract
      const { data: currentStatus } = await refetchPollStatus()
      const statusNum = typeof currentStatus === 'number' ? currentStatus : Number(currentStatus)

      console.log('Poll Status (number):', statusNum)
      console.log('Poll Status (name):', getStatusName(statusNum))

      // Check if poll is ACTIVE (status = 0)
      if (statusNum !== 0) {
        const statusName = getStatusName(statusNum)
        const message = getStatusMessage(statusNum)

        console.error('Poll is not ACTIVE. Current status:', statusName)
        toast({
          title: `Cannot Vote: Poll is ${statusName}`,
          description: message,
          variant: "destructive"
        })
        return
      }

      // Real-time check: Has user already voted? (Read directly from contract)
      if (address) {
        console.log('Checking if user has already voted (real-time from contract)...')
        try {
          const respondents = await readContract(config, {
            ...CONTRACT_CONFIG,
            functionName: 'getPollRespondents',
            args: [BigInt(pollId)],
          }) as string[]

          const hasVotedOnContract = respondents.some(
            (respondent: string) => respondent.toLowerCase() === address.toLowerCase()
          )

          console.log('Respondents count:', respondents.length)
          console.log('User has voted (contract):', hasVotedOnContract)

          if (hasVotedOnContract) {
            console.error('User has already voted for this poll (confirmed by contract)')
            toast({
              title: "Already Voted",
              description: "You have already submitted a vote for this poll.",
              variant: "destructive"
            })
            return
          }
        } catch (respondentsError) {
          console.warn('Could not check respondents:', respondentsError)
          // Continue anyway - contract will reject if already voted
        }
      }

      // Check option index is valid
      if (poll && selectedOption >= poll.options.length) {
        console.error('Invalid option index:', selectedOption, 'Max:', poll.options.length - 1)
        toast({
          title: "Invalid Option",
          description: "The selected option is invalid. Please try again.",
          variant: "destructive"
        })
        return
      }

      console.log('✓ All pre-vote validations passed')
      console.log('=== Submitting Vote ===')
      console.log('Poll ID:', pollId)
      console.log('Option Index:', selectedOption)
      console.log('Options Count:', poll?.options.length)
      console.log('Voter Address:', address)
    } catch (validationError) {
      console.error('Pre-vote validation error:', validationError)
      toast({
        title: "Validation Error",
        description: "Unable to validate poll status. Please try again.",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('Contract Address:', CONTRACT_CONFIG.address)
      console.log('Poll ID:', pollId)
      console.log('Selected Option:', selectedOption)
      console.log('Function:', 'respondToPoll')
      console.log('Args:', [BigInt(pollId), BigInt(selectedOption)])

      writeContract({
        ...CONTRACT_CONFIG,
        functionName: 'respondToPoll',
        args: [BigInt(pollId), BigInt(selectedOption)]
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

          // Try to decode the actual revert reason
          let errorTitle = "Transaction failed"
          let errorMessage = "Failed to submit your vote. Please try again."

          const errorStr = error.message || String(error)

          // Check for specific contract revert reasons
          if (errorStr.includes("Already responded to this poll") || errorStr.includes("Already responded")) {
            errorTitle = "Already Voted"
            errorMessage = "You have already submitted a vote for this poll. Each address can only vote once."
          } else if (errorStr.includes("Poll is not active") || errorStr.includes("not active for voting")) {
            errorTitle = "Poll Not Active"
            errorMessage = "This poll is no longer accepting votes. It may have ended or been closed by the creator."
          } else if (errorStr.includes("Invalid option") || errorStr.includes("option index")) {
            errorTitle = "Invalid Option"
            errorMessage = "The selected option is invalid. Please refresh the page and try again."
          } else if (errorStr.includes("Poll does not exist")) {
            errorTitle = "Poll Not Found"
            errorMessage = "This poll does not exist or has been deleted."
          } else if (errorStr.includes("user rejected") || errorStr.includes("User denied")) {
            errorTitle = "Transaction Rejected"
            errorMessage = "You rejected the transaction in your wallet."
          } else {
            // Log full error for debugging
            console.error('Full error object:', error)
            console.error('Error name:', error.name)
            console.error('Error cause:', (error as any).cause)

            // Extract any revert reason if available
            if ((error as any).cause?.reason) {
              errorMessage = (error as any).cause.reason
            } else if ((error as any).shortMessage) {
              errorMessage = (error as any).shortMessage
            }
          }

          toast({
            title: errorTitle,
            description: errorMessage,
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

  // Handle missing poll ID
  if (!pollId) {
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
              <p className="font-semibold text-destructive">No poll ID provided</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please select a poll from the polls list.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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

      {/* Debug Panel - Development Mode Only */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mb-6 border-blue-600/50 bg-blue-600/10">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-blue-600">Debug Panel (Dev Mode Only)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <p className="text-muted-foreground mb-1">Contract Address:</p>
                <p className="break-all">{CONTRACT_CONFIG.address}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Poll ID:</p>
                <p>{pollId}</p>
              </div>
            </div>

            <div className="border-t border-blue-600/20 pt-3">
              <p className="text-xs font-semibold mb-2">Contract Status Check:</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Poll Status (Contract):</span>
                  <Badge variant={contractPollStatus === 0 ? "default" : "secondary"} className={contractPollStatus === 0 ? "bg-green-600" : "bg-orange-600"}>
                    {getStatusName(typeof contractPollStatus === 'number' ? contractPollStatus : Number(contractPollStatus))}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Number:</span>
                  <span className="font-mono">{contractPollStatus !== undefined ? String(contractPollStatus) : 'Loading...'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Options Count:</span>
                  <span className="font-mono">{poll?.options.length || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Has Voted:</span>
                  <span className={hasVoted ? "text-orange-600 font-semibold" : "text-green-600 font-semibold"}>
                    {hasVoted ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Wallet Connected:</span>
                  <span className={isConnected ? "text-green-600 font-semibold" : "text-orange-600 font-semibold"}>
                    {isConnected ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Correct Chain:</span>
                  <span className={!chainGuard.isWrongChain ? "text-green-600 font-semibold" : "text-orange-600 font-semibold"}>
                    {!chainGuard.isWrongChain ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-600/20 pt-3">
              <p className="text-xs font-semibold mb-2">Voting Requirements:</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-start gap-2">
                  <span className={contractPollStatus === 0 ? "text-green-600" : "text-red-600"}>
                    {contractPollStatus === 0 ? '✓' : '✗'}
                  </span>
                  <span className="text-muted-foreground">Poll must be ACTIVE (status = 0)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={!hasVoted ? "text-green-600" : "text-red-600"}>
                    {!hasVoted ? '✓' : '✗'}
                  </span>
                  <span className="text-muted-foreground">User must not have voted yet</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={isConnected ? "text-green-600" : "text-red-600"}>
                    {isConnected ? '✓' : '✗'}
                  </span>
                  <span className="text-muted-foreground">Wallet must be connected</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={!chainGuard.isWrongChain ? "text-green-600" : "text-red-600"}>
                    {!chainGuard.isWrongChain ? '✓' : '✗'}
                  </span>
                  <span className="text-muted-foreground">Must be on Polygon Amoy (Chain 80002)</span>
                </div>
              </div>
            </div>

            {contractPollStatus !== 0 && (
              <div className="border-t border-blue-600/20 pt-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Why you can't vote:</strong><br/>
                    {getStatusMessage(typeof contractPollStatus === 'number' ? contractPollStatus : Number(contractPollStatus))}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Wrong Network Alert */}
      {chainGuard.isWrongChain && !hasVoted && !expired && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You're connected to the wrong network. Please switch to {chainGuard.requiredChainName} (Chain ID: {chainGuard.requiredChainId})
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                try {
                  await chainGuard.switchToRequiredChain()
                  toast({
                    title: "Network Switched",
                    description: `Successfully switched to ${chainGuard.requiredChainName}`,
                  })
                } catch (error) {
                  toast({
                    title: "Switch Failed",
                    description: "Failed to switch network. Please switch manually in your wallet.",
                    variant: "destructive"
                  })
                }
              }}
              disabled={chainGuard.isSwitching}
            >
              {chainGuard.isSwitching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Switch Network"}
            </Button>
          </AlertDescription>
        </Alert>
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
