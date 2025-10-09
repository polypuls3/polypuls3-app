import { useEffect, useState } from 'react';
import { getAdminStats, getUniqueParticipants, getAllPollsWithDetails, type Poll } from '@/lib/graphql/queries';

interface AdminStats {
  totalPolls: number;
  activePolls: number;
  totalProjects: number;
  totalSurveys: number;
  totalUsers: number;
}

export function useAdminData() {
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

        // Fetch all data in parallel
        const [adminStats, uniqueUsers, pollsData] = await Promise.all([
          getAdminStats(),
          getUniqueParticipants(),
          getAllPollsWithDetails(100)
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
  }, []);

  return {
    stats,
    polls,
    loading,
    error,
  };
}
