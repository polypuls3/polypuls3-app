import { PartialPollData, CompletePollData } from './poll-types';

const VALID_CATEGORIES = ['governance', 'development', 'marketing', 'community', 'partnerships', 'other'];
const VALID_VOTING_TYPES = ['single', 'multiple', 'ranked'];
const VALID_VISIBILITIES = ['public', 'private', 'token-gated'];

export function isCompletePollData(data: PartialPollData): data is CompletePollData {
  return (
    data.question !== null &&
    data.question.trim().length > 0 &&
    data.options !== null &&
    data.options.length >= 2 &&
    data.options.length <= 10 &&
    data.options.every(opt => opt.trim().length > 0) &&
    data.durationInDays !== null &&
    data.durationInDays > 0 &&
    data.category !== null &&
    VALID_CATEGORIES.includes(data.category) &&
    data.votingType !== null &&
    VALID_VOTING_TYPES.includes(data.votingType) &&
    data.visibility !== null &&
    VALID_VISIBILITIES.includes(data.visibility) &&
    data.projectId !== null &&
    data.rewardPool !== null
  );
}

export function validatePollData(data: PartialPollData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.question || data.question.trim().length === 0) {
    errors.push('Question is required');
  }

  if (!data.options || data.options.length < 2) {
    errors.push('At least 2 options are required');
  } else if (data.options.length > 10) {
    errors.push('Maximum 10 options allowed');
  } else if (data.options.some(opt => opt.trim().length === 0)) {
    errors.push('All options must be non-empty');
  }

  if (data.durationInDays === null || data.durationInDays <= 0) {
    errors.push('Duration must be a positive number');
  }

  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (data.votingType && !VALID_VOTING_TYPES.includes(data.votingType)) {
    errors.push(`Voting type must be one of: ${VALID_VOTING_TYPES.join(', ')}`);
  }

  if (data.visibility && !VALID_VISIBILITIES.includes(data.visibility)) {
    errors.push(`Visibility must be one of: ${VALID_VISIBILITIES.join(', ')}`);
  }

  return {
    valid: errors.length === 0 && isCompletePollData(data),
    errors,
  };
}

export function getDefaultPollData(): PartialPollData {
  return {
    question: null,
    options: null,
    durationInDays: 7, // Default 7 days
    category: null,
    votingType: 'single', // Default single choice
    visibility: 'public', // Default public
    projectId: '0', // Default no project
    rewardPool: '0', // Default no reward
  };
}

export function mergePollData(current: PartialPollData, updates: Partial<PartialPollData>): PartialPollData {
  return {
    ...current,
    ...Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== null)
    ),
  };
}
