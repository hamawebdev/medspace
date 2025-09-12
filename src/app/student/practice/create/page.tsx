// @ts-nocheck
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionWizard, PracticeSessionPayload } from '@/components/student/practice/session-wizard';
import { useQuizFilters } from '@/hooks/use-quiz-api';
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription';
import { QuizService } from '@/lib/api-services';
import { NewApiService } from '@/lib/api/new-api-services';
import { toast } from 'sonner';

export default function PracticeCreatePage() {
  const router = useRouter();
  const { filters: quizFilters } = useQuizFilters();
  const { subscriptions } = useUserSubscriptions();

  const handleCreateSession = async (payload: PracticeSessionPayload & { questionCount?: number; courseIds?: number[]; sessionFilters?: any }) => {
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

      // Validate that we have a valid question count from the API
      if (!payload.questionCount || payload.questionCount <= 0) {
        toast.error('Invalid question count. Please select a valid number of questions.');
        return;
      }

      if (!payload.availableCount || payload.availableCount <= 0) {
        toast.error('No questions available with current filters. Please adjust your selection.');
        return;
      }

      const safeCount = Math.min(payload.questionCount, payload.availableCount);

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

      // Method 1: Complete Workflow of Filter
      // Step 1: Get Content Structure (already available via useQuizFilters)
      // Step 2: Get Available Questions by Unite or Module
      let allQuestions: any[] = [];

      // Fetch questions for each unite
      if (uniteIds && uniteIds.length > 0) {
        for (const uniteId of uniteIds) {
          try {
            console.debug('[Practice/Create] Fetching questions for unite:', uniteId);
            const qRes = await NewApiService.getQuestionsByUniteOrModule({ uniteId });
            if (qRes.success && qRes.data?.questions) {
              allQuestions.push(...qRes.data.questions);
            }
          } catch (err) {
            console.warn(`Failed to fetch questions for unite ${uniteId}:`, err);
          }
        }
      }

      // Fetch questions for each module
      if (moduleIds && moduleIds.length > 0) {
        for (const moduleId of moduleIds) {
          try {
            console.debug('[Practice/Create] Fetching questions for module:', moduleId);
            const qRes = await NewApiService.getQuestionsByUniteOrModule({ moduleId });
            if (qRes.success && qRes.data?.questions) {
              allQuestions.push(...qRes.data.questions);
            }
          } catch (err) {
            console.warn(`Failed to fetch questions for module ${moduleId}:`, err);
          }
        }
      }

      if (allQuestions.length === 0) {
        toast.error('No questions available for the selected content');
        return;
      }

      // Step 3: Apply Frontend Filters
      let filteredQuestions = allQuestions;

      // Filter by question type if specified
      if (questionTypes.length === 1) {
        const targetType = questionTypes[0];
        filteredQuestions = filteredQuestions.filter((q: any) => q.questionType === targetType);
      }

      // Remove duplicates by question ID
      const uniqueQuestions = filteredQuestions.filter((q: any, index: number, arr: any[]) =>
        arr.findIndex((item: any) => item.id === q.id) === index
      );

      // Randomize and limit to requested count
      const shuffledQuestions = uniqueQuestions.sort(() => Math.random() - 0.5);
      const questionIds: number[] = shuffledQuestions.slice(0, safeCount).map((q: any) => Number(q?.id)).filter(Boolean);

      if (!questionIds.length) {
        toast.error('No questions available with current filters');
        return;
      }

      // Step 4: Create Session using new endpoint
      const sessionData = {
        title: createPayload.title,
        questionCount: safeCount,
        courseIds: selectedCourseIds,
        sessionType: 'PRACTISE' as const, // Note: using PRACTISE as per documentation
        // Practice sessions should not include rotations
        rotations: [] as Array<'R1' | 'R2' | 'R3' | 'R4'>,
        ...(payload.sessionFilters?.questionTypes?.length > 0 && {
          questionTypes: payload.sessionFilters.questionTypes
        }),
        ...(payload.sessionFilters?.years?.length > 0 && {
          years: payload.sessionFilters.years
        }),
        ...(payload.sessionFilters?.questionSourceIds?.length > 0 && {
          questionSourceIds: payload.sessionFilters.questionSourceIds
        }),
      };

      console.debug('[Practice/Create] Creating PRACTICE session with new endpoint:', sessionData);
      const created = await QuizService.createSession(sessionData);

      if (created.success && created.data?.sessionId) {
        toast.success('Practice session created');
        router.push(`/session/${created.data.sessionId}`);
      } else {
        console.error('Session creation failed:', created);
        toast.error(created.error || 'Failed to create practice session');
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

