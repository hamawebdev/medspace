// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart3,
  Trophy,
  Home,
  X,
  TrendingUp,
  Clock,
  Target,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { QuizStatisticsDisplay } from './quiz-statistics-display';
import { SessionStatusManager } from '@/lib/session-status-manager';
import { QuizService } from '@/lib/api-services';
import { toast } from 'sonner';

interface EnhancedExitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
  timer: any;
  localAnswers?: Record<number, any>;
  apiSessionId?: number;
  apiSessionResults?: {
    scoreOutOf20?: number;
    percentageScore?: number;
    timeSpent?: number;
    answeredQuestions?: number;
    totalQuestions?: number;
    status?: string;
    sessionId?: number;
  };
  onShowStats?: () => void;
  statsError?: string | null;
}

export function EnhancedExitDialog({
  open,
  onOpenChange,
  session,
  timer,
  localAnswers,
  apiSessionId,
  apiSessionResults,
  onShowStats,
  statsError
}: EnhancedExitDialogProps) {
  const router = useRouter();
  const [showStats, setShowStats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleShowStats = () => {
    if (onShowStats) {
      onShowStats();
    } else {
      // Fallback to showing stats in dialog if no callback provided
      setShowStats(true);
    }
  };

  /**
   * Submit all current answers to the API
   * Returns the submission response data for parsing scores and stats
   */
  const submitAllAnswers = async (): Promise<any> => {
    if (!apiSessionId || !localAnswers) {
      throw new Error('No session ID or answers available for submission');
    }

    // Convert localAnswers to API format
    const answersToSubmit = Object.entries(localAnswers)
      .filter(([questionId, answer]) => {
        // Only submit answers that have actual selections
        return answer && (
          answer.selectedAnswerId ||
          answer.selectedAnswerIds?.length ||
          answer.selectedOptions?.length ||
          answer.textAnswer
        );
      })
      .map(([questionId, answer]) => {
        const qId = Number(questionId);

        // Determine question type from session data
        const question = session.questions?.find((q: any) => Number(q.id) === qId);
        const questionType = question?.questionType || 'SINGLE_CHOICE';

        const isSingle = questionType === 'SINGLE_CHOICE' || questionType === 'QCS';
        const isMulti = questionType === 'MULTIPLE_CHOICE' || questionType === 'QCM';

        if (isSingle) {
          // For single choice, use selectedAnswerId or first from array
          const selectedId = answer.selectedAnswerId ||
            (Array.isArray(answer.selectedAnswerIds) && answer.selectedAnswerIds.length ? answer.selectedAnswerIds[0] :
            (Array.isArray(answer.selectedOptions) && answer.selectedOptions.length ? Number(answer.selectedOptions[0]) : undefined));

          return {
            questionId: qId,
            ...(Number.isFinite(selectedId) ? { selectedAnswerId: Number(selectedId) } : {}),
            timeSpent: answer.timeSpent || 0
          };
        }

        if (isMulti) {
          // For multiple choice, use selectedAnswerIds array
          const ids = answer.selectedAnswerIds ||
            (Array.isArray(answer.selectedOptions) ? answer.selectedOptions.map(Number).filter(n => Number.isFinite(n)) : []);

          return {
            questionId: qId,
            ...(ids.length ? { selectedAnswerIds: ids } : {}),
            timeSpent: answer.timeSpent || 0
          };
        }

        // Fallback for other question types
        return {
          questionId: qId,
          ...(answer.selectedAnswerId ? { selectedAnswerId: answer.selectedAnswerId } :
              answer.selectedAnswerIds?.length ? { selectedAnswerIds: answer.selectedAnswerIds } : {}),
          ...(answer.textAnswer ? { textAnswer: answer.textAnswer } : {}),
          timeSpent: answer.timeSpent || 0
        };
      })
      .filter(answer => answer.selectedAnswerId || answer.selectedAnswerIds || answer.textAnswer);

    if (answersToSubmit.length === 0) {
      console.log('No answers to submit');
      return { success: true, data: null };
    }

    console.log(`📤 Submitting ${answersToSubmit.length} answers for session ${apiSessionId}...`);

    // Calculate total time spent
    const totalTimeSpent = timer?.totalTime || 0;

    // Submit answers using the bulk submission endpoint
    const response = await QuizService.submitAnswersBulk(apiSessionId, answersToSubmit, totalTimeSpent);

    if (!response.success) {
      throw new Error(response.error || 'Failed to submit answers');
    }

    console.log('✅ Successfully submitted all answers:', response.data);
    return response.data;
  };

  const handleShowResults = async () => {
    if (!apiSessionId) {
      // For non-API sessions, just navigate to results
      const sessionId = session.id;
      if (sessionId) {
        router.push(`/session/${sessionId}/results?from=exit`);
      } else {
        router.push('/student/practice');
      }
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Step 1: Submit all current answers
      console.log('🔄 Submitting answers before showing results...');
      const submissionData = await submitAllAnswers();

      // Step 2: Update session status to COMPLETED
      console.log('🔄 Updating session status to COMPLETED...');
      const statusUpdateSuccess = await SessionStatusManager.setCompleted(apiSessionId, {
        showToast: false,
        silent: true
      });

      if (!statusUpdateSuccess) {
        console.warn('Failed to update session status to COMPLETED, but continuing to results');
      }

      // Step 3: Navigate to results page
      console.log('✅ Successfully submitted answers and updated status, navigating to results...');
      onOpenChange(false);
      router.push(`/session/${apiSessionId}/results`);

    } catch (error) {
      console.error('❌ Failed to submit answers for results:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Failed to submit answers');

      // Don't navigate to results if submission failed
      toast.error('Failed to submit answers. Please try again or continue without submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitToDashboard = async () => {
    if (!apiSessionId) {
      // For non-API sessions, just navigate to dashboard
      onOpenChange(false);
      router.push('/student/dashboard');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Step 1: Submit all current answers
      console.log('🔄 Submitting answers before exiting to dashboard...');
      const submissionData = await submitAllAnswers();

      // Step 2: Update session status to IN_PROGRESS (since user is exiting before completion)
      console.log('🔄 Updating session status to IN_PROGRESS...');
      const statusUpdateSuccess = await SessionStatusManager.setInProgress(apiSessionId, {
        showToast: false,
        silent: true
      });

      if (!statusUpdateSuccess) {
        console.warn('Failed to update session status to IN_PROGRESS, but continuing to dashboard');
      }

      // Step 3: Navigate to dashboard
      console.log('✅ Successfully submitted answers and updated status, navigating to dashboard...');
      onOpenChange(false);
      router.push('/student/dashboard');

    } catch (error) {
      console.error('❌ Failed to submit answers for dashboard exit:', error);
      setSubmissionError(error instanceof Error ? error.message : 'Failed to submit answers');

      // Don't navigate to dashboard if submission failed
      toast.error('Failed to submit answers. Please try again or continue without submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToOptions = () => {
    setShowStats(false);
    setSubmissionError(null);
  };

  const handleContinueQuiz = () => {
    onOpenChange(false);
    setSubmissionError(null);
  };

  const handleRetrySubmission = () => {
    setSubmissionError(null);
  };

  const handleForceExit = (destination: 'dashboard' | 'results') => {
    console.log(`⚠️ User chose to force exit to ${destination} without submitting answers`);
    onOpenChange(false);

    if (destination === 'dashboard') {
      router.push('/student/dashboard');
    } else {
      const sessionId = apiSessionId || session.id;
      router.push(`/session/${sessionId}/results?from=exit`);
    }
  };

  // Calculate basic stats for preview - prioritize API data when available
  const totalQuestions = apiSessionResults?.totalQuestions || session.totalQuestions || session.questions?.length || 0;
  const answeredQuestions = apiSessionResults?.answeredQuestions ?? (
    session.questions?.filter((question: any) => {
      const answerId = Number(question.id);
      const answer = localAnswers?.[answerId] || session.userAnswers?.[String(question.id)];
      return answer && (answer.selectedOptions?.length || answer.selectedAnswerId || answer.selectedAnswerIds?.length || answer.textAnswer);
    }).length || 0
  );
  const progressPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
  const timeSpent = (apiSessionResults?.timeSpent ?? timer.totalTime) || 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!showStats ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                Exit Quiz Session?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Your progress has been automatically saved. Choose what you'd like to do next.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Quick Stats Preview */}
            <Card className="my-6 border-primary/20">
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-primary">{progressPercentage}%</div>
                    <div className="text-sm text-muted-foreground">Progress</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-chart-1" />
                    </div>
                    <div className="text-2xl font-bold text-chart-1">{answeredQuestions}/{totalQuestions}</div>
                    <div className="text-sm text-muted-foreground">Answered</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <Clock className="h-5 w-5 text-chart-2" />
                    </div>
                    <div className="text-2xl font-bold text-chart-2">{formatTime(timeSpent)}</div>
                    <div className="text-sm text-muted-foreground">Time Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {submissionError && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-destructive mb-1">Submission Failed</h4>
                      <p className="text-sm text-muted-foreground mb-3">{submissionError}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={handleRetrySubmission}
                          size="sm"
                          variant="outline"
                          className="border-destructive/30 hover:bg-destructive/10"
                        >
                          Try Again
                        </Button>
                        <Button
                          onClick={() => handleForceExit('dashboard')}
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Continue to Dashboard
                        </Button>
                        <Button
                          onClick={() => handleForceExit('results')}
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Continue to Results
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={handleShowStats}
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30"
                >
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Show Stats</div>
                    <div className="text-xs text-muted-foreground">View detailed progress</div>
                  </div>
                </Button>

                <Button
                  onClick={handleShowResults}
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-chart-1/5 hover:border-chart-1/30"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 text-chart-1 animate-spin" />
                  ) : (
                    <Trophy className="h-6 w-6 text-chart-1" />
                  )}
                  <div className="text-center">
                    <div className="font-semibold">
                      {isSubmitting ? 'Submitting...' : 'Show Results'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isSubmitting ? 'Please wait' : 'View full results page'}
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={handleExitToDashboard}
                  variant="outline"
                  disabled={isSubmitting}
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-chart-2/5 hover:border-chart-2/30"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 text-chart-2 animate-spin" />
                  ) : (
                    <Home className="h-6 w-6 text-chart-2" />
                  )}
                  <div className="text-center">
                    <div className="font-semibold">
                      {isSubmitting ? 'Submitting...' : 'Exit to Dashboard'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isSubmitting ? 'Please wait' : 'Return to main menu'}
                    </div>
                  </div>
                </Button>
              </div>

              {/* Continue Quiz Button */}
              <div className="flex justify-center pt-4 border-t">
                <Button
                  onClick={handleContinueQuiz}
                  disabled={isSubmitting}
                  className="px-8"
                >
                  Continue Quiz
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Quiz Statistics
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Detailed view of your current progress and performance
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Full Statistics Display */}
            <div className="my-6">
              <QuizStatisticsDisplay
                session={session}
                timer={timer}
                localAnswers={localAnswers}
                showTitle={false}
                apiSessionResults={apiSessionResults}
                statsError={statsError}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleBackToOptions}
                variant="outline"
                disabled={isSubmitting}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Back to Options
              </Button>
              <Button
                onClick={handleShowResults}
                variant="outline"
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trophy className="h-4 w-4" />
                )}
                {isSubmitting ? 'Submitting...' : 'Show Results'}
              </Button>
              <Button
                onClick={handleExitToDashboard}
                variant="outline"
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Home className="h-4 w-4" />
                )}
                {isSubmitting ? 'Submitting...' : 'Exit to Dashboard'}
              </Button>
              <Button
                onClick={handleContinueQuiz}
                disabled={isSubmitting}
                className="gap-2"
              >
                Continue Quiz
              </Button>
            </div>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
