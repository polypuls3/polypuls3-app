import { useCallback } from 'react'
import { useDataSource } from '@/contexts/data-source-context'
import {
  getProjectsByCreator,
  getPollsByCreator,
  getSurveysByCreator,
  getPollsByProject,
  getSurveysByProject,
  getProjectById,
  getPollById,
  getPollWithResponses,
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
  getPollByIdFromContract,
  getPollResponsesFromContract,
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
    fetchProjectsByCreator: useCallback(async (creator: string): Promise<Project[]> => {
      if (dataSource === 'contract') {
        return getProjectsByCreatorFromContract(creator)
      }
      return getProjectsByCreator(creator)
    }, [dataSource]),

    /**
     * Fetch polls by creator address
     */
    fetchPollsByCreator: useCallback(async (creator: string): Promise<Poll[]> => {
      if (dataSource === 'contract') {
        return getPollsByCreatorFromContract(creator)
      }
      return getPollsByCreator(creator)
    }, [dataSource]),

    /**
     * Fetch surveys by creator address
     */
    fetchSurveysByCreator: useCallback(async (creator: string): Promise<Survey[]> => {
      if (dataSource === 'contract') {
        return getSurveysByCreatorFromContract(creator)
      }
      return getSurveysByCreator(creator)
    }, [dataSource]),

    /**
     * Fetch polls by project ID
     */
    fetchPollsByProject: useCallback(async (projectId: string): Promise<Poll[]> => {
      if (dataSource === 'contract') {
        return getPollsByProjectFromContract(projectId)
      }
      return getPollsByProject(projectId)
    }, [dataSource]),

    /**
     * Fetch surveys by project ID
     */
    fetchSurveysByProject: useCallback(async (projectId: string): Promise<Survey[]> => {
      if (dataSource === 'contract') {
        return getSurveysByProjectFromContract(projectId)
      }
      return getSurveysByProject(projectId)
    }, [dataSource]),

    /**
     * Fetch a single project by ID
     */
    fetchProjectById: useCallback(async (projectId: string): Promise<Project | null> => {
      if (dataSource === 'contract') {
        return getProjectByIdFromContract(projectId)
      }
      return getProjectById(projectId)
    }, [dataSource]),

    /**
     * Fetch all active polls (for participant page)
     */
    fetchAllActivePolls: useCallback(async (): Promise<Poll[]> => {
      if (dataSource === 'contract') {
        return getAllActivePollsFromContract()
      }
      return getAllPolls()
    }, [dataSource]),

    /**
     * Fetch all polls (for admin page)
     */
    fetchAllPolls: useCallback(async (): Promise<Poll[]> => {
      if (dataSource === 'contract') {
        return getAllPollsFromContract()
      }
      // For admin, we might need a different subgraph query
      // For now, using the same getAllPolls
      return getAllPolls(1000)
    }, [dataSource]),

    /**
     * Fetch admin stats (total polls, active polls, projects, surveys)
     */
    fetchAdminStats: useCallback(async (): Promise<{
      totalPolls: number
      activePolls: number
      totalProjects: number
      totalSurveys: number
    }> => {
      if (dataSource === 'contract') {
        return getAdminStatsFromContract()
      }
      return getAdminStats()
    }, [dataSource]),

    /**
     * Fetch unique participants count
     */
    fetchUniqueParticipants: useCallback(async (): Promise<number> => {
      if (dataSource === 'contract') {
        return getUniqueParticipantsFromContract()
      }
      return getUniqueParticipants()
    }, [dataSource]),

    /**
     * Fetch user's poll responses
     */
    fetchUserPollResponses: useCallback(async (userAddress: string): Promise<any[]> => {
      if (dataSource === 'contract') {
        return getUserPollResponsesFromContract(userAddress)
      }
      return getUserPollResponses(userAddress)
    }, [dataSource]),

    /**
     * Fetch a single poll by ID
     */
    fetchPollById: useCallback(async (pollId: string): Promise<Poll | null> => {
      if (dataSource === 'contract') {
        return getPollByIdFromContract(pollId)
      }
      return getPollById(pollId)
    }, [dataSource]),

    /**
     * Fetch poll with responses
     */
    fetchPollWithResponses: useCallback(async (pollId: string): Promise<{ poll: Poll | null; responses: any[] }> => {
      if (dataSource === 'contract') {
        const poll = await getPollByIdFromContract(pollId)
        const responses = await getPollResponsesFromContract(pollId)
        return { poll, responses }
      }
      return getPollWithResponses(pollId)
    }, [dataSource]),

    /**
     * Current data source
     */
    dataSource,
  }
}
