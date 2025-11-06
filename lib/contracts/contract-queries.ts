import { readContract } from '@wagmi/core'
import { config } from '@/components/providers/wallet'
import { CONTRACT_CONFIG } from './config'
import type { Poll, Project, Survey, PollStatus } from '../graphql/queries'

// Helper to convert BigInt to string for consistency with subgraph
const bigIntToString = (value: any): string => {
  if (typeof value === 'bigint') return value.toString()
  return String(value)
}

// Helper to map contract status enum to PollStatus
const mapPollStatus = (statusNum: number): PollStatus => {
  const statuses = ['ACTIVE', 'ENDED', 'CLAIMING_ENABLED', 'CLAIMING_DISABLED', 'CLOSED']
  return statuses[statusNum] as PollStatus || 'ACTIVE'
}

/**
 * Fetch all polls by creator from contract
 * This loops through all polls and filters by creator address
 */
export async function getPollsByCreatorFromContract(creator: string): Promise<Poll[]> {
  try {
    // Get total poll count
    const pollCount = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'pollCount',
    }) as bigint

    const polls: Poll[] = []

    // Loop through all poll IDs
    for (let i = 0; i < Number(pollCount); i++) {
      try {
        const pollData = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getPoll',
          args: [BigInt(i)],
        }) as any

        // Check if creator matches (case-insensitive)
        if (pollData.creator.toLowerCase() === creator.toLowerCase()) {
          const status = await readContract(config, {
            ...CONTRACT_CONFIG,
            functionName: 'getPollStatus',
            args: [BigInt(i)],
          }) as number

          polls.push({
            id: `poll-${i}`,
            pollId: i.toString(),
            creator: pollData.creator,
            question: pollData.question,
            options: pollData.options,
            createdAt: bigIntToString(pollData.createdAt),
            expiresAt: bigIntToString(pollData.expiresAt),
            rewardPool: bigIntToString(pollData.rewardPool),
            isActive: pollData.isActive,
            totalResponses: bigIntToString(pollData.totalResponses || 0),
            category: pollData.category || '',
            projectId: bigIntToString(pollData.projectId),
            votingType: pollData.votingType || 'single',
            visibility: pollData.visibility || 'public',
            status: mapPollStatus(status),
            platformFeeAmount: bigIntToString(pollData.platformFeeAmount || 0),
            claimedRewards: bigIntToString(pollData.claimedRewards || 0),
          })
        }
      } catch (error) {
        console.error(`Error fetching poll ${i}:`, error)
        // Continue to next poll
      }
    }

    // Sort by createdAt descending (newest first) to match subgraph behavior
    return polls.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
  } catch (error) {
    console.error('Error fetching polls from contract:', error)
    return []
  }
}

/**
 * Fetch all projects by creator from contract
 */
export async function getProjectsByCreatorFromContract(creator: string): Promise<Project[]> {
  try {
    const projectCount = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'projectCount',
    }) as bigint

    const projects: Project[] = []

    for (let i = 0; i < Number(projectCount); i++) {
      try {
        const projectData = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getProject',
          args: [BigInt(i)],
        }) as any

        if (projectData.creator.toLowerCase() === creator.toLowerCase()) {
          projects.push({
            id: `project-${i}`,
            projectId: i.toString(),
            creator: projectData.creator,
            name: projectData.name,
            description: projectData.description,
            tags: projectData.tags || '',
            createdAt: bigIntToString(projectData.createdAt),
            isActive: projectData.isActive,
          })
        }
      } catch (error) {
        console.error(`Error fetching project ${i}:`, error)
      }
    }

    // Sort by createdAt descending (newest first) to match subgraph behavior
    return projects.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
  } catch (error) {
    console.error('Error fetching projects from contract:', error)
    return []
  }
}

/**
 * Fetch all surveys by creator from contract
 */
export async function getSurveysByCreatorFromContract(creator: string): Promise<Survey[]> {
  try {
    const surveyCount = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'surveyCount',
    }) as bigint

    const surveys: Survey[] = []

    for (let i = 0; i < Number(surveyCount); i++) {
      try {
        const surveyData = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getSurvey',
          args: [BigInt(i)],
        }) as any

        if (surveyData.creator.toLowerCase() === creator.toLowerCase()) {
          surveys.push({
            id: `survey-${i}`,
            surveyId: i.toString(),
            creator: surveyData.creator,
            projectId: bigIntToString(surveyData.projectId),
            title: surveyData.title,
            description: surveyData.description,
            questions: surveyData.questions,
            createdAt: bigIntToString(surveyData.createdAt),
            expiresAt: bigIntToString(surveyData.expiresAt),
            rewardPool: bigIntToString(surveyData.rewardPool),
            isActive: surveyData.isActive,
            totalResponses: bigIntToString(surveyData.totalResponses || 0),
          })
        }
      } catch (error) {
        console.error(`Error fetching survey ${i}:`, error)
      }
    }

    // Sort by createdAt descending (newest first) to match subgraph behavior
    return surveys.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
  } catch (error) {
    console.error('Error fetching surveys from contract:', error)
    return []
  }
}

