"use client";

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { CONTRACT_CONFIG } from "@/lib/contracts/config";
import { PULSE_TOKEN_ADDRESS, ERC20_ABI } from "@/lib/contracts/swap-config";
import { useTokenApproval, useUserBalances } from "./use-swap";

export type FundingToken = "POL" | "PULSE";

interface CreatePollParams {
  question: string;
  options: string[];
  durationInDays: bigint;
  category: string;
  projectId: bigint;
  votingType: string;
  visibility: string;
  rewardAmount: string;
  fundingToken: FundingToken;
}

// Hook for creating polls
export function useCreatePoll() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createPollWithPOL = (params: CreatePollParams) => {
    writeContract({
      ...CONTRACT_CONFIG,
      functionName: "createPoll",
      args: [
        params.question,
        params.options,
        params.durationInDays,
        params.category,
        params.projectId,
        params.votingType,
        params.visibility,
      ],
      value: parseEther(params.rewardAmount),
    });
  };

  const createPollWithPulse = (params: CreatePollParams) => {
    const pulseAmount = parseUnits(params.rewardAmount, 18);
    writeContract({
      ...CONTRACT_CONFIG,
      functionName: "createPollWithPulse",
      args: [
        params.question,
        params.options,
        params.durationInDays,
        params.category,
        params.projectId,
        params.votingType,
        params.visibility,
        pulseAmount,
      ],
    });
  };

  const createPoll = (params: CreatePollParams) => {
    if (params.fundingToken === "PULSE") {
      createPollWithPulse(params);
    } else {
      createPollWithPOL(params);
    }
  };

  return {
    createPoll,
    createPollWithPOL,
    createPollWithPulse,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

// Hook for PULSE approval specifically for poll creation
export function usePollPulseApproval(amount: string) {
  const { address } = useAccount();
  const pulseAmount = amount ? parseUnits(amount, 18) : BigInt(0);

  return useTokenApproval(
    PULSE_TOKEN_ADDRESS,
    address,
    CONTRACT_CONFIG.address, // Approve the main dapp contract
    pulseAmount
  );
}

// Re-export user balances for convenience
export { useUserBalances };
