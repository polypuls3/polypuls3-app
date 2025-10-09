import { useEffect, useState, useMemo } from 'react';
import { getPollWithResponses, type Poll, type PollResponse } from '@/lib/graphql/queries';
import { useAccount } from 'wagmi';

export interface PollOptionWithVotes {
  index: number;
  text: string;
  votes: number;
  percentage: number;
}

export function usePollDetail(pollId: string) {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [responses, setResponses] = useState<PollResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    async function fetchData() {
      if (!pollId) return;

      try {
        setLoading(true);
        setError(null);

        const { poll: pollData, responses: responsesData } = await getPollWithResponses(pollId);

        if (!pollData) {
          throw new Error('Poll not found');
        }

        setPoll(pollData);
        setResponses(responsesData);
      } catch (err) {
        console.error('Error fetching poll details:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch poll details'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [pollId]);

  // Calculate vote distribution
  const optionsWithVotes = useMemo((): PollOptionWithVotes[] => {
    if (!poll) return [];

    // Count votes for each option
    const voteCounts = new Map<number, number>();
    responses.forEach(response => {
      const optionIndex = parseInt(response.optionIndex);
      voteCounts.set(optionIndex, (voteCounts.get(optionIndex) || 0) + 1);
    });

    const totalVotes = responses.length;

    return poll.options.map((optionText, index) => ({
      index,
      text: optionText,
      votes: voteCounts.get(index) || 0,
      percentage: totalVotes > 0 ? ((voteCounts.get(index) || 0) / totalVotes) * 100 : 0,
    }));
  }, [poll, responses]);

  // Check if user has already voted
  const userVote = useMemo(() => {
    if (!address) return null;
    return responses.find(
      response => response.respondent.toLowerCase() === address.toLowerCase()
    );
  }, [address, responses]);

  return {
    poll,
    responses,
    optionsWithVotes,
    userVote,
    hasVoted: !!userVote,
    loading,
    error,
  };
}
