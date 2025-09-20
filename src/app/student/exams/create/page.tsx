'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useStudentAuth } from '@/hooks/use-auth';
import { FullPageLoading } from '@/components/loading-states';
import { ExamSessionWizard } from '@/components/student/exams/session-wizard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CreateExamPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading, checkAndRedirect } = useStudentAuth();

  useEffect(() => {
    checkAndRedirect();
  }, [checkAndRedirect]);

  if (loading) {
    return <FullPageLoading message="Loading..." />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleExamCreated = (examSession: any) => {
    // Session data is now at root level with id field
    const sessionId = examSession?.id;
    if (sessionId) {
      toast.success('Exam session created');
      router.push(`/session/${sessionId}`);
    } else {
      toast.error('Session created but no sessionId returned');
      router.push('/student/exams');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 pb-6 sm:pb-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                  Create Exam Session
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Set up a timed exam to test your knowledge under pressure
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/student/exams')}
              className="border-border/50 hover:bg-muted/50 self-start sm:self-center min-h-[44px]"
            >
              Back to Exams
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="p-0">
            <ExamSessionWizard
              onCancel={() => router.push('/student/exams')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

