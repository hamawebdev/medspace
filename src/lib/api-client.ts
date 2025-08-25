// @ts-nocheck
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'sonner';
import { logger, logApiRequest } from './logger';

// API Configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1',
  timeout: 30000, // 30 seconds
};

// Determine credential usage based on environment (student + admin logic)
const isNgrokUrl = API_CONFIG.baseURL.includes('ngrok');
const isHostedBackend = API_CONFIG.baseURL.includes('hstgr.cloud') ||
                       API_CONFIG.baseURL.includes('ngrok-free.app') ||
                       API_CONFIG.baseURL.includes('ngrok.app') ||
                       API_CONFIG.baseURL.includes('ngrok.io');
const needsCredentials = !(isHostedBackend || isNgrokUrl) && !process.env.NEXT_PUBLIC_DISABLE_CREDENTIALS;

// API configuration is set up silently

// Token storage keys
const TOKEN_STORAGE_KEY = 'auth_token';
const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Error response interface
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private tokenLoggedThisSession = false;

  constructor() {
    // Prepare headers for the axios instance
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add ngrok-specific headers if using ngrok
    if (API_CONFIG.baseURL.includes('ngrok')) {
      defaultHeaders['ngrok-skip-browser-warning'] = 'true';
    }

    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      withCredentials: needsCredentials, // Disabled for hosted backend to avoid CORS issues
      headers: defaultHeaders,
    });

    this.setupInterceptors();
  }



  private setupInterceptors() {
    // Request interceptor - Add auth token to requests
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle responses and errors (simplified, no auto-refresh)
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        // Handle 401 errors by redirecting to login (no automatic refresh)
        // BUT skip auto-redirect for auth endpoints to prevent page reload during auth operations
        const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                              error.config?.url?.includes('/auth/register') ||
                              error.config?.url?.includes('/auth/forgot-password') ||
                              error.config?.url?.includes('/auth/reset-password') ||
                              error.config?.url?.includes('/auth/verify-email') ||
                              error.config?.url?.includes('/auth/resend-verification');

        if (error.response?.status === 401 && !isAuthEndpoint) {
          this.handleAuthError();
        }

        return Promise.reject(error);
      }
    );
  }



  private handleAuthError() {
    console.log('🚨 API Client: Handling authentication error, clearing tokens');
    this.clearStoredTokens();

    // Only redirect if we're not already on the login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      console.log('🚨 API Client: Redirecting to login page');
      // Use a small delay to prevent immediate redirect during API calls
      setTimeout(() => {
        if (!window.location.pathname.includes('/login')) {
          console.log('🚨 API Client: Executing redirect to /login');
          window.location.href = '/login';
        }
      }, 500); // Increased delay to prevent race conditions
    }
  }

  // Token management methods
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    // Use centralized logging with throttling
    if (!this.tokenLoggedThisSession) {
      logger.debug('🔐 Getting stored token:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
        tokenKey: TOKEN_STORAGE_KEY
      }, 'token-management');
      this.tokenLoggedThisSession = true;
    }

    return token;
  }

  private setStoredToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);

      // Only log token storage once per session to reduce spam
      if (process.env.NODE_ENV === 'development' && !this.tokenLoggedThisSession) {
        console.log('🔐 Token stored in localStorage:', {
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
          tokenKey: TOKEN_STORAGE_KEY
        });
      }
    }
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  private setStoredRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
  }

  private clearStoredTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    }
  }

  // Public methods for token management
  public setTokens(token: string, refreshToken?: string): void {
    // Only log token operations in development and reduce frequency
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Storing tokens in localStorage:', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
      });
    }

    this.setStoredToken(token);
    if (refreshToken) {
      this.setStoredRefreshToken(refreshToken);
    }

    // Verify tokens were stored (only in development)
    if (process.env.NODE_ENV === 'development') {
      const storedToken = this.getStoredToken();
      console.log('🔐 Token storage verification:', {
        tokenStored: !!storedToken,
        tokensMatch: storedToken === token
      });
    }
  }

  public getRefreshToken(): string | null {
    return this.getStoredRefreshToken();
  }

  public clearTokens(): void {
    this.clearStoredTokens();
  }

  public isAuthenticated(): boolean {
    const token = this.getStoredToken();
    if (!token) {
      return false;
    }

    // Basic token format validation (JWT should have 3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('🔐 Invalid token format detected, clearing token');
      this.clearStoredTokens();
      return false;
    }

    return true;
  }

  // HTTP methods
  private async makeRequest<T>(
    requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error) {
      console.error('🚨 makeRequest caught error:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): ApiError {
    let errorMessage = 'An unexpected error occurred';
    let statusCode = 500;

    // Enhanced error logging for debugging
    console.error('🔍 Raw error object:', error);
    console.error('🔍 Error type:', typeof error);
    console.error('🔍 Error constructor:', error?.constructor?.name);
    console.error('🔍 Error message:', error?.message);
    console.error('🔍 Error response:', error?.response);
    console.error('🔍 Error request:', error?.request);
    console.error('🔍 Error config:', error?.config);

    // Check if it's an AxiosError
    const isAxiosError = error?.isAxiosError || error?.response || error?.request;

    if (!isAxiosError) {
      console.error('⚠️ Not an Axios error, treating as generic error');
      return {
        message: error?.message || errorMessage,
        statusCode: 500,
        details: { originalError: error }
      };
    }

    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      responseData: error.response?.data,
      hasAuthHeader: !!(error.config?.headers?.Authorization),
      code: error.code,
      baseURL: error.config?.baseURL,
      timeout: error.config?.timeout,
      isNetworkError: !error.response && error.request,
      isTimeoutError: error.code === 'ECONNABORTED',
    };

    console.error('API Error Details:', errorDetails);

    if (error.response) {
      statusCode = error.response.status;
      const responseData = error.response.data as any;

      // Log detailed info for 401 errors to help debug authentication issues
      if (statusCode === 401) {
        console.error('🔐 401 Unauthorized Error Details:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          responseData: responseData,
          responseHeaders: error.response.headers,
        });
      }

      // Handle different response data structures
      if (responseData?.error) {
        // Handle structured error object from API
        if (typeof responseData.error === 'object' && responseData.error.message) {
          errorMessage = responseData.error.message;
        } else if (typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else {
          errorMessage = 'An error occurred';
        }
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (responseData?.detail) {
        errorMessage = responseData.detail;
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else {
        errorMessage = `HTTP ${statusCode}: ${error.response.statusText || 'Request failed'}`;
      }

      // Only override error message for specific status codes if we don't have a proper API error message
      if (!responseData?.error?.message && !responseData?.error) {
        switch (statusCode) {
          case 404:
            errorMessage = 'Resource not found - please check the API endpoint';
            break;
          case 403:
            errorMessage = 'Access forbidden - please check your permissions';
            break;
          case 500:
            errorMessage = 'Server error - please try again later';
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = 'Service temporarily unavailable - please try again later';
            break;
        }
      }
    } else if (error.request) {
      // Network error or no response received
      console.error('🌐 Network error details:', {
        code: error.code,
        message: error.message,
        baseURL: API_CONFIG.baseURL,
        isNgrok: isNgrokUrl,
        requestStatus: error.request?.status,
        requestReadyState: error.request?.readyState,
      });

      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        if (isNgrokUrl) {
          errorMessage = `Cannot connect to ngrok tunnel at ${API_CONFIG.baseURL}. Please check if ngrok is running and the tunnel is active.`;
        } else {
          errorMessage = `Cannot connect to API server at ${API_CONFIG.baseURL}. Please check if the backend server is running.`;
        }
      } else if (error.code === 'ENOTFOUND') {
        if (isNgrokUrl) {
          errorMessage = `Ngrok tunnel not found at ${API_CONFIG.baseURL}. Please check if the ngrok URL is correct and active.`;
        } else {
          errorMessage = `API server not found at ${API_CONFIG.baseURL}. Please check the API URL configuration.`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = `Request timeout - the API server at ${API_CONFIG.baseURL} is taking too long to respond.`;
      } else {
        errorMessage = `Network error - please check your connection and API URL (${API_CONFIG.baseURL})`;
      }
    } else {
      // Request setup error
      console.error('🔧 Request setup error:', {
        message: error.message,
        code: error.code,
        config: error.config,
      });
      errorMessage = error.message || 'Request setup error';
    }

    // Show toast notification for errors (except 401 and network errors to avoid spam)
    if (statusCode !== 401 && typeof errorMessage === 'string' && !errorMessage.includes('Network error') && !errorMessage.includes('ERR_CONNECTION')) {
      toast.error(errorMessage);
    }

    return {
      success: false,
      error: errorMessage,
      statusCode,
    };
  }

  // Public HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.get<ApiResponse<T>>(url, config));
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.post<ApiResponse<T>>(url, data, config));
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.put<ApiResponse<T>>(url, data, config));
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.delete<ApiResponse<T>>(url, config));
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.makeRequest(() => this.client.patch<ApiResponse<T>>(url, data, config));
  }


}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing purposes
export { ApiClient };
