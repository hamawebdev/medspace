// @ts-nocheck
import { apiClient } from './api-client';
import { AuthService } from './api-services';
import { User, LoginData, AuthResponse } from '@/types/auth';
import { LoginRequest } from '@/types/api';

// Authentication class that integrates with the Medical Education Platform API
export class AuthAPI {
  /**
   * Register new user
   */
  static async register(registrationData: {
    email: string;
    password: string;
    fullName: string;
    universityId: number;
    specialtyId: number;
    currentYear: string;
  }): Promise<{ message: string; tokens?: { accessToken: string; refreshToken: string } }> {
    try {
      const response = await AuthService.register(registrationData);

      if (!response.success) {
        // Handle API error structure
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Registration failed';
        throw new Error(errorMessage);
      }

      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Get universities list for registration
   */
  static async getUniversities(): Promise<{ id: number; name: string; country: string }[]> {
    try {
      const response = await AuthService.getUniversities();

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch universities');
      }

      if (!response.data?.universities) {
        throw new Error('Invalid universities data structure');
      }

      // Extract universities from the nested response structure
      return response.data.universities.map(uni => ({
        id: uni.id,
        name: uni.name,
        country: uni.country
      }));
    } catch (error: any) {
      console.error('Error fetching universities:', error);
      throw new Error(error.message || 'Failed to fetch universities');
    }
  }

  /**
   * Get specialties list for registration
   */
  static async getSpecialties(): Promise<{ id: number; name: string; description?: string }[]> {
    try {
      const response = await AuthService.getSpecialties();

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch specialties');
      }

      // Extract specialties from the nested response structure
      return response.data.specialties.map(spec => ({
        id: spec.id,
        name: spec.name
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch specialties');
    }
  }

  /**
   * Login user with email and password
   */
  static async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const response = await AuthService.login(credentials as LoginRequest);

      if (!response.success) {
        // Handle API error structure
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Login failed';
        throw new Error(errorMessage);
      }

      // Handle the actual API response structure
      const { tokens } = response.data;
      console.log('🔐 AuthAPI.login: Tokens extracted', { hasAccessToken: !!tokens?.accessToken, hasRefreshToken: !!tokens?.refreshToken });

      if (!tokens || !tokens.accessToken) {
        console.error('🔐 AuthAPI.login: Missing tokens in response');
        throw new Error('Invalid login response: missing tokens');
      }

      // Store tokens in the API client
      apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
      console.log('🔐 AuthAPI.login: Tokens stored in API client');

      // Get user profile after successful login
      console.log('🔐 AuthAPI.login: Fetching user profile...');
      const profileResponse = await AuthService.getProfile();
      console.log('🔐 AuthAPI.login: Profile response received', { success: profileResponse.success });

      if (!profileResponse.success) {
        console.error('🔐 AuthAPI.login: Failed to get profile', profileResponse.error);
        throw new Error(profileResponse.error || 'Failed to get user profile');
      }

      const user = profileResponse.data as User;
      console.log('🔐 AuthAPI.login: User profile extracted', { userId: user.id, role: user.role, email: user.email });

      const result = {
        user,
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };

      console.log('🔐 AuthAPI.login: Login successful, returning result', { userId: user.id, role: user.role });
      return result;
    } catch (error: any) {
      console.error('🔐 AuthAPI.login: Login error', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Get current user profile from API
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      if (!apiClient.isAuthenticated()) {
        console.log('🔐 AuthAPI.getCurrentUser: No token found, user not authenticated');
        return null;
      }

      console.log('🔐 AuthAPI.getCurrentUser: Fetching user profile...');
      const response = await AuthService.getProfile();

      if (!response.success) {
        console.log('🔐 AuthAPI.getCurrentUser: Profile fetch failed', response.error);
        // Only clear tokens on authentication errors, not on other failures
        if (response.error && (response.error.includes('401') || response.error.includes('Unauthorized'))) {
          console.log('🔐 AuthAPI.getCurrentUser: Authentication error, clearing tokens');
          apiClient.clearTokens();
        }
        return null;
      }

      console.log('🔐 AuthAPI.getCurrentUser: Profile fetched successfully');
      return response.data as User;
    } catch (error: any) {
      console.log('🔐 AuthAPI.getCurrentUser: Error occurred', error);
      // Only clear tokens on 401 errors, not on network or other errors
      if (error.response?.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('🔐 AuthAPI.getCurrentUser: 401 error, clearing tokens');
        apiClient.clearTokens();
      } else {
        console.log('🔐 AuthAPI.getCurrentUser: Non-auth error, keeping tokens', error.message);
      }
      return null;
    }
  }

  /**
   * Refresh tokens using stored refresh token
   */
  static async refreshTokens(): Promise<void> {
    const refreshToken = apiClient.getRefreshToken?.();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await AuthService.refreshToken({ refreshToken });
    if (!response.success) {
      throw new Error(typeof response.error === 'string' ? response.error : (response.error?.message || 'Failed to refresh tokens'));
    }

    const tokens = response.data?.tokens;
    if (!tokens?.accessToken) {
      throw new Error('Invalid refresh response');
    }

    apiClient.setTokens(tokens.accessToken, tokens.refreshToken);
  }


  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint if authenticated
      if (apiClient.isAuthenticated()) {
        await AuthService.logout();
      }
    } catch (error) {
      // Even if logout API call fails, we still want to clear local tokens
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear tokens locally
      apiClient.clearTokens();
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Update user profile
   */
  static async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await AuthService.updateProfile(profileData as Partial<ApiUser>);

      if (!response.success) {
        // Handle API error structure
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Profile update failed';
        throw new Error(errorMessage);
      }

      return response.data as User;
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  /**
   * Change password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await AuthService.changePassword({
        currentPassword,
        newPassword,
      });

      if (!response.success) {
        // Handle API error structure
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Password change failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Password change failed');
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      const response = await AuthService.forgotPassword(email);

      if (!response.success) {
        // Handle API error structure
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Password reset request failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await AuthService.resetPassword({
        token,
        newPassword,
      });

      if (!response.success) {
        // Handle API error structure
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Password reset failed';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await AuthService.verifyEmail(token);

      if (!response.success) {
        // Handle API error structure
        const errorMessage = typeof response.error === 'string'
          ? response.error
          : response.error?.message || 'Email verification failed';
        throw new Error(errorMessage);
      }

      return response.data || { message: 'Email verified successfully' };
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const response = await AuthService.resendVerificationEmail(email);

      if (!response.success) {
        throw new Error(response.error || 'Failed to resend verification email');
      }

      return response.data || { message: 'Verification email sent successfully' };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  }

  /**
   * Get role-based redirect path
   */
  static getRedirectPath(role: User['role']): string {
    switch (role) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'ADMIN':
        return '/admin/content/';
      case 'EMPLOYEE':
        return '/employee/dashboard';
      default:
        return '/';
    }
  }


}



export async function apiGetCurrentUser(): Promise<User | null> {
  return AuthAPI.getCurrentUser();
}

export async function apiLogout(): Promise<void> {
  return AuthAPI.logout();
}

export function apiIsAuthenticated(): boolean {
  return AuthAPI.isAuthenticated();
}

export function apiGetRedirectPath(role: User['role']): string {
  return AuthAPI.getRedirectPath(role);
}

// Export the main class
export default AuthAPI;
