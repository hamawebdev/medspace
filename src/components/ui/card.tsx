// @ts-nocheck
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Base styling with design system tokens
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6",
        // Enhanced shadows and transitions
        "shadow-sm hover:shadow-lg hover:shadow-black/5",
        "transition-all duration-300 ease-out",
        // Subtle hover transformations
        "hover:-translate-y-1 hover:border-border/60",
        // Layout and overflow
        "relative overflow-hidden",
        // Group class for child hover effects
        "group",
        // Subtle background gradient on hover
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:via-transparent before:to-black/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none",
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
        // Enhanced grid layout with better spacing
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
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
        // Enhanced typography with better hierarchy
        "leading-tight font-semibold text-base",
        // Subtle color transition on hover
        "transition-colors duration-300 ease-out",
        "group-hover:text-foreground/90",
        // Better spacing and alignment
        "flex items-center gap-2",
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
      className={cn("text-muted-foreground text-sm", className)}
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
        // Enhanced spacing and layout
        "px-6 space-y-4",
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
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
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
