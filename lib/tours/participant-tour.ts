import type { TourConfig } from './types'

export const participantTourConfig: TourConfig = {
  role: 'participant',
  welcomeTitle: 'Welcome, Voter!',
  welcomeDescription: 'Your voice matters - participate in community decisions and make your opinions count.',
  welcomeIcon: 'Vote',
  steps: [
    {
      id: 'participant-search',
      targetSelector: '[data-tour="participant-search"]',
      title: 'Find Polls',
      description: 'Search and filter polls by keywords or category. Find the topics that matter most to you.',
      position: 'bottom',
    },
    {
      id: 'participant-filters',
      targetSelector: '[data-tour="participant-filters"]',
      title: 'Filter by Category',
      description: 'Browse polls by category to focus on specific topics. Click any category to filter the list.',
      position: 'bottom',
    },
    {
      id: 'participant-sort',
      targetSelector: '[data-tour="participant-sort"]',
      title: 'Sort Options',
      description: 'Sort polls by newest, oldest, ending soon, or most votes. Find what interests you quickly.',
      position: 'bottom',
    },
    {
      id: 'participant-stats',
      targetSelector: '[data-tour="participant-stats"]',
      title: 'Track Your Progress',
      description: 'See active polls, your votes, and total participants. Track your engagement with the community.',
      position: 'bottom',
    },
    {
      id: 'participant-poll-card',
      targetSelector: '[data-tour="participant-poll-card"]',
      title: 'Active Polls',
      description: 'Browse active polls and see voting deadlines. Click "Vote Now" to cast your vote and earn rewards!',
      position: 'top',
      optional: true,
    },
  ],
}
