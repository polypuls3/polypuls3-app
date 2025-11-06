import { useState, useCallback } from 'react';
import { AIChatMessage, AIResponse, PartialPollData } from '@/lib/ai/poll-types';
import { getDefaultPollData, mergePollData, isCompletePollData } from '@/lib/ai/poll-validator';

export function useAIPollBuilder() {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [pollData, setPollData] = useState<PartialPollData>(getDefaultPollData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

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
      if (aiResponse.isComplete && isCompletePollData(updatedPollData)) {
        setIsComplete(true);
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

  const reset = useCallback(() => {
    setMessages([]);
    setPollData(getDefaultPollData());
    setIsLoading(false);
    setError(null);
    setIsComplete(false);
  }, []);

  const startConversation = useCallback(() => {
    const welcomeMessage: AIChatMessage = {
      role: 'assistant',
      content: "Hi! I'm here to help you create a poll. What would you like to ask your community?",
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
    reset,
    startConversation,
  };
}
