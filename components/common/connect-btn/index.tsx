'use client'

import { useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Button } from '@/components/ui/button'
import { Wallet, ChevronDown, Copy, Check } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import dynamic from 'next/dynamic'

function ConnectButtonComponent() {
    const { address, isConnected, chain } = useAccount()
    const { disconnect } = useDisconnect()
    const { open } = useWeb3Modal()
    const [copied, setCopied] = useState(false)

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    const copyToClipboard = async () => {
        if (!address) return
        try {
            await navigator.clipboard.writeText(address)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy address:', err)
        }
    }

    if (!isConnected || !address) {
        return (
            <Button onClick={() => open()} variant="default" className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Wallet className="h-4 w-4" />
                    <span>{formatAddress(address)}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <div className="flex flex-col space-y-2 p-2">
                    <p className="text-sm font-medium">Connected Account</p>
                    <div
                        className="flex items-center gap-2 p-2 rounded-md bg-muted cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={copyToClipboard}
                    >
                        <p className="text-xs text-muted-foreground font-mono flex-1 truncate">
                            {formatAddress(address)}
                        </p>
                        {copied ? (
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                            <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                    </div>
                    {copied && (
                        <p className="text-xs text-green-500">Copied to clipboard!</p>
                    )}
                    {chain && (
                        <p className="text-xs text-muted-foreground">
                            Network: {chain.name}
                        </p>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => open()}>
                    Change Wallet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => open({ view: 'Networks' })}>
                    Switch Network
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => disconnect()}
                    className="text-destructive focus:text-destructive"
                >
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Export with dynamic import to prevent SSR
const ConnectButton = dynamic(() => Promise.resolve(ConnectButtonComponent), {
    ssr: false,
    loading: () => (
        <Button variant="default" className="gap-2" disabled>
            <Wallet className="h-4 w-4" />
            Connect Wallet
        </Button>
    )
})

export default ConnectButton
