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
  Target
} from 'lucide-react';
import { QuizStatisticsDisplay } from './quiz-statistics-display';

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
}

export function EnhancedExitDialog({
  open,
  onOpenChange,
  session,
  timer,
  localAnswers,
  apiSessionId,
  apiSessionResults
}: EnhancedExitDialogProps) {
  const router = useRouter();
  const [showStats, setShowStats] = useState(false);

  const handleShowStats = () => {
    setShowStats(true);
  };

  const handleShowResults = async () => {
    onOpenChange(false);

    try {
      const sessionId = apiSessionId || session.id;

      if (!sessionId) {
        console.error('No session ID available for results navigation');
        // Fallback to dashboard if no session ID
        router.push('/student/practice');
        return;
      }

      // For API sessions, ensure the session is marked as completed before navigating
      if (apiSessionId) {
        try {
          // Import QuizService dynamically to avoid circular dependencies
          const { QuizService } = await import('@/lib/api-services');
          await QuizService.updateQuizSessionStatus(apiSessionId, 'COMPLETED');
          console.log(`✅ Session ${apiSessionId} marked as COMPLETED for results view`);
        } catch (error) {
          console.warn('Failed to mark session as completed:', error);
          // Continue anyway - the results page will handle incomplete sessions
        }
      }

      // Navigate to results with a query parameter to indicate this is from exit dialog
      router.push(`/session/${sessionId}/results?from=exit`);
    } catch (error) {
      console.error('Error navigating to results:', error);
      // Fallback navigation
      router.push('/student/practice');
    }
  };

  const handleExitToDashboard = () => {
    onOpenChange(false);
    router.push('/student/practice');
  };

  const handleBackToOptions = () => {
    setShowStats(false);
  };

  const handleContinueQuiz = () => {
    onOpenChange(false);
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
  const timeSpent = apiSessionResults?.timeSpent ?? timer.totalTime || 0;

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

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={handleShowStats}
                  variant="outline"
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
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-chart-1/5 hover:border-chart-1/30"
                >
                  <Trophy className="h-6 w-6 text-chart-1" />
                  <div className="text-center">
                    <div className="font-semibold">Show Results</div>
                    <div className="text-xs text-muted-foreground">View full results page</div>
                  </div>
                </Button>

                <Button
                  onClick={handleExitToDashboard}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-chart-2/5 hover:border-chart-2/30"
                >
                  <Home className="h-6 w-6 text-chart-2" />
                  <div className="text-center">
                    <div className="font-semibold">Exit to Dashboard</div>
                    <div className="text-xs text-muted-foreground">Return to main menu</div>
                  </div>
                </Button>
              </div>

              {/* Continue Quiz Button */}
              <div className="flex justify-center pt-4 border-t">
                <Button
                  onClick={handleContinueQuiz}
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
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleBackToOptions}
                variant="outline"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Back to Options
              </Button>
              <Button
                onClick={handleShowResults}
                variant="outline"
                className="gap-2"
              >
                <Trophy className="h-4 w-4" />
                Show Results
              </Button>
              <Button
                onClick={handleExitToDashboard}
                variant="outline"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Exit to Dashboard
              </Button>
              <Button
                onClick={handleContinueQuiz}
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
