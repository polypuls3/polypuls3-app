import { useState, useCallback } from 'react';
import { AIChatMessage, AIResponse, PartialPollData } from '@/lib/ai/poll-types';
import { getDefaultPollData, mergePollData, isCompletePollData } from '@/lib/ai/poll-validator';

export function useAIPollBuilder() {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [pollData, setPollData] = useState<PartialPollData>(getDefaultPollData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const sendMessage = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    setError(null);

    // Add user message to chat
    const newUserMessage: AIChatMessage = {
      role: 'user',
      content: userMessage,
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const aiResponse: AIResponse = await response.json();

      // Add AI response to chat
      const newAIMessage: AIChatMessage = {
        role: 'assistant',
        content: aiResponse.message,
      };

      setMessages([...updatedMessages, newAIMessage]);

      // Update poll data
      const updatedPollData = mergePollData(pollData, aiResponse.pollData);
      setPollData(updatedPollData);

      // Check if complete
      const pollComplete = aiResponse.isComplete && isCompletePollData(updatedPollData);
      setIsComplete(pollComplete);

      // Automatically show preview and action buttons if poll is complete
      if (pollComplete && !showActions) {
        // Add preview message
        const previewMessage: AIChatMessage = {
          role: 'assistant',
          content: 'Here\'s how your poll will look:',
          type: 'preview',
          metadata: {
            pollData: updatedPollData,
          },
        };

        // Add action buttons (without "Show Preview" since we already showed it)
        const actionsMessage: AIChatMessage = {
          role: 'assistant',
          content: '',
          type: 'actions',
          metadata: {
            actions: ['create', 'reset'],
          },
        };

        setMessages((prev) => [...prev, previewMessage, actionsMessage]);
        setShowActions(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      // Add error message to chat
      const errorAIMessage: AIChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
      };

      setMessages([...updatedMessages, errorAIMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, pollData]);

  const showPreview = useCallback(() => {
    const previewMessage: AIChatMessage = {
      role: 'assistant',
      content: 'Here\'s how your poll will look:',
      type: 'preview',
      metadata: {
        pollData,
      },
    };
    setMessages((prev) => [...prev, previewMessage]);
  }, [pollData]);

  const addStatusMessage = useCallback((content: string, statusType: 'loading' | 'success' | 'error') => {
    const statusMessage: AIChatMessage = {
      role: 'assistant',
      content,
      type: 'status',
      metadata: {
        statusType,
      },
    };
    setMessages((prev) => [...prev, statusMessage]);
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setPollData(getDefaultPollData());
    setIsLoading(false);
    setError(null);
    setIsComplete(false);
    setShowActions(false);
  }, []);

  const startConversation = useCallback(() => {
    const welcomeMessage: AIChatMessage = {
      role: 'assistant',
      content: `Hi! I'm here to help you create a poll quickly. Just tell me what you want to ask your community, and I'll generate poll options for you!

**Quick Example:**
"What should we build next for polypuls3?, 7 days, 0.1 POL"

Or simply: "Should we add dark mode?"

I'll automatically create relevant options and apply sensible defaults. You can always modify them before creating!`,
    };
    setMessages([welcomeMessage]);
  }, []);

  return {
    messages,
    pollData,
    isLoading,
    error,
    isComplete,
    sendMessage,
    showPreview,
    addStatusMessage,
    reset,
    startConversation,
  };
}
