// @ts-nocheck
'use client';
export function normalizeQuizFilters(raw: any) {
  if (!raw) return null;
  return {
    availableYears: Array.isArray(raw.availableYears) ? raw.availableYears : [],
    unites: Array.isArray(raw.unites) ? raw.unites : [],
    quizSources: Array.isArray(raw.quizSources)
      ? raw.quizSources.map((s: any) => ({ id: s.id, name: s.name, description: s.description, availableYears: s.availableYears }))
      : [],
    availableQuizYears: Array.isArray(raw.availableQuizYears) ? raw.availableQuizYears : undefined,
  };
}


import { useState, useEffect, useCallback } from 'react';
import { QuizService } from '@/lib/api-services';
import { QuizFilters, YearLevel, QuizCourse, QuizTopic, QuizDifficulty } from '@/types/api';
import { toast } from 'sonner';
import { useQuizSessionCache } from './use-quiz-session-cache';

// Interface for quiz filters state
interface QuizFiltersState {
  filters: QuizFilters | null;
  loading: boolean;
  error: string | null;
}

// Hook for managing quiz filters
export function useQuizFilters() {
  const [state, setState] = useState<QuizFiltersState>({
    filters: null,
    loading: true,
    error: null,
  });

  const fetchFilters = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await QuizService.getQuizFilters();

      if (response.success) {
        // Handle nested response structure: response.data.data
        const filtersData = response.data.data || response.data;
        setState({
          filters: normalizeQuizFilters(filtersData),
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch quiz filters');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quiz filters';
      setState({
        filters: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  return {
    ...state,
    refresh: fetchFilters,
  };



}



// Hook for managing quiz sessions with smart caching
export function useQuizSession(sessionId: number | null) {
  const [state, setState] = useState<{
    session: any | null;
    loading: boolean;
    error: string | null;
  }>({
    session: null,
    loading: false,
    error: null,
  });

  const { getCachedSession, setCachedSession, invalidateCache } = useQuizSessionCache();

  const fetchSession = useCallback(async (id: number, forceRefresh: boolean = false) => {
    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedSession = getCachedSession(id);
      if (cachedSession) {
        setState({
          session: cachedSession,
          loading: false,
          error: null,
        });
        return;
      }
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await QuizService.getQuizSession(id);

      if (response.success) {
        // Handle nested response structure
        const sessionData = response.data.data || response.data;

        // Cache the session data
        setCachedSession(id, sessionData);

        setState({
          session: sessionData,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch quiz session');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quiz session';
      setState({
        session: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [getCachedSession, setCachedSession]);

  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, [sessionId, fetchSession]);

  return {
    ...state,
    refresh: sessionId ? () => fetchSession(sessionId, false) : undefined,
    forceRefresh: sessionId ? () => fetchSession(sessionId, true) : undefined,
    invalidateCache: () => invalidateCache(sessionId || undefined),
  };
}

// Hook for quiz sessions list
export function useQuizSessions(params: {
  status?: 'NOT_STARTED' | 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED';
  type?: 'PRACTICE' | 'EXAM' | 'REMEDIAL' | 'RESIDENCY';
  page?: number;
  limit?: number;
} = {}) {
  const [state, setState] = useState<{
    sessions: any[] | null;
    pagination: any | null;
    loading: boolean;
    error: string | null;
  }>({
    sessions: null,
    pagination: null,
    loading: true,
    error: null,
  });

  const fetchSessions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Debug: Log the parameters being sent to the API (uncomment for debugging)
    // console.log('🔍 useQuizSessions Debug - API params:', params);

    try {
      const response = await QuizService.getQuizSessions(params);

      if (response.success) {
        // Debug: Log the API response structure (uncomment for debugging)
        // console.log('🔍 useQuizSessions Debug - API response:', response);

        // Handle nested response structure: response.data.data.sessions
        const responseData = response.data?.data?.data || response.data?.data || response.data;
        const sessionsArray = responseData?.sessions || responseData?.data || responseData;

        // Enforce client-side type separation in case backend ignores filter
        const classifyType = (s: any): 'PRACTICE' | 'EXAM' | 'REMEDIAL' | 'RESIDENCY' | undefined => {
          const raw = s?.type || s?.sessionType || s?.session_type || s?.quizType || s?.sessionCategory;
          if (typeof raw === 'string') {
            const up = raw.toUpperCase();
            if (up.includes('EXAM')) return 'EXAM';
            if (up.includes('RESIDENCY')) return 'RESIDENCY';
            if (up.includes('PRACTICE') || up.includes('TRAINING')) return 'PRACTICE';
            if (up.includes('REMEDIAL') || up.includes('REMEDIATION')) return 'REMEDIAL';
          }
          // Heuristics when explicit type is missing
          if (s?.examId) return 'EXAM';
          if (s?.quizId) return 'PRACTICE';
          const title: string = s?.title || '';
          if (/^exam\b/i.test(title) || s?.subject === 'Exam' || s?.unit === 'Exam Session') return 'EXAM';
          if (/residen/i.test(title)) return 'RESIDENCY';
          return undefined;
        };

        let filtered = Array.isArray(sessionsArray)
          ? (params.type ? sessionsArray.filter((s: any) => classifyType(s) === params.type) : sessionsArray)
          : [];

        // Fallback client-side status filter (APIs may use different param names)
        if (params.status) {
          const want = String(params.status).toUpperCase();
          filtered = filtered.filter((s: any) => String(s?.status || '').toUpperCase() === want);
        }

        const p = responseData?.pagination;
        const normalized = p ? {
          page: p.currentPage ?? p.page ?? 1,
          totalPages: p.totalPages ?? Math.ceil((p.total ?? 0) / (p.limit ?? params.limit ?? 10)) ?? 1,
          total: p.total ?? p.totalItems ?? 0,
          limit: p.limit ?? params.limit ?? 10,
          hasPrev: (p.currentPage ?? p.page ?? 1) > 1,
          hasNext: (p.currentPage ?? p.page ?? 1) < (p.totalPages ?? Math.ceil((p.total ?? 0) / (p.limit ?? params.limit ?? 10)) ?? 1),
        } : null;

        setState({
          sessions: filtered,
          pagination: normalized,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch quiz sessions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quiz sessions';
      setState({
        sessions: null,
        pagination: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [
    params.status,
    params.type,
    params.page,
    params.limit,
    params.search,
    params.subjectId,
    params.sessionType,
    params.startDate,
    params.endDate,
    params.sortBy,
    params.sortOrder
  ]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    ...state,
    refresh: fetchSessions,
  };
}

// Hook for submitting quiz answers
export function useQuizAnswerSubmission() {
  const [submitting, setSubmitting] = useState(false);

  const submitAnswer = useCallback(async (
    sessionId: number,
    answerData: {
      questionId: number;
      selectedAnswerId: number;
      timeSpent?: number;
    }
  ) => {
    setSubmitting(true);

    try {
      const response = await QuizService.submitAnswer(sessionId, answerData);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to submit answer');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit answer';
      toast.error(errorMessage);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const updateAnswer = useCallback(async (
    sessionId: number,
    questionId: number,
    answerData: {
      selectedAnswerId: number;
      timeSpent?: number;
    }
  ) => {
    setSubmitting(true);

    try {
      const response = await QuizService.updateAnswer(sessionId, questionId, answerData);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update answer');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update answer';
      toast.error(errorMessage);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitting,
    submitAnswer,
    updateAnswer,
  };
}

// Utility functions for working with quiz filters
export function getFilterOptions(filters: QuizFilters | null) {
  if (!filters) return null;

  // Extract courses from the nested structure
  const allCourses: QuizCourse[] = [];
  filters.unites?.forEach(unit => {
    unit.modules?.forEach(module => {
      module.courses?.forEach(course => {
        allCourses.push({
          ...course,
          moduleName: module.name,
          unitName: unit.name,
          year: unit.year
        });
      });
    });
  });

  return {
    yearLevels: filters.availableYears?.map(year => ({
      value: year,
      label: `Year ${year}`,
    })) || [],
    courses: allCourses.map(course => ({
      value: course.id.toString(),
      label: `${course.name} (${course.moduleName})`,
      moduleName: course.moduleName,
      unitName: course.unitName,
      questionCount: course.questionCount,
    })),
    units: filters.unites?.map(unit => ({
      value: unit.id.toString(),
      label: unit.name,
      year: unit.year,
    })) || [],
    modules: filters.unites?.flatMap(unit =>
      unit.modules?.map(module => ({
        value: module.id.toString(),
        label: module.name,
        unitId: unit.id,
        unitName: unit.name,
      })) || []
    ) || [],
    // Add default difficulties since API doesn't provide them
    difficulties: [
      { value: 'EASY', label: 'Easy' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HARD', label: 'Hard' }
    ],
  };
}

// Function to get topics for a specific course
// Note: Current API doesn't return topics, so we return empty array
export function getTopicsForCourse(filters: QuizFilters | null, courseId: number): QuizTopic[] {
  if (!filters) return [];
  // TODO: Update when API provides topics data
  return [];
}


