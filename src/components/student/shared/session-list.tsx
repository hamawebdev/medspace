'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/loading-states';
import { EmptyState } from '@/components/ui/empty-state';
import { RetakeDialog, RetakeType } from '@/components/student/quiz/retake-dialog';
import { QuizService } from '@/lib/api-services';
import { toast } from 'sonner';
import { extractSessionId, validateRetakeParams } from '@/lib/utils/session-utils';
import {
  Play,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Calendar,
  BarChart3,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Utility function to normalize session data from API response
function normalizeSessionData(session: any): SessionItem {
  // Handle both sessionId and id fields from different API responses
  const id = session.id || session.sessionId;

  if (!id) {
    console.warn('Session missing both id and sessionId:', session);
  }

  return {
    id: id || 0,
    sessionId: session.sessionId,
    title: session.title || `Session ${id}`,
    status: session.status || 'NOT_STARTED',
    type: session.type || 'PRACTICE',
    createdAt: session.createdAt || new Date().toISOString(),
    completedAt: session.completedAt,
    score: session.score,
    totalQuestions: session.totalQuestions,
    correctAnswers: session.correctAnswers,
    incorrectAnswers: session.incorrectAnswers,
    questionsAnswered: session.questionsAnswered,
    questionsNotAnswered: session.questionsNotAnswered,
    timeSpent: session.timeSpent,
    percentage: session.percentage,
    averageTimePerQuestion: session.averageTimePerQuestion
  };
}

interface SessionItem {
  id: number;
  sessionId?: number; // Support both id and sessionId from API
  title: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  type: 'PRACTICE' | 'EXAM';
  createdAt: string;
  completedAt?: string | null;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  questionsAnswered?: number;
  questionsNotAnswered?: number;
  timeSpent?: number;
  percentage?: number;
  averageTimePerQuestion?: number;
}

interface PaginationInfo {
  page: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  total?: number;
}

interface SessionListProps {
  sessions: SessionItem[] | any[]; // Allow raw API data that will be normalized
  loading: boolean;
  error: string | null;
  variant: 'practice' | 'exam';
  selectedItemName?: string;
  onBack?: () => void;
  className?: string;
  pagination?: PaginationInfo | null;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
}

export function SessionList({
  sessions: rawSessions,
  loading,
  error,
  variant,
  selectedItemName,
  onBack,
  className,
  pagination,
  onPageChange,
  onRefresh
}: SessionListProps) {
  const router = useRouter();
  const [retakeDialogOpen, setRetakeDialogOpen] = useState(false);
  const [retakeSourceSessionId, setRetakeSourceSessionId] = useState<number | null>(null);
  const [retakeDefaultTitle, setRetakeDefaultTitle] = useState<string>('');

  // Normalize sessions data to handle different API response formats
  const sessions: SessionItem[] = React.useMemo(() => {
    if (!rawSessions || !Array.isArray(rawSessions)) {
      console.warn('Sessions data is not an array:', rawSessions);
      return [];
    }

    return rawSessions.map(session => {
      try {
        return normalizeSessionData(session);
      } catch (err) {
        console.error('Failed to normalize session data:', session, err);
        // Return a fallback session object
        return {
          id: session.id || session.sessionId || 0,
          title: session.title || 'Unknown Session',
          status: 'NOT_STARTED' as const,
          type: variant.toUpperCase() as 'PRACTICE' | 'EXAM',
          createdAt: new Date().toISOString(),
          totalQuestions: 0,
          score: 0,
          percentage: 0
        };
      }
    });
  }, [rawSessions, variant]);

  const handleOpenRetake = (session: SessionItem) => {
    setRetakeSourceSessionId(session.id);
    setRetakeDefaultTitle(session.title || `${variant === 'practice' ? 'Practice' : 'Exam'} ${session.id}`);
    setRetakeDialogOpen(true);
  };

  const handleConfirmRetake = async ({ retakeType, title }: { retakeType: RetakeType; title?: string }) => {
    if (!retakeSourceSessionId) {
      toast.error('No session selected for retake');
      return;
    }

    try {
      // Validate parameters before making the API call
      const validation = validateRetakeParams({
        originalSessionId: retakeSourceSessionId,
        retakeType,
        title
      });

      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid retake parameters');
        return;
      }

      console.log('🔄 [SessionList-Retake] Starting retake session creation:', {
        originalSessionId: retakeSourceSessionId,
        retakeType,
        title
      });

      const res = await QuizService.retakeQuizSession({
        originalSessionId: retakeSourceSessionId,
        retakeType,
        title
      });

      if (res.success) {
        const newId = extractSessionId(res);

        if (newId) {
          console.log('✅ [SessionList-Retake] Successfully created retake session:', newId);
          toast.success('Retake session created successfully!');
          router.push(`/session/${newId}`);
        } else {
          console.error('❌ [SessionList-Retake] Session created but ID not found in response:', res.data);
          toast.error('Session created but ID not found. Please check the session list.');
        }
      } else {
        console.error('❌ [SessionList-Retake] API returned error:', res.error);
        toast.error(res.error || 'Failed to create retake session');
      }
    } catch (error: any) {
      console.error('💥 [SessionList-Retake] Exception during retake creation:', error);

      // Provide more specific error messages
      if (error.message?.includes('404')) {
        toast.error('Original session not found. Please try again.');
      } else if (error.message?.includes('403')) {
        toast.error('You do not have permission to retake this session.');
      } else if (error.message?.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(error?.message || 'Failed to create retake session');
      }
    } finally {
      setRetakeDialogOpen(false);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm(`Delete this ${variant} session? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await QuizService.deleteQuizSession(sessionId);
      if (res.success) {
        toast.success('Session deleted successfully');
        onRefresh?.();
      } else {
        toast.error(res.error || 'Failed to delete session');
      }
    } catch (error: any) {
      // Handle specific error cases with user-friendly messages
      let errorMessage = 'Failed to delete session';

      if (error?.message) {
        if (error.message.includes('Session not found')) {
          errorMessage = 'Session not found. It may have already been deleted.';
        } else if (error.message.includes('Authentication required')) {
          errorMessage = 'Please log in again to delete sessions.';
        } else if (error.message.includes('Access denied')) {
          errorMessage = 'You can only delete your own sessions.';
        } else if (error.message.includes('Valid session ID is required')) {
          errorMessage = 'Invalid session. Please refresh the page and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
      console.error('Session deletion error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-chart-1" />;
      case 'IN_PROGRESS':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'ABANDONED':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'IN_PROGRESS':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'ABANDONED':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const handleSessionClick = (session: SessionItem) => {
    if (session.status === 'COMPLETED') {
      router.push(`/session/${session.id}/results`);
    } else if (session.status === 'IN_PROGRESS') {
      router.push(`/session/${session.id}`);
    } else {
      // For NOT_STARTED sessions, we might want to start them
      router.push(`/session/${session.id}`);
    }
  };

  const formatTimeSpent = (seconds?: number) => {
    if (!seconds || seconds <= 0) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return format(date, 'MMM dd, yyyy');
    } catch (err) {
      console.warn('Failed to format date:', dateString, err);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-lg font-medium">Loading sessions...</p>
          <p className="text-sm text-muted-foreground">
            Fetching {variant} sessions{selectedItemName ? ` for ${selectedItemName}` : ''}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to selection
          </Button>
        )}
        <EmptyState
          icon={XCircle}
          title="Failed to Load Sessions"
          description={error}
        />
      </div>
    );
  }

  if (sessions.length === 0) {
    // Determine if this is an error state or just empty results
    const isErrorState = error !== null;
    const emptyMessage = isErrorState
      ? error
      : `No ${variant} sessions found${selectedItemName ? ` for ${selectedItemName}` : ''}. Create your first session to get started.`;

    return (
      <div className={cn("space-y-4", className)}>
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to selection
          </Button>
        )}
        <EmptyState
          icon={isErrorState ? XCircle : (variant === 'practice' ? Play : FileText)}
          title={isErrorState ? "Unable to Load Sessions" : `No ${variant === 'practice' ? 'Practice' : 'Exam'} Sessions Found`}
          description={emptyMessage}
          action={!isErrorState ? undefined : (
            <Button onClick={onRefresh} variant="outline">
              Try Again
            </Button>
          )}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 p-2 touch-target">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-lg sm:text-xl font-semibold">
              {variant === 'practice' ? 'Practice' : 'Exam'} Sessions
            </h2>
            <Badge variant="secondary" className="text-xs">{sessions.length}</Badge>
          </div>
          {selectedItemName && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Showing sessions for {selectedItemName}
            </p>
          )}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => handleSessionClick(session)}
          >
            <CardContent className="p-4 sm:p-6">
              {/* Mobile-first responsive layout */}
              <div className="space-y-4">
                {/* Header section with icon and title */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={cn(
                    "p-2 sm:p-3 rounded-lg flex-shrink-0",
                    variant === 'practice' ? "bg-primary/10" : "bg-chart-2/10"
                  )}>
                    {variant === 'practice' ? (
                      <Play className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5",
                        variant === 'practice' ? "text-primary" : "text-chart-2"
                      )} />
                    ) : (
                      <FileText className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5",
                        variant === 'practice' ? "text-primary" : "text-chart-2"
                      )} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base sm:text-lg text-foreground leading-tight">
                        {session.title}
                      </h3>
                      <Badge className={cn("text-xs w-fit", getStatusColor(session.status))}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{session.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    
                    {/* Session details - responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{formatDate(session.createdAt)}</span>
                      </div>
                      
                      {session.totalQuestions && (
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>{session.totalQuestions} questions</span>
                        </div>
                      )}
                      
                      {session.score !== undefined && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>{session.score}%</span>
                        </div>
                      )}
                      
                      {session.timeSpent && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>{formatTimeSpent(session.timeSpent)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action buttons - responsive layout */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 border-t border-border/50">
                  <div className="flex flex-wrap gap-2 flex-1">
                    {session.status === 'NOT_STARTED' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 sm:flex-none touch-target"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await QuizService.updateQuizSessionStatus(session.id, 'IN_PROGRESS');
                          } catch {}
                          router.push(`/session/${session.id}`);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start
                      </Button>
                    )}

                    {session.status === 'IN_PROGRESS' && (
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 sm:flex-none touch-target"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/session/${session.id}`);
                        }}
                      >
                        Continue
                      </Button>
                    )}

                    {session.status === 'COMPLETED' && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 sm:flex-none touch-target"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/session/${session.id}/results`);
                          }}
                        >
                          View Results
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1 sm:flex-none touch-target"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRetake(session);
                          }}
                        >
                          Retake
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 touch-target"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleDeleteSession(session.id);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 sm:pt-6 border-t border-border">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Page {pagination.page} of {pagination.totalPages}
            {pagination.total && (
              <span className="ml-1 sm:ml-2">({pagination.total} total sessions)</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev && pagination.page <= 1}
              onClick={() => onPageChange?.(Math.max(1, pagination.page - 1))}
              className="gap-1 touch-target"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext && pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="gap-1 touch-target"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Retake Dialog */}
      <RetakeDialog
        open={retakeDialogOpen}
        onOpenChange={setRetakeDialogOpen}
        onConfirm={handleConfirmRetake}
        defaultTitle={retakeDefaultTitle}
      />
    </div>
  );
}
