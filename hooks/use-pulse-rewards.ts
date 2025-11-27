"use client"

import { useState, useCallback, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import PulseRewardsABI from '@/lib/contracts/PulseRewardsABI.json'

// Configure this with your deployed contract address
const PULSE_REWARDS_ADDRESS = process.env.NEXT_PUBLIC_PULSE_REWARDS_ADDRESS as `0x${string}` | undefined

interface UserClaimInfo {
  totalClaimed: bigint
  lastClaimTimestamp: bigint
  pendingRewards: bigint
  canClaim: boolean
  cooldownRemaining: bigint
}

export function usePulseRewards() {
  const { address, isConnected } = useAccount()

  // Read contract state
  const { data: conversionRate } = useReadContract({
    address: PULSE_REWARDS_ADDRESS,
    abi: PulseRewardsABI.abi,
    functionName: 'conversionRate',
    query: {
      enabled: !!PULSE_REWARDS_ADDRESS,
    },
  })

  const { data: minClaimPoints } = useReadContract({
    address: PULSE_REWARDS_ADDRESS,
    abi: PulseRewardsABI.abi,
    functionName: 'minClaimPoints',
    query: {
      enabled: !!PULSE_REWARDS_ADDRESS,
    },
  })

  const { data: maxClaimAmount } = useReadContract({
    address: PULSE_REWARDS_ADDRESS,
    abi: PulseRewardsABI.abi,
    functionName: 'maxClaimAmount',
    query: {
      enabled: !!PULSE_REWARDS_ADDRESS,
    },
  })

  const { data: contractBalance } = useReadContract({
    address: PULSE_REWARDS_ADDRESS,
    abi: PulseRewardsABI.abi,
    functionName: 'getContractBalance',
    query: {
      enabled: !!PULSE_REWARDS_ADDRESS,
    },
  })

  // Read user claim info
  const { data: userClaimInfoRaw, refetch: refetchClaimInfo } = useReadContract({
    address: PULSE_REWARDS_ADDRESS,
    abi: PulseRewardsABI.abi,
    functionName: 'getUserClaimInfo',
    args: [address],
    query: {
      enabled: !!PULSE_REWARDS_ADDRESS && !!address,
    },
  })

  // Parse user claim info
  const userClaimInfo: UserClaimInfo | null = userClaimInfoRaw
    ? {
        totalClaimed: (userClaimInfoRaw as [bigint, bigint, bigint, boolean, bigint])[0],
        lastClaimTimestamp: (userClaimInfoRaw as [bigint, bigint, bigint, boolean, bigint])[1],
        pendingRewards: (userClaimInfoRaw as [bigint, bigint, bigint, boolean, bigint])[2],
        canClaim: (userClaimInfoRaw as [bigint, bigint, bigint, boolean, bigint])[3],
        cooldownRemaining: (userClaimInfoRaw as [bigint, bigint, bigint, boolean, bigint])[4],
      }
    : null

  // Calculate PULSE amount for points
  const calculatePulseAmount = useCallback((points: number): string => {
    if (!conversionRate) return '0'
    const amount = (BigInt(points) * parseEther('1')) / (conversionRate as bigint)
    return formatEther(amount)
  }, [conversionRate])

  return {
    isConfigured: !!PULSE_REWARDS_ADDRESS,
    contractAddress: PULSE_REWARDS_ADDRESS,
    conversionRate: conversionRate ? Number(formatEther(conversionRate as bigint)) : 100,
    minClaimPoints: minClaimPoints ? Number(minClaimPoints) : 100,
    maxClaimAmount: maxClaimAmount ? formatEther(maxClaimAmount as bigint) : '1000',
    contractBalance: contractBalance ? formatEther(contractBalance as bigint) : '0',
    userClaimInfo,
    calculatePulseAmount,
    refetchClaimInfo,
  }
}

export function useClaimRewards() {
  const { address } = useAccount()
  const { refetchClaimInfo } = usePulseRewards()

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  })

  const claimRewards = useCallback(
    async (points: number) => {
      if (!PULSE_REWARDS_ADDRESS || !address) {
        throw new Error('Contract not configured or wallet not connected')
      }

      // For now, use empty signature - backend verification can be added later
      const signature = '0x' as `0x${string}`

      writeContract({
        address: PULSE_REWARDS_ADDRESS,
        abi: PulseRewardsABI.abi,
        functionName: 'claimRewards',
        args: [BigInt(points), signature],
      })
    },
    [address, writeContract]
  )

  const claimAllocatedRewards = useCallback(async () => {
    if (!PULSE_REWARDS_ADDRESS || !address) {
      throw new Error('Contract not configured or wallet not connected')
    }

    writeContract({
      address: PULSE_REWARDS_ADDRESS,
      abi: PulseRewardsABI.abi,
      functionName: 'claimAllocatedRewards',
      args: [],
    })
  }, [address, writeContract])

  // Refetch claim info after successful transaction
  useEffect(() => {
    if (isSuccess) {
      refetchClaimInfo()
    }
  }, [isSuccess, refetchClaimInfo])

  return {
    claimRewards,
    claimAllocatedRewards,
    isPending: isWritePending || isConfirming,
    isSuccess,
    error: writeError || confirmError,
    txHash: hash,
  }
}

export function useRewardsHistory() {
  const { address } = useAccount()
  const [history, setHistory] = useState<Array<{
    type: 'claim' | 'push'
    amount: string
    timestamp: number
    txHash: string
  }>>([])

  // TODO: Implement event fetching for reward history
  // This would query RewardClaimed and RewardPushed events from the contract

  return { history }
}
