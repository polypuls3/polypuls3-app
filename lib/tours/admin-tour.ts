import type { TourConfig } from './types'

export const adminTourConfig: TourConfig = {
  role: 'admin',
  welcomeTitle: 'Welcome, Admin!',
  welcomeDescription: 'Manage the platform, monitor activity, and configure settings. This dashboard gives you full control.',
  welcomeIcon: 'Settings',
  steps: [
    {
      id: 'admin-stats',
      targetSelector: '[data-tour="admin-stats"]',
      title: 'Platform Overview',
      description: 'Monitor total polls, active polls, participants, and projects at a glance. Keep track of platform growth.',
      position: 'bottom',
    },
    {
      id: 'admin-settings',
      targetSelector: '[data-tour="admin-settings"]',
      title: 'Platform Settings',
      description: 'View and manage platform fees, treasury balance, and collected fees. Click "Full Settings" for more options.',
      position: 'bottom',
    },
    {
      id: 'admin-polls-table',
      targetSelector: '[data-tour="admin-polls-table"]',
      title: 'Manage All Polls',
      description: 'View, search, and manage all polls on the platform. End voting, enable/disable claiming, or close polls.',
      position: 'top',
    },
    {
      id: 'admin-summary',
      targetSelector: '[data-tour="admin-summary"]',
      title: 'Platform Summary',
      description: 'Detailed statistics about platform activity. Track polls, projects, and surveys in one place.',
      position: 'top',
      optional: true,
    },
    {
      id: 'admin-quick-actions',
      targetSelector: '[data-tour="admin-quick-actions"]',
      title: 'Quick Actions',
      description: 'Quick links to common admin tasks. Access settings, view polls, or create new content.',
      position: 'top',
      optional: true,
    },
  ],
}
