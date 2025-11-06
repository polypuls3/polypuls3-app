'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot, X, CheckCircle2, Loader2 } from 'lucide-react';
import { ChatInterface } from './chat-interface';
import { PollPreviewPanel } from './poll-preview-panel';
import { useAIPollBuilder } from '@/hooks/use-ai-poll-builder';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_CONFIG } from '@/lib/contracts/config';
import { useChainGuard } from '@/hooks/use-chain-guard';
import { useToast } from '@/hooks/use-toast';
import { isCompletePollData } from '@/lib/ai/poll-validator';
import { useRouter } from 'next/navigation';

export function AIChatDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { address: walletAddress } = useAccount();
  const { toast } = useToast();
  const chainGuard = useChainGuard();
  const router = useRouter();

  const {
    messages,
    pollData,
    isLoading,
    error,
    isComplete,
    sendMessage,
    reset,
    startConversation,
  } = useAIPollBuilder();

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Start conversation when dialog opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startConversation();
    }
  }, [isOpen, messages.length, startConversation]);

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Poll Created Successfully!',
        description: `Transaction hash: ${hash?.slice(0, 10)}...`,
      });

      // Reset and close dialog
      setTimeout(() => {
        reset();
        setIsOpen(false);
        // Optionally redirect to creator dashboard
        router.push('/creator');
      }, 2000);
    }
  }, [isSuccess, hash, toast, reset, router]);

  // Handle transaction error
  useEffect(() => {
    if (isWriteError && writeError) {
      toast({
        title: 'Transaction Failed',
        description: writeError.message,
        variant: 'destructive',
      });
    }
  }, [isWriteError, writeError, toast]);

  const handleCreatePoll = async () => {
    if (!isCompletePollData(pollData)) {
      toast({
        title: 'Incomplete Poll Data',
        description: 'Please complete all required fields before creating the poll.',
        variant: 'destructive',
      });
      return;
    }

    if (!walletAddress) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a poll.',
        variant: 'destructive',
      });
      return;
    }

    // Check if on correct chain
    if (chainGuard.isWrongChain) {
      toast({
        title: 'Wrong Network',
        description: `Please switch to ${chainGuard.requiredChainName} to create a poll`,
        variant: 'destructive',
      });

      try {
        await chainGuard.switchToRequiredChain();
        toast({
          title: 'Network Switched',
          description: `Successfully switched to ${chainGuard.requiredChainName}`,
        });
      } catch (error) {
        console.error('Failed to switch chain:', error);
        return;
      }
    }

    try {
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: 'createPoll',
        args: [
          pollData.question,
          pollData.options,
          BigInt(pollData.durationInDays),
          pollData.category,
          BigInt(pollData.projectId),
          pollData.votingType,
          pollData.visibility,
        ],
        value: pollData.rewardPool !== '0' ? parseEther(pollData.rewardPool) : BigInt(0),
      });
    } catch (err) {
      console.error('Error creating poll:', err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Optionally reset conversation on close
    // reset();
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-6xl h-[80vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle>AI Poll Creator</DialogTitle>
                  <DialogDescription>
                    Describe your poll idea and I'll help you create it
                  </DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden px-6 pb-6">
            {/* Chat Panel */}
            <div className="border rounded-lg overflow-hidden flex flex-col h-full">
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
              />
            </div>

            {/* Preview Panel */}
            <div className="border rounded-lg overflow-hidden">
              <PollPreviewPanel pollData={pollData} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t p-4 flex items-center justify-between bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isComplete && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Poll is ready to create!</span>
                </>
              )}
              {isConfirming && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Confirming transaction...</span>
                </>
              )}
              {isSuccess && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Poll created successfully!</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={reset} disabled={isWritePending || isConfirming}>
                Reset
              </Button>
              <Button
                onClick={handleCreatePoll}
                disabled={!isComplete || isWritePending || isConfirming || isSuccess}
              >
                {isWritePending || isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isWritePending ? 'Creating...' : 'Confirming...'}
                  </>
                ) : (
                  'Create Poll'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
