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
      const sessionData = apiSession.data?.data || apiSession.data || apiSession;
      const sessionType = sessionData.type || 'PRACTICE';

      const totalQ = sessionData.questions?.length || 0;
      const answeredCount = Array.isArray(sessionData.answers) ? sessionData.answers.length : 0;
      const serverStatus = sessionData.status;
      const isServerCompleted = serverStatus === 'COMPLETED';

      // Extract questions early so subsequent logic can reference it safely
      const extractedQuestions = Array.isArray(sessionData.questions)
        ? sessionData.questions
        : (Array.isArray(sessionData?.data?.questions)
            ? sessionData.data.questions
            : (Array.isArray(sessionData?.session?.questions)
                ? sessionData.session.questions
                : []));

      if (!extractedQuestions.length) {
        console.debug('[SessionRunner] No questions extracted from API payload', {
          keys: Object.keys(sessionData || {}),
          hasDataQuestions: Array.isArray(sessionData?.data?.questions),
          hasSessionQuestions: Array.isArray(sessionData?.session?.questions),
          questionIds: sessionData?.questionIds || sessionData?.session?.questionIds || [],
        });
      }

      // Build userAnswers map from API answers for proper review highlighting (supports QCS and QCM)
      const answersArr = Array.isArray(sessionData.answers) ? sessionData.answers : [];
      const builtUserAnswers = (() => {
        const map: Record<string, any> = {};

        // Prefer server-provided userAnswers if present; we'll merge with answersArr data
        if (sessionData.userAnswers && typeof sessionData.userAnswers === 'object') {
          for (const [qidStr, ua] of Object.entries(sessionData.userAnswers)) {
            const qid = String(qidStr);
            const selectedIds = Array.isArray((ua as any).selectedAnswerIds)
              ? (ua as any).selectedAnswerIds.map((n: any) => String(n))
              : Array.isArray((ua as any).selectedOptions)
                ? (ua as any).selectedOptions.map((s: any) => String(s))
                : (typeof (ua as any).selectedAnswerId !== 'undefined' ? [String((ua as any).selectedAnswerId)] : []);
            map[qid] = {
              questionId: qid,
              selectedOptions: selectedIds,
            };
          }
        }

        // Merge in selections from answers array
        for (const a of answersArr) {
          const qid = String(a.questionId || a.question?.id || a.id);
          if (!qid) continue;
          const ids: string[] = Array.isArray(a.selectedAnswerIds) && a.selectedAnswerIds.length
            ? a.selectedAnswerIds.map((n: any) => String(n))
            : (typeof a.selectedAnswerId !== 'undefined' || typeof a.answerId !== 'undefined' || typeof a.selectedOptionId !== 'undefined')
              ? [String(a.selectedAnswerId ?? a.answerId ?? a.selectedOptionId)]
              : [];
          if (!ids.length) continue;
          if (!map[qid]) map[qid] = { questionId: qid, selectedOptions: [] as string[] };
          const arr = map[qid].selectedOptions as string[];
          ids.forEach(id => { if (!arr.includes(id)) arr.push(id); });
        }

        // Compute isCorrect per question when possible
        const questionById: Record<string, any> = {};
        (extractedQuestions || []).forEach((q: any) => { questionById[String(q.id)] = q; });
        for (const [qid, entry] of Object.entries(map)) {
          const q = questionById[qid];
          const selected = new Set((entry as any).selectedOptions || []);
          const correctIds = new Set(
            (q?.answers || q?.options || [])
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
        ...sessionData,
        settings: {
          showTimer: !isReview, // hide timer in review by default
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
        status: isReview ? 'COMPLETED' : (serverStatus || 'active'),
        questions: extractedQuestions,
        type: sessionType,
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
    <>
      {useApiIntegration ? (
        <ApiQuizProvider initialSession={quizSession} apiSessionId={sessionId} enableApiSubmission={true}>
          <QuizLayout />
        </ApiQuizProvider>
      ) : (
        <QuizProvider initialSession={quizSession}>
          <QuizLayout />
        </QuizProvider>
      )}
    </>
  );
}

