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

export const supportedChains: readonly [Chain, ...Chain[]] = [
    hardhat,
    mainnet,
    goerli,
    polygon,
    polygonMumbai,
    polygonAmoy,
    polygonZkEvm,
    polygonZkEvmTestnet
]
