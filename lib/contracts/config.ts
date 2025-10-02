import { polygonAmoy } from 'wagmi/chains';
import PolyPuls3ABI from './PolyPuls3ABI.json';

export const POLYPULS3_CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_POLYPULS3_CONTRACT_ADDRESS || '0xfc0323F3c5eD271564Ca8F3d4C5FfAD32D553893') as `0x${string}`;

export const POLYPULS3_CHAIN_ID = polygonAmoy.id;

export const POLYPULS3_ABI = PolyPuls3ABI as const;

export const CONTRACT_CONFIG = {
  address: POLYPULS3_CONTRACT_ADDRESS,
  abi: POLYPULS3_ABI,
  chainId: POLYPULS3_CHAIN_ID,
} as const;
