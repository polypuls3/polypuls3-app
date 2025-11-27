"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ArrowDownUp, Loader2, AlertCircle, CheckCircle2, Wallet, Info, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  useSwap,
  useUserBalances,
  useTokenApproval,
  useSwapPulseForUsdc,
  useSwapUsdcForPulse,
} from "@/hooks/use-swap";
import { PULSE_SWAP_ADDRESS, PULSE_TOKEN_ADDRESS, USDC_ADDRESS } from "@/lib/contracts/swap-config";

type SwapDirection = "sell" | "buy";

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();

  const [direction, setDirection] = useState<SwapDirection>("sell");
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");

  const {
    usdcRateFormatted,
    swapFeePercent,
    isPaused,
    isLoading: ratesLoading,
    calculateUsdcFromPulse,
    calculatePulseFromUsdc,
    pulseBalanceFormatted: liquidityPulse,
    usdcBalanceFormatted: liquidityUsdc,
    refetch: refetchLiquidity,
  } = useSwap();

  const userBalances = useUserBalances(address);

  // Determine which token needs approval based on direction
  const tokenToApprove = direction === "sell" ? PULSE_TOKEN_ADDRESS : USDC_ADDRESS;
  const approvalDecimals = direction === "sell" ? 18 : 6;

  const approvalAmount = inputAmount
    ? parseUnits(inputAmount, approvalDecimals)
    : BigInt(0);

  const approval = useTokenApproval(
    tokenToApprove,
    address,
    PULSE_SWAP_ADDRESS,
    approvalAmount
  );

  // Swap hooks
  const swapPulseForUsdc = useSwapPulseForUsdc();
  const swapUsdcForPulse = useSwapUsdcForPulse();

  const currentSwap = direction === "sell" ? swapPulseForUsdc : swapUsdcForPulse;
  const isSwapping = currentSwap.isPending || currentSwap.isConfirming;

  // Calculate output when input changes
  useEffect(() => {
    if (!inputAmount || isNaN(Number(inputAmount)) || Number(inputAmount) <= 0) {
      setOutputAmount("");
      return;
    }

    if (direction === "sell") {
      setOutputAmount(calculateUsdcFromPulse(inputAmount));
    } else {
      setOutputAmount(calculatePulseFromUsdc(inputAmount));
    }
  }, [inputAmount, direction, calculateUsdcFromPulse, calculatePulseFromUsdc]);

  // Handle swap direction toggle
  const toggleDirection = () => {
    setDirection(prev => prev === "sell" ? "buy" : "sell");
    setInputAmount("");
    setOutputAmount("");
  };

  // Handle swap execution
  const handleSwap = () => {
    if (!inputAmount) return;

    try {
      const decimals = direction === "sell" ? 18 : 6;
      const amount = parseUnits(inputAmount, decimals);
      currentSwap.swap(amount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid amount",
        variant: "destructive",
      });
    }
  };

  // Show success toast on swap completion
  useEffect(() => {
    if (currentSwap.isSuccess) {
      toast({
        title: "Swap Successful!",
        description: `Successfully swapped ${inputAmount} ${direction === "sell" ? "PULSE" : "USDC"} for ${outputAmount} ${direction === "sell" ? "USDC" : "PULSE"}`,
      });
      setInputAmount("");
      setOutputAmount("");
      userBalances.refetch();
      refetchLiquidity();
    }
  }, [currentSwap.isSuccess]);

  // Refetch allowance after approval
  useEffect(() => {
    if (approval.isApproved) {
      approval.refetchAllowance();
    }
  }, [approval.isApproved]);

  // Get user's relevant balance
  const getUserInputBalance = () => {
    if (direction === "sell") {
      return userBalances.pulseBalanceFormatted;
    }
    return userBalances.usdcBalanceFormatted;
  };

  // Check if there's enough liquidity
  const hasEnoughLiquidity = () => {
    if (!outputAmount) return true;
    const needed = parseFloat(outputAmount);
    if (direction === "sell") {
      // Selling PULSE for USDC, need USDC liquidity
      return parseFloat(liquidityUsdc) >= needed;
    } else {
      // Buying PULSE with USDC, need PULSE liquidity
      return parseFloat(liquidityPulse) >= needed;
    }
  };

  const inputToken = direction === "sell" ? "PULSE" : "USDC";
  const outputToken = direction === "sell" ? "USDC" : "PULSE";
  const inputDecimals = direction === "sell" ? 4 : 2;
  const outputDecimals = direction === "sell" ? 2 : 4;

  // Add PULSE token to wallet
  const addPulseToWallet = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    try {
      await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: PULSE_TOKEN_ADDRESS,
            symbol: "PULSE",
            decimals: 18,
          },
        },
      });
      toast({
        title: "Token Added",
        description: "PULSE token has been added to your wallet",
      });
    } catch (error) {
      console.error("Failed to add token:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="h-6 w-6" />
              Connect Wallet
            </CardTitle>
            <CardDescription>
              Please connect your wallet to swap tokens
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Swap PULSE</CardTitle>
              <CardDescription>
                {direction === "sell"
                  ? "Sell PULSE for USDC"
                  : "Buy PULSE with USDC"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isPaused && (
                <Badge variant="destructive">Paused</Badge>
              )}
              <button
                onClick={addPulseToWallet}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
                title="Add PULSE token to wallet"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline">Add PULSE to wallet</span>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rate Display */}
          <div className="p-4 rounded-lg bg-muted space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Exchange Rate</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">1 PULSE = ${usdcRateFormatted.toFixed(4)} USDC</p>
                <p className="text-xs text-muted-foreground">
                  1 USDC = {usdcRateFormatted > 0 ? (1 / usdcRateFormatted).toFixed(2) : "0"} PULSE
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">Swap Fee</span>
              <span className="text-sm font-medium">{swapFeePercent}%</span>
            </div>
          </div>

          {/* Input Amount */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>You {direction === "sell" ? "sell" : "pay"}</Label>
              <span className="text-sm text-muted-foreground">
                Balance: {parseFloat(getUserInputBalance()).toFixed(inputDecimals)} {inputToken}
              </span>
            </div>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="pr-24 text-lg"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInputAmount(getUserInputBalance())}
                  className="h-6 px-2 text-xs"
                >
                  MAX
                </Button>
                <span className="text-muted-foreground font-medium">{inputToken}</span>
              </div>
            </div>
          </div>

          {/* Swap Direction Toggle */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDirection}
              className="rounded-full"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* Output Amount */}
          <div className="space-y-2">
            <Label>You {direction === "sell" ? "receive" : "get"}</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="0.00"
                value={outputAmount ? parseFloat(outputAmount).toFixed(outputDecimals) : ""}
                readOnly
                className="pr-20 text-lg bg-muted"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {outputToken}
              </span>
            </div>
          </div>

          {/* Liquidity Warning */}
          {outputAmount && !hasEnoughLiquidity() && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient liquidity. Available: {direction === "sell" ? liquidityUsdc : liquidityPulse} {outputToken}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {approval.needsApproval ? (
              <Button
                onClick={approval.handleApprove}
                disabled={!inputAmount || approval.isApproving || isPaused}
                className="w-full"
              >
                {approval.isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  `Approve ${inputToken}`
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSwap}
                disabled={
                  !inputAmount ||
                  !outputAmount ||
                  isSwapping ||
                  isPaused ||
                  !hasEnoughLiquidity()
                }
                className="w-full"
              >
                {isSwapping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentSwap.isPending ? "Confirm in wallet..." : "Swapping..."}
                  </>
                ) : isPaused ? (
                  "Swap Paused"
                ) : (
                  "Swap"
                )}
              </Button>
            )}
          </div>

          {/* Success Message */}
          {currentSwap.isSuccess && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Swap completed successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Transaction Hash */}
          {currentSwap.hash && (
            <p className="text-xs text-center text-muted-foreground">
              Transaction:{" "}
              <a
                href={`https://amoy.polygonscan.com/tx/${currentSwap.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                {currentSwap.hash.slice(0, 10)}...{currentSwap.hash.slice(-8)}
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contract Liquidity Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Swap Contract Liquidity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">PULSE Available</p>
              <p className="font-semibold text-lg">{parseFloat(liquidityPulse).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">USDC Available</p>
              <p className="font-semibold text-lg">{parseFloat(liquidityUsdc).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">How it works</p>
              <p>
                Swap PULSE tokens for USDC stablecoin at a fixed exchange rate.
                The rate is set by the platform and may be adjusted periodically.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
