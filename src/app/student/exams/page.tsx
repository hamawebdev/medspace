// @ts-nocheck
'use client';

import React from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/error-boundary';
import { FullPageLoading } from '@/components/loading-states';
import { useStudentAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { UnitModuleGrid } from '@/components/student/shared/unit-module-grid';
import { MedicalModulesGrid } from '@/components/student/shared/medical-modules-grid';
import { SessionList } from '@/components/student/shared/session-list';
import { useContentHistory } from '@/hooks/use-content-history';

export default function ExamsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useStudentAuth();

  // Content history for unit/module based exam sessions
  const {
    contentFilters,
    loading: contentLoading,
    error: contentError,
    selectedItem,
    sessions: historySessions,
    sessionsLoading: historySessionsLoading,
    sessionsError: historySessionsError,
    pagination,
    selectItem,
    clearSelection,
    refetchContent,
    refetchSessions,
    setPage
  } = useContentHistory('EXAM');

  if (loading) {
    return <FullPageLoading message="Loading your account..." />;
  }

  if (!isAuthenticated) return null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse-soft"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary/30 animate-ping"></div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold practice-history-gradient-text">
                  Exam History
                </h1>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">Browse exam sessions by unit or module</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() => router.push('/student/exams/create')}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px] touch-target"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Exam</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>

          {/* Exam History Content */}
          {selectedItem ? (
            <SessionList
              sessions={historySessions || []}
              loading={historySessionsLoading}
              error={historySessionsError}
              variant="exam"
              selectedItemName={selectedItem.name}
              onBack={clearSelection}
              pagination={pagination}
              onPageChange={setPage}
              onRefresh={refetchSessions}
            />
          ) : (
            <MedicalModulesGrid
              variant="exam"
              units={contentFilters?.unites}
              independentModules={contentFilters?.independentModules}
              loading={contentLoading}
              error={contentError}
              onItemClick={(item) => {
                // Convert to UnitModuleItem format for compatibility
                const unitModuleItem = {
                  id: item.id,
                  name: item.name,
                  type: item.type,
                  isIndependent: item.isIndependent,
                  sessionCount: item.sessionCount
                };
                selectItem(unitModuleItem);
              }}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
