// @ts-nocheck
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { QuizLayout } from '@/components/student/quiz/quiz-layout';
import { QuizProvider } from '@/components/student/quiz/quiz-context';
import { ApiQuizProvider } from '@/components/student/quiz/quiz-api-context';
import { useQuizSession } from '@/hooks/use-quiz-api';
import { FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary, ApiError } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { SoundProvider } from '@/components/student/quiz/sound-provider';

function StudentSessionRunnerContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = parseInt(params.sessionId as string);

  const { session: apiSession, loading: sessionLoading, error: sessionError, refresh } = useQuizSession(sessionId);
  const [quizSession, setQuizSession] = useState<any>(null);

  // Debug: log session fetch lifecycle
  useEffect(() => {
    if (!apiSession) return;
    const sessionData = apiSession.data?.data || apiSession.data || apiSession;
    console.debug('[SessionRunner] API session raw:', {
      sessionId,
      questionCount: sessionData?.questions?.length || 0,
      questionIdsSample: (sessionData?.questions || []).slice(0, 20).map((q: any) => q.id),
    });
  }, [apiSession, sessionId]);

  useEffect(() => {
    if (apiSession) {
      // Parse response according to session-doc.md structure
      // Expected structure: { success: true, data: { id, title, type, status, questions, answers, timeSpent, ... } }
      const responseData = apiSession.data || apiSession;
      const sessionData = responseData.data || responseData;

      // Validate we have the expected session data structure
      if (!sessionData || typeof sessionData.id !== 'number') {
        console.error('Invalid session data structure:', sessionData);
        return;
      }

      const sessionType = sessionData.type || 'PRACTICE';
      const serverStatus = sessionData.status;
      const isServerCompleted = serverStatus === 'COMPLETED';

      // Handle session completion redirect
      if (isServerCompleted && !searchParams?.get('review')) {
        console.log('🏁 Session is completed, redirecting to results...', {
          sessionId,
          status: serverStatus,
          type: sessionType
        });
        router.push(`/session/${sessionId}/results`);
        return;
      }

      // Log session resumption details
      console.log('🔄 Resuming session from API:', {
        sessionId,
        type: sessionType,
        status: serverStatus,
        timeSpent: sessionData.timeSpent,
        answersCount: sessionData.answers?.length || 0,
        questionsCount: sessionData.questions?.length || 0
      });

      // Extract questions from the documented structure
      const extractedQuestions = Array.isArray(sessionData.questions) ? sessionData.questions : [];

      if (!extractedQuestions.length) {
        console.debug('[SessionRunner] No questions extracted from API payload', {
          keys: Object.keys(sessionData || {}),
          hasDataQuestions: Array.isArray(sessionData?.data?.questions),
          hasSessionQuestions: Array.isArray(sessionData?.session?.questions),
          questionIds: sessionData?.questionIds || sessionData?.session?.questionIds || [],
        });
      }

      // Build userAnswers map from API answers according to getsessioninprogress.md structure
      // The answers array contains objects with questionId, selectedAnswerId, isCorrect, answeredAt for answered questions
      // and objects with only questionId for unanswered questions
      const answersArr = Array.isArray(sessionData.answers) ? sessionData.answers : [];
      const { builtUserAnswers, nextUnansweredIndex } = (() => {
        const map: Record<string, any> = {};
        let nextUnanswered = 0;
        const answeredQuestionIds = new Set();

        // Process answers from API response
        for (const answer of answersArr) {
          const qid = String(answer.questionId);
          if (qid) {
            if (answer.selectedAnswerId) {
              // This is an answered question
              answeredQuestionIds.add(answer.questionId);
              map[qid] = {
                questionId: qid,
                selectedOptions: [String(answer.selectedAnswerId)],
                isCorrect: answer.isCorrect,
                timeSpent: 0,
                isBookmarked: false,
                notes: '',
                flags: [],
                answeredAt: answer.answeredAt,
                locked: true, // Lock previously submitted answers so they cannot be changed
              };
            } else {
              // This is an unanswered question (only has questionId)
              map[qid] = {
                questionId: qid,
                selectedOptions: [],
                isCorrect: false,
                timeSpent: 0,
                isBookmarked: false,
                notes: '',
                flags: [],
                locked: false,
              };
            }
          }
        }

        // Find the first unanswered question to navigate to
        if (extractedQuestions && Array.isArray(extractedQuestions)) {
          for (let i = 0; i < extractedQuestions.length; i++) {
            if (!answeredQuestionIds.has(extractedQuestions[i].id)) {
              nextUnanswered = i;
              break;
            }
          }
          // If all questions are answered, stay on the last question
          if (nextUnanswered === 0 && answeredQuestionIds.size === extractedQuestions.length) {
            nextUnanswered = extractedQuestions.length - 1;
          }
        }

        return { builtUserAnswers: map, nextUnansweredIndex: nextUnanswered };
      })();



      const isReview = searchParams?.get('review') === '1';
      const transformedSession = {
        // Use documented session structure from session-doc.md and getsessioninprogress.md
        id: sessionData.id,
        title: sessionData.title || 'Quiz Session',
        type: sessionData.type || 'PRACTICE',
        status: isReview ? 'COMPLETED' : (sessionData.status || 'NOT_STARTED'),
        score: sessionData.score || 0,
        percentage: sessionData.percentage || 0,
        questions: extractedQuestions,
        answers: sessionData.answers || [],
        createdAt: sessionData.createdAt,
        updatedAt: sessionData.updatedAt,

        // Additional fields for quiz functionality
        settings: {
          showTimer: !isReview,
          allowPause: !isReview,
          showProgress: true,
          randomizeOptions: false,
          ...(sessionData.settings || {}),
        },
        // Use API-determined current question index for session resumption
        currentQuestionIndex: isReview ? 0 : nextUnansweredIndex,
        totalQuestions: extractedQuestions.length || 0,
        userAnswers: builtUserAnswers,
        subject: sessionData.subject || (sessionType === 'EXAM' ? 'Exam' : 'General'),
        unit: sessionData.unit || (sessionType === 'EXAM' ? 'Exam Session' : 'Practice'),
        timeLimit: sessionData.settings?.timeLimit,

        // Resume session state from API
        timeSpent: sessionData.timeSpent || 0, // Resume timer from where user left off
        resumeFromApi: true, // Flag to indicate this session is being resumed from API
      };

      setQuizSession(transformedSession);
    }
  }, [apiSession, router, sessionId, searchParams]);

  if (sessionLoading) {
    return <FullPageLoading message="Loading session..." />;
  }

  if (sessionError && !quizSession) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-lg space-y-6 text-center">
            <h1 className="text-2xl font-semibold">Couldn’t load the session</h1>
            <ApiError error={sessionError} onRetry={refresh} />
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={refresh}>Try Again</Button>
              <Button onClick={() => router.push('/student/practice')}>Back to Practice</Button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!quizSession || !quizSession.settings) {
    return <FullPageLoading message="Preparing session..." />;
  }

  const useApiIntegration = !isNaN(sessionId) && apiSession;

  return (
    <div className="min-h-screen bg-background">
      <SoundProvider>
        {useApiIntegration ? (
          <ApiQuizProvider initialSession={quizSession} apiSessionId={sessionId} enableApiSubmission={true}>
            <QuizLayout />
          </ApiQuizProvider>
        ) : (
          <QuizProvider initialSession={quizSession}>
            <QuizLayout />
          </QuizProvider>
        )}
      </SoundProvider>
    </div>
  );
}

export default function StudentSessionRunnerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentSessionRunnerContent />
    </Suspense>
  );
}
