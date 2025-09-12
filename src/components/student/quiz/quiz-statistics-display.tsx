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
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export function QuizStatisticsDisplay({
  session,
  timer,
  localAnswers,
  className = '',
  showTitle = true,
  apiSessionResults
}: QuizStatisticsProps) {
  // Calculate statistics - prioritize API response data when available
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
  const totalTimeSpent = apiSessionResults?.timeSpent ?? timer.totalTime || 0;
  const averageTimePerQuestion = answeredQuestions > 0 ? Math.round(totalTimeSpent / answeredQuestions) : 0;

  // API-specific data
  const scoreOutOf20 = apiSessionResults?.scoreOutOf20;
  const percentageScore = apiSessionResults?.percentageScore;
  const sessionStatus = apiSessionResults?.status;
  
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

      {/* API Response Data Card - Show when available */}
      {apiSessionResults && (scoreOutOf20 !== undefined || percentageScore !== undefined) && (
        <Card className="border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-green-600" />
              <CardTitle className="text-xl text-green-700 dark:text-green-400">Session Results</CardTitle>
            </div>
            <CardDescription>
              Results from your submitted answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {scoreOutOf20 !== undefined && (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-green-600">{scoreOutOf20.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Score / 20</div>
                </div>
              )}
              {percentageScore !== undefined && (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">{percentageScore.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Percentage</div>
                </div>
              )}
              <div className="space-y-2">
                <div className="text-3xl font-bold text-purple-600">{formatTime(totalTimeSpent)}</div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-orange-600">{answeredQuestions}/{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Answered</div>
              </div>
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

      {/* Progress Overview Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className={cn("h-6 w-6", performance.color)} />
            <CardTitle className="text-xl">{performance.level} Progress</CardTitle>
          </div>
          <CardDescription>
            You've answered {answeredQuestions} out of {totalQuestions} questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2">{progressPercentage}%</div>
            <Progress value={progressPercentage} className="h-3 mb-4" />
            <p className="text-sm text-muted-foreground">
              Overall Completion Rate
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#00B05020', border: '1px solid #00B05040' }}>
              <CheckCircle className="h-6 w-6 mx-auto mb-2" style={{ color: '#00B050' }} />
              <div className="text-2xl font-bold" style={{ color: '#00B050' }}>{answeredQuestions}</div>
              <div className="text-sm font-medium" style={{ color: '#00B050' }}>Justes</div>
            </div>
            
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FF000020', border: '1px solid #FF000040' }}>
              <Circle className="h-6 w-6 mx-auto mb-2" style={{ color: '#FF0000' }} />
              <div className="text-2xl font-bold" style={{ color: '#FF0000' }}>{unansweredQuestions}</div>
              <div className="text-sm font-medium" style={{ color: '#FF0000' }}>Fausses</div>
            </div>
            
            <div className="text-center p-4 rounded-lg col-span-2 md:col-span-1" style={{ backgroundColor: '#BFBFBF20', border: '1px solid #BFBFBF40' }}>
              <Clock className="h-6 w-6 mx-auto mb-2" style={{ color: '#BFBFBF' }} />
              <div className="text-2xl font-bold" style={{ color: '#BFBFBF' }}>{totalQuestions}</div>
              <div className="text-sm font-medium" style={{ color: '#BFBFBF' }}>Consultées</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-chart-1" />
              Session Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Session Type</span>
              <Badge variant="secondary" className="font-semibold">
                {session.type || 'PRACTICE'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Current Question</span>
              <Badge variant="outline" className="font-semibold">
                {(session.currentQuestionIndex || 0) + 1} of {totalQuestions}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Avg. Time/Question</span>
              <span className="text-sm font-semibold">{formatTime(averageTimePerQuestion)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              Progress Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Completion Rate</span>
              <span className="text-sm font-semibold text-primary">{progressPercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Questions Left</span>
              <span className="text-sm font-semibold">{unansweredQuestions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Performance Level</span>
              <Badge className={cn("font-semibold", performance.bgColor, performance.color)}>
                {performance.level}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar with Labels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-chart-3" />
            Detailed Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Questions Answered</span>
              <span className="text-muted-foreground">{answeredQuestions}/{totalQuestions}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
