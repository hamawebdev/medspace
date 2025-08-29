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

      // Calculate results from unified session data
      const totalQuestions = sessionData.questions?.length || 0;
      const score = sessionData.score || 0;
      const percentage = sessionData.percentage || 0;
      const sessionType = sessionData.type || 'PRACTICE';

      // Process question results with unified data structure, including user's selected answers (QCS & QCM)
      const questionResults = sessionData.questions?.map((question, index) => {
        const ua = sessionData.userAnswers?.[question.id] || {};
        const selectedIds = Array.isArray(ua.selectedAnswerIds)
          ? ua.selectedAnswerIds
          : (typeof ua.selectedAnswerId !== 'undefined' ? [ua.selectedAnswerId] : (ua.selectedOptions || []));

        const answers = question.answers || question.options || [];
        const correctAnswers = answers.filter((a: any) => a.isCorrect);
        const userSelectedAnswers = answers.filter((a: any) => selectedIds?.map(String).includes(String(a.id)));

        // Determine correctness for QCS and QCM
        const correctIds = new Set(correctAnswers.map((a: any) => String(a.id)));
        const selectedIdSet = new Set((selectedIds || []).map((id: any) => String(id)));
        const isCorrect = correctIds.size > 0 && selectedIdSet.size === correctIds.size && Array.from(selectedIdSet).every(id => correctIds.has(id));

        return {
          questionNumber: index + 1,
          question: question.questionText || question.content,
          userAnswer: userSelectedAnswers.length
            ? userSelectedAnswers.map((a: any) => a.answerText || a.text).join(', ')
            : 'No answer',
          correctAnswer: correctAnswers.map((a: any) => a.answerText || a.text).join(', '),
          isCorrect,
          explanation: question.explanation,
          timeSpent: ua?.timeSpent || 0,
          selectedAnswerIds: selectedIds || [],
        };
      }) || [];

      const correctAnswers = questionResults.filter(q => q.isCorrect).length;
      const incorrectAnswers = totalQuestions - correctAnswers;

      setQuizResults({
        sessionId: sessionData.id || sessionData.sessionId,
        title: sessionData.title || (sessionType === 'EXAM' ? 'Exam Session' : 'Quiz Session'),
        type: sessionType,
        status: sessionData.status,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        score,
        percentage,
        questionResults,
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
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto animate-slide-up">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-2">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Error Loading Results</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{error}</p>
                </div>
                <Button
                  onClick={() => router.push('/student/dashboard')}
                  className="btn-modern"
                >
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8 space-y-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/student/dashboard')}
              className="btn-modern group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Button>

            <div className="group/header text-center space-y-6 animate-slide-up">
              {/* Enhanced Performance Icon */}
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full animate-pulse-soft" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full flex items-center justify-center animate-float-gentle group-hover/header:scale-110 transition-transform duration-500 border-2 border-primary/20 group-hover/header:border-primary/40">
                  <PerformanceIcon className={cn("h-12 w-12 group-hover/header:scale-110 transition-transform duration-300", performance.color)} />
                </div>
              </div>

              {/* Enhanced Title Section */}
              <div className="space-y-4">
                <div className="relative">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-balance bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent group-hover/header:from-primary group-hover/header:via-foreground group-hover/header:to-primary transition-all duration-700">
                    {quizResults.type === 'EXAM' ? 'Exam Results' : 'Quiz Results'}
                  </h1>
                  {/* Animated underline */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 group-hover/header:w-32 h-1 bg-gradient-to-r from-primary via-chart-1 to-accent rounded-full transition-all duration-700 ease-out" />
                </div>

                {/* Enhanced Subtitle */}
                <div className="relative">
                  <p className="text-xl sm:text-2xl text-muted-foreground font-medium group-hover/header:text-foreground transition-colors duration-500">
                    {quizResults.title}
                  </p>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover/header:opacity-100 transition-opacity duration-500 rounded-lg" />
                </div>

                {/* Enhanced Badge Section */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Badge
                    variant="outline"
                    className="group/badge text-base px-4 py-2 border-2 hover:border-primary/50 hover:bg-primary/5 hover:scale-105 transition-all duration-300 font-semibold"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary/50 group-hover/badge:bg-primary animate-pulse" />
                      {quizResults.type === 'EXAM' ? 'Exam Session' : 'Practice Session'}
                    </div>
                  </Badge>

                  <Badge
                    variant="secondary"
                    className={cn(
                      "group/performance text-base px-4 py-2 font-semibold hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-current/20",
                      performance.color
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <PerformanceIcon className="h-4 w-4 group-hover/performance:rotate-12 transition-transform duration-300" />
                      {performance.level}
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Main Score Card */}
            <Card className="group/score lg:col-span-1 relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/30 border-2 border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 animate-slide-up animate-delay-100">
              <div className="absolute inset-0 bg-grid-pattern opacity-0 group-hover/score:opacity-20 transition-opacity duration-700" />
              <div className={cn(
                "absolute top-0 left-0 w-full h-1 transition-all duration-500",
                quizResults.percentage >= 80 ? "bg-gradient-to-r from-chart-2 to-chart-4" :
                quizResults.percentage >= 60 ? "bg-gradient-to-r from-chart-3 to-chart-1" :
                "bg-gradient-to-r from-destructive to-chart-5"
              )} />

              <CardHeader className="text-center pb-6 relative">
                <div className="flex items-center justify-center mb-3">
                  <PerformanceIcon className={cn("h-8 w-8 mr-2 group-hover/score:scale-110 transition-transform duration-300", performance.color)} />
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Final Score
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="text-center space-y-6 relative">
                <div className="relative group-hover/score:scale-105 transition-transform duration-300">
                  <div className={cn(
                    "text-7xl font-black tracking-tighter leading-none animate-counter-up tabular-nums group-hover/score:text-8xl transition-all duration-500",
                    getScoreColor(quizResults.percentage)
                  )}>
                    {Math.round(quizResults.percentage)}%
                  </div>
                  <div className={cn(
                    "absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-20 h-1.5 rounded-full group-hover/score:w-24 group-hover/score:h-2 transition-all duration-500",
                    quizResults.percentage >= 80 ? "bg-gradient-to-r from-chart-2 to-chart-4" :
                    quizResults.percentage >= 60 ? "bg-gradient-to-r from-chart-3 to-chart-1" :
                    "bg-gradient-to-r from-destructive to-chart-5"
                  )}></div>
                </div>

                <div className="space-y-2">
                  <Badge variant={getScoreBadgeVariant(quizResults.percentage)} className="text-base px-4 py-2 group-hover/score:scale-105 transition-transform duration-300">
                    {quizResults.correctAnswers}/{quizResults.totalQuestions} Correct
                  </Badge>
                  <p className="text-muted-foreground text-sm font-medium">
                    {performance.level}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Performance Breakdown */}
            <Card className="group/performance relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/30 border-2 border-border/30 hover:border-chart-1/30 transition-all duration-500 hover:shadow-2xl hover:shadow-chart-1/10 animate-slide-up animate-delay-200">
              <div className="absolute inset-0 bg-grid-pattern opacity-0 group-hover/performance:opacity-20 transition-opacity duration-700" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chart-2 via-chart-1 to-chart-3 transition-all duration-500" />

              <CardHeader className="pb-6 relative">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-chart-1/10 rounded-xl mr-3 group-hover/performance:bg-chart-1/20 group-hover/performance:scale-110 transition-all duration-300">
                    <Target className="h-5 w-5 text-chart-1 group-hover/performance:rotate-12 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Performance
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="group/correct p-4 bg-gradient-to-br from-chart-2/10 to-chart-2/5 rounded-xl border border-chart-2/20 hover:border-chart-2/40 hover:shadow-lg hover:shadow-chart-2/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-chart-2 mr-2 group-hover/correct:scale-110 transition-transform duration-300" />
                        <span className="text-sm text-chart-2 font-semibold">Correct</span>
                      </div>
                      <span className="font-black text-2xl tabular-nums text-chart-2 group-hover/correct:scale-110 transition-transform duration-300">
                        {quizResults.correctAnswers}
                      </span>
                    </div>
                  </div>

                  <div className="group/incorrect p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 rounded-xl border border-destructive/20 hover:border-destructive/40 hover:shadow-lg hover:shadow-destructive/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-destructive mr-2 group-hover/incorrect:scale-110 transition-transform duration-300" />
                        <span className="text-sm text-destructive font-semibold">Incorrect</span>
                      </div>
                      <span className="font-black text-2xl tabular-nums text-destructive group-hover/incorrect:scale-110 transition-transform duration-300">
                        {quizResults.incorrectAnswers}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-border/30 group-hover/performance:border-primary/30 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground font-medium">Overall Progress</span>
                    <span className="font-bold text-lg tabular-nums">{Math.round(quizResults.percentage)}%</span>
                  </div>
                  <Progress
                    value={quizResults.percentage}
                    className="h-4 progress-animated group-hover/performance:h-5 transition-all duration-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="group/info relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/30 border-2 border-border/30 hover:border-accent/30 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 animate-slide-up animate-delay-300">
              <div className="absolute inset-0 bg-grid-pattern opacity-0 group-hover/info:opacity-20 transition-opacity duration-700" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-chart-1 transition-all duration-500" />

              <CardHeader className="pb-6 relative">
                <div className="flex items-center mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-xl mr-3 group-hover/info:bg-accent/20 group-hover/info:scale-110 transition-all duration-300">
                    <Clock className="h-5 w-5 text-accent group-hover/info:rotate-12 transition-transform duration-300" />
                  </div>
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Session Info
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 relative">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-300 group/item">
                    <span className="text-sm text-muted-foreground font-medium">Type:</span>
                    <Badge variant="outline" className="font-semibold group-hover/item:scale-105 transition-transform duration-300">
                      {quizResults.type}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-300 group/item">
                    <span className="text-sm text-muted-foreground font-medium">Questions:</span>
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover/item:bg-primary/20 group-hover/item:scale-105 transition-all duration-300">
                      <span className="font-black text-lg tabular-nums text-primary">{quizResults.totalQuestions}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-300 group/item">
                    <span className="text-sm text-muted-foreground font-medium">Status:</span>
                    <Badge variant="default" className="bg-chart-2 text-white font-semibold group-hover/item:scale-105 group-hover/item:shadow-lg transition-all duration-300">
                      Completed
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors duration-300 group/item">
                    <span className="text-sm text-muted-foreground font-medium">Performance:</span>
                    <Badge variant="secondary" className={cn("font-semibold group-hover/item:scale-105 transition-transform duration-300", performance.color)}>
                      {performance.level}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Review */}
          <Card className="group/card animate-slide-up animate-delay-300 card-hover-lift overflow-hidden bg-gradient-to-br from-card via-card to-muted/20 border-2 border-border/30 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
            <CardHeader className="relative border-b border-border/30 bg-gradient-to-r from-muted/20 via-background/50 to-muted/20 group-hover/card:from-primary/5 group-hover/card:via-primary/10 group-hover/card:to-primary/5 transition-all duration-500">
              <div className="absolute inset-0 bg-grid-pattern opacity-0 group-hover/card:opacity-30 transition-opacity duration-700" />
              <CardTitle className="relative flex items-center text-2xl font-bold tracking-tight group-hover/card:text-primary transition-colors duration-300">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mr-4 group-hover/card:bg-primary/20 group-hover/card:scale-110 transition-all duration-300">
                  <BookOpen className="h-7 w-7 text-primary group-hover/card:rotate-12 transition-transform duration-300" />
                </div>
                <div className="space-y-1">
                  <span>Question Review</span>
                  <div className="w-0 group-hover/card:w-20 h-1 bg-gradient-to-r from-primary to-chart-1 rounded-full transition-all duration-500 ease-out" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {quizResults.questionResults.map((result, index) => (
                  <div
                    key={index}
                    className={cn(
                      "group relative p-8 transition-all duration-300 ease-out",
                      "hover:bg-gradient-to-r hover:from-muted/30 hover:via-muted/20 hover:to-transparent",
                      "hover:shadow-lg hover:shadow-primary/5",
                      "border-l-4 border-l-transparent hover:border-l-primary/30",
                      result.isCorrect
                        ? "hover:border-l-chart-2/50 hover:bg-chart-2/5"
                        : "hover:border-l-destructive/50 hover:bg-destructive/5"
                    )}
                  >
                    {/* Subtle background pattern on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-grid-pattern pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300",
                            "group-hover:scale-110 group-hover:shadow-md",
                            result.isCorrect
                              ? "bg-chart-2/20 text-chart-2 group-hover:bg-chart-2/30"
                              : "bg-destructive/20 text-destructive group-hover:bg-destructive/30"
                          )}>
                            {result.questionNumber}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-xl tracking-tight group-hover:text-primary transition-colors duration-300">
                              Question {result.questionNumber}
                            </h3>
                            <div className="w-0 group-hover:w-12 h-0.5 bg-primary/50 transition-all duration-500 ease-out" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-full transition-all duration-300 group-hover:scale-110",
                            result.isCorrect
                              ? "bg-chart-2/20 group-hover:bg-chart-2/30"
                              : "bg-destructive/20 group-hover:bg-destructive/30"
                          )}>
                            {result.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-chart-2" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive" />
                            )}
                          </div>
                          <Badge
                            variant={result.isCorrect ? 'default' : 'destructive'}
                            className="font-medium px-3 py-1 transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm"
                          >
                            {result.isCorrect ? 'Correct' : 'Incorrect'}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-8 group-hover:mb-10 transition-all duration-300">
                        <p className="text-foreground leading-relaxed text-pretty text-lg group-hover:text-foreground/90 transition-colors duration-300">
                          {result.question}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                        <div className="space-y-3 group/answer">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                            Your Answer
                          </span>
                          <div className={cn(
                            "relative p-5 rounded-xl border-l-4 transition-all duration-300 group-hover/answer:scale-[1.02]",
                            "group-hover/answer:shadow-lg backdrop-blur-sm",
                            result.isCorrect
                              ? "border-l-chart-2 bg-gradient-to-r from-chart-2/10 to-chart-2/5 group-hover/answer:from-chart-2/15 group-hover/answer:to-chart-2/8"
                              : "border-l-destructive bg-gradient-to-r from-destructive/10 to-destructive/5 group-hover/answer:from-destructive/15 group-hover/answer:to-destructive/8"
                          )}>
                            <p className={cn(
                              "font-medium text-base leading-relaxed transition-all duration-300",
                              result.isCorrect ? 'text-chart-2' : 'text-destructive'
                            )}>
                              {result.userAnswer}
                            </p>
                            <div className={cn(
                              "absolute top-2 right-2 w-3 h-3 rounded-full transition-all duration-300",
                              result.isCorrect ? 'bg-chart-2/30' : 'bg-destructive/30'
                            )} />
                          </div>
                        </div>
                        <div className="space-y-3 group/correct">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-chart-2/50" />
                            Correct Answer
                          </span>
                          <div className="relative p-5 rounded-xl border-l-4 border-l-chart-2 bg-gradient-to-r from-chart-2/10 to-chart-2/5 transition-all duration-300 group-hover/correct:scale-[1.02] group-hover/correct:shadow-lg group-hover/correct:from-chart-2/15 group-hover/correct:to-chart-2/8 backdrop-blur-sm">
                            <p className="font-medium text-chart-2 text-base leading-relaxed">
                              {result.correctAnswer}
                            </p>
                            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-chart-2/30" />
                          </div>
                        </div>
                      </div>

                      {result.explanation && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-accent/15 via-accent/10 to-accent/5 border border-accent/20 rounded-xl transition-all duration-300 group-hover:shadow-md group-hover:border-accent/30 backdrop-blur-sm">
                          <div className="flex items-start gap-4">
                            <div className="flex items-center justify-center w-8 h-8 bg-accent/30 rounded-full flex-shrink-0 mt-1 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/40">
                              <BookOpen className="h-4 w-4 text-accent-foreground" />
                            </div>
                            <div className="space-y-2 flex-1">
                              <span className="text-xs font-semibold text-accent-foreground uppercase tracking-wider flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent/50" />
                                Explanation
                              </span>
                              <p className="text-accent-foreground/90 leading-relaxed text-pretty text-base">
                                {result.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
                <Button
                  onClick={() => router.push(`/session/${quizResults.sessionId}/review`)}
                  className="group/review relative overflow-hidden bg-gradient-to-r from-chart-2 to-green-500 hover:from-chart-2/90 hover:to-green-500/90 text-white px-10 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/25 btn-interactive"
                  size="lg"
                >
                  <div className="flex items-center justify-center">
                    <BookOpen className="h-6 w-6 mr-3 group-hover/review:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Review Questions</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/review:translate-x-full transition-transform duration-700 ease-out" />
                </Button>

            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-16 text-center animate-slide-up animate-delay-300">
            <div className="group/actions relative inline-flex flex-col sm:flex-row gap-6 p-8 bg-gradient-to-br from-muted/40 via-muted/30 to-background/50 rounded-3xl border-2 border-border/30 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 backdrop-blur-sm">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-grid-pattern opacity-0 group-hover/actions:opacity-20 transition-opacity duration-700 rounded-3xl" />

              {/* Gradient accent line */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 group-hover/actions:w-32 h-1 bg-gradient-to-r from-primary via-chart-1 to-accent rounded-full transition-all duration-700 ease-out" />

              <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                <Button
                  onClick={() => router.push('/student/practice')}
                  className="group/practice relative overflow-hidden bg-gradient-to-r from-primary to-chart-1 hover:from-primary/90 hover:to-chart-1/90 text-white px-10 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25 btn-interactive"
                  size="lg"
                >
                  <div className="flex items-center justify-center">
                    <BookOpen className="h-6 w-6 mr-3 group-hover/practice:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Practice More</span>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/practice:translate-x-full transition-transform duration-700 ease-out" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/student/dashboard')}
                  className="group/dashboard relative overflow-hidden border-2 border-border hover:border-primary/50 bg-background/80 hover:bg-muted/50 px-10 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-muted/25 backdrop-blur-sm"
                  size="lg"
                >
                  <div className="flex items-center justify-center">
                    <ArrowLeft className="h-6 w-6 mr-3 group-hover/dashboard:-translate-x-1 transition-transform duration-300" />
                    <span>Return to Dashboard</span>
                  </div>
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover/dashboard:opacity-100 transition-opacity duration-300" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
