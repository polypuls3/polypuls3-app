import { querySubgraph } from './client';

// Types matching subgraph entities
export interface Project {
  id: string;
  projectId: string;
  creator: string;
  name: string;
  description: string;
  tags: string;
  createdAt: string;
  isActive: boolean;
}

export interface Poll {
  id: string;
  pollId: string;
  creator: string;
  question: string;
  options: string[];
  createdAt: string;
  expiresAt: string;
  rewardPool: string;
  isActive: boolean;
  totalResponses: string;
  category: string;
  projectId: string;
  votingType: string;
  visibility: string;
}

export interface Survey {
  id: string;
  surveyId: string;
  creator: string;
  projectId: string;
  title: string;
  description: string;
  questions: string[];
  createdAt: string;
  expiresAt: string;
  rewardPool: string;
  isActive: boolean;
  totalResponses: string;
}

export interface PollResponse {
  id: string;
  pollId: string;
  respondent: string;
  optionIndex: string;
  timestamp: string;
  rewardClaimed: boolean;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondent: string;
  answers: string[];
  timestamp: string;
  rewardClaimed: boolean;
}

// Query functions
export async function getProjectsByCreator(creator: string): Promise<Project[]> {
  const query = `
    query GetProjectsByCreator($creator: Bytes!) {
      projects(
        where: { creator: $creator, isActive: true }
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        projectId
        creator
        name
        description
        tags
        createdAt
        isActive
      }
    }
  `;

  const data = await querySubgraph<{ projects: Project[] }>(query, { creator: creator.toLowerCase() });
  return data.projects;
}

export async function getAllProjects(first: number = 10, skip: number = 0): Promise<Project[]> {
  const query = `
    query GetAllProjects($first: Int!, $skip: Int!) {
      projects(
        first: $first
        skip: $skip
        where: { isActive: true }
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        projectId
        creator
        name
        description
        tags
        createdAt
        isActive
      }
    }
  `;

  const data = await querySubgraph<{ projects: Project[] }>(query, { first, skip });
  return data.projects;
}

export async function getPollsByCreator(creator: string): Promise<Poll[]> {
  const query = `
    query GetPollsByCreator($creator: Bytes!) {
      polls(
        where: { creator: $creator, isActive: true }
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        pollId
        creator
        question
        options
        createdAt
        expiresAt
        rewardPool
        isActive
        totalResponses
        category
        projectId
        votingType
        visibility
      }
    }
  `;

  const data = await querySubgraph<{ polls: Poll[] }>(query, { creator: creator.toLowerCase() });
  return data.polls;
}

export async function getAllPolls(first: number = 100, skip: number = 0): Promise<Poll[]> {
  const query = `
    query GetAllPolls($first: Int!, $skip: Int!) {
      polls(
        first: $first
        skip: $skip
        where: { isActive: true }
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        pollId
        creator
        question
        options
        createdAt
        expiresAt
        rewardPool
        isActive
        totalResponses
        category
        projectId
        votingType
        visibility
      }
    }
  `;

  const data = await querySubgraph<{ polls: Poll[] }>(query, { first, skip });
  return data.polls;
}

export async function getSurveysByCreator(creator: string): Promise<Survey[]> {
  const query = `
    query GetSurveysByCreator($creator: Bytes!) {
      surveys(
        where: { creator: $creator, isActive: true }
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        surveyId
        creator
        projectId
        title
        description
        questions
        createdAt
        expiresAt
        rewardPool
        isActive
        totalResponses
      }
    }
  `;

  const data = await querySubgraph<{ surveys: Survey[] }>(query, { creator: creator.toLowerCase() });
  return data.surveys;
}

export async function getSurveysByProject(projectId: string): Promise<Survey[]> {
  const query = `
    query GetSurveysByProject($projectId: String!) {
      surveys(
        where: { projectId: $projectId, isActive: true }
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        surveyId
        creator
        projectId
        title
        description
        questions
        createdAt
        expiresAt
        rewardPool
        isActive
        totalResponses
      }
    }
  `;

  const data = await querySubgraph<{ surveys: Survey[] }>(query, { projectId });
  return data.surveys;
}

export async function getPollResponses(pollId: string): Promise<PollResponse[]> {
  const query = `
    query GetPollResponses($pollId: String!) {
      pollResponses(
        where: { pollId: $pollId }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        pollId
        respondent
        optionIndex
        timestamp
        rewardClaimed
      }
    }
  `;

  const data = await querySubgraph<{ pollResponses: PollResponse[] }>(query, { pollId });
  return data.pollResponses;
}

export async function getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  const query = `
    query GetSurveyResponses($surveyId: String!) {
      surveyResponses(
        where: { surveyId: $surveyId }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        surveyId
        respondent
        answers
        timestamp
        rewardClaimed
      }
    }
  `;

  const data = await querySubgraph<{ surveyResponses: SurveyResponse[] }>(query, { surveyId });
  return data.surveyResponses;
}

export async function getUserPollResponses(respondent: string): Promise<PollResponse[]> {
  const query = `
    query GetUserPollResponses($respondent: Bytes!) {
      pollResponses(
        where: { respondent: $respondent }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        pollId
        respondent
        optionIndex
        timestamp
        rewardClaimed
      }
    }
  `;

  const data = await querySubgraph<{ pollResponses: PollResponse[] }>(query, { respondent: respondent.toLowerCase() });
  return data.pollResponses;
}

export async function getPollById(pollId: string): Promise<Poll | null> {
  const query = `
    query GetPollById($pollId: String!) {
      polls(where: { pollId: $pollId }) {
        id
        pollId
        creator
        question
        options
        createdAt
        expiresAt
        rewardPool
        isActive
        totalResponses
        category
        projectId
        votingType
        visibility
      }
    }
  `;

  const data = await querySubgraph<{ polls: Poll[] }>(query, { pollId });
  return data.polls.length > 0 ? data.polls[0] : null;
}

export async function getPollWithResponses(pollId: string): Promise<{ poll: Poll | null; responses: PollResponse[] }> {
  const [poll, responses] = await Promise.all([
    getPollById(pollId),
    getPollResponses(pollId)
  ]);

  return { poll, responses };
}

// Admin queries
export async function getAdminStats(): Promise<{
  totalPolls: number;
  activePolls: number;
  totalProjects: number;
  totalSurveys: number;
}> {
  const query = `
    query GetAdminStats {
      polls(first: 1000) {
        id
        isActive
      }
      projects(first: 1000) {
        id
      }
      surveys(first: 1000) {
        id
      }
    }
  `;

  const data = await querySubgraph<{
    polls: { id: string; isActive: boolean }[];
    projects: { id: string }[];
    surveys: { id: string }[];
  }>(query, {});

  return {
    totalPolls: data.polls.length,
    activePolls: data.polls.filter(p => p.isActive).length,
    totalProjects: data.projects.length,
    totalSurveys: data.surveys.length,
  };
}

export async function getUniqueParticipants(): Promise<number> {
  const query = `
    query GetUniqueParticipants {
      pollResponses(first: 1000) {
        respondent
      }
    }
  `;

  const data = await querySubgraph<{ pollResponses: { respondent: string }[] }>(query, {});
  const uniqueRespondents = new Set(data.pollResponses.map(r => r.respondent.toLowerCase()));

  return uniqueRespondents.size;
}

export async function getAllPollsWithDetails(first: number = 100): Promise<Poll[]> {
  return getAllPolls(first, 0);
}
