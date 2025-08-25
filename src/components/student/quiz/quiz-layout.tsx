// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Clock,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Flag,
  BookOpen,
  Trophy,
  Send,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useQuiz } from './quiz-api-context';
import { QuestionDisplay } from './question-display';
// import { ClientStorageIndicator } from './client-storage-indicator';
import { SessionTypeIndicator } from './session-type-indicator';
import { QuizTimer } from './quiz-timer';
import { QuizResults } from './session-completion/quiz-results';
import { ApiStatusIndicator } from './api-status-indicator';
import { ApiQuizResults } from './api-quiz-results';
import { useApiQuiz } from './quiz-api-context';
import { EnhancedQuizFooter } from './enhanced-quiz-footer';

export function QuizLayout() {
  const router = useRouter(); 
  const { state, pauseQuiz, resumeQuiz, nextQuestion, previousQuestion, completeQuiz, goToQuestion, toggleSidebar, submitAllAnswers } = useQuiz();
  const { state: apiState } = useApiQuiz();
  const [showExitDialog, setShowExitDialog] = useState(false);

  const { session, timer, currentQuestion } = state;

  // Safety check - ensure session exists and has required properties
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5 flex items-center justify-center p-4">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center animate-pulse-soft">
              <span className="text-xl">📚</span>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Loading Quiz Session...
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Please wait while we prepare your quiz.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Initializing...</span>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to completion page when quiz is completed
  const totalQuestions = session.totalQuestions || session.questions?.length || 0;
  const answeredQuestions = Object.keys(state.localAnswers || {}).length;

  // Redirect to new completion page instead of showing inline results
  useEffect(() => {
    if (session.status === 'completed' || session.status === 'COMPLETED') {
      const id = (state as any).apiSessionId || session.id;
      if (id) {
        router.push(`/student/sessions/${id}/results`);
      }
    }
  }, [session.status, router]);

  // Show loading while redirecting
  if (session.status === 'completed' || session.status === 'COMPLETED') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
          Redirecting to completion page...
        </div>
      </div>
    );
  }

  // Ensure required session properties exist with defaults
  const currentQuestionIndex = session.currentQuestionIndex ?? 0;
  const userAnswers = session.userAnswers ?? {};

  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExitQuiz = () => {
    router.push('/student/practice');
  };

  // Helper functions for question info
  const getQuestionType = (question: any) => {
    if (question?.type) return question.type;
    if (question?.questionType) return question.questionType;
    if (question?.options?.length > 0) {
      const correctCount = question.options.filter((opt: any) => opt.isCorrect).length;
      return correctCount > 1 ? 'QCM' : 'QCS';
    }
    return 'QCS';
  };

  const getQuestionTypeInfo = (type: string) => {
    switch (type) {
      case 'QCM':
        return {
          name: 'Multiple Choice (QCM)',
          description: 'Multiple correct answers possible',
          icon: '☑️',
        };
      case 'QCS':
        return {
          name: 'Single Choice (QCS)',
          description: 'Only one correct answer',
          icon: '⚪',
        };
      case 'QROC':
        return {
          name: 'Questions à Réponse Ouverte Courte',
          description: 'Réponse libre courte',
          icon: '✏️',
        };
      case 'CAS':
        return {
          name: 'Cas Cliniques',
          description: 'Cas clinique avec sous-questions',
          icon: '🏥',
        };
      default:
        return {
          name: 'Question',
          description: 'Type de question',
          icon: '❓',
        };
    }
  };

  const transformQuestion = (question: any) => {
    return {
      ...question,
      content: question.content || question.questionText || question.text || '',
      source: question.source || 'Practice Quiz',
      tags: question.tags || [],
    };
  };

  const handlePauseResume = () => {
    if (timer.isPaused) {
      resumeQuiz();
    } else {
      pauseQuiz();
    }
  };

  const getSessionTypeBadge = (type: string) => {
    const variants = {
      training: 'bg-blue-50 text-blue-700 border-blue-200',
      exam: 'bg-green-50 text-green-700 border-green-200',
      residency: 'bg-purple-50 text-purple-700 border-purple-200',
      remedial: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    return variants[type as keyof typeof variants] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm supports-[backdrop-filter]:bg-card/50 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-3">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            {/* Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="gap-1 sm:gap-2 flex-shrink-0"
            >
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Questions</span>
            </Button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-xs sm:text-sm tracking-tight truncate text-foreground">
                  {session.title}
                </h1>
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                  <SessionTypeIndicator
                    type={session.type || 'PRACTICE'}
                    variant="compact"
                  />
                </div>
              </div>
            </div>
          </div>



          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* ClientStorageIndicator removed to avoid iterating all sessions */}

            {/* API Status Indicator - Hidden on mobile */}
            <div className="hidden lg:block">
              <ApiStatusIndicator />
            </div>

            {/* Timer */}
            {(session.settings?.showTimer ?? true) && (
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm bg-muted/30 rounded-lg px-2 sm:px-3 py-1 sm:py-1.5">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="font-mono font-medium text-foreground tracking-wider text-xs sm:text-sm">
                  {formatTime(timer.totalTime)}
                </span>
              </div>
            )}

            {/* Info Dropdown */}
            {currentQuestion && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 btn-modern focus-ring hover:bg-accent/50 px-2 sm:px-3"
                  >
                    <Info className="h-3 w-3" />
                    <span className="hidden sm:inline">Info</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96 p-0" align="end">
                  <Card className="border-0 shadow-none">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Question Type</h4>
                          <p className="text-muted-foreground leading-relaxed">{getQuestionTypeInfo(getQuestionType(currentQuestion)).description}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Source</h4>
                          <p className="text-muted-foreground leading-relaxed">{transformQuestion(currentQuestion).source}</p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Tags</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {(transformQuestion(currentQuestion).tags && Array.isArray(transformQuestion(currentQuestion).tags) && transformQuestion(currentQuestion).tags.length > 0) ? (
                              transformQuestion(currentQuestion).tags.map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs font-medium">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No tags available</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Storage Status Section */}
                      <div className="mt-6 pt-4 border-t border-border/50">
                        <h4 className="font-semibold text-foreground mb-4">Session Status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Answers Saved:</span>
                              <span className="font-medium">{Object.keys(apiState.localAnswers || {}).length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Questions:</span>
                              <span className="font-medium">{session.totalQuestions || session.questions?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Session Type:</span>
                              <span className="font-medium">{session.type || 'PRACTICE'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Storage:</span>
                              <span className="font-medium text-green-600">Local Device</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Auto-save:</span>
                              <span className="font-medium">{apiState.autoSave ? 'Enabled' : 'Disabled'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">API Session:</span>
                              <span className="font-medium">{apiState.apiSessionId ? 'Active' : 'Local Mode'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Pause/Resume */}
            {/* Review-mode actions */}
            {(session.status === 'COMPLETED' || session.status === 'completed') ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push(`/student/session/${state.apiSessionId || session.id}/results`)} className="gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Return to Results</span>
                </Button>
                {/* Per-question Edit button exists inside question components now */}
              </div>
            ) : (
              <>
                {(session.settings?.allowPause ?? true) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePauseResume}
                    className="gap-1 sm:gap-2 btn-modern focus-ring hover:bg-accent/50 px-2 sm:px-3"
                  >
                    {timer.isPaused ? (
                      <>
                        <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Resume</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    )}
                  </Button>
                )}

                {/* Exit Quiz */}
                <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Home className="h-4 w-4" />
                      <span className="hidden sm:inline">Exit</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Exit Quiz Session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to exit this quiz session? Your progress will be saved,
                        but you'll need to resume from where you left off.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
                      <AlertDialogAction onClick={handleExitQuiz}>
                        Exit Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>


      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Quiz Questions Sidebar */}
        <div className={cn(
          "bg-card/50 border-r border-border/50 flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out",
          // Desktop behavior
          "hidden lg:block",
          state.sidebarOpen ? "lg:w-64" : "lg:w-0 lg:border-r-0",
          // Mobile behavior - overlay
          "lg:relative absolute inset-y-0 left-0 z-50",
          state.sidebarOpen ? "block w-64 shadow-xl" : "hidden"
        )}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Questions</h3>
              {/* Close button for mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden p-1 h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {session.questions.map((_, index) => {
                const isCurrentQuestion = index === currentQuestionIndex;
                const isAnswered = session.userAnswers[session.questions[index]?.id];

                return (
                  <button
                    key={index}
                    onClick={() => {
                      goToQuestion(index);
                      // Auto-close sidebar on mobile after selection
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isCurrentQuestion
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : isAnswered
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    Q{index + 1}
                    {isAnswered && !isCurrentQuestion && (
                      <span className="ml-2 text-xs">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {state.sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={toggleSidebar}
          />
        )}

        {/* Question Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10 min-w-0">
          {/* Question Content */}
          <div className="flex-1 overflow-y-auto">
            <QuestionDisplay />
            {/* Per-question and session actions: notes, labels, report */}
            <div className="border-t border-border/50 bg-card/30">
              {/* QuestionActions removed: no submit/duplicate note/signal/favorite buttons here */}
              <div className="px-3 sm:px-4 py-2 sm:py-3" />
            </div>
          </div>

          {/* Enhanced Navigation Footer */}
          <EnhancedQuizFooter
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            answeredQuestions={answeredQuestions}
            onPrevious={previousQuestion}
            onNext={() => {
              // Lock Next until the current question is answered
              const currentId = state.session?.questions?.[currentQuestionIndex]?.id;
              const hasAnswer = !!state.localAnswers?.[currentId];
              if (!hasAnswer) return;
              nextQuestion();
            }}
            onSubmit={async () => {
              // Inline finish: directly submit all answers and proceed to results
              await submitAllAnswers();
            }}
            canGoBack={currentQuestionIndex > 0}
            canGoForward={currentQuestionIndex < totalQuestions - 1 && !!state.localAnswers?.[state.session?.questions?.[currentQuestionIndex]?.id]}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
            hideSubmit
          />
        </div>
      </div>

      {/* Pause Overlay (disabled in review mode) */}
      {timer.isPaused && !(session.status === 'COMPLETED' || session.status === 'completed') && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="text-center space-y-8 animate-fade-in-up">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-pulse-soft">
                <span className="text-4xl">⏸️</span>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Quiz Paused</h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                Take your time. Click Resume when you're ready to continue your session.
              </p>
            </div>
            <Button
              onClick={resumeQuiz}
              size="lg"
              className="gap-3 btn-modern focus-ring bg-primary hover:bg-primary/90 px-8 py-3 text-lg"
            >
              <Play className="h-5 w-5" />
              Resume Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
