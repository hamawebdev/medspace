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

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
          icon: CheckCircle,
        };
      case 'IN_PROGRESS':
        return {
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
          icon: Play,
        };
      case 'NOT_STARTED':
        return {
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
          icon: Clock,
        };
      default:
        return {
          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
          icon: AlertCircle,
        };
    }
  };

  // Get performance color based on percentage
  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-[calc(var(--spacing)*4)]">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            Recent Activity
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Chargement de votre activité récente...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-[calc(var(--spacing)*4)] bg-muted/30 rounded-lg animate-pulse">
            <div className="flex items-center gap-[calc(var(--spacing)*3)] mb-[calc(var(--spacing)*3)]">
              <div className="h-8 w-8 bg-muted rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded mb-[calc(var(--spacing)*2)]"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </div>
            <div className="flex gap-[calc(var(--spacing)*2)]">
              <div className="h-5 w-16 bg-muted rounded"></div>
              <div className="h-5 w-20 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-[calc(var(--spacing)*4)]">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          Recent Activity
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Votre dernière session d'étude
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!session ? (
          <div className="text-center py-[calc(var(--spacing)*8)] text-muted-foreground">
            Aucun élément disponible.
          </div>
        ) : (
          <div className="p-[calc(var(--spacing)*4)] bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-[calc(var(--spacing)*3)] mb-[calc(var(--spacing)*4)]">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                {(() => {
                  const Icon = getSessionIcon(session.type);
                  return <Icon className="h-4 w-4 text-primary" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base line-clamp-1 mb-1">
                  {session.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-[calc(var(--spacing)*2)]">
                  {session.createdAt && formatDistanceToNow(new Date(session.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-[calc(var(--spacing)*3)] mb-[calc(var(--spacing)*3)]">
              <Badge variant="outline" className="text-xs">
                {session.type}
              </Badge>
              
              {(() => {
                const statusInfo = getStatusInfo(session.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <Badge variant="outline" className={cn("text-xs flex items-center gap-1", statusInfo.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {session.status}
                  </Badge>
                );
              })()}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[calc(var(--spacing)*4)]">
                <div className="text-center">
                  <div className={cn("text-lg font-bold", getPerformanceColor(session.percentage))}>
                    {session.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">
                    {session.score.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
              </div>
              
              {session.status === 'IN_PROGRESS' && (
                <Button size="sm" variant="outline" className="text-xs">
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