/**
 * Fetch polls by project ID from contract
 */
export async function getPollsByProjectFromContract(projectId: string): Promise<Poll[]> {
  try {
    const pollCount = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'pollCount',
    }) as bigint

    const polls: Poll[] = []

    for (let i = 0; i < Number(pollCount); i++) {
      try {
        const pollData = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getPoll',
          args: [BigInt(i)],
        }) as any

        if (bigIntToString(pollData.projectId) === projectId) {
          const status = await readContract(config, {
            ...CONTRACT_CONFIG,
            functionName: 'getPollStatus',
            args: [BigInt(i)],
          }) as number

          polls.push({
            id: `poll-${i}`,
            pollId: i.toString(),
            creator: pollData.creator,
            question: pollData.question,
            options: pollData.options,
            createdAt: bigIntToString(pollData.createdAt),
            expiresAt: bigIntToString(pollData.expiresAt),
            rewardPool: bigIntToString(pollData.rewardPool),
            isActive: pollData.isActive,
            totalResponses: bigIntToString(pollData.totalResponses || 0),
            category: pollData.category || '',
            projectId: bigIntToString(pollData.projectId),
            votingType: pollData.votingType || 'single',
            visibility: pollData.visibility || 'public',
            status: mapPollStatus(status),
            platformFeeAmount: bigIntToString(pollData.platformFeeAmount || 0),
            claimedRewards: bigIntToString(pollData.claimedRewards || 0),
          })
        }
      } catch (error) {
        console.error(`Error fetching poll ${i}:`, error)
      }
    }

    // Sort by createdAt descending (newest first) to match subgraph behavior
    return polls.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
  } catch (error) {
    console.error('Error fetching polls by project from contract:', error)
    return []
  }
}

/**
 * Fetch surveys by project ID from contract
 */
export async function getSurveysByProjectFromContract(projectId: string): Promise<Survey[]> {
  try {
    const surveyCount = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'surveyCount',
    }) as bigint

    const surveys: Survey[] = []

    for (let i = 0; i < Number(surveyCount); i++) {
      try {
        const surveyData = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getSurvey',
          args: [BigInt(i)],
        }) as any

        if (bigIntToString(surveyData.projectId) === projectId) {
          surveys.push({
            id: `survey-${i}`,
            surveyId: i.toString(),
            creator: surveyData.creator,
            projectId: bigIntToString(surveyData.projectId),
            title: surveyData.title,
            description: surveyData.description,
            questions: surveyData.questions,
            createdAt: bigIntToString(surveyData.createdAt),
            expiresAt: bigIntToString(surveyData.expiresAt),
            rewardPool: bigIntToString(surveyData.rewardPool),
            isActive: surveyData.isActive,
            totalResponses: bigIntToString(surveyData.totalResponses || 0),
          })
        }
      } catch (error) {
        console.error(`Error fetching survey ${i}:`, error)
      }
    }

    // Sort by createdAt descending (newest first) to match subgraph behavior
    return surveys.sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
  } catch (error) {
    console.error('Error fetching surveys by project from contract:', error)
    return []
  }
}

/**
 * Fetch a single project by ID from contract
 */
export async function getProjectByIdFromContract(projectId: string): Promise<Project | null> {
  try {
    const projectData = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'getProject',
      args: [BigInt(projectId)],
    }) as any

    return {
      id: `project-${projectId}`,
      projectId: projectId,
      creator: projectData.creator,
      name: projectData.name,
      description: projectData.description,
      tags: projectData.tags || '',
      createdAt: bigIntToString(projectData.createdAt),
      isActive: projectData.isActive,
    }
  } catch (error) {
    console.error(`Error fetching project ${projectId} from contract:`, error)
    return null
  }
}

/**
 * Fetch all active polls from contract (for participant page)
 */
