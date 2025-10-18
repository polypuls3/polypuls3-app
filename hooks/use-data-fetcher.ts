import { useDataSource } from '@/contexts/data-source-context'
import {
  getProjectsByCreator,
  getPollsByCreator,
  getSurveysByCreator,
  getPollsByProject,
  getSurveysByProject,
  getProjectById,
  getAllPolls,
  getAdminStats,
  getUniqueParticipants,
  getUserPollResponses,
  type Project,
  type Poll,
  type Survey,
} from '@/lib/graphql/queries'
import {
  getPollsByCreatorFromContract,
  getProjectsByCreatorFromContract,
  getSurveysByCreatorFromContract,
  getPollsByProjectFromContract,
  getSurveysByProjectFromContract,
  getProjectByIdFromContract,
  getAllActivePollsFromContract,
  getAllPollsFromContract,
  getAdminStatsFromContract,
  getUniqueParticipantsFromContract,
  getUserPollResponsesFromContract,
} from '@/lib/contracts/contract-queries'

/**
 * Unified data fetcher hook that switches between subgraph and contract
 * based on the user's data source preference
 */
export function useDataFetcher() {
  const { dataSource } = useDataSource()

  return {
    /**
     * Fetch projects by creator address
     */
    fetchProjectsByCreator: async (creator: string): Promise<Project[]> => {
      if (dataSource === 'contract') {
        return getProjectsByCreatorFromContract(creator)
      }
      return getProjectsByCreator(creator)
    },

    /**
     * Fetch polls by creator address
     */
    fetchPollsByCreator: async (creator: string): Promise<Poll[]> => {
      if (dataSource === 'contract') {
        return getPollsByCreatorFromContract(creator)
      }
      return getPollsByCreator(creator)
    },

    /**
     * Fetch surveys by creator address
     */
    fetchSurveysByCreator: async (creator: string): Promise<Survey[]> => {
      if (dataSource === 'contract') {
        return getSurveysByCreatorFromContract(creator)
      }
      return getSurveysByCreator(creator)
    },

    /**
     * Fetch polls by project ID
     */
    fetchPollsByProject: async (projectId: string): Promise<Poll[]> => {
      if (dataSource === 'contract') {
        return getPollsByProjectFromContract(projectId)
      }
      return getPollsByProject(projectId)
    },

    /**
     * Fetch surveys by project ID
     */
    fetchSurveysByProject: async (projectId: string): Promise<Survey[]> => {
      if (dataSource === 'contract') {
        return getSurveysByProjectFromContract(projectId)
      }
      return getSurveysByProject(projectId)
    },

    /**
     * Fetch a single project by ID
     */
    fetchProjectById: async (projectId: string): Promise<Project | null> => {
      if (dataSource === 'contract') {
        return getProjectByIdFromContract(projectId)
      }
      return getProjectById(projectId)
    },

    /**
     * Fetch all active polls (for participant page)
     */
    fetchAllActivePolls: async (): Promise<Poll[]> => {
      if (dataSource === 'contract') {
        return getAllActivePollsFromContract()
      }
      return getAllPolls()
    },

    /**
     * Fetch all polls (for admin page)
     */
    fetchAllPolls: async (): Promise<Poll[]> => {
      if (dataSource === 'contract') {
        return getAllPollsFromContract()
      }
      // For admin, we might need a different subgraph query
      // For now, using the same getAllPolls
      return getAllPolls(1000)
    },

    /**
     * Fetch admin stats (total polls, active polls, projects, surveys)
     */
    fetchAdminStats: async (): Promise<{
      totalPolls: number
      activePolls: number
      totalProjects: number
      totalSurveys: number
    }> => {
      if (dataSource === 'contract') {
        return getAdminStatsFromContract()
      }
      return getAdminStats()
    },

    /**
     * Fetch unique participants count
     */
    fetchUniqueParticipants: async (): Promise<number> => {
      if (dataSource === 'contract') {
        return getUniqueParticipantsFromContract()
      }
      return getUniqueParticipants()
    },

    /**
     * Fetch user's poll responses
     */
    fetchUserPollResponses: async (userAddress: string): Promise<any[]> => {
      if (dataSource === 'contract') {
        return getUserPollResponsesFromContract(userAddress)
      }
      return getUserPollResponses(userAddress)
    },

    /**
     * Current data source
     */
    dataSource,
  }
}
