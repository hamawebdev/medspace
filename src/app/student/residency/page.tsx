// @ts-nocheck
'use client';

import React from 'react';
import { Plus, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/error-boundary';
import { FullPageLoading } from '@/components/loading-states';
import { useStudentAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useUserSubscriptions, selectEffectiveActiveSubscription } from '@/hooks/use-subscription';
import { UnitModuleGrid } from '@/components/student/shared/unit-module-grid';
import { SessionList } from '@/components/student/shared/session-list';
import { useContentHistory } from '@/hooks/use-content-history';
import { cn } from '@/lib/utils';

export default function ResidencyPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useStudentAuth();
  const { subscriptions } = useUserSubscriptions();
  const { isResidency } = selectEffectiveActiveSubscription(subscriptions);

  // Content history for unit/module based residency sessions
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
  } = useContentHistory('PRACTICE'); // Use PRACTICE type since RESIDENCY might not be supported

  if (loading) {
    return <FullPageLoading message="Loading your account..." />;
  }

  if (!isAuthenticated) return null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-chart-4 animate-pulse-soft"></div>
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-chart-4/30 animate-ping"></div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-chart-4 to-chart-5 bg-clip-text text-transparent">
                  Residency History
                </h1>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">Browse residency sessions by unit or module</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isResidency && (
                <Button
                  onClick={() => router.push('/student/residency/create')}
                  className="gap-2 bg-chart-4 hover:bg-chart-4/90 min-h-[44px] touch-target"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Residency</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              )}
            </div>
          </div>

          {/* Subscription Notice */}
          {!isResidency && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <GraduationCap className="h-8 w-8 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800">Residency Subscription Required</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Access to residency sessions requires an active residency subscription. Upgrade your plan to unlock advanced medical training content.
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/student/subscriptions')}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Residency History Content */}
          {isResidency ? (
            selectedItem ? (
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
              <UnitModuleGrid
                units={contentFilters?.unites}
                independentModules={contentFilters?.independentModules}
                onItemClick={selectItem}
                variant="practice"
                loading={contentLoading}
                error={contentError}
                selectedItem={selectedItem}
              />
            )
          ) : null}
        </div>
      </div>
    </ErrorBoundary>
  );
}
