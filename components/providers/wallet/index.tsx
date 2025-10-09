'use client'

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import React, { useState, useRef, useEffect } from 'react'
import { WagmiProvider, type Config } from 'wagmi'
import { supportedChains } from './chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Config for WC v3 - must be created outside component for SSR
const metadata = {
    name: 'PolyPulse',
    description: 'A decentralized platform for creating and participating in polls and surveys on Polygon',
    url: 'https://polypuls3.vercel.app',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

const wagmiConfig = defaultWagmiConfig({
    chains: supportedChains,
    projectId,
    metadata,
    ssr: true
})

interface WalletProviderProps {
    children: React.ReactNode
}

export default function WalletProvider({ children }: WalletProviderProps) {
    const [queryClient] = useState(() => new QueryClient())
    const modalInitialized = useRef(false)

    useEffect(() => {
        if (!modalInitialized.current && typeof window !== 'undefined') {
            createWeb3Modal({
                wagmiConfig,
                projectId,
                chains: supportedChains
            })
            modalInitialized.current = true
        }
    }, [])

    return (
        <WagmiProvider config={wagmiConfig as Config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
