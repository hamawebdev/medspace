// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { QuizLayout } from '@/components/student/quiz/quiz-layout';
import { QuizProvider } from '@/components/student/quiz/quiz-context';
import { ApiQuizProvider } from '@/components/student/quiz/quiz-api-context';
import { useQuizSession } from '@/hooks/use-quiz-api';
import { FullPageLoading } from '@/components/loading-states';
import { ErrorBoundary, ApiError } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';

export default function StudentSessionRunnerPage() {
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
      // Expected structure: { success: true, data: { id, title, type, status, questions, answers, ... } }
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

      // Build userAnswers map from API answers according to session-doc.md structure
      // The answers array contains objects with questionId only (no selected answers in this structure)
      const answersArr = Array.isArray(sessionData.answers) ? sessionData.answers : [];
      const builtUserAnswers = (() => {
        const map: Record<string, any> = {};

        // According to session-doc.md, answers array contains objects like { "questionId": 1 }
        // This indicates which questions have been answered, but not the actual selected answers
        // The actual selected answers would be stored separately or retrieved from submission history
        for (const answer of answersArr) {
          const qid = String(answer.questionId);
          if (qid) {
            map[qid] = {
              questionId: qid,
              selectedOptions: [], // Will be populated from local storage or submission data
            };
          }
        }

        // Compute isCorrect per question when possible using documented structure
        const questionById: Record<string, any> = {};
        (extractedQuestions || []).forEach((q: any) => { questionById[String(q.id)] = q; });
        for (const [qid, entry] of Object.entries(map)) {
          const q = questionById[qid];
          const selected = new Set((entry as any).selectedOptions || []);

          // According to session-doc.md, answers are in questionAnswers array
          const correctIds = new Set(
            (q?.questionAnswers || [])
              .filter((ans: any) => ans.isCorrect)
              .map((ans: any) => String(ans.id))
          );

          if (correctIds.size > 0) {
            const sameSize = selected.size === correctIds.size;
            const allMatch = sameSize && Array.from(selected).every(id => correctIds.has(id));
            (entry as any).isCorrect = !!allMatch;
          }
        }

        return map;
      })();



      const isReview = searchParams?.get('review') === '1';
      const transformedSession = {
        // Use documented session structure from session-doc.md
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
        currentQuestionIndex: sessionData.currentQuestionIndex || 0,
        totalQuestions: extractedQuestions.length || 0,
        userAnswers: builtUserAnswers,
        subject: sessionData.subject || (sessionType === 'EXAM' ? 'Exam' : 'General'),
        unit: sessionData.unit || (sessionType === 'EXAM' ? 'Exam Session' : 'Practice'),
        timeLimit: sessionData.settings?.timeLimit,
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
      {useApiIntegration ? (
        <ApiQuizProvider initialSession={quizSession} apiSessionId={sessionId} enableApiSubmission={true}>
          <QuizLayout />
        </ApiQuizProvider>
      ) : (
        <QuizProvider initialSession={quizSession}>
          <QuizLayout />
        </QuizProvider>
      )}
    </div>
  );
}

