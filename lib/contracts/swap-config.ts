// PulseSwap Contract Configuration

// Contract addresses (Polygon Amoy testnet)
export const PULSE_SWAP_ADDRESS = (
  process.env.NEXT_PUBLIC_PULSE_SWAP_ADDRESS ||
  "0x224FdD5342871f1d557649f33bA6dc37669B7dea"
) as `0x${string}`;

export const PULSE_TOKEN_ADDRESS = (
  process.env.NEXT_PUBLIC_PULSE_TOKEN_ADDRESS ||
  "0x25718cf963455f09081EA27C5DfAd6CE4CF4292C"
) as `0x${string}`;

export const USDC_ADDRESS = (
  process.env.NEXT_PUBLIC_USDC_ADDRESS ||
  "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
) as `0x${string}`;

// PulseSwap ABI (simplified for frontend use)
export const PULSE_SWAP_ABI = [
  // View functions
  {
    inputs: [],
    name: "usdcRate",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPulseBalance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getUsdcBalance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "pulseAmount", type: "uint256" }],
    name: "calculateUsdcOutput",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "usdcAmount", type: "uint256" }],
    name: "calculatePulseOutputFromUsdc",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // User swap functions
  {
    inputs: [{ name: "pulseAmount", type: "uint256" }],
    name: "swapPulseForUsdc",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "usdcAmount", type: "uint256" }],
    name: "swapUsdcForPulse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Admin functions
  {
    inputs: [{ name: "_rate", type: "uint256" }],
    name: "setUsdcRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "depositPulse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "depositUsdc",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "withdrawPulse",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "withdrawUsdc",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ERC20 ABI for token approvals and balances
export const ERC20_ABI = [
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Swap configuration
export const SWAP_CONFIG = {
  address: PULSE_SWAP_ADDRESS,
  abi: PULSE_SWAP_ABI,
} as const;

// Token configurations
export const TOKENS = {
  PULSE: {
    address: PULSE_TOKEN_ADDRESS,
    symbol: "PULSE",
    decimals: 18,
  },
  USDC: {
    address: USDC_ADDRESS,
    symbol: "USDC",
    decimals: 6,
  },
} as const;
