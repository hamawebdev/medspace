// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudentService } from '@/lib/api-services';
import { StudentDashboardStats } from '@/types/api';
import { toast } from 'sonner';

// Interface for dashboard stats state
interface DashboardStatsState {
  data: StudentDashboardStats | null;
  loading: boolean;
  error: string | null;
}

// Hook for managing student dashboard stats data
export function useStudentDashboardStats() {
  const [state, setState] = useState<DashboardStatsState>({
    data: null,
    loading: true,
    error: null,
  });

  // Fetch dashboard stats data
  const fetchDashboardStats = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await StudentService.getDashboardStats();

      if (response.success) {
        // Handle nested response structure
        const statsData = response.data?.data ?? response.data ?? null;

        setState(prev => ({
          ...prev,
          data: statsData,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
      setState(prev => ({
        ...prev,
        data: null,
        loading: false,
        error: errorMessage,
      }));
      console.error('Dashboard stats fetch error:', error);

      // Don't show toast for network errors to avoid spam
      if (!`${errorMessage}`.toLowerCase().includes('network')) {
        toast.error('Failed to load dashboard statistics');
      }
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Refresh data
  const refresh = useCallback(() => {
    return fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Initialize data on mount
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Derived data for easier consumption
  const derivedData = state.data ? {
    // Stats cards data
    statsCards: {
      totalUnits: state.data.unitsCount,
      totalQuestions: state.data.questionCount,
      independentModules: state.data.independentModulesCount,
    },
    
    // Recent activity data
    recentActivity: state.data.lastSessionByCreated,
    
    // Todos today (limit to 3)
    todosToday: state.data.todosToday?.slice(0, 3) || [],
    
    // Weekly performance data (transform for chart)
    weeklyPerformance: state.data.answersLast7Days?.map(day => ({
      date: day.date,
      correct: day.correct,
      incorrect: day.incorrect,
      viewed: day.total - day.correct - day.incorrect, // Calculate viewed from total
    })) || [],
    
    // User profile
    userProfile: state.data.userProfile,
  } : null;

  return {
    ...state,
    derivedData,
    clearError,
    refresh,
  };
}
