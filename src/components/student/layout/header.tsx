// @ts-nocheck
'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { StudentSearch } from './search'
import { StudentProfileDropdown } from './profile-dropdown'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Search, GraduationCap } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useStudentSearch } from '@/context/student-search-context'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)
  const isMobile = useIsMobile()
  const { setOpen: setSearchOpen } = useStudentSearch()

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75',
        'flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 border-b border-border/50 px-4 sm:px-6',
        'transition-all duration-200',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-lg border-border' : 'shadow-none',
        className
      )}
      {...props}
    >
      {/* Mobile Layout */}
      {isMobile ? (
        <>
          {/* Left: Hamburger Menu */}
          <SidebarTrigger
            variant='ghost'
            className='h-9 w-9 rounded-lg hover:bg-muted/50 transition-colors touch-target'
            aria-label="Open navigation menu"
          />

          {/* Center: Logo */}
          <div className='flex-1 flex justify-center'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center justify-center rounded-lg bg-primary h-8 w-8'>
                <GraduationCap className='h-4 w-4 text-white' />
              </div>
              <span className='text-lg font-bold text-foreground'>
                MedCortex
              </span>
            </div>
          </div>

          {/* Right: Search Icon + Theme Toggle + Profile */}
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='h-9 w-9 rounded-lg hover:bg-muted/50 transition-all duration-200 touch-target hover:scale-105'
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className='h-4 w-4' />
            </Button>
            <ThemeToggle />
            <StudentProfileDropdown />
          </div>
        </>
      ) : (
        <>
          {/* Desktop Layout */}
          {/* Sidebar Trigger */}
          <SidebarTrigger
            variant='ghost'
            className='h-9 w-9 rounded-lg hover:bg-muted/50 transition-colors'
          />

          {/* Separator */}
          <Separator orientation='vertical' className='h-6' />

          {/* Search Bar - Centered */}
          <div className='flex-1 flex justify-center max-w-2xl mx-auto'>
            <div className='w-full max-w-xs sm:max-w-md'>
              <StudentSearch
                className='h-9 sm:h-10 rounded-xl border-border/50 bg-muted/30 hover:bg-muted/50 focus-within:bg-background focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200'
                placeholder='Search courses, topics, questions...'
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className='flex items-center gap-3'>
            <ThemeToggle />
            <Separator orientation='vertical' className='h-6' />
            <StudentProfileDropdown />
          </div>
        </>
      )}

      {/* Custom children content */}
      {children}
    </header>
  )
}

Header.displayName = 'Header'
