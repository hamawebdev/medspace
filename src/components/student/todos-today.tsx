// @ts-nocheck
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  BookOpen,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Play,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TodoItem } from '@/types/api'

interface TodosTodayProps {
  todos: TodoItem[]
  loading?: boolean
}

export function TodosToday({ todos, loading }: TodosTodayProps) {
  // Format date to DD/MM/YYYY HH:mm
  const formatDueDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Get icon for todo type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EXAM':
        return Target;
      case 'PRACTICE':
        return Play;
      case 'READING':
        return BookOpen;
      default:
        return FileText;
    }
  };

  // Get priority color using design system colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'MEDIUM':
        return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      case 'LOW':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
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
      case 'PENDING':
        return {
          color: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
          icon: Clock,
        };
      default:
        return {
          color: 'bg-muted/10 text-muted-foreground border-muted/20',
          icon: AlertCircle,
        };
    }
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/50 hover:border-primary/20">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-3 sm:gap-4 text-lg sm:text-xl font-bold text-foreground">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl border border-primary/20">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            Tâches d'aujourd'hui
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground leading-relaxed font-medium">
            Chargement de vos tâches...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 sm:p-6 bg-muted/30 rounded-lg sm:rounded-xl animate-pulse border border-border/50">
              <div className="h-4 sm:h-5 bg-muted rounded mb-2 sm:mb-3"></div>
              <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mb-3 sm:mb-4"></div>
              <div className="flex gap-2 sm:gap-3">
                <div className="h-5 sm:h-6 w-16 sm:w-20 bg-muted rounded"></div>
                <div className="h-5 sm:h-6 w-20 sm:w-24 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/50 hover:border-primary/20">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-3 sm:gap-4 text-lg sm:text-xl font-bold text-foreground">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl border border-primary/20">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          Tâches d'aujourd'hui
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground leading-relaxed font-medium">
          Vos tâches prioritaires pour aujourd'hui
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {todos.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground">
            <div className="text-base font-medium">Aucun élément disponible.</div>
          </div>
        ) : (
          todos.map((todo) => {
            const TypeIcon = getTypeIcon(todo.type);
            const statusInfo = getStatusInfo(todo.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={todo.id}
                className="p-4 sm:p-6 bg-muted/30 rounded-lg sm:rounded-xl border border-border/50 hover:bg-muted/50 transition-all duration-300 ease-out hover:shadow-sm"
              >
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl flex-shrink-0 border border-primary/20">
                    <TypeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base line-clamp-2 mb-2 text-foreground">
                      {todo.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3 font-medium">
                      {todo.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Badge variant="outline" className={cn("text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1", getPriorityColor(todo.priority))}>
                    {todo.priority}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs sm:text-sm flex items-center gap-1 font-semibold px-2 sm:px-3 py-1", statusInfo.color)}>
                    <StatusIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {todo.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 bg-chart-3/10 text-chart-3 border-chart-3/20">
                    {todo.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground font-medium">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Échéance: {formatDueDate(todo.dueDate)}</span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
