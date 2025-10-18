import { useEffect, useState } from 'react';
import { type Poll, type PollResponse } from '@/lib/graphql/queries';
import { useAccount } from 'wagmi';
import { useDataFetcher } from '@/hooks/use-data-fetcher';

export function usePolls() {
  const { fetchAllActivePolls, fetchUserPollResponses, dataSource } = useDataFetcher();

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

        // Fetch all active polls using unified fetcher
        const pollsData = await fetchAllActivePolls();
        setPolls(pollsData);

        // Fetch user's poll responses if wallet is connected
        if (address) {
          const responsesData = await fetchUserPollResponses(address);
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
  }, [address, dataSource, fetchAllActivePolls, fetchUserPollResponses]);

  return {
    polls,
    userResponses,
    loading,
    error,
  };
}
