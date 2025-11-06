export interface PartialPollData {
  question: string | null;
  options: string[] | null;
  durationInDays: number | null;
  category: string | null;
  votingType: string | null;
  visibility: string | null;
  projectId: string | null;
  rewardPool: string | null;
}

export interface CompletePollData {
  question: string;
  options: string[];
  durationInDays: number;
  category: string;
  votingType: string;
  visibility: string;
  projectId: string;
  rewardPool: string;
}

export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  message: string;
  pollData: PartialPollData;
  isComplete: boolean;
  nextAction: 'ask_question' | 'confirm' | 'submit';
}

export type PollCategory = 'governance' | 'development' | 'marketing' | 'community' | 'partnerships' | 'other';
export type VotingType = 'single' | 'multiple' | 'ranked';
export type Visibility = 'public' | 'private' | 'token-gated';
