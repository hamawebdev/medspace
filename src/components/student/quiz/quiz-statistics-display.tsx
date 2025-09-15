// @ts-nocheck
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  Award,
  Circle,
  Trophy,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionStatsChart } from './session-stats-chart';

interface QuizStatisticsProps {
  session: any;
  timer: any;
  localAnswers?: Record<number, any>;
  className?: string;
  showTitle?: boolean;
  apiSessionResults?: {
    scoreOutOf20?: number;
    percentageScore?: number;
    timeSpent?: number;
    answeredQuestions?: number;
    totalQuestions?: number;
    status?: string;
    sessionId?: number;
  };
  statsError?: string | null;
}

export function QuizStatisticsDisplay({
  session,
  timer,
  localAnswers,
  className = '',
  showTitle = true,
  apiSessionResults,
  statsError
}: QuizStatisticsProps) {
  // Calculate statistics - prioritize API response data when available, with fallbacks for errors
  const totalQuestions = apiSessionResults?.totalQuestions || session.totalQuestions || session.questions?.length || 0;

  // Use API response data first, then fall back to local calculations
  const answeredQuestions = apiSessionResults?.answeredQuestions ?? (
    session.questions?.filter((question: any) => {
      const answerId = Number(question.id);
      const answer = localAnswers?.[answerId] || session.userAnswers?.[String(question.id)];
      return answer && (answer.selectedOptions?.length || answer.selectedAnswerId || answer.selectedAnswerIds?.length || answer.textAnswer);
    }).length || 0
  );

  const unansweredQuestions = totalQuestions - answeredQuestions;
  const progressPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  // Calculate time spent - prioritize API response data
  const totalTimeSpent = (apiSessionResults?.timeSpent ?? timer?.totalTime) || 0;
  const averageTimePerQuestion = answeredQuestions > 0 ? Math.round(totalTimeSpent / answeredQuestions) : 0;

  // API-specific data with fallbacks
  const scoreOutOf20 = apiSessionResults?.scoreOutOf20;
  const percentageScore = apiSessionResults?.percentageScore;
  const sessionStatus = apiSessionResults?.status;

  // Check if we have valid API data or if there was an error
  const hasValidApiData = apiSessionResults && (
    scoreOutOf20 !== undefined ||
    percentageScore !== undefined ||
    apiSessionResults.answeredQuestions !== undefined
  );
  const showApiError = statsError && !hasValidApiData;

  // Calculate correct/incorrect answers for chart
  const calculateCorrectIncorrect = () => {
    if (percentageScore !== undefined && answeredQuestions > 0) {
      const correct = Math.round((percentageScore / 100) * answeredQuestions);
      const incorrect = answeredQuestions - correct;
      return { correct, incorrect };
    }

    // Fallback to local calculation if available
    if (session.questions && localAnswers) {
      let correct = 0;
      let incorrect = 0;

      session.questions.forEach((question: any) => {
        const answerId = Number(question.id);
        const answer = localAnswers[answerId];
        if (answer && (answer.selectedOptions?.length || answer.selectedAnswerId || answer.selectedAnswerIds?.length || answer.textAnswer)) {
          // This is a simplified check - in real implementation, you'd check against correct answers
          if (answer.isCorrect) {
            correct++;
          } else {
            incorrect++;
          }
        }
      });

      return { correct, incorrect };
    }

    return { correct: 0, incorrect: 0 };
  };

  const { correct, incorrect } = calculateCorrectIncorrect();

  // Prepare data for SessionStatsChart
  const chartData = totalQuestions > 0 ? {
    totalQuestions,
    answeredQuestions,
    correctAnswers: correct,
    incorrectAnswers: incorrect,
    scoreOutOf20,
    percentageScore,
    timeSpent: totalTimeSpent,
    status: sessionStatus
  } : null;
  
  // Format time helper
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get performance level
  const getPerformanceLevel = () => {
    if (progressPercentage >= 80) return { level: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/20' };
    if (progressPercentage >= 60) return { level: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/20' };
    if (progressPercentage >= 40) return { level: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20' };
    return { level: 'Getting Started', color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-950/20' };
  };

  const performance = getPerformanceLevel();

  return (
    <div className={cn('space-y-6', className)}>
      {showTitle && (
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-foreground">Quiz Statistics</h3>
          <p className="text-muted-foreground">Your current progress and performance</p>
        </div>
      )}

      {/* Circular Chart - Show when we have data */}
      {!showApiError && chartData && (
        <SessionStatsChart
          data={chartData}
          title="Session Progress"
          size="md"
          showTitle={false}
          className="max-w-md mx-auto"
          fallbackMessage={statsError || 'Aucune statistique disponible.'}
        />
      )}

      {/* Error Display - Show when submission failed */}
      {showApiError && (
        <SessionStatsChart
          data={null}
          title="Session Statistics"
          size="md"
          showTitle={true}
          className="max-w-md mx-auto"
          fallbackMessage={statsError || 'Failed to load current statistics. Please retry.'}
        />
      )}

      {/* Additional Details Card - Show when we have API data */}
      {hasValidApiData && !showApiError && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Session Details</CardTitle>
            </div>
            <CardDescription>
              Additional metrics from your session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              {scoreOutOf20 !== undefined && (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">{scoreOutOf20.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Score / 20</div>
                </div>
              )}
              <div className="space-y-2">
                <div className="text-2xl font-bold text-muted-foreground">{formatTime(totalTimeSpent)}</div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
              {averageTimePerQuestion > 0 && (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-muted-foreground">{averageTimePerQuestion}s</div>
                  <div className="text-sm text-muted-foreground">Avg per Question</div>
                </div>
              )}
            </div>
            {sessionStatus && (
              <div className="mt-4 text-center">
                <Badge
                  variant={sessionStatus === 'completed' ? 'default' : 'secondary'}
                  className="font-semibold"
                >
                  Status: {sessionStatus.charAt(0).toUpperCase() + sessionStatus.slice(1)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
