export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
  },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    // customers: '/dashboard/customers',
    user: '/dashboard/eduquest-user',
    // integrations: '/dashboard/integrations',
    // settings: '/dashboard/settings',
    course: {
      all: '/dashboard/course/all-courses',
      my: '/dashboard/course/my-courses',
    },
    quest: {
      all: '/dashboard/quest/all-quests',
      my: '/dashboard/quest/my-quests',
    },
    generator: {
      upload: '/dashboard/generator/my-upload',
      quest: '/dashboard/generator/my-quest',
    },
    import: '/dashboard/import',
    badge: {
      catalogue: '/dashboard/badge/badge-catalogue',
      my: '/dashboard/badge/my-badge',
    },
    insights: {
      student: '/dashboard/insights/student',
      course: '/dashboard/insights/course',
    },
    feedback: '/dashboard/feedback'
  },
  errors: {
    notFound: '/errors/not-found',
  },
} as const;
