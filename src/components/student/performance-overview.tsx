// @ts-nocheck
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BookOpen,
  GraduationCap,
  Flame,
  Award,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceOverviewProps {
  performance: {
    studyStreak: number
    improvementTrend: number
    weeklyStats: Array<{
      week: string
      sessionsCompleted: number
      averageScore: number
    }>
    subjectPerformance: Array<{
      subject: string
      averageScore: number
      totalSessions: number
    }>
  } | null
}

export function PerformanceOverview({ performance }: PerformanceOverviewProps) {
  if (!performance) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-background/95 via-accent/8 to-muted/12 border border-border/50 shadow-xl">
        {/* Enhanced background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-1/15 to-chart-2/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-chart-3/12 to-chart-5/15 rounded-full blur-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>

        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-[calc(var(--spacing)*2)] tracking-tight text-lg">
            <div className="p-[calc(var(--spacing)*1)] bg-gradient-to-r from-chart-1/20 to-chart-2/20 rounded-lg">
              <BarChart3 className="h-4 w-4 text-chart-1" />
            </div>
            Performance Overview
          </CardTitle>
          <CardDescription className="leading-relaxed pl-[calc(var(--spacing)*7)]">Loading your performance data...</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[calc(var(--spacing)*4)] sm:gap-[calc(var(--spacing)*5)]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gradient-to-br from-muted/30 to-muted/20 rounded-xl p-[calc(var(--spacing)*4)] animate-pulse border border-muted/30">
                <div className="h-4 bg-muted rounded mb-[calc(var(--spacing)*3)]"></div>
                <div className="h-8 bg-muted rounded mb-[calc(var(--spacing)*2)]"></div>
                <div className="h-3 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate metrics from API data
  const totalSessions = performance.weeklyStats.reduce((sum, week) => sum + week.sessionsCompleted, 0)
  const totalQuestions = totalSessions * 10 // Estimate 10 questions per session
  const totalSubjects = performance.subjectPerformance.length
  
  // Calculate average score from subject performance
  const averageScore = performance.subjectPerformance.length > 0
    ? Math.round(performance.subjectPerformance.reduce((sum, subject) => sum + subject.averageScore, 0) / performance.subjectPerformance.length)
    : 0

  // Get trend direction
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return TrendingUp
    if (trend < 0) return TrendingDown
    return Minus
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-chart-2'
    if (trend < 0) return 'text-destructive'
    return 'text-muted-foreground'
  }

  const TrendIcon = getTrendIcon(performance.improvementTrend)

  const metrics = [
    {
      label: 'Study Streak',
      value: performance.studyStreak,
      unit: 'days',
      icon: Flame,
      gradient: 'from-chart-5 to-orange-500',
      bgGradient: 'from-chart-5/10 to-orange-500/10',
      description: 'Consecutive study days'
    },
    {
      label: 'Total Questions',
      value: totalQuestions.toLocaleString(),
      unit: '',
      icon: BookOpen,
      gradient: 'from-chart-1 to-blue-500',
      bgGradient: 'from-chart-1/10 to-blue-500/10',
      description: 'Questions answered'
    },
    {
      label: 'Sessions',
      value: totalSessions.toLocaleString(),
      unit: '',
      icon: GraduationCap,
      gradient: 'from-chart-2 to-green-500',
      bgGradient: 'from-chart-2/10 to-green-500/10',
      description: 'Sessions completed'
    },
    {
      label: 'Average Score',
      value: averageScore,
      unit: '%',
      icon: Award,
      gradient: 'from-chart-3 to-purple-500',
      bgGradient: 'from-chart-3/10 to-purple-500/10',
      description: 'Overall performance'
    }
  ]

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background/95 via-accent/8 to-muted/12 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Enhanced background elements for visual depth */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-chart-1/15 to-chart-2/25 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-chart-3/12 to-chart-5/22 rounded-full blur-2xl"></div>
      <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-accent/10 to-muted/12 rounded-full blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>

      <CardHeader className="relative pb-[calc(var(--spacing)*4)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)]">
          <div className="space-y-[calc(var(--spacing)*1)] min-w-0 flex-1">
            <CardTitle className="flex items-center gap-[calc(var(--spacing)*2)] tracking-tight text-lg sm:text-xl">
              <div className="p-[calc(var(--spacing)*1)] bg-gradient-to-r from-chart-1/20 to-chart-2/20 rounded-lg">
                <BarChart3 className="h-4 w-4 text-chart-1 flex-shrink-0" />
              </div>
              <span className="truncate">Performance Overview</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-[calc(var(--spacing)*2)] leading-relaxed text-sm pl-[calc(var(--spacing)*7)]">
              <div className="p-[calc(var(--spacing)*0.5)] bg-gradient-to-r from-muted/20 to-muted/10 rounded-full">
                <TrendIcon className={cn("h-3 w-3 flex-shrink-0", getTrendColor(performance.improvementTrend))} />
              </div>
              <span className="truncate">
                {performance.improvementTrend === 0
                  ? "Steady progress"
                  : performance.improvementTrend > 0
                    ? `Improving by ${performance.improvementTrend}%`
                    : `Declining by ${Math.abs(performance.improvementTrend)}%`
                }
              </span>
            </CardDescription>
          </div>

          <Badge variant="outline" className="bg-card/50 backdrop-blur-sm text-xs font-medium self-start sm:self-auto flex-shrink-0 border-chart-1/30">
            {totalSubjects} Subject{totalSubjects !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[calc(var(--spacing)*4)] sm:gap-[calc(var(--spacing)*5)]">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            const isPrimary = index < 2 // First two metrics get primary treatment

            return (
              <div
                key={metric.label}
                className={cn(
                  "relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                  "bg-gradient-to-br rounded-xl border shadow-lg hover:shadow-xl",
                  isPrimary ? "p-[calc(var(--spacing)*5)] border-white/30" : "p-[calc(var(--spacing)*4)] border-white/20",
                  "hover:border-white/40",
                  metric.bgGradient
                )}
              >
                {/* Enhanced background gradient */}
                <div className={cn(
                  "absolute top-0 right-0 rounded-full blur-2xl transition-opacity group-hover:opacity-30",
                  isPrimary ? "w-20 h-20 opacity-25" : "w-16 h-16 opacity-20",
                  "bg-gradient-to-br", metric.gradient
                )}></div>

                {/* Subtle overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-xl"></div>

                <div className="relative">
                  {/* Enhanced Icon */}
                  <div className="flex items-center justify-center mb-[calc(var(--spacing)*3)]">
                    <div className={cn(
                      "rounded-xl bg-gradient-to-r shadow-lg group-hover:scale-110 transition-all duration-300",
                      isPrimary ? "p-[calc(var(--spacing)*2.5)]" : "p-[calc(var(--spacing)*2)]",
                      metric.gradient
                    )}>
                      <Icon className={cn("text-white", isPrimary ? "h-5 w-5" : "h-4 w-4")} />
                    </div>
                  </div>

                  {/* Enhanced Value Display */}
                  <div className="text-center space-y-[calc(var(--spacing)*1.5)]">
                    <div className={cn(
                      "font-bold bg-gradient-to-r bg-clip-text text-transparent tracking-tight",
                      isPrimary ? "text-3xl" : "text-2xl",
                      metric.gradient
                    )}>
                      {metric.value}{metric.unit}
                    </div>
                    <div className={cn(
                      "font-semibold text-foreground/80 tracking-tight",
                      isPrimary ? "text-sm" : "text-xs"
                    )}>
                      {metric.label}
                    </div>
                    <div className={cn(
                      "text-muted-foreground leading-relaxed",
                      isPrimary ? "text-sm" : "text-xs"
                    )}>
                      {metric.description}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>


      </CardContent>
    </Card>
  )
}
