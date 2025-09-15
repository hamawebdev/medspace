// @ts-nocheck
'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionWizard, PracticeSessionPayload } from '@/components/student/practice/session-wizard';
import { QuizService } from '@/lib/api-services';
import { toast } from 'sonner';

export default function PracticeCreatePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = useCallback(async (payload: PracticeSessionPayload & { questionCount?: number; courseIds?: number[]; sessionFilters?: any }) => {
    // Prevent duplicate submissions
    if (isCreating) {
      console.log('⚠️ [Practice/Create] Session creation already in progress, ignoring duplicate request');
      return;
    }

    setIsCreating(true);
    try {
      // Enhanced validation for required fields
      if (!payload.title || payload.title.trim().length < 3 || payload.title.trim().length > 100) {
        toast.error('Session title must be between 3 and 100 characters.');
        return;
      }

      if (!payload.questionCount || payload.questionCount < 1 || payload.questionCount > 100) {
        toast.error('Question count must be between 1 and 100.');
        return;
      }

      if (!payload.courseIds || payload.courseIds.length === 0 || payload.courseIds.length > 50) {
        toast.error('Please select between 1 and 50 courses.');
        return;
      }

      // Validate enum values for questionTypes
      const validQuestionTypes = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'];
      if (payload.sessionFilters?.questionTypes?.length > 0) {
        const invalidTypes = payload.sessionFilters.questionTypes.filter((type: string) => !validQuestionTypes.includes(type));
        if (invalidTypes.length > 0) {
          toast.error(`Invalid question types: ${invalidTypes.join(', ')}. Must be SINGLE_CHOICE or MULTIPLE_CHOICE.`);
          return;
        }
      }

      // Rotations removed from practice creation - always send empty array

      // Create session using the documented endpoint with proper filter structure
      const sessionData = {
        title: payload.title.trim(),
        questionCount: payload.questionCount,
        courseIds: payload.courseIds,
        sessionType: 'PRACTISE' as const,
        // Include all optional filters from sessionFilters if they exist
        ...(payload.sessionFilters?.questionTypes?.length > 0 && {
          questionTypes: payload.sessionFilters.questionTypes
        }),
        ...(payload.sessionFilters?.years?.length > 0 && {
          years: payload.sessionFilters.years
        }),
        ...(payload.sessionFilters?.questionSourceIds?.length > 0 && {
          questionSourceIds: payload.sessionFilters.questionSourceIds
        }),
        ...(payload.sessionFilters?.universityIds?.length > 0 && {
          universityIds: payload.sessionFilters.universityIds
        }),
        rotations: [], // Always empty for practice sessions
      };

      console.log('🚀 [Practice/Create] Creating session with payload:', {
        endpoint: 'POST /quizzes/sessions',
        requestBody: sessionData
      });

      const created = await QuizService.createSession(sessionData);

      console.log('📋 [Practice/Create] Session creation response:', {
        success: created.success,
        data: created.data,
        error: created.error
      });

      if (created.success && created.data?.sessionId) {
        const sessionId = created.data.sessionId;

        console.log('✅ [Practice/Create] Session created successfully, sessionId:', sessionId);

        // MANDATORY: Immediately fetch session questions using documented endpoint
        console.log('🔄 [Practice/Create] Fetching session questions...');
        const sessionResponse = await QuizService.getQuizSession(sessionId);

        console.log('📋 [Practice/Create] Session fetch response:', {
          success: sessionResponse.success,
          hasData: !!sessionResponse.data,
          questionsCount: sessionResponse.data?.questions?.length || 0
        });

        if (sessionResponse.success && sessionResponse.data?.questions) {
          console.log('✅ [Practice/Create] Session questions validated, redirecting...');
          toast.success('Practice session created successfully');
          router.push(`/session/${sessionId}`);
        } else {
          console.error('❌ [Practice/Create] Session created but questions fetch failed:', sessionResponse);
          toast.error('Session created but failed to load questions. Please try again.');
          return;
        }
      } else {
        console.error('❌ [Practice/Create] Session creation failed:', {
          success: created.success,
          error: created.error,
          data: created.data
        });

        if (!created.data?.sessionId) {
          toast.error('Session created but sessionId missing. Please contact support.');
        } else {
          toast.error(created.error || 'Failed to create practice session');
        }
      }
    } catch (e: any) {
      console.error('❌ [Practice/Create] Unexpected error:', {
        message: e?.message,
        statusCode: e?.statusCode,
        error: e
      });
      toast.error(e?.message || 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, router]);

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
              isCreating={isCreating}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

