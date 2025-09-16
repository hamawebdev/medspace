// @ts-nocheck
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  Target,
  Play,
  BarChart3,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { SessionInfo } from '@/types/api'

interface RecentActivityCardProps {
  session: SessionInfo | null
  loading?: boolean
}

export function RecentActivityCard({ session, loading }: RecentActivityCardProps) {
  // Get icon for session type
  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'EXAM':
        return Target;
      case 'PRACTICE':
        return Play;
      default:
        return BarChart3;
    }
  };

  // Get status color and icon using design system colors
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
          icon: CheckCircle,
        };
      case 'IN_PROGRESS':
        return {
          color: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
          icon: Play,
        };
      case 'NOT_STARTED':
        return {
          color: 'bg-muted/10 text-muted-foreground border-muted/20',
          icon: Clock,
        };
      default:
        return {
          color: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
          icon: AlertCircle,
        };
    }
  };

  // Get performance color based on percentage using design system colors
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-chart-5';
    if (percentage >= 60) return 'text-chart-4';
    return 'text-foreground';
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/50 hover:border-primary/20">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-3 sm:gap-4 text-lg sm:text-xl font-bold text-foreground">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl border border-primary/20">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            Recent Activity
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground leading-relaxed font-medium">
            Chargement de votre activité récente...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 sm:p-6 bg-muted/30 rounded-lg sm:rounded-xl animate-pulse border border-border/50">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-muted rounded-lg sm:rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 sm:h-5 bg-muted rounded mb-2 sm:mb-3"></div>
                <div className="h-3 sm:h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="h-5 sm:h-6 w-12 sm:w-16 bg-muted rounded"></div>
              <div className="h-5 sm:h-6 w-16 sm:w-20 bg-muted rounded"></div>
            </div>
            <div className="flex justify-between">
              <div className="h-6 sm:h-8 w-16 sm:w-20 bg-muted rounded"></div>
              <div className="h-8 sm:h-10 w-20 sm:w-24 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-3 sm:gap-4 text-lg sm:text-xl font-bold text-foreground">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl border border-primary/20">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          Recent Activity
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground leading-relaxed font-medium">
          Votre dernière session d'étude
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!session ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground">
            <div className="text-base font-medium">Aucun élément disponible.</div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 bg-muted/30 rounded-lg sm:rounded-xl border border-border/50 hover:bg-muted/50 transition-all duration-300 ease-out hover:shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl flex-shrink-0 border border-primary/20">
                {(() => {
                  const Icon = getSessionIcon(session.type);
                  return <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base sm:text-lg line-clamp-1 mb-2 text-foreground">
                  {session.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground font-medium mb-3">
                  {session.createdAt && formatDistanceToNow(new Date(session.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Badge variant="outline" className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 bg-chart-3/10 text-chart-3 border-chart-3/20">
                {session.type}
              </Badge>

              {(() => {
                const statusInfo = getStatusInfo(session.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <Badge variant="outline" className={cn("text-xs sm:text-sm flex items-center gap-1 font-semibold px-2 sm:px-3 py-1", statusInfo.color)}>
                    <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {session.status}
                  </Badge>
                );
              })()}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <div className={cn("text-xl sm:text-2xl font-bold", getPerformanceColor(session.percentage))}>
                    {session.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-semibold">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    {session.score.toFixed(1)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-semibold">Points</div>
                </div>
              </div>

              {session.status === 'IN_PROGRESS' && (
                <Button size="sm" variant="outline" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                  Continuer
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
