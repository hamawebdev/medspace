// @ts-nocheck
import { Database, Users, CreditCard, FileQuestion, BarChart3, Settings, HelpCircle, Key, FolderOpen } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin User',
    email: 'admin@medcortex.com',
    avatar: '/images/avatars/default.jpg',
  },
  teams: [
    {
      name: 'MedCortex Admin',
      logo: Settings,
      plan: 'Administration',
    },
  ],
  navGroups: [
    {
      title: 'Dashboard',
      items: [
        {
          title: 'Overview',
          url: '/admin/dashboard',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'User Management',
      items: [
        {
          title: 'All Users',
          url: '/admin/users',
          icon: Users,
        },
        {
          title: 'Subscriptions',
          url: '/admin/subscriptions',
          icon: CreditCard,
        },
        {
          title: 'Activation Codes',
          url: '/admin/activation-codes',
          icon: Key,
        },
      ],
    },
    {
      title: 'Content Management',
      items: [
        {
          title: 'Questions',
          url: '/admin/questions',
          icon: HelpCircle,
        },
        {
          title: 'Question Import',
          url: '/admin/content',
          icon: Database,
        },
        {
          title: 'Course Resources',
          url: '/admin/course-resources',
          icon: FolderOpen,
        },
        {
          title: 'Question Reports',
          url: '/admin/reports',
          icon: FileQuestion,
        },
      ],
    },
  ],
}
