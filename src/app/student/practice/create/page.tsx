// @ts-nocheck
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionWizard, PracticeSessionPayload } from '@/components/student/practice/session-wizard';
import { useQuizFilters } from '@/hooks/use-quiz-api';
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription';
import { QuizService, StudentService } from '@/lib/api-services';
import { toast } from 'sonner';

export default function PracticeCreatePage() {
  const router = useRouter();
  const { filters: quizFilters } = useQuizFilters();
  const { subscriptions } = useUserSubscriptions();

  const handleCreateSession = async (payload: PracticeSessionPayload & { questionCount?: number; courseIds?: number[] }) => {
    try {
      const selectedTypes = payload.filters.types || [];
      const questionTypes = selectedTypes.map((t) => (t.toUpperCase() === 'QCM' ? 'MULTIPLE_CHOICE' : 'SINGLE_CHOICE')) as Array<'SINGLE_CHOICE'|'MULTIPLE_CHOICE'>;
      const quizType = questionTypes.length === 1 ? (questionTypes[0] === 'MULTIPLE_CHOICE' ? 'QCM' : 'QCS') : undefined;

      const courseNameToId = new Map((quizFilters?.courses || []).map((c: any) => [c.name, c.id]));
      const selectedCourseIds = (payload.courseIds && payload.courseIds.length)
        ? payload.courseIds
        : (payload.courses || []).map((name) => courseNameToId.get(name)).filter(Boolean) as number[];

      const quizYears = (payload.filters as any).quizYears as number[] | undefined;

      const filters: any = {
        ...(selectedCourseIds.length ? { courseIds: selectedCourseIds } : {}),
        ...(questionTypes.length ? { questionTypes } : {}),
        ...(payload.filters.quizSourceIds && payload.filters.quizSourceIds.length ? { quizSourceIds: payload.filters.quizSourceIds } : {}),
        ...(quizYears && quizYears.length ? { quizYears } : {}),
      };

      const moduleIds = (payload as any).moduleIds?.map(Number);
      const uniteIds = payload.unitId ? [Number(payload.unitId)] : undefined;

      const yearLevelsFromSubs = selectEffectiveActiveSubscription(subscriptions).allowedYearLevels;

      const safeCount = Math.max(1, Math.min(payload.questionCount || 10, payload.availableCount || Infinity));

      const createPayload = {
        title: payload.title || 'Practice Session',
        ...(quizType ? { quizType } : {}),
        settings: {
          questionCount: safeCount,
          ...(payload.timeLimit ? { timeLimit: payload.timeLimit } : {})
        },
        filters: {
          yearLevels: yearLevelsFromSubs,
          ...filters,
          ...(moduleIds && moduleIds.length ? { moduleIds } : {}),
          ...(uniteIds ? { uniteIds } : {}),
        },
      } as any;

      // Build question IDs via GET /students/questions then create by IDs as PRACTICE
      const baseParams: any = {
        yearLevels: yearLevelsFromSubs,
        moduleIds,
        uniteIds,
        count: safeCount,
        randomize: true,
      };
      if (questionTypes.length === 1) {
        baseParams.questionType = questionTypes[0];
      }

      console.debug('[Practice/Create] Fetching questions to build PRACTICE session by IDs', baseParams);
      const qRes = await StudentService.getQuestions(baseParams);
      if (!qRes.success) {
        const msg = qRes.error || 'Failed to fetch questions for the selected filters';
        toast.error(msg);
        return;
      }

      const questionsArr: any[] = (qRes.data?.data?.questions || qRes.data?.questions || qRes.data?.items || []) as any[];
      const questionIds: number[] = questionsArr.slice(0, safeCount).map((q: any) => Number(q?.id)).filter(Boolean);

      if (!questionIds.length) {
        toast.error('No questions available with current filters');
        return;
      }

      const created = await QuizService.createSessionByQuestions({
        type: 'PRACTICE',
        questionIds,
        title: createPayload.title,
      });

      const sid = created?.data?.sessionId || created?.data?.id || (created as any)?.sessionId || (created as any)?.id;
      if (sid) {
        toast.success('Practice session created');
        router.push(`/session/${sid}`);
      } else {
        toast.error('Session created but no sessionId returned');
        router.push('/student/practice');
      }
    } catch (e: any) {
      console.error('[Practice/Create] error:', e);
      toast.error(e?.message || 'Failed to create session');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Create Practice Session
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Customize your learning experience with targeted practice
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/student/practice')}
              className="border-border/50 hover:bg-muted/50 self-start sm:self-center min-h-[44px]"
            >
              Back to Practice
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-0">
            <SessionWizard
              onCreate={(p) => handleCreateSession(p as any)}
              onCancel={() => router.push('/student/practice')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

