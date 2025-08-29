// @ts-nocheck
import {
  LayoutDashboard,
  Activity,
  GraduationCap,
  FolderOpen,
  BarChart3,
  StickyNote,
  Tags,
  FileText,
  ClipboardCheck,
  CreditCard,
  Settings,
  Stethoscope
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  teams: [],
  navGroups: [
    {
      title: 'Core',
      items: [
        {
          title: 'Dashboard',
          url: '/student/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Practice',
          url: '/student/practice',
          icon: Activity,
        },
        {
          title: 'Exams',
          url: '/student/exams',
          icon: GraduationCap,
        },
        {
          title: 'Course Resources',
          url: '/student/course-resources',
          icon: FolderOpen,
        },
        {
          title: 'Analytics',
          url: '/student/analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Organization',
      items: [
        {
          title: 'Notes',
          url: '/student/notes',
          icon: StickyNote,
        },
        {
          title: 'Labels',
          url: '/student/labels',
          icon: Tags,
        },
        {
          title: 'Questions Reports',
          url: '/student/questions-reports',
          icon: FileText,
        },
        {
          title: 'Todos',
          url: '/student/todos',
          icon: ClipboardCheck,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          title: 'Subscriptions',
          url: '/student/subscriptions',
          icon: CreditCard,
        },
        {
          title: 'Settings',
          url: '/student/settings',
          icon: Settings,
        },
      ],
    },
  ],
}
