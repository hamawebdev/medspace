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
import { Stethoscope } from 'lucide-react';

export default function ResidencyCreatePage() {
  const router = useRouter();
  const { filters: quizFilters } = useQuizFilters();
  const { subscriptions } = useUserSubscriptions();
  const { isResidency } = selectEffectiveActiveSubscription(subscriptions);

  const handleCreateSession = async (payload: PracticeSessionPayload & { questionCount?: number; courseIds?: number[] }) => {
    try {
      if (!isResidency) {
        toast.error('Residency subscription required');
        return;
      }

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
        title: payload.title || 'Residency Session',
        type: 'RESIDENCY',
        ...(quizType ? { quizType } : {}),
        settings: { questionCount: safeCount },
        filters: {
          yearLevels: yearLevelsFromSubs,
          ...filters,
          ...(moduleIds && moduleIds.length ? { moduleIds } : {}),
          ...(uniteIds ? { uniteIds } : {}),
        },
      } as any;

      // Build residency session by question IDs (consistent with practice flow)
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

      console.debug('[Residency/Create] Fetching questions to build RESIDENCY session by IDs', baseParams);
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
        type: 'RESIDENCY',
        questionIds,
        title: createPayload.title,
      });

      const sid = created?.data?.sessionId || created?.data?.id || (created as any)?.sessionId || (created as any)?.id;
      if (sid) {
        toast.success('Residency session created');
        router.push(`/session/${sid}`);
      } else {
        toast.error('Session created but no sessionId returned');
        router.push('/student/residency');
      }
    } catch (e: any) {
      console.error('[Residency/Create] error:', e);
      toast.error(e?.message || 'Failed to create session');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
                  Create Residency Session
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Advanced medical training with specialized residency content
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/student/residency')}
              className="border-border/50 hover:bg-muted/50 self-start sm:self-center min-h-[44px]"
            >
              Back to Residency
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {!isResidency ? (
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl">Residency Access Required</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You need an active Residency study pack subscription to create residency sessions with specialized medical content.
              </p>
              <Button
                onClick={() => router.push('/student/subscriptions')}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                View Subscription Plans
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-lg">
            <CardContent className="p-0">
              <SessionWizard
                onCreate={(p) => handleCreateSession(p as any)}
                onCancel={() => router.push('/student/residency')}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

