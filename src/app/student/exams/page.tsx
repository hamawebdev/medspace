// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Sparkles,
  ArrowLeft,
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  BarChart3,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorBoundary } from '@/components/error-boundary';
import { FullPageLoading } from '@/components/loading-states';
import { useStudentAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useQuizSessions } from '@/hooks/use-quiz-api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizService } from '@/lib/api-services';
import { toast } from 'sonner';
import { RetakeDialog, RetakeType } from '@/components/student/quiz/retake-dialog';
import { Skeleton, SkeletonCard, SkeletonStats } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function ExamsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useStudentAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [status, setStatus] = useState<'ALL' | 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'>('ALL');

  const { sessions, pagination, loading: sessionsLoading, error, refresh } = useQuizSessions({
    type: 'EXAM',
    page,
    limit,
    status: status === 'ALL' ? undefined : (status as any),
  });

  const [retakeDialogOpen, setRetakeDialogOpen] = useState(false);
  const [retakeSourceSessionId, setRetakeSourceSessionId] = useState<number | null>(null);
  const [retakeDefaultTitle, setRetakeDefaultTitle] = useState<string>('');

  const handleOpenRetake = (s: any) => {
    setRetakeSourceSessionId(Number(s.id));
    setRetakeDefaultTitle((s.title || '').toString());
    setRetakeDialogOpen(true);
  };

  const handleConfirmRetake = async ({ retakeType, title }: { retakeType: RetakeType; title?: string }) => {
    if (!retakeSourceSessionId) return;
    const res = await QuizService.retakeQuizSession({ originalSessionId: retakeSourceSessionId, retakeType, title });
    if (res.success) {
      const data = res.data?.data || res.data;
      const newId = data?.session?.id || data?.sessionId || data?.id;
      if (newId) router.push(`/student/session/${newId}`);
    } else {
      toast.error(res.error || 'Failed to create retake');
    }
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!sessions) return { total: 0, completed: 0, inProgress: 0, notStarted: 0, avgScore: 0 };
    
    const completed = sessions.filter((s: any) => (s.status || '').toUpperCase() === 'COMPLETED');
    const inProgress = sessions.filter((s: any) => (s.status || '').toUpperCase() === 'IN_PROGRESS');
    const notStarted = sessions.filter((s: any) => (s.status || '').toUpperCase() === 'NOT_STARTED');
    
    const avgScore = completed.length > 0 
      ? Math.round(completed.reduce((sum: number, s: any) => sum + (s.percentage || 0), 0) / completed.length)
      : 0;

    return {
      total: sessions.length,
      completed: completed.length,
      inProgress: inProgress.length,
      notStarted: notStarted.length,
      avgScore
    };
  }, [sessions]);

  if (loading) {
    return <FullPageLoading message="Loading your account..." />;
  }

  if (!isAuthenticated) return null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-chart-4 animate-pulse-soft"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-chart-4/30 animate-ping"></div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-chart-4 to-chart-5 bg-clip-text text-transparent">
                  Exam Sessions
                </h1>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">Track your exam performance and progress</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Select value={status} onValueChange={(v: any) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px] min-h-[44px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sessions</SelectItem>
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => router.push('/student/exams/create')}
                className="gap-2 bg-chart-4 hover:bg-chart-4/90 min-h-[44px] touch-target"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Exam</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>

          {/* Statistics Overview */}
          <div className="responsive-grid-1-2-4 lg:grid-cols-5">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Exams</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Not Started</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.notStarted}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.avgScore}%</p>
                  </div>
                  <Trophy className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions List */}
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
                Loading exam sessions...
              </div>
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="p-12">
                <EmptyState
                  icon={Folder}
                  title="No exam sessions yet"
                  description="Create your first exam session to start tracking your performance."
                  action={
                    <Button 
                      onClick={() => router.push('/student/exams/create')} 
                      className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <Plus className="w-4 h-4" />
                      Create Exam Session
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((s: any) => {
                const st = (s.status || '').toUpperCase();
                const clickable = st === 'COMPLETED';
                
                return (
                  <Card
                    key={s.id}
                    onClick={() => { if (clickable) router.push(`/student/sessions/${s.id}/results`); }}
                    className={cn(
                      'relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2',
                      clickable && 'cursor-pointer hover:bg-accent/10',
                      'bg-card border-border'
                    )}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : -1}
                  >
                    <div className={cn("absolute top-0 left-0 w-full h-1",
                      st === 'COMPLETED' ? "bg-success" :
                      st === 'IN_PROGRESS' ? "bg-primary" :
                      "bg-muted-foreground"
                    )} />
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg truncate">{s.title || `Exam ${s.id}`}</CardTitle>
                        <div className="flex items-center gap-2">
                          {typeof s.percentage === 'number' && (
                            <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', 
                              s.percentage >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            )}>
                              {Math.round(s.percentage)}%
                            </span>
                          )}
                          <Badge variant={st === 'COMPLETED' ? 'default' : st === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                            {st.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(s.createdAt || s.created_at || Date.now()).toLocaleDateString()}
                        </div>
                        {s.percentage && (
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4" />
                            Score: {Math.round(s.percentage)}%
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          {st === 'NOT_STARTED' && (
                            <Button size="sm" variant="default" onClick={async (e) => {
                              e.stopPropagation();
                              try { await QuizService.updateQuizSessionStatus(s.id, 'IN_PROGRESS'); } catch {}
                              router.push(`/student/session/${s.id}`)
                            }}>
                              Start Exam
                            </Button>
                          )}

                          {st === 'IN_PROGRESS' && (
                            <>
                              <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); router.push(`/student/session/${s.id}`); }}>
                                Continue
                              </Button>
                              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenRetake(s); }}>
                                Retake
                              </Button>
                            </>
                          )}

                          {st === 'COMPLETED' && (
                            <>
                              <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); router.push(`/student/sessions/${s.id}/results`); }}>
                                View Results
                              </Button>
                              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleOpenRetake(s); }}>
                                Retake
                              </Button>
                            </>
                          )}
                        </div>
                        
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('Delete this exam session?')) {
                            const res = await QuizService.deleteQuizSession(s.id);
                            if (res.success) refresh?.(); else toast.error(res.error || 'Failed to delete');
                          }
                        }}>
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!(pagination.hasPrev ?? (pagination.page > 1))}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!(pagination.hasNext ?? (pagination.page < (pagination.totalPages || 1)))}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <RetakeDialog
        open={retakeDialogOpen}
        onOpenChange={setRetakeDialogOpen}
        onConfirm={handleConfirmRetake}
        defaultTitle={retakeDefaultTitle}
      />
    </ErrorBoundary>
  );
}
