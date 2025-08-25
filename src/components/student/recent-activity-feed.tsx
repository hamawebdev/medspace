// @ts-nocheck
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  BookOpen,
  Target,
  Calendar,
  Play,
  BarChart3,
  Award,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { useQuizSessions } from '@/hooks/use-quiz-api'
import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RecentActivity {
  date: string
  activity: string
  score: number
  type: 'PRACTICE' | 'EXAM'
  subject: string
  sessionId?: number
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | string
}

interface RecentActivityFeedProps {
  activities: RecentActivity[]
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const router = useRouter();

  // Fetch recent completed sessions to supplement the activities data
  const { sessions: recentSessions, loading: sessionsLoading } = useQuizSessions({
    status: 'COMPLETED',
    limit: 5,
  });

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PRACTICE' | 'EXAM'>('ALL');

  // Combine API activities with recent session data
  const combinedActivities = useMemo(() => {
    const apiActivities = (activities || []).map(a => ({ ...a }));

    // Convert recent sessions to activity format with sessionId/status for navigation
    const sessionActivities = (recentSessions || []).map(session => ({
      date: session.completedAt || session.createdAt,
      activity: `Completed ${session.sessionType === 'PRACTICE' ? 'Practice' : 'Exam'} Session - ${session.title || 'Quiz Session'}`,
      score: Math.round(session.finalScore || 0),
      type: session.sessionType || 'PRACTICE',
      subject: session.subject || 'General',
      sessionId: session.id,
      status: session.status,
    }));

    // Merge and deduplicate activities, sort by date
    const allActivities = [...apiActivities, ...sessionActivities];
    const uniqueActivities = allActivities.filter((activity, index, self) =>
      index === self.findIndex(a => a.date === activity.date && a.activity === activity.activity)
    );

    return uniqueActivities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8); // Keep more to allow filtering to still show up to ~4
  }, [activities, recentSessions]);

  const filteredActivities = useMemo(() => {
    if (typeFilter === 'ALL') return combinedActivities.slice(0, 4);
    return combinedActivities.filter(a => a.type === typeFilter).slice(0, 4);
  }, [combinedActivities, typeFilter]);

  const navigateToSession = (a?: RecentActivity) => {
    const id = a?.sessionId;
    const status = a?.status;
    if (!id) {
      router.push('/student/practice');
      return;
    }
    if (status === 'COMPLETED') {
      router.push(`/student/session/${id}/results`);
    } else {
      router.push(`/student/session/${id}`);
    }
  };

  // If there are no activities at all, render the empty state regardless of loading status to avoid undefined access
  if (!combinedActivities || combinedActivities.length === 0) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-background/95 via-accent/8 to-muted/12 border border-border/50 shadow-xl">
        {/* Enhanced background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-chart-1/15 to-chart-2/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-chart-3/12 to-chart-5/15 rounded-full blur-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>

        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-[calc(var(--spacing)*2)] tracking-tight text-lg">
            <div className="p-[calc(var(--spacing)*1)] bg-gradient-to-r from-chart-1/20 to-chart-2/20 rounded-lg">
              <Clock className="h-4 w-4 text-chart-1" />
            </div>
            Recent Activity
          </CardTitle>
          <CardDescription className="leading-relaxed pl-[calc(var(--spacing)*7)]">Your recent study sessions will appear here</CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-center py-[calc(var(--spacing)*8)]">
            <div className="p-[calc(var(--spacing)*4)] bg-gradient-to-r from-muted/20 to-muted/10 rounded-full w-fit mx-auto mb-[calc(var(--spacing)*4)]">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight mb-[calc(var(--spacing)*2)]">No Recent Activity</h3>
            <p className="text-muted-foreground mb-[calc(var(--spacing)*6)] font-medium leading-relaxed max-w-sm mx-auto">Start your learning journey and track your progress here</p>
            <Button onClick={() => router.push('/student/practice')} className="gap-[calc(var(--spacing)*2)] bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold tracking-tight">
              <Play className="h-4 w-4" />
              Start Your First Session
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get the most recent activity for highlighting
  const mostRecentActivity = combinedActivities[0]
  const otherActivities = combinedActivities.slice(1, 4) // Show up to 3 additional activities

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'EXAM':
        return Award
      case 'PRACTICE':
        return Target
      default:
        return BookOpen
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-chart-2 bg-chart-2/10'
    if (score >= 70) return 'text-chart-3 bg-chart-3/10'
    if (score >= 50) return 'text-chart-1 bg-chart-1/10'
    return 'text-destructive bg-destructive/10'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EXAM':
        return 'bg-chart-5/10 text-chart-5 border-chart-5/20'
      case 'PRACTICE':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20'
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20'
    }
  }

  const formatActivityDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background/95 via-accent/8 to-muted/12 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Enhanced background elements for visual depth */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-chart-1/15 to-chart-2/25 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-chart-3/12 to-chart-5/18 rounded-full blur-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5"></div>

      <CardHeader className="relative pb-[calc(var(--spacing)*4)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)]">
          <div className="space-y-[calc(var(--spacing)*1)] min-w-0 flex-1">
            <CardTitle className="flex items-center gap-[calc(var(--spacing)*2)] tracking-tight text-lg sm:text-xl">
              <div className="p-[calc(var(--spacing)*1)] bg-gradient-to-r from-chart-1/20 to-chart-2/20 rounded-lg">
                <Clock className="h-4 w-4 text-chart-1 flex-shrink-0" />
              </div>
              <span className="truncate">Recent Activity</span>
            </CardTitle>
            <CardDescription className="leading-relaxed text-sm pl-[calc(var(--spacing)*7)]">
              {sessionsLoading ? 'Loading recent sessions...' : 'Your latest study sessions and progress'}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-muted-foreground">Filter:</div>
            <div className="flex rounded-md overflow-hidden border border-border/30">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={cn('px-3 py-1.5 text-xs', typeFilter==='ALL' ? 'bg-card text-foreground' : 'bg-background/50 text-muted-foreground')}
              >All</button>
              <button
                onClick={() => setTypeFilter('PRACTICE')}
                className={cn('px-3 py-1.5 text-xs border-l border-border/30', typeFilter==='PRACTICE' ? 'bg-card text-foreground' : 'bg-background/50 text-muted-foreground')}
              >Practice</button>
              <button
                onClick={() => setTypeFilter('EXAM')}
                className={cn('px-3 py-1.5 text-xs border-l border-border/30', typeFilter==='EXAM' ? 'bg-card text-foreground' : 'bg-background/50 text-muted-foreground')}
              >Exam</button>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/student/analytics')} className="bg-card/50 backdrop-blur-sm gap-[calc(var(--spacing)*2)] font-medium self-start sm:self-auto flex-shrink-0 border-chart-1/30 hover:border-chart-1/50 transition-all">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-[calc(var(--spacing)*4)]">
        {/* Enhanced Most Recent Activity - Featured */}
        <div className="relative group">
          <div className="bg-gradient-to-r from-chart-1/12 to-chart-2/12 rounded-xl p-[calc(var(--spacing)*5)] border border-chart-1/20 hover:border-chart-1/30 transition-all duration-300 shadow-lg hover:shadow-xl">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 rounded-xl"></div>

            <div className="relative">
              <button onClick={() => navigateToSession(mostRecentActivity as any)} className="w-full text-left">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[calc(var(--spacing)*4)] mb-[calc(var(--spacing)*4)]">
                  <div className="flex items-center gap-[calc(var(--spacing)*4)] min-w-0 flex-1">
                    <div className="p-[calc(var(--spacing)*2.5)] bg-gradient-to-r from-chart-1 to-chart-2 rounded-xl flex-shrink-0 shadow-lg">
                      {(() => {
                        const Icon = getActivityIcon(mostRecentActivity.type)
                        return <Icon className="h-5 w-5 text-white" />
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base line-clamp-1 tracking-tight mb-[calc(var(--spacing)*1)]">
                        {mostRecentActivity.activity}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed truncate">
                        {mostRecentActivity.subject} • {formatActivityDate(mostRecentActivity.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-[calc(var(--spacing)*2)] flex-shrink-0 self-start sm:self-auto">
                    <Badge variant="outline" className={`${getTypeColor(mostRecentActivity.type)} text-xs font-medium border-current/30`}>
                      {mostRecentActivity.type}
                    </Badge>
                    <Badge variant="outline" className={`${getScoreColor(mostRecentActivity.score)} text-sm font-semibold tracking-tight border-current/30`}>
                      {mostRecentActivity.score}%
                    </Badge>
                  </div>
                </div>
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-[calc(var(--spacing)*3)] sm:gap-[calc(var(--spacing)*4)] text-sm text-muted-foreground font-medium leading-relaxed">
                  <div className="flex items-center gap-[calc(var(--spacing)*2)]">
                    <div className="p-[calc(var(--spacing)*1)] bg-chart-2/20 rounded-full">
                      <CheckCircle className="h-3 w-3 text-chart-2 flex-shrink-0" />
                    </div>
                    <span>{mostRecentActivity.status === 'COMPLETED' ? 'Completed' : 'In Progress'}</span>
                  </div>
                  <div className="flex items-center gap-[calc(var(--spacing)*2)]">
                    <div className="p-[calc(var(--spacing)*1)] bg-chart-3/20 rounded-full">
                      <Calendar className="h-3 w-3 text-chart-3 flex-shrink-0" />
                    </div>
                    <span className="hidden sm:inline">{new Date(mostRecentActivity.date).toLocaleDateString()}</span>
                    <span className="sm:hidden">{new Date(mostRecentActivity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <Button onClick={() => navigateToSession(mostRecentActivity as any)} variant="ghost" size="sm" className="h-9 px-[calc(var(--spacing)*4)] text-sm font-medium self-start sm:self-auto bg-card/50 hover:bg-card/70 transition-all">
                  {mostRecentActivity.status === 'COMPLETED' ? 'Review' : 'Resume'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Earlier Sessions */}
        {otherActivities.length > 0 && (
          <div className="space-y-[calc(var(--spacing)*3)]">
            <div className="flex items-center gap-[calc(var(--spacing)*3)]">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
              <h4 className="text-sm font-semibold text-muted-foreground tracking-tight">Earlier Sessions</h4>
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
            </div>

            <div className="grid grid-cols-1 gap-[calc(var(--spacing)*2)]">
              {otherActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type)

                return (
                  <button
                    key={`${activity.date}-${index}`}
                    onClick={() => navigateToSession(activity as any)}
                    className="group flex items-center gap-[calc(var(--spacing)*3)] p-[calc(var(--spacing)*4)] bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm rounded-lg border border-border/20 hover:border-border/40 transition-all duration-300 cursor-pointer hover:shadow-md text-left"
                  >
                    <div className="p-[calc(var(--spacing)*2)] bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg group-hover:from-chart-1/20 group-hover:to-chart-2/20 transition-all duration-300">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-chart-1 transition-colors" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1 tracking-tight mb-[calc(var(--spacing)*0.5)]">
                        {activity.activity}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {activity.subject} • {formatActivityDate(activity.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-[calc(var(--spacing)*2)]">
                      <Badge variant="outline" className={`${getScoreColor(activity.score)} text-xs font-semibold border-current/30`}>
                        {activity.score}%
                      </Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Enhanced Quick Action */}
        <div className="pt-[calc(var(--spacing)*5)] border-t border-gradient-to-r from-transparent via-border to-transparent">
          <div className="bg-gradient-to-r from-background/50 to-card/30 rounded-lg p-[calc(var(--spacing)*4)] border border-border/30">
            <div className="text-center mb-[calc(var(--spacing)*3)]">
              <h4 className="text-sm font-semibold text-muted-foreground tracking-tight">Ready for More?</h4>
              <p className="text-xs text-muted-foreground mt-[calc(var(--spacing)*1)]">Continue your learning journey</p>
            </div>
            <Button onClick={() => router.push('/student/practice')} className="w-full gap-[calc(var(--spacing)*2)] bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold tracking-tight">
              <Play className="h-4 w-4" />
              Start New Session
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
