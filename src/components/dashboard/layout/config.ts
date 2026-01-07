import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  {
    key: 'course',
    title: 'Course',
    icon: 'book',
    items: [
      {
        key: 'all-courses',
        title: 'All Courses',
        href: paths.dashboard.course.all
      },
      {
        key: 'my-courses',
        title: 'My Courses',
        href: paths.dashboard.course.my
      }
    ]
  },
  {
    key: 'quest',
    title: 'Quest',
    icon: 'sword',
    items: [
      {
        key: 'all-quests',
        title: 'All Quests',
        href: paths.dashboard.quest.all
      },
      {
        key: 'my-quests',
        title: 'My Quests',
        href: paths.dashboard.quest.my
      }
    ]
  },
  {
    key: 'badge',
    title: 'Badge',
    icon: 'badge',
    items: [
      {
        key: 'my-quest',
        title: 'Badge Catalogue',
        href: paths.dashboard.badge.catalogue
      },
      {
        key: 'my-badges',
        title: 'My Badges',
        href: paths.dashboard.badge.my
      }
    ]
  },
  {
    key: 'generator',
    title: 'Quest Generator',
    icon: 'magic-wand',
    items: [
      {
        key: 'my-upload',
        title: 'Upload Document',
        href: paths.dashboard.generator.upload
      },
      {
        key: 'my-quest',
        title: 'Generate Quest',
        href: paths.dashboard.generator.quest
      }
    ],
  },
  {
    key: 'import',
    title: 'Import',
    href: paths.dashboard.import,
    icon: 'upload',
    matcher: { type: 'startsWith', href: paths.dashboard.import },
  },
  {
    key: 'insights',
    title: 'Insights',
    icon: 'chart-bar-horizontal',
    items: [
      {
        key: 'student',
        title: 'Students',
        href: paths.dashboard.insights.student
      },
      {
        key: 'course',
        title: 'Courses',
        href: paths.dashboard.insights.course
      },
      {
        key: 'attendance',
        title: 'Attendance',
        href: paths.dashboard.attendance
      }
    ]
  },
  {
    key: 'eduquest-user',
    title: 'Eduquest Users',
    href: paths.dashboard.user,
    icon: 'users'
  },
  {
    key: 'feedback',
    title: 'Feedback',
    href: paths.dashboard.feedback,
    icon: 'chat-circle-dots',
    matcher: { type: 'startsWith', href: paths.dashboard.feedback },
  },
  // { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  // { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, icon: 'plugs-connected' },
  // { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'profile', title: 'Profile', href: paths.dashboard.account, icon: 'user' },
  // { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },

] satisfies NavItemConfig[];
