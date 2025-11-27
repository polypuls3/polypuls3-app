import type { TourConfig } from './types'

export const creatorTourConfig: TourConfig = {
  role: 'creator',
  welcomeTitle: 'Welcome, Creator!',
  welcomeDescription: 'Create polls, surveys, and gather community feedback. Let us show you around your dashboard.',
  welcomeIcon: 'PenTool',
  steps: [
    {
      id: 'creator-stats',
      targetSelector: '[data-tour="creator-stats"]',
      title: 'Your Dashboard Stats',
      description: 'Track your polls, surveys, projects, and total responses at a glance. These cards give you a quick overview of your activity.',
      position: 'bottom',
    },
    {
      id: 'creator-create-poll',
      targetSelector: '[data-tour="creator-create-poll"]',
      title: 'Create a Poll',
      description: 'Start gathering community opinions with a new poll. Choose options, set voting rules, and collect responses.',
      position: 'bottom',
    },
    {
      id: 'creator-create-survey',
      targetSelector: '[data-tour="creator-create-survey"]',
      title: 'Create Surveys',
      description: 'Build detailed surveys for in-depth feedback. Add multiple questions and gather comprehensive responses.',
      position: 'bottom',
    },
    {
      id: 'creator-projects',
      targetSelector: '[data-tour="creator-projects"]',
      title: 'Organize with Projects',
      description: 'Group related polls and surveys into projects. Keep your content organized and easy to manage.',
      position: 'top',
    },
    {
      id: 'creator-activity',
      targetSelector: '[data-tour="creator-activity"]',
      title: 'Recent Activity',
      description: 'View your latest polls and surveys here. Click any item to see detailed results and manage responses.',
      position: 'top',
      optional: true,
    },
  ],
}
