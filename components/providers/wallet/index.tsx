'use client'

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import React, { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { supportedChains } from './chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Config for WC v3
const metadata = {
    name: 'PolyPulse',
    description: 'A decentralized platform for creating and participating in polls and surveys on Polygon',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://127.0.0.1',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

const wagmiConfig = defaultWagmiConfig({
    chains: supportedChains,
    projectId,
    metadata
})

// Only initialize Web3Modal once using a module-level flag
let web3ModalInitialized = false

if (typeof window !== 'undefined' && !web3ModalInitialized) {
    createWeb3Modal({
        wagmiConfig,
        projectId,
        chains: supportedChains
    })
    web3ModalInitialized = true
}

interface WalletProviderProps {
    children: React.ReactNode
}

export default function WalletProvider({ children }: WalletProviderProps) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
