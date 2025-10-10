import { useEffect, useState } from 'react';
import { getUserClaimablePollResponses, type PollResponse, PollStatus } from '@/lib/graphql/queries';
import { useAccount } from 'wagmi';

export interface ClaimableResponse extends PollResponse {
  rewardAmount: bigint;
}

export function useClaimsData() {
  const { address, isConnected } = useAccount();
  const [claimableResponses, setClaimableResponses] = useState<ClaimableResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!address || !isConnected) {
        setClaimableResponses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const responses = await getUserClaimablePollResponses(address);

        // Filter and transform responses
        const claimable = responses
          .filter(response => {
            // Only include polls where claiming is enabled and reward not yet claimed
            return (
              response.poll?.status === PollStatus.CLAIMING_ENABLED &&
              !response.rewardClaimed
            );
          })
          .map(response => {
            // Calculate reward amount per user
            const rewardPool = BigInt(response.poll?.rewardPool || '0');
            const totalResponses = BigInt(response.poll?.totalResponses || '1');
            const rewardAmount = totalResponses > 0n ? rewardPool / totalResponses : 0n;

            return {
              ...response,
              rewardAmount,
            };
          });

        setClaimableResponses(claimable);
      } catch (err) {
        console.error('Error fetching claims data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch claims data'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [address, isConnected]);

  return {
    claimableResponses,
    loading,
    error,
    refetch: () => {
      if (address && isConnected) {
        setLoading(true);
        getUserClaimablePollResponses(address)
          .then(responses => {
            const claimable = responses
              .filter(response => {
                return (
                  response.poll?.status === PollStatus.CLAIMING_ENABLED &&
                  !response.rewardClaimed
                );
              })
              .map(response => {
                const rewardPool = BigInt(response.poll?.rewardPool || '0');
                const totalResponses = BigInt(response.poll?.totalResponses || '1');
                const rewardAmount = totalResponses > 0n ? rewardPool / totalResponses : 0n;

                return {
                  ...response,
                  rewardAmount,
                };
              });

            setClaimableResponses(claimable);
          })
          .catch(err => {
            console.error('Error refetching claims data:', err);
            setError(err instanceof Error ? err : new Error('Failed to refetch claims data'));
          })
          .finally(() => setLoading(false));
      }
    },
  };
}
