import { useEffect, useState } from 'react';
import { type Poll } from '@/lib/graphql/queries';
import { useDataFetcher } from '@/hooks/use-data-fetcher';

interface AdminStats {
  totalPolls: number;
  activePolls: number;
  totalProjects: number;
  totalSurveys: number;
  totalUsers: number;
}

export function useAdminData() {
  const { fetchAdminStats, fetchUniqueParticipants, fetchAllPolls, dataSource } = useDataFetcher();

  const [stats, setStats] = useState<AdminStats>({
    totalPolls: 0,
    activePolls: 0,
    totalProjects: 0,
    totalSurveys: 0,
    totalUsers: 0,
  });
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel using unified fetcher
        const [adminStats, uniqueUsers, pollsData] = await Promise.all([
          fetchAdminStats(),
          fetchUniqueParticipants(),
          fetchAllPolls()
        ]);

        setStats({
          ...adminStats,
          totalUsers: uniqueUsers,
        });
        setPolls(pollsData);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch admin data'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [dataSource, fetchAdminStats, fetchUniqueParticipants, fetchAllPolls]);

  return {
    stats,
    polls,
    loading,
    error,
  };
}
