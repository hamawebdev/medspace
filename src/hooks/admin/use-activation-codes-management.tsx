'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/api-services';
import { ActivationCode, CreateActivationCodeRequest, ActivationCodeFilters, PaginationParams } from '@/types/api';
import { toast } from 'sonner';

// Interface for activation codes management state
interface ActivationCodesState {
  codes: ActivationCode[];
  totalCodes: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filters: ActivationCodeFilters & PaginationParams;
}

// Hook for managing activation codes data
export function useActivationCodesManagement() {
  const [state, setState] = useState<ActivationCodesState>({
    codes: [],
    totalCodes: 0,
    currentPage: 1,
    totalPages: 1,
    loading: true,
    error: null,
    filters: {
      page: 1,
      limit: 20,
    },
  });

  // Fetch activation codes
  const fetchCodes = useCallback(async (page?: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = {
        ...state.filters,
        page: page || state.filters.page || 1,
      };

      console.log('🔍 Fetching activation codes with params:', params);

      const response = await AdminService.getActivationCodes(params);
      console.log('🔍 Raw API response:', response);

      if (response.success && response.data) {
        // Handle the response structure safely
        const responseData = response.data.data || response.data;
        const rawCodes = responseData.activationCodes || [];
        const pagination = responseData.pagination || {};

        console.log('✅ Activation codes fetched successfully:', {
          codesCount: rawCodes.length,
          pagination,
        });

        setState(prev => ({
          ...prev,
          codes: rawCodes,
          totalCodes: pagination.total || 0,
          currentPage: pagination.page || 1,
          totalPages: pagination.totalPages || 1,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch activation codes');
      }
    } catch (err) {
      console.error('❌ Error fetching activation codes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activation codes';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      toast.error('Error', {
        description: errorMessage,
      });
    }
  }, [state.filters]);

  // Initial load
  useEffect(() => {
    fetchCodes();
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<ActivationCodeFilters & PaginationParams>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters,
        page: newFilters.page || 1, // Reset to page 1 when filters change (except when explicitly setting page)
      },
    }));

    // Fetch with new filters
    setTimeout(() => {
      fetchCodes(newFilters.page || 1);
    }, 0);
  }, [fetchCodes]);

  // Clear filters
  const clearFilters = useCallback(() => {
    const clearedFilters = {
      page: 1,
      limit: 20,
    };
    
    setState(prev => ({
      ...prev,
      filters: clearedFilters,
    }));

    setTimeout(() => {
      fetchCodes(1);
    }, 0);
  }, [fetchCodes]);

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    updateFilters({ page });
  }, [updateFilters]);

  // Create activation code
  const createCode = useCallback(async (codeData: CreateActivationCodeRequest) => {
    try {
      console.log('🔄 Creating activation code:', codeData);

      const response = await AdminService.createActivationCode(codeData);

      if (response.success && response.data) {
        console.log('✅ Activation code created successfully:', response.data);
        
        toast.success('Success', {
          description: 'Activation code created successfully',
        });

        // Refresh the codes list
        await fetchCodes(state.currentPage);
        
        return response.data.activationCode;
      } else {
        throw new Error(response.error || 'Failed to create activation code');
      }
    } catch (err) {
      console.error('❌ Error creating activation code:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create activation code';
      
      toast.error('Error', {
        description: errorMessage,
      });
      
      throw err;
    }
  }, [fetchCodes, state.currentPage]);

  // Deactivate activation code
  const deactivateCode = useCallback(async (codeId: number) => {
    try {
      console.log('🔄 Deactivating activation code:', codeId);

      const response = await AdminService.deactivateActivationCode(codeId);

      if (response.success && response.data) {
        console.log('✅ Activation code deactivated successfully:', response.data);
        
        toast.success('Success', {
          description: 'Activation code deactivated successfully',
        });

        // Refresh the codes list
        await fetchCodes(state.currentPage);
        
        return response.data.activationCode;
      } else {
        throw new Error(response.error || 'Failed to deactivate activation code');
      }
    } catch (err) {
      console.error('❌ Error deactivating activation code:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to deactivate activation code';
      
      toast.error('Error', {
        description: errorMessage,
      });
      
      throw err;
    }
  }, [fetchCodes, state.currentPage]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchCodes(state.currentPage);
  }, [fetchCodes, state.currentPage]);

  // Computed properties
  const hasCodes = state.codes.length > 0;
  const hasError = !!state.error;
  const hasFilters = Object.keys(state.filters).some(key => 
    key !== 'page' && key !== 'limit' && state.filters[key as keyof typeof state.filters] !== undefined
  );

  return {
    // Data
    codes: state.codes,
    totalCodes: state.totalCodes,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loading: state.loading,
    error: state.error,
    filters: state.filters,

    // Actions
    updateFilters,
    clearFilters,
    createCode,
    deactivateCode,
    goToPage,
    refresh,

    // Computed
    hasCodes,
    hasError,
    hasFilters,
  };
}
