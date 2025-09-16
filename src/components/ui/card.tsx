// @ts-nocheck
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Base styling with design system tokens
        "bg-card text-card-foreground flex flex-col rounded-xl border",
        // Responsive spacing using design system
        "p-4 sm:p-6 gap-4 sm:gap-6",
        // Enhanced shadows and transitions using design system
        "shadow-sm hover:shadow-lg hover:shadow-primary/5",
        "transition-all duration-300 ease-out",
        // Subtle hover transformations
        "hover:-translate-y-1 hover:border-primary/20",
        // Layout and overflow
        "relative overflow-hidden",
        // Group class for child hover effects
        "group",
        // Border styling using design system
        "border-border/50",

        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        // Enhanced grid layout with design system spacing
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start",
        // Responsive design system spacing
        "gap-2 sm:gap-3 px-4 sm:px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4 sm:[.border-b]:pb-6",
        // Subtle animation on parent hover
        "transition-all duration-300 ease-out",
        "group-hover:translate-y-0.5",
        // Relative positioning for z-index layering
        "relative z-10",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // Responsive typography with design system tokens - Heading style
        "text-base sm:text-lg font-bold leading-tight tracking-tight text-foreground",
        // Better spacing and alignment using design system
        "flex items-center gap-2 sm:gap-3",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        // Responsive body style typography with design system tokens
        "text-sm sm:text-base text-muted-foreground leading-relaxed font-medium",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        // Responsive spacing using design system tokens
        "px-4 sm:px-6 space-y-4 sm:space-y-6",
        // Smooth transitions with better easing
        "transition-all duration-300 ease-out",
        // Subtle content shift on hover
        "group-hover:translate-y-0.5",
        // Relative positioning for layering
        "relative z-10",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 sm:px-6 [.border-t]:pt-4 sm:[.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