export async function getAllActivePollsFromContract(): Promise<Poll[]> {
  try {
    const pollCount = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'pollCount',
    }) as bigint

    const polls: Poll[] = []

    for (let i = 0; i < Number(pollCount); i++) {
      try {
        const pollData = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getPoll',
          args: [BigInt(i)],
        }) as any

        const status = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getPollStatus',
          args: [BigInt(i)],
        }) as number

        // Only include ACTIVE polls (status = 0)
        if (status === 0 && pollData.isActive) {
          polls.push({
            id: `poll-${i}`,
            pollId: i.toString(),
            creator: pollData.creator,
            question: pollData.question,
            options: pollData.options,
            createdAt: bigIntToString(pollData.createdAt),
            expiresAt: bigIntToString(pollData.expiresAt),
            rewardPool: bigIntToString(pollData.rewardPool),
            isActive: pollData.isActive,
            totalResponses: bigIntToString(pollData.totalResponses || 0),
            category: pollData.category || '',
            projectId: bigIntToString(pollData.projectId),
            votingType: pollData.votingType || 'single',
            visibility: pollData.visibility || 'public',
            status: mapPollStatus(status),
            platformFeeAmount: bigIntToString(pollData.platformFeeAmount || 0),
            claimedRewards: bigIntToString(pollData.claimedRewards || 0),
          })
        }
      } catch (error) {
        console.error(`Error fetching poll ${i}:`, error)
      }
    }

    return polls
  } catch (error) {
    console.error('Error fetching active polls from contract:', error)
    return []
  }
}

/**
 * Fetch all polls from contract (for admin page)
 */
export async function getAllPollsFromContract(): Promise<Poll[]> {
  try {
    const pollCount = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'pollCount',
    }) as bigint

    const polls: Poll[] = []

    for (let i = 0; i < Number(pollCount); i++) {
      try {
        const pollData = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getPoll',
          args: [BigInt(i)],
        }) as any

        const status = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getPollStatus',
          args: [BigInt(i)],
        }) as number

        polls.push({
          id: `poll-${i}`,
          pollId: i.toString(),
          creator: pollData.creator,
          question: pollData.question,
          options: pollData.options,
          createdAt: bigIntToString(pollData.createdAt),
          expiresAt: bigIntToString(pollData.expiresAt),
          rewardPool: bigIntToString(pollData.rewardPool),
          isActive: pollData.isActive,
          totalResponses: bigIntToString(pollData.totalResponses || 0),
          category: pollData.category || '',
          projectId: bigIntToString(pollData.projectId),
          votingType: pollData.votingType || 'single',
          visibility: pollData.visibility || 'public',
          status: mapPollStatus(status),
          platformFeeAmount: bigIntToString(pollData.platformFeeAmount || 0),
          claimedRewards: bigIntToString(pollData.claimedRewards || 0),
        })
      } catch (error) {
        console.error(`Error fetching poll ${i}:`, error)
      }
    }

    return polls
  } catch (error) {
    console.error('Error fetching all polls from contract:', error)
    return []
  }
}

/**
 * Fetch admin stats from contract
 * Calculates total polls, active polls, projects, and surveys
 */
export async function getAdminStatsFromContract(): Promise<{
  totalPolls: number
  activePolls: number
  totalProjects: number
  totalSurveys: number
}> {
  try {
    const [pollCount, projectCount, surveyCount] = await Promise.all([
      readContract(config, {
        ...CONTRACT_CONFIG,
        functionName: 'pollCount',
      }) as Promise<bigint>,
      readContract(config, {
        ...CONTRACT_CONFIG,
        functionName: 'projectCount',
      }) as Promise<bigint>,
      readContract(config, {
        ...CONTRACT_CONFIG,
        functionName: 'surveyCount',
      }) as Promise<bigint>,
    ])

    // Count active polls by checking status
    let activePolls = 0
    for (let i = 0; i < Number(pollCount); i++) {
      try {
        const status = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getPollStatus',
          args: [BigInt(i)],
        }) as number

        if (status === 0) { // ACTIVE status
          activePolls++
        }
      } catch (error) {
        console.error(`Error checking poll ${i} status:`, error)
      }
    }

    return {
      totalPolls: Number(pollCount),
      activePolls,
      totalProjects: Number(projectCount),
      totalSurveys: Number(surveyCount),
    }
  } catch (error) {
    console.error('Error fetching admin stats from contract:', error)
    return {
      totalPolls: 0,
      activePolls: 0,
      totalProjects: 0,
      totalSurveys: 0,
    }
  }
}

/**
 * Fetch unique participants count from contract
 * Gets all poll respondents and counts unique addresses
 */
export async function getUniqueParticipantsFromContract(): Promise<number> {
  try {
    const pollCount = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'pollCount',
    }) as bigint

    const uniqueAddresses = new Set<string>()

    for (let i = 0; i < Number(pollCount); i++) {
      try {
        const respondents = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getPollRespondents',
          args: [BigInt(i)],
        }) as string[]

        respondents.forEach(addr => uniqueAddresses.add(addr.toLowerCase()))
      } catch (error) {
        console.error(`Error fetching respondents for poll ${i}:`, error)
      }
    }

    return uniqueAddresses.size
  } catch (error) {
    console.error('Error fetching unique participants from contract:', error)
    return 0
  }
}

/**
 * Fetch user's poll responses from contract
 * Checks all polls to see which ones the user has responded to
 */
export async function getUserPollResponsesFromContract(userAddress: string): Promise<any[]> {
  try {
    const pollCount = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'pollCount',
    }) as bigint

    const userResponses: any[] = []

    for (let i = 0; i < Number(pollCount); i++) {
      try {
        const respondents = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'getPollRespondents',
          args: [BigInt(i)],
        }) as string[]

        // Check if user is in the respondents list
        const userHasResponded = respondents.some(
          addr => addr.toLowerCase() === userAddress.toLowerCase()
        )

        if (userHasResponded) {
          // Fetch the poll data
          const pollData = await readContract(config, {
            ...CONTRACT_CONFIG,
            functionName: 'getPoll',
            args: [BigInt(i)],
          }) as any

          const status = await readContract(config, {
            ...CONTRACT_CONFIG,
            functionName: 'getPollStatus',
            args: [BigInt(i)],
          }) as number

          userResponses.push({
            id: `response-${i}`,
            pollId: i.toString(),
            respondent: userAddress,
            optionIndex: 0, // Contract doesn't expose individual vote, just that user voted
            timestamp: bigIntToString(pollData.createdAt),
            rewardClaimed: false, // Would need separate contract call to check this
            poll: {
              id: `poll-${i}`,
              pollId: i.toString(),
              creator: pollData.creator,
              question: pollData.question,
              options: pollData.options,
              createdAt: bigIntToString(pollData.createdAt),
              expiresAt: bigIntToString(pollData.expiresAt),
              rewardPool: bigIntToString(pollData.rewardPool),
              isActive: pollData.isActive,
              totalResponses: bigIntToString(pollData.totalResponses || 0),
              category: pollData.category || '',
              projectId: bigIntToString(pollData.projectId),
              votingType: pollData.votingType || 'single',
              visibility: pollData.visibility || 'public',
              status: mapPollStatus(status),
              platformFeeAmount: bigIntToString(pollData.platformFeeAmount || 0),
              claimedRewards: bigIntToString(pollData.claimedRewards || 0),
            },
          })
        }
      } catch (error) {
        console.error(`Error checking user response for poll ${i}:`, error)
      }
    }

    return userResponses
  } catch (error) {
    console.error('Error fetching user poll responses from contract:', error)
    return []
  }
}

/**
 * Fetch a single poll by ID from contract
 */
export async function getPollByIdFromContract(pollId: string): Promise<Poll | null> {
  try {
    const pollData = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'getPoll',
      args: [BigInt(pollId)],
    }) as any

    const status = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'getPollStatus',
      args: [BigInt(pollId)],
    }) as number

    const poll: Poll = {
      id: `poll-${pollId}`,
      pollId: pollId,
      creator: pollData.creator,
      question: pollData.question,
      options: pollData.options,
      createdAt: bigIntToString(pollData.createdAt),
      expiresAt: bigIntToString(pollData.expiresAt),
      category: pollData.category,
      projectId: bigIntToString(pollData.projectId),
      votingType: pollData.votingType,
      visibility: pollData.visibility,
      rewardPool: bigIntToString(pollData.rewardPool),
      totalResponses: bigIntToString(pollData.totalResponses),
      status: mapPollStatus(status),
    }

    return poll
  } catch (error) {
    console.error('Error fetching poll by ID from contract:', error)
    return null
  }
}

/**
 * Fetch poll responses from contract
 */
export async function getPollResponsesFromContract(pollId: string): Promise<any[]> {
  try {
    // First get all respondents
    const respondents = await readContract(config, {
      ...CONTRACT_CONFIG,
      functionName: 'getPollRespondents',
      args: [BigInt(pollId)],
    }) as string[]

    const responses = []

    // For each respondent, get their response details
    for (const respondent of respondents) {
      try {
        // Read from the pollResponses mapping
        const responseData = await readContract(config, {
          ...CONTRACT_CONFIG,
          functionName: 'pollResponses',
          args: [BigInt(pollId), respondent],
        }) as any

        // Only include if they have responded (timestamp > 0)
        if (responseData.timestamp > 0n) {
          responses.push({
            id: `response-${pollId}-${respondent}`,
            pollId: pollId,
            respondent: respondent,
            optionIndex: bigIntToString(responseData.optionIndex),
            timestamp: bigIntToString(responseData.timestamp),
          })
        }
      } catch (err) {
        console.error(`Error fetching response for ${respondent}:`, err)
      }
    }

    return responses
  } catch (error) {
    console.error('Error fetching poll responses from contract:', error)
    return []
  }
}
