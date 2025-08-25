// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconArrowRightDashed,
  IconChevronRight,
  IconDeviceLaptop,
  IconMoon,
  IconSun,
  IconSearch,
} from '@tabler/icons-react'
import {
  BookOpen,
  GraduationCap,
  FileText,
  Video,
  Calendar,
  Settings,
  CreditCard,
  BarChart3,
  Clock,
  Target,
  Brain,
  Stethoscope,
  TrendingUp,
  FolderOpen,
  StickyNote,
  Tags,
  ClipboardCheck
} from 'lucide-react'
import { useStudentSearch } from '@/context/student-search-context'
import { useTheme } from 'next-themes'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { SettingsService } from '@/lib/api-services'
import type { UserProfile } from '@/types/api'

export function StudentCommandMenu() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { open, setOpen } = useStudentSearch()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Load user profile for personalized search
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await SettingsService.getUserProfile()
        if (response.success && response.data) {
          setProfile(response.data)
        }
      } catch (error) {
        console.error('Error loading profile for search:', error)
      }
    }

    if (open) {
      loadProfile()
    }
  }, [open])

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  // Student dashboard navigation items (only valid routes)
  const navigationItems = [
    {
      group: 'Core',
      items: [
        { title: 'Dashboard', url: '/student/dashboard', icon: BarChart3, description: 'View your performance overview' },
        { title: 'Practice', url: '/student/practice', icon: Brain, description: 'Practice with questions' },
        { title: 'Exams', url: '/student/exams', icon: GraduationCap, description: 'Take practice exams' },
        { title: 'Course Resources', url: '/student/course-resources', icon: FolderOpen, description: 'Access course materials and resources' },
        { title: 'Analytics', url: '/student/analytics', icon: TrendingUp, description: 'Track your learning progress and performance insights' },
      ]
    },
    {
      group: 'Organization',
      items: [
        { title: 'Notes', url: '/student/notes', icon: StickyNote, description: 'Manage your study notes' },
        { title: 'Labels', url: '/student/labels', icon: Tags, description: 'Organize content with labels' },
        { title: 'Questions Reports', url: '/student/questions-reports', icon: FileText, description: 'View detailed question analysis' },
        { title: 'Todos', url: '/student/todos', icon: ClipboardCheck, description: 'Track your study tasks' },
      ]
    },
    {
      group: 'Account',
      items: [
        { title: 'Subscriptions', url: '/student/subscriptions', icon: CreditCard, description: 'Manage your study plans' },
        { title: 'Settings', url: '/student/settings', icon: Settings, description: 'Manage your account settings' },
      ]
    }
  ]

  // Quick actions based on user's current state
  const getQuickActions = () => {
    const actions = []
    
    if (profile) {
      // Personalized quick actions based on user data
      actions.push({
        title: `Continue ${profile.currentYear || 'First'} Year Studies`,
        action: () => router.push('/student/study'),
        icon: BookOpen,
        description: `Study materials for ${profile.specialty?.name || 'your specialty'}`
      })

      if (profile.subscriptions && profile.subscriptions.length > 0) {
        const activeSubscription = profile.subscriptions.find(sub => sub.status === 'ACTIVE')
        if (activeSubscription) {
          actions.push({
            title: `Access ${activeSubscription.studyPack.name}`,
            action: () => router.push('/student/study'),
            icon: GraduationCap,
            description: 'Your active study pack content'
          })
        }
      }
    }

    // General quick actions
    actions.push(
      {
        title: 'Start Practice Session',
        action: () => router.push('/student/practice'),
        icon: Brain,
        description: 'Practice with questions'
      },
      {
        title: 'View Performance',
        action: () => router.push('/student/dashboard'),
        icon: BarChart3,
        description: 'Check your progress'
      },
      {
        title: 'Take Practice Exam',
        action: () => router.push('/student/exams'),
        icon: GraduationCap,
        description: 'Simulate real exam conditions'
      },
      {
        title: 'Browse Study Packs',
        action: () => router.push('/student/discover'),
        icon: BookOpen,
        description: 'Find study materials'
      }
    )

    return actions
  }

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <ScrollArea type='hover' className='h-96 pr-1'>
          <CommandEmpty>
            <div className="flex flex-col items-center gap-2 py-6">
              <Stethoscope className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No results found.</p>
              <p className="text-xs text-muted-foreground">Try searching for study, practice, or settings.</p>
            </div>
          </CommandEmpty>

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            {getQuickActions().map((action, i) => (
              <CommandItem
                key={`quick-${i}`}
                value={action.title}
                onSelect={() => runCommand(action.action)}
              >
                <action.icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{action.title}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Navigation */}
          {navigationItems.map((group) => (
            <CommandGroup key={group.group} heading={group.group}>
              {group.items.map((item, i) => (
                <CommandItem
                  key={`${item.url}-${i}`}
                  value={`${item.title} ${item.description}`}
                  onSelect={() => runCommand(() => router.push(item.url))}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {/* User Info */}
          {profile && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Your Profile">
                <CommandItem value="profile info" className="cursor-default">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{profile.fullName}</span>
                        {profile.emailVerified && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{profile.university?.name || 'No University'}</span>
                        <span>•</span>
                        <span>{profile.currentYear || 'No Year'} Year</span>
                        <span>•</span>
                        <span>{profile.specialty?.name || 'No Specialty'}</span>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          <CommandSeparator />

          {/* Theme */}
          <CommandGroup heading='Theme'>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <IconSun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <IconMoon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <IconDeviceLaptop className="mr-2 h-4 w-4" />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
