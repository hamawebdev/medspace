// @ts-nocheck
'use client';

import { useEffect, useState, useCallback } from 'react';
import ExamService, { ExamSessionFilters } from '@/lib/api/exam-service';

interface State {
  filters: ExamSessionFilters | null;
  loading: boolean;
  error: string | null;
}

export function useExamSessionFilters() {
  const [state, setState] = useState<State>({ filters: null, loading: true, error: null });

  const fetchFilters = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await ExamService.getExamSessionFilters();
      setState({ filters: data, loading: false, error: null });
    } catch (e: any) {
      const message = e?.message || 'Failed to load exam session filters';
      setState({ filters: null, loading: false, error: message });
    }
  }, []);

  useEffect(() => { fetchFilters(); }, [fetchFilters]);

  return { ...state, refresh: fetchFilters };
}

