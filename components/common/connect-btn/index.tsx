'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Button } from '@/components/ui/button'
import { Wallet, ChevronDown } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ConnectButton() {
    const { address, isConnected, chain } = useAccount()
    const { disconnect } = useDisconnect()
    const { open } = useWeb3Modal()

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
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
                    <span className="hidden sm:inline">{formatAddress(address)}</span>
                    <span className="sm:hidden">{formatAddress(address).slice(0, 8)}</span>
                    {chain && (
                        <span className="hidden md:inline text-muted-foreground">
                            ({chain.name})
                        </span>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">Connected Account</p>
                    <p className="text-xs text-muted-foreground font-mono">{address}</p>
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
