// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizSession } from '@/hooks/use-quiz-api';
import { FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary as ErrorBoundaryComponent } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Trophy, BookOpen, ArrowLeft, TrendingUp, Award, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = parseInt(params.sessionId as string);

  const { session: apiSession, loading, error } = useQuizSession(sessionId);
  const [quizResults, setQuizResults] = useState(null);

  // Process quiz/exam results when API session is available (unified handling)
  useEffect(() => {
    if (apiSession) {
      // Handle nested response structure from unified API
      const sessionData = apiSession.data?.data || apiSession.data || apiSession;

      // Calculate results from unified session data, prioritizing submit-answer response fields
      const totalQuestions = sessionData.totalQuestions || sessionData.questions?.length || 0;
      const answeredQuestions = sessionData.answeredQuestions;
      const scoreOutOf20 = sessionData.score || 0;
      const percentageScore = sessionData.percentage || 0;
      const timeSpent = sessionData.timeSpent || 0;
      const sessionType = sessionData.type || 'PRACTICE';
      const status = sessionData.status;

      // Log submit-answer response data if available
      if (answeredQuestions !== undefined || sessionData.scoreOutOf20 !== undefined) {
        console.log('📊 Submit-answer response data detected:', {
          sessionId: sessionData.id || sessionData.sessionId,
          scoreOutOf20,
          percentageScore,
          timeSpent,
          answeredQuestions,
          totalQuestions,
          status
        });
      }

      // Calculate correct/incorrect answers
      const correctAnswers = Math.round((percentageScore / 100) * totalQuestions);
      const incorrectAnswers = (answeredQuestions || totalQuestions) - correctAnswers;

      // Process question results if available
      const questionResults = sessionData.questions?.map((q, index) => ({
        questionNumber: index + 1,
        question: q.question || q.questionText || 'Question text not available',
        userAnswer: q.selectedAnswer || q.userAnswer || 'Not answered',
        correctAnswer: q.correctAnswer || 'Not available',
        isCorrect: q.isCorrect || false,
        explanation: q.explanation || null
      })) || [];

      // Set unified quiz results
      setQuizResults({
        sessionId: sessionData.id || sessionData.sessionId || sessionId,
        title: sessionData.title || `${sessionType} Session`,
        type: sessionType,
        totalQuestions,
        answeredQuestions: answeredQuestions || totalQuestions,
        correctAnswers,
        incorrectAnswers,
        unansweredCount: Math.max(0, totalQuestions - (answeredQuestions || totalQuestions)),
        percentage: percentageScore,
        scoreOutOf20,
        timeSpent,
        status: status || 'COMPLETED',
        questionResults,
        
        // Legacy fields for backward compatibility
        questions: questionResults,
        sessionType,
        completedAt: sessionData.updatedAt || sessionData.completedAt || new Date().toISOString(),
      });

      console.log(`📊 Processed ${sessionType} results for session ${sessionData.id || sessionData.sessionId}`);
    }
  }, [apiSession]);

  if (loading) {
    return <FullPageLoading message="Loading quiz results..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/student/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizResults) {
    return <FullPageLoading message="Processing results..." />;
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-chart-2';
    if (percentage >= 60) return 'text-chart-3';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Excellent', icon: Award, color: 'text-chart-2' };
    if (percentage >= 80) return { level: 'Great', icon: Trophy, color: 'text-chart-2' };
    if (percentage >= 70) return { level: 'Good', icon: Target, color: 'text-chart-3' };
    if (percentage >= 60) return { level: 'Fair', icon: TrendingUp, color: 'text-chart-3' };
    return { level: 'Needs Improvement', icon: BookOpen, color: 'text-destructive' };
  };

  const performance = getPerformanceLevel(quizResults.percentage);
  const PerformanceIcon = performance.icon;

  return (
    <div>
      <h1>Test</h1>
    </div>
  );
}
