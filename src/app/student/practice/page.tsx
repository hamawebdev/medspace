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

export default function PracticePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useStudentAuth();

  // Content history for unit/module based practice sessions
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
  } = useContentHistory('PRACTICE');

  if (loading) {
    return <FullPageLoading message="Loading your account..." />;
  }

  if (!isAuthenticated) return null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl space-y-4 sm:space-y-6 lg:space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary animate-pulse-soft"></div>
                  <div className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary/30 animate-ping"></div>
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold practice-history-gradient-text">
                  Practice History
                </h1>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">Browse practice sessions by unit or module</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                onClick={() => router.push('/student/practice/create')}
                className="gap-2 bg-primary hover:bg-primary/90 min-h-[44px] touch-target text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create Practice</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>

          {/* Practice History Content */}
          {selectedItem ? (
            <SessionList
              sessions={historySessions || []}
              loading={historySessionsLoading}
              error={historySessionsError}
              variant="practice"
              selectedItemName={selectedItem.name}
              onBack={clearSelection}
              pagination={pagination}
              onPageChange={setPage}
              onRefresh={refetchSessions}
            />
          ) : (
            <MedicalModulesGrid
              variant="practice"
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
