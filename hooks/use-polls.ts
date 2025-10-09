import { useEffect, useState } from 'react';
import { getAllPolls, getUserPollResponses, type Poll, type PollResponse } from '@/lib/graphql/queries';
import { useAccount } from 'wagmi';

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userResponses, setUserResponses] = useState<PollResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { address } = useAccount();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all active polls
        const pollsData = await getAllPolls();
        setPolls(pollsData);

        // Fetch user's poll responses if wallet is connected
        if (address) {
          const responsesData = await getUserPollResponses(address);
          setUserResponses(responsesData);
        }
      } catch (err) {
        console.error('Error fetching polls:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch polls'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [address]);

  return {
    polls,
    userResponses,
    loading,
    error,
  };
}
