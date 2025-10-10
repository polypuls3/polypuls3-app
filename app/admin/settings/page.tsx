'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Settings, DollarSign, Wallet } from 'lucide-react'
import Link from 'next/link'
import { parseEther, formatEther } from 'viem'

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
    {
      inputs: [{ name: '_newFeePercentage', type: 'uint256' }],
      name: 'updatePlatformFee',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ name: '_newTreasuryAddress', type: 'address' }],
      name: 'updateTreasuryAddress',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
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

export default function AdminSettingsPage() {
  const { address } = useAccount()
  const { toast } = useToast()

  // State for form inputs
  const [newFeePercentage, setNewFeePercentage] = useState('')
  const [newTreasuryAddress, setNewTreasuryAddress] = useState('')

  // Read current settings
  const { data: currentFee, refetch: refetchFee } = useReadContract({
    ...POLL_CONTRACT,
    functionName: 'platformFeePercentage',
  })

  const { data: currentTreasury, refetch: refetchTreasury } = useReadContract({
    ...POLL_CONTRACT,
    functionName: 'treasuryAddress',
  })

  const { data: contractOwner } = useReadContract({
    ...POLL_CONTRACT,
    functionName: 'owner',
  })

  const { data: treasuryBalance } = useReadContract({
    ...TREASURY_CONTRACT,
    functionName: 'getBalance',
  })

  const { data: totalFeesCollected } = useReadContract({
    ...TREASURY_CONTRACT,
    functionName: 'totalFeesCollected',
  })

  // Write contracts
  const { writeContract: updateFee, data: feeHash, isPending: isFeeUpdating, reset: resetFee } = useWriteContract()
  const { writeContract: updateTreasury, data: treasuryHash, isPending: isTreasuryUpdating, reset: resetTreasury } = useWriteContract()

  // Wait for transactions
  const { isLoading: isFeeConfirming, isSuccess: isFeeSuccess } = useWaitForTransactionReceipt({ hash: feeHash })
  const { isLoading: isTreasuryConfirming, isSuccess: isTreasurySuccess } = useWaitForTransactionReceipt({ hash: treasuryHash })

  // Check if user is owner
  const isOwner = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase()

  // Handle fee update success
  useEffect(() => {
    if (isFeeSuccess) {
      toast({
        title: 'Platform fee updated!',
        description: `New fee: ${newFeePercentage / 100}%`,
      })
      setNewFeePercentage('')
      refetchFee()
      resetFee()
    }
  }, [isFeeSuccess, toast, newFeePercentage, refetchFee, resetFee])

  // Handle treasury update success
  useEffect(() => {
    if (isTreasurySuccess) {
      toast({
        title: 'Treasury address updated!',
        description: 'New treasury address has been set.',
      })
      setNewTreasuryAddress('')
      refetchTreasury()
      resetTreasury()
    }
  }, [isTreasurySuccess, toast, refetchTreasury, resetTreasury])

  const handleUpdateFee = () => {
    const feeValue = parseInt(newFeePercentage)

    // Validation
    if (isNaN(feeValue) || feeValue < 0 || feeValue > 5000) {
      toast({
        title: 'Invalid fee percentage',
        description: 'Fee must be between 0 and 5000 basis points (0-50%)',
        variant: 'destructive',
      })
      return
    }

    writeContract({
      ...POLL_CONTRACT,
      functionName: 'updatePlatformFee',
      args: [BigInt(feeValue)],
    })
  }

  const handleUpdateTreasury = () => {
    // Validation
    if (!newTreasuryAddress || !/^0x[a-fA-F0-9]{40}$/.test(newTreasuryAddress)) {
      toast({
        title: 'Invalid address',
        description: 'Please enter a valid Ethereum address',
        variant: 'destructive',
      })
      return
    }

    writeContract({
      ...POLL_CONTRACT,
      functionName: 'updateTreasuryAddress',
      args: [newTreasuryAddress as `0x${string}`],
    })
  }

  if (!address) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>Please connect your wallet to access admin settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only the contract owner can access these settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your address: {address}
            </p>
            <p className="text-sm text-muted-foreground">
              Contract owner: {contractOwner as string}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground">Configure platform fee and treasury settings</p>
        </div>
      </div>

      {/* Treasury Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Treasury Balance</CardTitle>
            <CardDescription>Available funds in treasury</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {treasuryBalance ? formatEther(treasuryBalance) : '0.0000'} POL
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Fees Collected</CardTitle>
            <CardDescription>Lifetime platform fees</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalFeesCollected ? formatEther(totalFeesCollected) : '0.0000'} POL
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Fee Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Platform Fee Configuration
          </CardTitle>
          <CardDescription>
            Configure the percentage of poll funding that goes to the platform as administration fee
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Fee Display */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Current Platform Fee</p>
                <p className="text-xs text-muted-foreground">
                  Applies to all new polls created after update
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {currentFee ? Number(currentFee) / 100 : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentFee ? currentFee.toString() : '0'} basis points
                </p>
              </div>
            </div>
          </div>

          {/* Update Fee Form */}
          <div className="space-y-2">
            <Label htmlFor="newFee">New Platform Fee (in basis points)</Label>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Input
                  id="newFee"
                  type="number"
                  placeholder="e.g., 1000 for 10%"
                  value={newFeePercentage}
                  onChange={(e) => setNewFeePercentage(e.target.value)}
                  min="0"
                  max="5000"
                  disabled={isFeeUpdating || isFeeConfirming}
                />
                <p className="text-xs text-muted-foreground">
                  {newFeePercentage && !isNaN(parseInt(newFeePercentage))
                    ? `${parseInt(newFeePercentage) / 100}% (max 50%)`
                    : 'Enter value between 0-5000 basis points'}
                </p>
              </div>
              <Button
                onClick={handleUpdateFee}
                disabled={!newFeePercentage || isFeeUpdating || isFeeConfirming}
              >
                {isFeeUpdating || isFeeConfirming ? 'Updating...' : 'Update Fee'}
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm">
              <strong>Example:</strong> If platform fee is set to 1000 (10%) and a user creates a poll with 10 POL:
            </p>
            <ul className="text-sm mt-2 ml-4 list-disc">
              <li>9 POL goes to reward pool (90%)</li>
              <li>1 POL held as platform fee (10%)</li>
              <li>Platform fee transferred to treasury when poll is closed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Treasury Address Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Treasury Contract Address
          </CardTitle>
          <CardDescription>
            The address where platform fees are sent when polls are closed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Treasury Display */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Current Treasury Address</p>
            <p className="text-xs font-mono break-all">
              {currentTreasury as string || '0x0000000000000000000000000000000000000000'}
            </p>
          </div>

          {/* Update Treasury Form */}
          <div className="space-y-2">
            <Label htmlFor="newTreasury">New Treasury Address</Label>
            <div className="flex gap-2">
              <Input
                id="newTreasury"
                type="text"
                placeholder="0x..."
                value={newTreasuryAddress}
                onChange={(e) => setNewTreasuryAddress(e.target.value)}
                className="font-mono"
                disabled={isTreasuryUpdating || isTreasuryConfirming}
              />
              <Button
                onClick={handleUpdateTreasury}
                disabled={!newTreasuryAddress || isTreasuryUpdating || isTreasuryConfirming}
              >
                {isTreasuryUpdating || isTreasuryConfirming ? 'Updating...' : 'Update Address'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Make sure this is a valid treasury contract address
            </p>
          </div>

          {/* Warning Box */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              ⚠️ Important
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
              Only update the treasury address to a contract you control. Once updated, all future platform fees from closed polls will be sent to this address.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contract Addresses Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contract Addresses</CardTitle>
          <CardDescription>Deployed contract addresses for reference</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Poll Contract</p>
              <p className="font-mono text-xs break-all text-muted-foreground">
                {POLL_CONTRACT.address}
              </p>
            </div>
            <div>
              <p className="font-medium">Treasury Contract</p>
              <p className="font-mono text-xs break-all text-muted-foreground">
                {TREASURY_CONTRACT.address}
              </p>
            </div>
            <div>
              <p className="font-medium">Contract Owner</p>
              <p className="font-mono text-xs break-all text-muted-foreground">
                {contractOwner as string}
              </p>
            </div>
            <div>
              <p className="font-medium">Your Address</p>
              <p className="font-mono text-xs break-all text-muted-foreground">
                {address}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
