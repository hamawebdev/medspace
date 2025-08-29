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
      router.push(`/session/${id}/results`);
    } else {
      router.push(`/session/${id}`);
    }
  };

  // If there are no activities at all, render the empty state regardless of loading status to avoid undefined access
  if (!combinedActivities || combinedActivities.length === 0) {
    return (
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            Recent Activity
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Your recent study sessions will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Start your learning journey and track your progress here
            </p>
            <Button
              onClick={() => router.push('/student/practice')}
              className="gap-2"
            >
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



  const formatActivityDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  return (
    <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              Recent Activity
            </CardTitle>
           
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border-border bg-background p-1">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  typeFilter === 'ALL'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('PRACTICE')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  typeFilter === 'PRACTICE'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Practice
              </button>
              <button
                onClick={() => setTypeFilter('EXAM')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  typeFilter === 'EXAM'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                Exam
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/student/analytics')}
              className="gap-2 font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Most Recent Activity - Featured */}
        <div className="group">
          <div className="bg-muted/30 rounded-lg p-4 border-border hover:bg-muted/50 transition-colors duration-200">
            <button
              onClick={() => navigateToSession(mostRecentActivity as any)}
              className="w-full text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                    {(() => {
                      const Icon = getActivityIcon(mostRecentActivity.type)
                      return <Icon className="h-4 w-4 text-primary-foreground" />
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base line-clamp-1 mb-1">
                      {mostRecentActivity.activity}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {mostRecentActivity.subject} • {formatActivityDate(mostRecentActivity.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {mostRecentActivity.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-sm font-semibold",
                      mostRecentActivity.score >= 90 && "text-chart-2 border-chart-2/20 bg-chart-2/10",
                      mostRecentActivity.score >= 70 && mostRecentActivity.score < 90 && "text-chart-1 border-chart-1/20 bg-chart-1/10",
                      mostRecentActivity.score >= 50 && mostRecentActivity.score < 70 && "text-chart-4 border-chart-4/20 bg-chart-4/10",
                      mostRecentActivity.score < 50 && "text-destructive border-destructive/20 bg-destructive/10"
                    )}
                  >
                    {mostRecentActivity.score}%
                  </Badge>
                </div>
              </div>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>{mostRecentActivity.status === 'COMPLETED' ? 'Completed' : 'In Progress'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span className="hidden sm:inline">{new Date(mostRecentActivity.date).toLocaleDateString()}</span>
                  <span className="sm:hidden">{new Date(mostRecentActivity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <Button
                onClick={() => navigateToSession(mostRecentActivity as any)}
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-sm font-medium self-start sm:self-auto"
              >
                {mostRecentActivity.status === 'COMPLETED' ? 'Review' : 'Resume'}
              </Button>
            </div>
          </div>
        </div>

        {/* Earlier Sessions */}
        {otherActivities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px bg-border flex-1"></div>
              <h4 className="text-sm font-medium text-muted-foreground">Earlier Sessions</h4>
              <div className="h-px bg-border flex-1"></div>
            </div>

            <div className="space-y-2">
              {otherActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type)

                return (
                  <button
                    key={`${activity.date}-${index}`}
                    onClick={() => navigateToSession(activity as any)}
                    className="group flex items-center gap-3 p-3 bg-background rounded-lg border-border hover:bg-muted/50 transition-colors duration-200 cursor-pointer text-left w-full"
                  >
                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1 mb-0.5">
                        {activity.activity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.subject} • {formatActivityDate(activity.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-medium",
                          activity.score >= 90 && "text-chart-2 border-chart-2/20 bg-chart-2/10",
                          activity.score >= 70 && activity.score < 90 && "text-chart-1 border-chart-1/20 bg-chart-1/10",
                          activity.score >= 50 && activity.score < 70 && "text-chart-4 border-chart-4/20 bg-chart-4/10",
                          activity.score < 50 && "text-destructive border-destructive/20 bg-destructive/10"
                        )}
                      >
                        {activity.score}%
                      </Badge>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Action */}
        <div className="pt-4 border-t border-border">
          <div className="bg-muted/20 rounded-lg p-4 border-border">
            <div className="text-center mb-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Ready for More?</h4>
              <p className="text-xs text-muted-foreground mt-1">Continue your learning journey</p>
            </div>
            <Button
              onClick={() => router.push('/student/practice')}
              className="w-full gap-2"
            >
              <Play className="h-4 w-4" />
              Start New Session
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
