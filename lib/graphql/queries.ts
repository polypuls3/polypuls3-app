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
      }
    }
  `;

  const data = await querySubgraph<{ polls: Poll[] }>(query, { creator: creator.toLowerCase() });
  return data.polls;
}

export async function getAllPolls(first: number = 10, skip: number = 0): Promise<Poll[]> {
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
