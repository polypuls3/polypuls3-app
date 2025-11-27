"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import {
  SWAP_CONFIG,
  PULSE_SWAP_ADDRESS,
  PULSE_TOKEN_ADDRESS,
  USDC_ADDRESS,
  ERC20_ABI,
  TOKENS,
} from "@/lib/contracts/swap-config";

// Hook to get swap rates
export function useSwapRates() {
  const { data: usdcRate, isLoading: usdcRateLoading, refetch: refetchUsdcRate } = useReadContract({
    ...SWAP_CONFIG,
    functionName: "usdcRate",
  });

  const { data: swapFeeBps, isLoading: feeLoading, refetch: refetchFee } = useReadContract({
    ...SWAP_CONFIG,
    functionName: "swapFeeBps",
  });

  const { data: isPaused } = useReadContract({
    ...SWAP_CONFIG,
    functionName: "paused",
  });

  // Format rates for display
  const usdcRateFormatted = usdcRate ? Number(usdcRate) / 1e6 : 0; // USDC per PULSE
  const swapFeePercent = swapFeeBps ? Number(swapFeeBps) / 100 : 0; // Convert basis points to percent

  return {
    usdcRate: usdcRate as bigint | undefined,
    usdcRateFormatted,
    swapFeeBps: swapFeeBps as bigint | undefined,
    swapFeePercent,
    isPaused: isPaused as boolean | undefined,
    isLoading: usdcRateLoading || feeLoading,
    refetch: () => {
      refetchUsdcRate();
      refetchFee();
    },
  };
}

// Hook to get contract liquidity balances
export function useSwapLiquidity() {
  const { data: pulseBalance, refetch: refetchPulse } = useReadContract({
    ...SWAP_CONFIG,
    functionName: "getPulseBalance",
  });

  const { data: usdcBalance, refetch: refetchUsdc } = useReadContract({
    ...SWAP_CONFIG,
    functionName: "getUsdcBalance",
  });

  return {
    pulseBalance: pulseBalance as bigint | undefined,
    usdcBalance: usdcBalance as bigint | undefined,
    pulseBalanceFormatted: pulseBalance ? formatUnits(pulseBalance as bigint, 18) : "0",
    usdcBalanceFormatted: usdcBalance ? formatUnits(usdcBalance as bigint, 6) : "0",
    refetch: () => {
      refetchPulse();
      refetchUsdc();
    },
  };
}

// Hook to get user's token balances
export function useUserBalances(address: `0x${string}` | undefined) {
  const { data: pulseBalance, refetch: refetchPulse } = useReadContract({
    address: PULSE_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: usdcBalance, refetch: refetchUsdc } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    pulseBalance: pulseBalance as bigint | undefined,
    usdcBalance: usdcBalance as bigint | undefined,
    pulseBalanceFormatted: pulseBalance ? formatUnits(pulseBalance as bigint, 18) : "0",
    usdcBalanceFormatted: usdcBalance ? formatUnits(usdcBalance as bigint, 6) : "0",
    refetch: () => {
      refetchPulse();
      refetchUsdc();
    },
  };
}

// Hook to check and handle token approvals
export function useTokenApproval(
  tokenAddress: `0x${string}`,
  ownerAddress: `0x${string}` | undefined,
  spenderAddress: `0x${string}`,
  amount: bigint
) {
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: ownerAddress ? [ownerAddress, spenderAddress] : undefined,
    query: { enabled: !!ownerAddress },
  });

  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract();

  const { isLoading: isWaitingForApproval, isSuccess: isApproved } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const needsApproval = allowance !== undefined && (allowance as bigint) < amount;

  const handleApprove = () => {
    approve({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [spenderAddress, amount],
    });
  };

  return {
    allowance: allowance as bigint | undefined,
    needsApproval,
    handleApprove,
    isApproving: isApproving || isWaitingForApproval,
    isApproved,
    refetchAllowance,
  };
}

// Hook for swapping PULSE to USDC
export function useSwapPulseForUsdc() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const swap = (pulseAmount: bigint) => {
    writeContract({
      ...SWAP_CONFIG,
      functionName: "swapPulseForUsdc",
      args: [pulseAmount],
    });
  };

  return {
    swap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Hook for swapping USDC to PULSE
export function useSwapUsdcForPulse() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const swap = (usdcAmount: bigint) => {
    writeContract({
      ...SWAP_CONFIG,
      functionName: "swapUsdcForPulse",
      args: [usdcAmount],
    });
  };

  return {
    swap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// Calculate output amounts (includes fee deduction)
export function useCalculateOutput() {
  const { usdcRate, swapFeeBps } = useSwapRates();

  const calculateUsdcFromPulse = (pulseAmount: string): string => {
    if (!pulseAmount || !usdcRate) return "0";
    try {
      const pulseWei = parseUnits(pulseAmount, 18);
      const grossUsdcWei = (pulseWei * usdcRate) / BigInt(1e18);
      // Apply fee
      const fee = swapFeeBps ? (grossUsdcWei * swapFeeBps) / BigInt(10000) : BigInt(0);
      const netUsdcWei = grossUsdcWei - fee;
      return formatUnits(netUsdcWei, 6);
    } catch {
      return "0";
    }
  };

  const calculatePulseFromUsdc = (usdcAmount: string): string => {
    if (!usdcAmount || !usdcRate || usdcRate === BigInt(0)) return "0";
    try {
      const usdcWei = parseUnits(usdcAmount, 6);
      const grossPulseWei = (usdcWei * BigInt(1e18)) / usdcRate;
      // Apply fee
      const fee = swapFeeBps ? (grossPulseWei * swapFeeBps) / BigInt(10000) : BigInt(0);
      const netPulseWei = grossPulseWei - fee;
      return formatUnits(netPulseWei, 18);
    } catch {
      return "0";
    }
  };

  // Calculate fee amount for display
  const calculateFeeAmount = (grossAmount: string, decimals: number): string => {
    if (!grossAmount || !swapFeeBps) return "0";
    try {
      const amount = parseUnits(grossAmount, decimals);
      const fee = (amount * swapFeeBps) / BigInt(10000);
      return formatUnits(fee, decimals);
    } catch {
      return "0";
    }
  };

  return {
    calculateUsdcFromPulse,
    calculatePulseFromUsdc,
    calculateFeeAmount,
  };
}

// Combined swap hook for easier use
export function useSwap() {
  const rates = useSwapRates();
  const liquidity = useSwapLiquidity();
  const calculate = useCalculateOutput();

  return {
    ...rates,
    ...liquidity,
    ...calculate,
    TOKENS,
    PULSE_SWAP_ADDRESS,
    PULSE_TOKEN_ADDRESS,
    USDC_ADDRESS,
  };
}
