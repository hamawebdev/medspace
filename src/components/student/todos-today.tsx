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

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
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
      case 'PENDING':
        return {
          color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
          icon: Clock,
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
          icon: AlertCircle,
        };
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="pb-[calc(var(--spacing)*4)]">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            Tâches d'aujourd'hui
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Chargement de vos tâches...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-[calc(var(--spacing)*4)]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-[calc(var(--spacing)*4)] bg-muted/30 rounded-lg animate-pulse">
              <div className="h-4 bg-muted rounded mb-[calc(var(--spacing)*2)]"></div>
              <div className="h-3 bg-muted rounded w-3/4 mb-[calc(var(--spacing)*2)]"></div>
              <div className="flex gap-[calc(var(--spacing)*2)]">
                <div className="h-5 w-16 bg-muted rounded"></div>
                <div className="h-5 w-20 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader className="pb-[calc(var(--spacing)*4)]">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          Tâches d'aujourd'hui
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Vos tâches prioritaires pour aujourd'hui
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-[calc(var(--spacing)*4)]">
        {todos.length === 0 ? (
          <div className="text-center py-[calc(var(--spacing)*8)] text-muted-foreground">
            Aucun élément disponible.
          </div>
        ) : (
          todos.map((todo) => {
            const TypeIcon = getTypeIcon(todo.type);
            const statusInfo = getStatusInfo(todo.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={todo.id}
                className="p-[calc(var(--spacing)*4)] bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-[calc(var(--spacing)*3)] mb-[calc(var(--spacing)*3)]">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <TypeIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {todo.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-[calc(var(--spacing)*2)]">
                      {todo.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-[calc(var(--spacing)*2)] mb-[calc(var(--spacing)*2)]">
                  <Badge variant="outline" className={cn("text-xs", getPriorityColor(todo.priority))}>
                    {todo.priority}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs flex items-center gap-1", statusInfo.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {todo.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {todo.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-[calc(var(--spacing)*2)] text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
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
