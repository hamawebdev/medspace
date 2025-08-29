// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuizSession } from '@/hooks/use-quiz-api';
import { FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

export default function QuizCompletionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = parseInt(params.sessionId as string);
  
  const { session: apiSession, loading, error } = useQuizSession(sessionId);
  const [completionData, setCompletionData] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Process completion data when session is available
  useEffect(() => {
    if (apiSession) {
      const sessionData = apiSession.data?.data || apiSession.data || apiSession;
      
      // Only show for completed sessions
      if (sessionData.status !== 'COMPLETED' && sessionData.status !== 'completed') {
        router.push(`/session/${sessionId}`);
        return;
      }

      const totalQuestions = sessionData.questions?.length || sessionData.questionsCount || 0;
      const answersArr = Array.isArray(sessionData.answers) ? sessionData.answers : [];
      
      // Calculate statistics
      let correctCount = 0;
      let answeredCount = 0;
      
      const questionSummary = (sessionData.questions || []).map((question: any, index: number) => {
        const userAnswer = answersArr.find((a: any) => String(a.questionId) === String(question.id));
        const isAnswered = userAnswer && (userAnswer.selectedAnswerId || userAnswer.selectedAnswerIds?.length);
        const isCorrect = userAnswer?.isCorrect || false;
        
        if (isAnswered) answeredCount++;
        if (isCorrect) correctCount++;

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

      const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const timeSpent = sessionData.timeSpent || 0;
      
      setCompletionData({
        sessionId: sessionData.id,
        title: sessionData.title || 'Quiz Session',
        type: sessionData.type || 'PRACTICE',
        totalQuestions,
        correctCount,
        incorrectCount: answeredCount - correctCount,
        unansweredCount: totalQuestions - answeredCount,
        percentage,
        timeSpent,
        completedAt: sessionData.completedAt || new Date().toISOString(),
        questionSummary,
        canRetake: true // TODO: Check retake permissions
      });

      // Trigger celebration for good scores
      if (percentage >= 70) {
        setShowCelebration(true);
        // Note: Confetti animation would be added here with canvas-confetti library
      }
    }
  }, [apiSession, sessionId, router]);

  if (loading) {
    return <FullPageLoading message="Loading completion results..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Failed to load quiz results</p>
            <Button onClick={() => router.push('/student/dashboard')}>
              Return to Dashboard
            </Button>
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
            <p className="text-sm text-muted-foreground">
              Completed on {new Date(completionData.completedAt).toLocaleString()}
            </p>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Score Card */}
            <Card className="lg:col-span-1 relative overflow-hidden">
              <div className={cn("absolute top-0 left-0 w-full h-1",
                completionData.percentage >= 80 ? "bg-chart-5" :
                completionData.percentage >= 60 ? "bg-chart-4" : "bg-destructive"
              )} />
              
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center mb-2">
                  <PerformanceIcon className={cn("h-8 w-8", performance.color)} />
                </div>
                <CardTitle>Your Score</CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div className={cn("text-6xl font-bold", performance.color)}>
                  {completionData.percentage}%
                </div>
                
                <Badge variant={completionData.percentage >= 70 ? 'default' : 'destructive'} className="text-base px-4 py-2">
                  {completionData.correctCount}/{completionData.totalQuestions} Correct
                </Badge>
                
                <p className="text-muted-foreground font-medium">
                  {performance.level}
                </p>
                
                <Progress value={completionData.percentage} className="h-3" />
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
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
                    <div className="text-2xl font-bold text-chart-2">{formatTime(completionData.timeSpent)}</div>
                    <div className="text-sm text-chart-2">Time Taken</div>
                  </div>

                  <div className="text-center p-4 bg-chart-3/10 rounded-lg border border-chart-3/20">
                    <Target className="h-6 w-6 text-chart-3 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-chart-3">{completionData.totalQuestions}</div>
                    <div className="text-sm text-chart-3">Total Questions</div>
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
                onClick={() => {/* TODO: Implement retake logic */}}
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

          {/* Answer Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle>Answer Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completionData.questionSummary.map((q: any, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      q.isCorrect ? "bg-chart-5/10 border-chart-5/20" : "bg-destructive/10 border-destructive/20"
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold",
                        q.isCorrect ? "bg-chart-5" : "bg-destructive"
                      )}>
                        {q.isCorrect ? "✓" : "✗"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground mb-1">
                          Question {q.questionNumber}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Your Answer:</span> {q.studentAnswer}
                          {!q.isCorrect && (
                            <>
                              <br />
                              <span className="font-medium text-chart-5">Correct Answer:</span> {q.correctAnswer}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </ErrorBoundary>
  );
}
