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
  Info,
  Check,
  X as XIcon
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
import { useGlobalKeyboardShortcuts } from './hooks/use-global-keyboard-shortcuts';
import { QuizResults } from './session-completion/quiz-results';
import { ApiStatusIndicator } from './api-status-indicator';
import { ApiQuizResults } from './api-quiz-results';
import { useApiQuiz } from './quiz-api-context';
import { EnhancedQuizFooter } from './enhanced-quiz-footer';
import { QuizStatisticsDisplay } from './quiz-statistics-display';
import { EnhancedExitDialog } from './enhanced-exit-dialog';
import { SessionStatusManager } from '@/lib/session-status-manager';


export function QuizLayout() {
  const router = useRouter();
  const { state, pauseQuiz, resumeQuiz, nextQuestion, previousQuestion, completeQuiz, goToQuestion, toggleSidebar, submitAllAnswers } = useQuiz();
  const { state: apiState } = useApiQuiz();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(false);
  const [latestApiResults, setLatestApiResults] = useState<any>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Extract API session results from the API state, prioritizing latest API response
  const apiSessionResults = latestApiResults || (apiState.session ? {
    scoreOutOf20: apiState.session.score,
    percentageScore: apiState.session.percentage,
    timeSpent: apiState.session.timeSpent,
    answeredQuestions: apiState.session.answeredQuestions,
    totalQuestions: apiState.session.totalQuestions,
    status: apiState.session.status,
    sessionId: apiState.apiSessionId
  } : undefined);

  // Global keyboard shortcuts
  useGlobalKeyboardShortcuts({
    onShowExitDialog: () => setShowExitDialog(true),
    onClearAnswers: () => {
      // This will be handled by individual question components
      // We'll pass this down to question components
    }
  });

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
        router.push(`/session/${id}/results`);
      }
    }
  }, [session.status, router]);

  // Handle browser close/navigation with session status management
  useEffect(() => {
    const apiSessionId = (state as any).apiSessionId;
    if (!apiSessionId) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only update status if session is not already completed
      if (session.status !== 'COMPLETED' && session.status !== 'completed') {
        SessionStatusManager.handleBeforeUnload(
          apiSessionId,
          totalQuestions,
          answeredQuestions
        );
      }
    };

    const handleVisibilityChange = () => {
      // Handle tab/window visibility changes
      if (document.hidden && session.status !== 'COMPLETED' && session.status !== 'completed') {
        // User switched away from tab - update status if there are unanswered questions
        if (answeredQuestions < totalQuestions && answeredQuestions > 0) {
          SessionStatusManager.setInProgress(apiSessionId, { silent: true });
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session.status, totalQuestions, answeredQuestions, state]);

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

  const handleShowStatsOverlay = async () => {
    setShowExitDialog(false); // Close exit dialog first
    setStatsError(null); // Clear any previous errors

    // Submit answers like pause does (but don't actually pause the timer)
    try {
      // Use the same submission logic as pause but without pausing
      if (state.apiSessionId) {
        const userAnswers = session?.userAnswers || {};
        const answersToSubmit = Object.keys(userAnswers).filter(
          questionId => {
            const answer = userAnswers[questionId];
            return answer && (answer.selectedOptions?.length || answer.textAnswer);
          }
        );

        if (answersToSubmit.length > 0) {
          console.log(`📤 Submitting ${answersToSubmit.length} answers for stats display...`);

          // Import QuizService dynamically to avoid circular dependencies
          const { QuizService } = await import('@/lib/api-services');

          // Convert answers to API format (same logic as pause)
          const answersForSubmission = answersToSubmit.map(questionId => {
            const answer = userAnswers[questionId];
            return {
              questionId: Number(questionId),
              selectedAnswerId: answer.selectedOptions?.[0],
              selectedAnswerIds: answer.selectedOptions,
              textAnswer: answer.textAnswer,
              timeSpent: answer.timeSpent || 0
            };
          });

          // Build question type lookup
          const questionTypeById: Record<number, string> = {};
          (session.questions || []).forEach((q: any) => {
            const qt = (q.questionType || q.type || '').toString().toUpperCase();
            questionTypeById[Number(q.id)] = qt || 'SINGLE_CHOICE';
          });

          // Convert to API format
          const apiAnswers = answersForSubmission.map(answer => {
            const qType = questionTypeById[Number(answer.questionId)] || 'SINGLE_CHOICE';
            const isSingle = qType === 'SINGLE_CHOICE' || qType === 'QCS';
            const isMulti = qType === 'MULTIPLE_CHOICE' || qType === 'QCM';

            if (isSingle) {
              const selectedId = typeof answer.selectedAnswerId === 'number'
                ? answer.selectedAnswerId
                : (Array.isArray(answer.selectedAnswerIds) && answer.selectedAnswerIds.length ? Number(answer.selectedAnswerIds[0]) : undefined);
              return {
                questionId: Number(answer.questionId),
                ...(Number.isFinite(selectedId as number) ? { selectedAnswerId: Number(selectedId) } : {}),
                timeSpent: answer.timeSpent,
              };
            }

            if (isMulti) {
              const ids = Array.isArray(answer.selectedAnswerIds) ? answer.selectedAnswerIds.map(Number).filter(n => Number.isFinite(n)) : [];
              return {
                questionId: Number(answer.questionId),
                ...(ids.length ? { selectedAnswerIds: ids } : {}),
                timeSpent: answer.timeSpent,
              };
            }

            return {
              questionId: Number(answer.questionId),
              ...(typeof answer.selectedAnswerId === 'number' ? { selectedAnswerId: answer.selectedAnswerId }
                : (Array.isArray(answer.selectedAnswerIds) && answer.selectedAnswerIds.length ? { selectedAnswerIds: answer.selectedAnswerIds } : {})),
              timeSpent: answer.timeSpent,
            };
          }).filter(entry => entry.selectedAnswerId || entry.selectedAnswerIds);

          if (apiAnswers.length > 0) {
            const totalTimeSpent = timer.totalTime || 0;
            const response = await QuizService.submitAnswersBulk(state.apiSessionId, apiAnswers, totalTimeSpent);

            if (response.success && response.data) {
              // Capture the API response data for display
              console.log('✅ Successfully submitted answers for stats display:', response.data);
              setLatestApiResults({
                scoreOutOf20: response.data.scoreOutOf20,
                percentageScore: response.data.percentageScore,
                timeSpent: response.data.timeSpent,
                answeredQuestions: response.data.answeredQuestions,
                totalQuestions: response.data.totalQuestions,
                status: response.data.status || 'IN_PROGRESS',
                sessionId: response.data.sessionId || state.apiSessionId
              });
            } else {
              throw new Error(response.error || 'Failed to submit answers');
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to submit answers for stats display:', error);
      setStatsError(error instanceof Error ? error.message : 'Failed to submit answers');
      // Continue to show stats even if submission fails
    }

    // Show the stats overlay
    setShowStatsOverlay(true);
  };

  const handleCloseStatsOverlay = () => {
    setShowStatsOverlay(false);
  };

  const getSessionTypeBadge = (type: string) => {
    const variants = {
      training: 'bg-primary/10 text-primary-foreground border-primary/20',
      exam: 'bg-primary/10 text-primary border-primary/20',
      residency: 'bg-accent/10 text-accent-foreground border-accent/20',
      remedial: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
    };
    return variants[type as keyof typeof variants] || 'bg-muted/10 text-muted-foreground border-muted/20';
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
              (() => {
                const timeLimit = session.timeLimit; // in minutes
                const totalTimeSeconds = timer.totalTime;
                const timeLimitSeconds = timeLimit ? timeLimit * 60 : null;
                const timeRemaining = timeLimitSeconds ? Math.max(0, timeLimitSeconds - totalTimeSeconds) : null;
                const isTimeUp = timeLimitSeconds && totalTimeSeconds >= timeLimitSeconds;
                const isNearEnd = timeLimitSeconds && timeRemaining && timeRemaining <= 300; // 5 minutes warning

                return (
                  <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 ${
                    isTimeUp ? 'bg-red-100 dark:bg-red-900/30' :
                    isNearEnd ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    'bg-muted/30'
                  }`}>
                    <Clock className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      isTimeUp ? 'text-red-600 dark:text-red-400' :
                      isNearEnd ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-muted-foreground'
                    }`} />
                    <span className={`font-mono font-medium tracking-wider text-xs sm:text-sm ${
                      isTimeUp ? 'text-red-600 dark:text-red-400' :
                      isNearEnd ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-foreground'
                    }`}>
                      {timeLimit ? (
                        timeRemaining !== null ? formatTime(timeRemaining) : formatTime(totalTimeSeconds)
                      ) : (
                        formatTime(totalTimeSeconds)
                      )}
                    </span>
                    {timeLimit && (
                      <span className="text-xs text-muted-foreground">
                        / {formatTime(timeLimitSeconds || 0)}
                      </span>
                    )}
                  </div>
                );
              })()
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
                <Button variant="outline" size="sm" onClick={() => router.push(`/session/${state.apiSessionId || session.id}/results`)} className="gap-2">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowExitDialog(true)}
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Exit</span>
                </Button>
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
              {session.questions.map((question, index) => {
                const isCurrentQuestion = index === currentQuestionIndex;
                // Use localAnswers from API context instead of session.userAnswers
                const userAnswer = state.localAnswers?.[question?.id] || session.userAnswers?.[question?.id];
                const isAnswered = !!userAnswer;

                // Only show status if user has actually interacted with the question
                // Check if answer was submitted (has selectedOptions, selectedAnswerIds, or selectedAnswerId) or if session is completed
                const hasUserInteraction = isAnswered && (
                  userAnswer.selectedOptions?.length > 0 ||
                  userAnswer.selectedAnswerIds?.length > 0 ||
                  userAnswer.selectedAnswerId ||
                  userAnswer.textAnswer ||
                  session.status === 'COMPLETED' ||
                  session.status === 'completed'
                );

                // Determine if the answer is correct (only if user has interacted)
                let isCorrect = null;
                if (hasUserInteraction && userAnswer) {
                  // If we have the isCorrect field directly (set at submission time), use it
                  if (typeof userAnswer.isCorrect === 'boolean') {
                    isCorrect = userAnswer.isCorrect;
                  } else {
                    // Handle text questions (QROC)
                    if (userAnswer.textAnswer && !userAnswer.selectedOptions && !userAnswer.selectedAnswerIds && !userAnswer.selectedAnswerId) {
                      const correctAnswers = question.correctAnswers || [];
                      if (correctAnswers.length > 0) {
                        // Simple keyword matching for text answers
                        const userText = userAnswer.textAnswer.toLowerCase().trim();
                        isCorrect = correctAnswers.some(correctAnswer => {
                          const keywords = correctAnswer.toLowerCase().split(/[\s,;]+/);
                          const matchedKeywords = keywords.filter(keyword =>
                            keyword.length > 2 && userText.includes(keyword)
                          );
                          return matchedKeywords.length >= Math.ceil(keywords.length * 0.6);
                        });
                      }
                    } else {
                      // Handle multiple choice questions
                      // Get selected answer IDs from different possible formats
                      let selectedAnswerIds: string[] = [];

                      if (userAnswer.selectedOptions?.length > 0) {
                        selectedAnswerIds = userAnswer.selectedOptions.map(String);
                      } else if (userAnswer.selectedAnswerIds?.length > 0) {
                        selectedAnswerIds = userAnswer.selectedAnswerIds.map(String);
                      } else if (userAnswer.selectedAnswerId) {
                        selectedAnswerIds = [String(userAnswer.selectedAnswerId)];
                      }

                      // Get correct answer IDs
                      const correctOptions = (question.options || question.answers || [])
                        .filter((opt: any) => opt.isCorrect)
                        .map((opt: any) => String(opt.id));

                      if (correctOptions.length > 0 && selectedAnswerIds.length > 0) {
                        // For multiple choice: all selected must be correct and all correct must be selected
                        const selectedSet = new Set(selectedAnswerIds);
                        const correctSet = new Set(correctOptions);
                        isCorrect = selectedSet.size === correctSet.size &&
                                   [...selectedSet].every(id => correctSet.has(id));
                      }
                    }
                  }
                }

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
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between",
                      isCurrentQuestion
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : hasUserInteraction
                          ? isCorrect === true
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : isCorrect === false
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <span>Question {index + 1}</span>
                    {hasUserInteraction && !isCurrentQuestion && (
                      <div className="flex items-center ml-2">
                        {isCorrect === true ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : isCorrect === false ? (
                          <XIcon className="h-4 w-4 text-red-600" />
                        ) : (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
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

        {/* Question Area - Enable scrolling */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/10 min-w-0">
          {/* Question Content - Allow scrolling */}
          <div className="flex-1 overflow-hidden">
            <QuestionDisplay />
          </div>

          {/* Enhanced Navigation Footer */}
          <EnhancedQuizFooter
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            answeredQuestions={answeredQuestions}
            onPrevious={previousQuestion}
            onNext={() => {
              // Allow navigation to next question without requiring an answer
              nextQuestion();
            }}
            onSubmit={async () => {
              // Inline finish: directly submit all answers and proceed to results
              await submitAllAnswers();
            }}
            canGoBack={currentQuestionIndex > 0}
            canGoForward={currentQuestionIndex < totalQuestions - 1}
            isLastQuestion={currentQuestionIndex === totalQuestions - 1}
            hideSubmit
          />
        </div>
      </div>

      {/* Pause Overlay (disabled in review mode) */}
      {timer.isPaused && !(session.status === 'COMPLETED' || session.status === 'completed') && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-8 animate-fade-in-up">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-pulse-soft">
                    <span className="text-4xl">⏸️</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">Quiz Paused</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Your answers have been automatically saved. Review your progress below.
                  </p>
                </div>
              </div>

              {/* Statistics Display */}
              <QuizStatisticsDisplay
                session={session}
                timer={timer}
                localAnswers={state.localAnswers}
                showTitle={false}
                className="max-w-3xl mx-auto"
                apiSessionResults={apiSessionResults}
                statsError={statsError}
              />

              {/* Resume Button */}
              <div className="text-center">
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
          </div>
        </div>
      )}

      {/* Stats Overlay (similar to pause overlay) */}
      {showStatsOverlay && !(session.status === 'COMPLETED' || session.status === 'completed') && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-8 animate-fade-in-up">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-pulse-soft">
                    <span className="text-4xl">📊</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground">Quiz Statistics</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-md mx-auto">
                    Your answers have been automatically saved. Review your detailed progress below.
                  </p>
                </div>
              </div>

              {/* Statistics Display */}
              <QuizStatisticsDisplay
                session={session}
                timer={timer}
                localAnswers={state.localAnswers}
                showTitle={false}
                className="max-w-3xl mx-auto"
                apiSessionResults={apiSessionResults}
                statsError={statsError}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleCloseStatsOverlay}
                  variant="outline"
                  size="lg"
                  className="gap-3 btn-modern focus-ring px-8 py-3 text-lg"
                >
                  <X className="h-5 w-5" />
                  Close Stats
                </Button>
                <Button
                  onClick={() => {
                    handleCloseStatsOverlay();
                    setShowExitDialog(true);
                  }}
                  variant="outline"
                  size="lg"
                  className="gap-3 btn-modern focus-ring px-8 py-3 text-lg"
                >
                  <Home className="h-5 w-5" />
                  Exit Options
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Exit Dialog */}
      <EnhancedExitDialog
        open={showExitDialog}
        onOpenChange={setShowExitDialog}
        session={session}
        timer={timer}
        localAnswers={state.localAnswers}
        apiSessionId={state.apiSessionId}
        apiSessionResults={apiSessionResults}
        onShowStats={handleShowStatsOverlay}
        statsError={statsError}
      />
    </div>
  );
}
