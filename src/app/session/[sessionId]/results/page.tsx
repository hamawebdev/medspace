// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuizSession } from '@/hooks/use-quiz-api';
import { FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RetakeDialog, RetakeType } from '@/components/student/quiz/retake-dialog';
import { QuizService } from '@/lib/api-services';
import { toast } from 'sonner';
import { extractSessionId, validateRetakeParams } from '@/lib/utils/session-utils';
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  RotateCcw,
  ArrowLeft,
  Award,
  Target,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionStatsChart } from '@/components/student/quiz/session-stats-chart';

// Utility function to format time in mm:ss format
const formatTimeMMSS = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Interface for completion data including submit-answer response fields
interface CompletionData {
  sessionId: number;
  title: string;
  type: string;
  totalQuestions: number;
  answeredQuestions?: number; // From submit-answer response
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  percentage: number; // percentageScore from submit-answer response
  scoreOutOf20?: number; // From submit-answer response
  timeSpent: number; // From submit-answer response
  completedAt: string;
  questionSummary: any[];
  canRetake: boolean;
  status?: string; // From submit-answer response
}

export default function QuizCompletionPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = parseInt(params.sessionId as string);
  const fromExit = searchParams.get('from') === 'exit';

  // Handle invalid sessionId
  useEffect(() => {
    if (isNaN(sessionId) || sessionId <= 0) {
      console.error('Invalid session ID:', params.sessionId);
      toast.error('Invalid session ID. Redirecting to dashboard.');
      router.push('/student/practice');
    }
  }, [sessionId, router, params.sessionId]);

  const { session: apiSession, loading, error } = useQuizSession(sessionId);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [retakeDialogOpen, setRetakeDialogOpen] = useState(false);
  const [retakeDefaultTitle, setRetakeDefaultTitle] = useState<string>('');

  // Process completion data when session is available
  useEffect(() => {
    if (apiSession) {
      const sessionData = apiSession.data?.data || apiSession.data || apiSession;

      // Allow viewing results if coming from exit dialog, otherwise only show for completed sessions
      const isCompleted = sessionData.status === 'COMPLETED' || sessionData.status === 'completed';
      if (!isCompleted && !fromExit) {
        router.push(`/session/${sessionId}`);
        return;
      }

      // If coming from exit dialog but session isn't completed, show a warning
      if (!isCompleted && fromExit) {
        console.log('📊 Showing results for incomplete session from exit dialog');
        toast.info('Showing current progress. Complete the quiz to finalize your results.', {
          duration: 5000,
        });
      }

      // Use submit-answer response data if available, otherwise calculate from session data
      const totalQuestions = sessionData.totalQuestions || sessionData.questions?.length || sessionData.questionsCount || 0;
      const answeredQuestions = sessionData.answeredQuestions;
      const scoreOutOf20 = sessionData.score || 0;
      const percentageScore = sessionData.percentage || 0;
      const timeSpent = sessionData.timeSpent || 0;
      const status = sessionData.status;

      // Validate essential fields
      if (totalQuestions === 0) {
        console.warn('No questions found in session data');
        toast.error('Invalid session data: No questions found');
        return;
      }

      // Log submit-answer response data for debugging
      if (answeredQuestions !== undefined || scoreOutOf20 !== undefined) {
        console.log('📊 Submit-answer response data detected:', {
          sessionId: sessionData.id,
          scoreOutOf20,
          percentageScore,
          timeSpent,
          answeredQuestions,
          totalQuestions,
          status
        });
      }

      const answersArr = Array.isArray(sessionData.answers) ? sessionData.answers : [];

      // Calculate statistics for backward compatibility if submit-answer response data is not available
      let correctCount = 0;
      let answeredCount = answeredQuestions ?? 0;

      // If we don't have answeredQuestions from submit-answer response, calculate it
      if (sessionData.answeredQuestions === undefined) {
        answeredCount = 0;
        correctCount = 0;

        (sessionData.questions || []).forEach((question: any) => {
          const userAnswer = answersArr.find((a: any) => String(a.questionId) === String(question.id));
          const isAnswered = userAnswer && (userAnswer.selectedAnswerId || userAnswer.selectedAnswerIds?.length);
          const isCorrect = userAnswer?.isCorrect || false;

          if (isAnswered) answeredCount++;
          if (isCorrect) correctCount++;
        });
      } else {
        // Calculate correct count from percentage and answered questions
        // Handle case where no questions are answered
        if (answeredCount > 0) {
          correctCount = Math.round((percentageScore / 100) * answeredCount);
        } else {
          correctCount = 0;
        }
      }

      const questionSummary = (sessionData.questions || []).map((question: any, index: number) => {
        const userAnswer = answersArr.find((a: any) => String(a.questionId) === String(question.id));
        const isAnswered = userAnswer && (userAnswer.selectedAnswerId || userAnswer.selectedAnswerIds?.length);
        const isCorrect = userAnswer?.isCorrect || false;

        // Get answer texts
        const selectedAnswers = question.answers?.filter((a: any) => {
          if (userAnswer?.selectedAnswerIds?.length) {
            return userAnswer.selectedAnswerIds.includes(a.id);
          }
          return userAnswer?.selectedAnswerId === a.id;
        }) || [];

        const correctAnswers = question.answers?.filter((a: any) => a.isCorrect) || [];

        return {
          questionNumber: index + 1,
          question: question.questionText || question.text || question.content,
          studentAnswer: selectedAnswers.map(a => a.answerText || a.text).join(', ') || 'No answer',
          correctAnswer: correctAnswers.map(a => a.answerText || a.text).join(', '),
          isCorrect,
          isAnswered
        };
      });

      setCompletionData({
        sessionId: sessionData.id,
        title: sessionData.title || 'Quiz Session',
        type: sessionData.type || 'PRACTICE',
        totalQuestions,
        answeredQuestions: answeredCount,
        correctCount,
        incorrectCount: Math.max(0, answeredCount - correctCount),
        unansweredCount: Math.max(0, totalQuestions - answeredCount),
        percentage: percentageScore,
        scoreOutOf20,
        timeSpent,
        completedAt: sessionData.completedAt || new Date().toISOString(),
        questionSummary,
        canRetake: true, // TODO: Check retake permissions
        status
      });

      // Trigger celebration for good scores
      if (percentageScore >= 70) {
        setShowCelebration(true);
        // Note: Confetti animation would be added here with canvas-confetti library
      }
    }
  }, [apiSession, sessionId, router]);

  const handleOpenRetake = () => {
    if (completionData) {
      setRetakeDefaultTitle(completionData.title || `${completionData.type === 'EXAM' ? 'Exam' : 'Practice'} ${sessionId}`);
      setRetakeDialogOpen(true);
    }
  };

  const handleConfirmRetake = async ({ retakeType, title }: { retakeType: RetakeType; title?: string }) => {
    try {
      // Validate parameters before making the API call
      const validation = validateRetakeParams({
        originalSessionId: sessionId,
        retakeType,
        title
      });

      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid retake parameters');
        return;
      }

      console.log('🔄 [Retake] Starting retake session creation:', {
        originalSessionId: sessionId,
        retakeType,
        title
      });

      const res = await QuizService.retakeQuizSession({
        originalSessionId: sessionId,
        retakeType,
        title
      });

      if (res.success) {
        const newId = extractSessionId(res);

        if (newId) {
          console.log('✅ [Retake] Successfully created retake session:', newId);
          toast.success('Retake session created successfully!');
          router.push(`/session/${newId}`);
        } else {
          console.error('❌ [Retake] Session created but ID not found in response:', res.data);
          toast.error('Session created but ID not found. Please check the session list.');
        }
      } else {
        console.error('❌ [Retake] API returned error:', res.error);
        toast.error(res.error || 'Failed to create retake session');
      }
    } catch (error: any) {
      console.error('💥 [Retake] Exception during retake creation:', error);

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

  if (loading) {
    return <FullPageLoading message="Loading completion results..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">
              Failed to load quiz results
              {fromExit && (
                <span className="block text-sm text-muted-foreground mt-2">
                  The session may not have been submitted properly.
                </span>
              )}
            </p>
            <div className="flex flex-col gap-2">
              {fromExit && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/session/${sessionId}`)}
                >
                  Return to Quiz
                </Button>
              )}
              <Button onClick={() => router.push('/student/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!completionData) {
    return <FullPageLoading message="Processing results..." />;
  }

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Excellent', icon: Trophy, color: 'text-chart-1' };
    if (percentage >= 80) return { level: 'Great', icon: Award, color: 'text-chart-5' };
    if (percentage >= 70) return { level: 'Good', icon: Target, color: 'text-chart-2' };
    if (percentage >= 60) return { level: 'Fair', icon: TrendingUp, color: 'text-chart-4' };
    return { level: 'Needs Improvement', icon: BookOpen, color: 'text-destructive' };
  };

  const performance = getPerformanceLevel(completionData.percentage);
  const PerformanceIcon = performance.icon;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/student/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Completion Celebration */}
          <div className="text-center space-y-4">
            <div className={cn("inline-flex items-center gap-3 px-6 py-3 rounded-full",
              showCelebration ? "bg-gradient-to-r from-chart-5 to-chart-5 text-primary-foreground animate-pulse" : "bg-muted"
            )}>
              {showCelebration && <Sparkles className="h-5 w-5" />}
              <h1 className="text-2xl font-bold">Quiz Completed!</h1>
              {showCelebration && <Sparkles className="h-5 w-5" />}
            </div>
            
            <p className="text-xl text-muted-foreground">{completionData.title}</p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Completed on {new Date(completionData.completedAt).toLocaleString()}</span>
              {completionData.status && (
                <Badge variant="outline" className="text-xs">
                  Status: {completionData.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Circular Chart */}
            <Card className="lg:col-span-1">
              <SessionStatsChart
                data={{
                  totalQuestions: completionData.totalQuestions,
                  answeredQuestions: completionData.answeredQuestions || (completionData.correctCount + completionData.incorrectCount),
                  correctAnswers: completionData.correctCount,
                  incorrectAnswers: completionData.incorrectCount,
                  scoreOutOf20: completionData.scoreOutOf20,
                  percentageScore: completionData.percentage,
                  timeSpent: completionData.timeSpent,
                  status: completionData.status
                }}
                title="Session Results"
                size="md"
                showTitle={true}
                className="border-0 shadow-none"
              />
            </Card>

            {/* Statistics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">

                  <div className="text-center p-4 bg-chart-5/10 rounded-lg border border-chart-5/20">
                    <CheckCircle className="h-6 w-6 text-chart-5 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-chart-5">{completionData.correctCount}</div>
                    <div className="text-sm text-chart-5">Correct</div>
                  </div>

                  <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <XCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                    <div className="text-2xl font-bold text-destructive">{completionData.incorrectCount}</div>
                    <div className="text-sm text-destructive">Incorrect</div>
                  </div>

                  <div className="text-center p-4 bg-chart-2/10 rounded-lg border border-chart-2/20">
                    <Clock className="h-6 w-6 text-chart-2 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-chart-2">{formatTimeMMSS(completionData.timeSpent)}</div>
                    <div className="text-sm text-chart-2">Time Spent</div>
                  </div>

                </div>

                {/* Additional Submit-Answer Response Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">

                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <Award className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="text-lg font-bold text-primary">
                      {completionData.scoreOutOf20 !== undefined ? completionData.scoreOutOf20.toFixed(1) : 'N/A'}/20
                    </div>
                    <div className="text-xs text-muted-foreground">Score Out of 20</div>
                  </div>

                  <div className="text-center p-3 bg-chart-3/10 rounded-lg">
                    <Target className="h-5 w-5 text-chart-3 mx-auto mb-2" />
                    <div className="text-lg font-bold text-chart-3">
                      {completionData.answeredQuestions !== undefined
                        ? `${completionData.answeredQuestions}/${completionData.totalQuestions}`
                        : `${completionData.correctCount + completionData.incorrectCount}/${completionData.totalQuestions}`
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Answered Questions</div>
                  </div>

                  <div className="text-center p-3 bg-chart-4/10 rounded-lg">
                    <Trophy className="h-5 w-5 text-chart-4 mx-auto mb-2" />
                    <div className="text-lg font-bold text-chart-4">
                      {completionData.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Percentage Score</div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => router.push(`/session/${sessionId}/review`)}
              className="gap-2 px-6 py-3 text-lg"
            >
              <BookOpen className="h-5 w-5" />
              Review Answers
            </Button>

            {completionData.canRetake && (
              <Button
                variant="outline"
                onClick={handleOpenRetake}
                className="gap-2 px-6 py-3 text-lg"
              >
                <RotateCcw className="h-5 w-5" />
                Retake Quiz
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => router.push('/student/dashboard')}
              className="gap-2 px-6 py-3 text-lg"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Course
            </Button>
          </div>


        </div>
      </div>

      {/* Retake Dialog */}
      <RetakeDialog
        open={retakeDialogOpen}
        onOpenChange={setRetakeDialogOpen}
        onConfirm={handleConfirmRetake}
        defaultTitle={retakeDefaultTitle}
      />
    </ErrorBoundary>
  );
}
