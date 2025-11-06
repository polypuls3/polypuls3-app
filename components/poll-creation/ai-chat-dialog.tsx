'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { ChatInterface } from './chat-interface';
import { useAIPollBuilder } from '@/hooks/use-ai-poll-builder';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_CONFIG } from '@/lib/contracts/config';
import { useChainGuard } from '@/hooks/use-chain-guard';
import { useToast } from '@/hooks/use-toast';
import { isCompletePollData } from '@/lib/ai/poll-validator';
import { useRouter } from 'next/navigation';
import { useDataSource } from '@/contexts/data-source-context';

export function AIChatDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const { address: walletAddress } = useAccount();
  const { toast } = useToast();
  const chainGuard = useChainGuard();
  const router = useRouter();
  const { triggerRefresh } = useDataSource();

  const {
    messages,
    pollData,
    isLoading,
    sendMessage,
    addStatusMessage,
    reset,
    startConversation,
  } = useAIPollBuilder();

  const {
    writeContract,
    data: hash,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
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
    if (isSuccess && hash && !hasRedirected) {
      // Mark as redirected immediately to prevent multiple executions
      setHasRedirected(true);

      addStatusMessage(
        `Poll created successfully! Transaction: ${hash.slice(0, 10)}...${hash.slice(-8)}`,
        'success'
      );

      toast({
        title: 'Poll Created Successfully!',
        description: `Transaction hash: ${hash.slice(0, 10)}...`,
      });

      // Wait for subgraph to index, then trigger refresh and navigate
      const timeoutId = setTimeout(() => {
        reset(); // Reset wagmi state FIRST to clear isSuccess
        setIsOpen(false);
        triggerRefresh(); // Refresh data on creator page
        router.push('/creator');
      }, 5000); // 5 seconds to allow subgraph indexing

      // Cleanup function to prevent timer accumulation
      return () => clearTimeout(timeoutId);
    }
  }, [isSuccess, hash]); // Only essential dependencies

  // Handle transaction error
  useEffect(() => {
    if (isWriteError && writeError) {
      addStatusMessage(`Transaction failed: ${writeError.message}`, 'error');
      toast({
        title: 'Transaction Failed',
        description: writeError.message,
        variant: 'destructive',
      });
    }
  }, [isWriteError, writeError]); // Remove non-essential dependencies

  // Handle confirming transaction
  useEffect(() => {
    if (isConfirming) {
      addStatusMessage('Confirming transaction on blockchain...', 'loading');
    }
  }, [isConfirming]); // Remove non-essential dependencies

  // Reset hasRedirected flag when dialog closes or transaction is cleared
  useEffect(() => {
    if (!isOpen || !hash) {
      setHasRedirected(false);
    }
  }, [isOpen, hash]);

  const handleAction = async (action: string) => {
    switch (action) {
      case 'create':
        await handleCreatePoll();
        break;
      case 'reset':
        reset();
        startConversation();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleCreatePoll = async () => {
    if (!isCompletePollData(pollData)) {
      addStatusMessage('Poll data is incomplete. Please provide all required information.', 'error');
      toast({
        title: 'Incomplete Poll Data',
        description: 'Please complete all required fields before creating the poll.',
        variant: 'destructive',
      });
      return;
    }

    if (!walletAddress) {
      addStatusMessage('Please connect your wallet to create a poll.', 'error');
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a poll.',
        variant: 'destructive',
      });
      return;
    }

    // Check if on correct chain
    if (chainGuard.isWrongChain) {
      addStatusMessage(`Please switch to ${chainGuard.requiredChainName} network...`, 'loading');
      toast({
        title: 'Wrong Network',
        description: `Please switch to ${chainGuard.requiredChainName} to create a poll`,
        variant: 'destructive',
      });

      try {
        await chainGuard.switchToRequiredChain();
        addStatusMessage(`Switched to ${chainGuard.requiredChainName} successfully!`, 'success');
        toast({
          title: 'Network Switched',
          description: `Successfully switched to ${chainGuard.requiredChainName}`,
        });
      } catch (error) {
        addStatusMessage('Failed to switch network. Please switch manually.', 'error');
        console.error('Failed to switch chain:', error);
        return;
      }
    }

    addStatusMessage('Creating poll transaction...', 'loading');

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
      addStatusMessage('Failed to create transaction. Please try again.', 'error');
      console.error('Error creating poll:', err);
    }
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
        <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
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
          </DialogHeader>

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              onAction={handleAction}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
