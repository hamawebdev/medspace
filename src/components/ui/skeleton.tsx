// @ts-nocheck
import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'title' | 'button' | 'avatar' | 'card'
  lines?: number
}

function Skeleton({
  className,
  variant = 'default',
  lines = 1,
  ...props
}: SkeletonProps) {
  const baseClasses = 'loading-skeleton'

  const variantClasses = {
    default: 'h-4 w-full',
    text: 'loading-skeleton-text',
    title: 'loading-skeleton-title',
    button: 'loading-skeleton-button',
    avatar: 'loading-skeleton-avatar',
    card: 'loading-skeleton-card'
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              index === lines - 1 && 'w-2/3',
              className
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      data-slot='skeleton'
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
}

// Enhanced skeleton components for common patterns
function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 sm:p-6 space-y-4', className)} {...props}>
      <Skeleton variant="title" />
      <Skeleton variant="text" lines={3} />
      <div className="flex justify-between items-center">
        <Skeleton variant="button" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

function SkeletonStats({
  items = 5,
  className,
  ...props
}: { items?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('responsive-grid-1-2-4 lg:grid-cols-5', className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="p-4 sm:p-6 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            </div>
            <Skeleton className="h-6 w-6 rounded flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonStats }
