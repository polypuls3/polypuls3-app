import { mainnet, goerli, polygon, polygonMumbai, polygonAmoy, polygonZkEvm, polygonZkEvmTestnet } from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';

const hardhat: Chain = {
    id: 31337,
    name: 'Hardhat',
    network: 'localhost',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        public: { http: ['http://127.0.0.1:8545'] },
        default: { http: ['http://127.0.0.1:8545'] },
    },
    /*blockExplorers: {
        etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
        default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    },*/
}

// Only include hardhat chain in development environment
const productionChains: readonly [Chain, ...Chain[]] = [
    polygonAmoy,
    polygon,
    mainnet,
    goerli,
    polygonMumbai,
    polygonZkEvm,
    polygonZkEvmTestnet
]

const developmentChains: readonly [Chain, ...Chain[]] = [
    hardhat,
    ...productionChains
]

export const supportedChains: readonly [Chain, ...Chain[]] =
    process.env.NODE_ENV === 'development'
        ? developmentChains
        : productionChains
