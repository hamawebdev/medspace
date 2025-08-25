'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '@/lib/api-services';
import { ApiUser, PaginationParams } from '@/types/api';
import { toast } from 'sonner';

// User filters interface
export interface UserFilters {
  search?: string;
  role?: 'STUDENT' | 'ADMIN' | 'EMPLOYEE' | '';
  university?: number;
  isActive?: boolean;
}

// User management state interface
interface UserManagementState {
  users: ApiUser[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filters: UserFilters;
}

// Hook for managing users
export function useUserManagement() {
  const [state, setState] = useState<UserManagementState>({
    users: [],
    totalUsers: 0,
    currentPage: 1,
    totalPages: 0,
    loading: true,
    error: null,
    filters: {
      search: '',
      role: '',
      university: undefined,
      isActive: undefined,
    },
  });

  // Fetch users with current filters and pagination
  const fetchUsers = useCallback(async (page: number = 1, limit: number = 20) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params: PaginationParams & UserFilters = {
        page,
        limit,
        ...state.filters,
      };

      // Clean up empty filters
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] === '' || params[key as keyof typeof params] === undefined) {
          delete params[key as keyof typeof params];
        }
      });

      console.log('🔍 Fetching users with params:', params);

      const response = await AdminService.getUsers(params);

      if (response.success && response.data) {
        // Handle the actual API response structure: { users: [...], pagination: {...} }
        const { users, pagination } = response.data;

        // Add safety checks for undefined values
        const safeUsers = users || [];
        const safePagination = pagination || { total: 0, page: 1, totalPages: 0 };

        setState(prev => ({
          ...prev,
          users: safeUsers,
          totalUsers: safePagination.total,
          currentPage: safePagination.page,
          totalPages: safePagination.totalPages,
          loading: false,
          error: null,
        }));

        console.log('✅ Users fetched successfully:', {
          count: safeUsers.length,
          total: safePagination.total,
          page: safePagination.page,
          responseStructure: Object.keys(response.data)
        });
      } else {
        throw new Error(response.error || 'Failed to fetch users');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      console.error('❌ Error fetching users:', error);
      
      setState(prev => ({
        ...prev,
        users: [],
        totalUsers: 0,
        currentPage: 1,
        totalPages: 0,
        loading: false,
        error: errorMessage,
      }));

      toast.error('Error', {
        description: errorMessage,
      });
    }
  }, [state.filters]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<UserFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        search: '',
        role: '',
        university: undefined,
        isActive: undefined,
      },
      currentPage: 1,
    }));
  }, []);

  // Create user
  const createUser = useCallback(async (userData: {
    email: string;
    password: string;
    fullName: string;
    role: 'STUDENT' | 'ADMIN' | 'EMPLOYEE';
    universityId?: number;
    specialtyId?: number;
    currentYear?: string;
  }) => {
    try {
      console.log('🔄 Creating user:', userData);

      const response = await AdminService.createUser(userData);

      if (response.success && response.data) {
        console.log('✅ User created successfully:', response.data);
        
        toast.success('Success', {
          description: 'User created successfully',
        });

        // Refresh the user list
        await fetchUsers(state.currentPage);
        
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create user');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      console.error('❌ Error creating user:', error);
      
      toast.error('Error', {
        description: errorMessage,
      });
      
      throw error;
    }
  }, [fetchUsers, state.currentPage]);

  // Update user
  const updateUser = useCallback(async (userId: number, userData: Partial<ApiUser>) => {
    try {
      console.log('🔄 Updating user:', { userId, userData });

      const response = await AdminService.updateUser(userId, userData);

      if (response.success && response.data) {
        console.log('✅ User updated successfully:', response.data);
        
        toast.success('Success', {
          description: 'User updated successfully',
        });

        // Refresh the user list
        await fetchUsers(state.currentPage);
        
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update user');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      console.error('❌ Error updating user:', error);
      
      toast.error('Error', {
        description: errorMessage,
      });
      
      throw error;
    }
  }, [fetchUsers, state.currentPage]);

  // Deactivate user
  const deactivateUser = useCallback(async (userId: number) => {
    try {
      console.log('🔄 Deactivating user:', userId);

      const response = await AdminService.deactivateUser(userId);

      if (response.success && response.data) {
        console.log('✅ User deactivated successfully:', response.data);
        
        toast.success('Success', {
          description: 'User deactivated successfully',
        });

        // Refresh the user list
        await fetchUsers(state.currentPage);
        
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to deactivate user');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate user';
      console.error('❌ Error deactivating user:', error);
      
      toast.error('Error', {
        description: errorMessage,
      });
      
      throw error;
    }
  }, [fetchUsers, state.currentPage]);

  // Reset user password
  const resetUserPassword = useCallback(async (userId: number, newPassword: string) => {
    try {
      console.log('🔄 Resetting password for user:', userId);

      const response = await AdminService.resetUserPassword(userId, newPassword);

      if (response.success && response.data) {
        console.log('✅ Password reset successfully');
        
        toast.success('Success', {
          description: 'Password reset successfully',
        });
        
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to reset password');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      console.error('❌ Error resetting password:', error);
      
      toast.error('Error', {
        description: errorMessage,
      });
      
      throw error;
    }
  }, []);

  // Load users on mount and when filters change
  useEffect(() => {
    fetchUsers(1);
  }, [state.filters]);

  // Go to specific page
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages) {
      fetchUsers(page);
    }
  }, [fetchUsers, state.totalPages]);

  return {
    // State
    users: state.users,
    totalUsers: state.totalUsers,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loading: state.loading,
    error: state.error,
    filters: state.filters,

    // Actions
    fetchUsers,
    updateFilters,
    clearFilters,
    createUser,
    updateUser,
    deactivateUser,
    resetUserPassword,
    goToPage,

    // Helper flags
    hasUsers: state.users.length > 0,
    hasError: !!state.error,
    hasFilters: Object.values(state.filters).some(value => value !== '' && value !== undefined),
  };
}

// Export types
export type { UserManagementState, UserFilters };
