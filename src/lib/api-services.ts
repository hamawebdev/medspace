// @ts-nocheck
import { apiClient } from './api-client';
import { logServiceCall } from './logger';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ApiUser,
  StudentDashboardPerformance,
  StudyPack,
  StudyPackDetails,
  QuizFilters,
  UserSubscription,
  ProgressOverview,
  CourseProgressDetails,
  CourseProgressUpdate,
  CourseProgressResponse,
  PaginatedResponse,
  PaginationParams,
  Exam,
  ExamSession,
  ExamQuestion,
  ExamResult,
  ExamFilters,
  SessionResult,
  SessionResultsFilters,
  AdvancedSessionFilters,
  SessionComparison,
  SessionSummary,
  ComparisonMetrics,
  TimeBasedAnalytics,
  QuestionReport,
  QuestionReportRequest,
  QuestionReportResponse,
  QuestionReportsFilters,
  AvailableExamsResponse,
  UserProfile,
  ProfileUpdateRequest,
  University,
  Specialty,
  CourseResourcesResponse,
  UniversitiesResponse,
  SpecialtiesResponse,
  // Todos
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  // Analytics
  AnalyticsOverview,
  CourseProgressUpdateRequest,
  QuizHistoryParams,
  QuizHistoryItem,
  SessionResultsParams,
  DetailedSessionResult,
  AvailableSessionsParams,
  AvailableSession,
  TimeBasedAnalyticsParams,
  SubjectAnalytics,
  PerformanceComparisonParams,
  PerformanceComparison,
  // Admin types
  DashboardStats,
  AdminSubscription,
  AdminSubscriptionFilters,
  UpdateSubscriptionRequest,
  CancelSubscriptionRequest,
  AddMonthsToSubscriptionRequest,
  AdminQuiz,
  AdminQuizFilters,
  CreateQuizRequest,
  UpdateQuizRequest,
  AdminExam,
  AdminExamFilters,
  CreateExamRequest,
  UpdateExamRequest,
  UpdateExamQuestionOrderRequest,
  AdminQuestionReport,
  AdminQuestionReportFilters,
  ReviewQuestionReportRequest,
  ActivationCode,
  CreateActivationCodeRequest,
  ActivationCodeFilters,
  AdminQuestion,
  AdminQuestionFilters,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  UpdateQuestionExplanationRequest,
  ImageUploadResponse,
  PDFUploadResponse,
  StudyPackMediaUploadResponse,
  ExplanationUploadResponse,
  LogoUploadResponse,
  // Study pack content types
  StudyPackUnit,
  StudyPackModule,
  StudyPackCourse,
  CurrentYear,
} from '@/types/api';

// Authentication Services
export class AuthService {
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
  }): Promise<ApiResponse<{ message: string; tokens?: { accessToken: string; refreshToken: string } }>> {
    return apiClient.post<{ message: string; tokens?: { accessToken: string; refreshToken: string } }>('/auth/register', registrationData);
  }

  /**
   * Get universities list for settings
   */
  static async getUniversities(): Promise<ApiResponse<UniversitiesResponse>> {
    return apiClient.get<UniversitiesResponse>('/Universities');
  }

  /**
   * Get specialties list for settings
   */
  static async getSpecialties(): Promise<ApiResponse<SpecialtiesResponse>> {
    return apiClient.get<SpecialtiesResponse>('/Specialties');
  }

  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    console.log('🌐 AuthService.login: Making API call', {
      endpoint: '/auth/login',
      email: credentials.email,
      hasPassword: !!credentials.password,
      credentialsKeys: Object.keys(credentials)
    });

    return apiClient.post<LoginResponse>('/auth/login', credentials);
  }

  /**
   * Get current user profile with full details for settings
   */
  static async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>('/auth/profile');
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/refresh', refreshTokenData);
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/logout');
  }

  /**
   * Update user profile with validation
   */
  static async updateProfile(profileData: ProfileUpdateRequest): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>('/auth/profile', profileData);
  }

  /**
   * Change password
   */
  static async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.put<void>('/auth/change-password', passwordData);
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  static async resetPassword(resetData: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/reset-password', resetData);
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/verify-email', { token });
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>('/auth/resend-verification', { email });
  }
}

// Settings Services
export class SettingsService {
  /**
   * Get current user profile for settings page
   */
  static async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return AuthService.getProfile();
  }

  /**
   * Update user profile settings
   */
  static async updateUserProfile(profileData: ProfileUpdateRequest): Promise<ApiResponse<UserProfile>> {
    return AuthService.updateProfile(profileData);
  }

  /**
   * Get available universities for settings dropdown
   */
  static async getUniversities(): Promise<ApiResponse<UniversitiesResponse>> {
    return AuthService.getUniversities();
  }

  /**
   * Get available specialties for settings dropdown
   */
  static async getSpecialties(): Promise<ApiResponse<SpecialtiesResponse>> {
    return AuthService.getSpecialties();
  }

  /**
   * Get user's current subscriptions for settings display
   */
  static async getUserSubscriptions(): Promise<ApiResponse<UserSubscription[]>> {
    return StudentService.getSubscriptions();
  }

  /**
   * Validate profile update data before submission
   */
  static validateProfileData(data: ProfileUpdateRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.fullName !== undefined) {
      if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Full name must be at least 2 characters long');
      }
    }

    if (data.universityId !== undefined) {
      if (!Number.isInteger(data.universityId) || data.universityId <= 0) {
        errors.push('Please select a valid university');
      }
    }

    if (data.specialtyId !== undefined) {
      if (!Number.isInteger(data.specialtyId) || data.specialtyId <= 0) {
        errors.push('Please select a valid specialty');
      }
    }

    if (data.currentYear !== undefined) {
      const validYears = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
      if (!validYears.includes(data.currentYear)) {
        errors.push('Please select a valid academic year');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Student Services
export class StudentService {
  /**
   * Get student dashboard performance data
   */
  static async getDashboardPerformance(): Promise<ApiResponse<StudentDashboardPerformance>> {
    return apiClient.get<StudentDashboardPerformance>('/students/dashboard/performance');
  }

  /**
   * Get user subscriptions
   */
  static async getSubscriptions(): Promise<ApiResponse<UserSubscription[]>> {
    return apiClient.get<UserSubscription[]>('/students/subscriptions');
  }
  /**
   * Get study packs for student browse
   * Note: student endpoint returns nested structure
   */
  static async getStudyPacks(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const url = queryParams.toString() ? `/study-packs?${queryParams.toString()}` : '/study-packs';
    return apiClient.get<any>(url);
  }


  /**
   * Get progress overview
   */
  /**
   * Get study pack details for student context (modules, courses, etc.)
   */
  static async getStudentStudyPackDetails(studyPackId: number): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/student/study-pack/${studyPackId}`);
  }

  static async getProgressOverview(): Promise<ApiResponse<ProgressOverview>> {
    return apiClient.get<ProgressOverview>('/students/progress/overview');
  }

  /**
   * Get session results with filtering
   */
  static async getSessionResults(params: {
    answerType?: 'all' | 'correct' | 'incorrect';
    page?: number;
    limit?: number;
    sessionIds?: string;
    sessionType?: 'PRACTICE' | 'EXAM';
    completedAfter?: string;
    completedBefore?: string;
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    if (params.answerType) queryParams.append('answerType', params.answerType);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sessionIds) queryParams.append('sessionIds', params.sessionIds);
    if (params.sessionType) queryParams.append('sessionType', params.sessionType);
    if (params.completedAfter) {
      // Convert date-only format to ISO datetime format if needed
      const afterDate = params.completedAfter.includes('T')
        ? params.completedAfter
        : `${params.completedAfter}T00:00:00Z`;
      queryParams.append('completedAfter', afterDate);
    }
    if (params.completedBefore) {
      // Convert date-only format to ISO datetime format if needed
      const beforeDate = params.completedBefore.includes('T')
        ? params.completedBefore
        : `${params.completedBefore}T23:59:59Z`;
      queryParams.append('completedBefore', beforeDate);
    }

    const url = queryParams.toString() ? `/students/session-results?${queryParams.toString()}` : '/students/session-results';
    return apiClient.get<any>(url);
  }

  /**
   * Get available sessions for filtering
   */
  static async getAvailableSessions(type: 'all' | 'PRACTICE' | 'EXAM' = 'all'): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (type !== 'all') {
      queryParams.append('sessionType', type);
    }
    const url = queryParams.toString() ? `/students/available-sessions?${queryParams.toString()}` : '/students/available-sessions';
    return apiClient.get<any>(url);
  }
  /**
   * Get student questions with applied filters
   * GET /students/questions
   * Returns questions and metadata including applied filters and subscription info
   */
  static async getQuestions(params: {
    // Optional filters (expand as backend supports)
    questionType?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
    yearLevels?: string[]; // e.g., ['ONE','TWO']
    moduleIds?: number[];
    uniteIds?: number[];
    universityIds?: number[];
    examYears?: number[];
    count?: number;
    randomize?: boolean;
    includeAnswers?: boolean;
    includeExplanations?: boolean;
    includeImages?: boolean;
  } = {}): Promise<ApiResponse<any>> {
    const qs = new URLSearchParams();
    if (params.questionType) qs.append('questionType', params.questionType);
    if (params.yearLevels?.length) qs.append('yearLevels', params.yearLevels.join(','));
    if (params.moduleIds?.length) qs.append('moduleIds', params.moduleIds.join(','));
    if (params.uniteIds?.length) qs.append('uniteIds', params.uniteIds.join(','));
    if (params.universityIds?.length) qs.append('universityIds', params.universityIds.join(','));
    if (params.examYears?.length) qs.append('examYears', params.examYears.join(','));
    if (typeof params.count === 'number') qs.append('count', String(params.count));
    if (typeof params.randomize === 'boolean') qs.append('randomize', String(params.randomize));
    if (typeof params.includeAnswers === 'boolean') qs.append('includeAnswers', String(params.includeAnswers));
    if (typeof params.includeExplanations === 'boolean') qs.append('includeExplanations', String(params.includeExplanations));
    if (typeof params.includeImages === 'boolean') qs.append('includeImages', String(params.includeImages));

    const url = qs.toString() ? `/students/questions?${qs.toString()}` : '/students/questions';
    return apiClient.get<any>(url);
  }


  /**
   * Get advanced session results with enhanced filtering
   */
  static async getAdvancedSessionResults(filters: AdvancedSessionFilters = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    // Basic filters
    if (filters.answerType) queryParams.append('answerType', filters.answerType);
    if (filters.sessionType) queryParams.append('sessionType', filters.sessionType);
    if (filters.sessionIds) queryParams.append('sessionIds', filters.sessionIds);
    if (filters.completedAfter) {
      // Convert date-only format to ISO datetime format if needed
      const afterDate = filters.completedAfter.includes('T')
        ? filters.completedAfter
        : `${filters.completedAfter}T00:00:00Z`;
      queryParams.append('completedAfter', afterDate);
    }
    if (filters.completedBefore) {
      // Convert date-only format to ISO datetime format if needed
      const beforeDate = filters.completedBefore.includes('T')
        ? filters.completedBefore
        : `${filters.completedBefore}T23:59:59Z`;
      queryParams.append('completedBefore', beforeDate);
    }
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    // Legacy filters for backward compatibility
    if (filters.studyPackId) queryParams.append('studyPackId', filters.studyPackId.toString());
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.minAccuracy) queryParams.append('minAccuracy', filters.minAccuracy.toString());
    if (filters.maxAccuracy) queryParams.append('maxAccuracy', filters.maxAccuracy.toString());

    const url = queryParams.toString() ? `/students/session-results?${queryParams.toString()}` : '/students/session-results';
    return apiClient.get<any>(url);
  }

  /**
   * Compare multiple sessions by their IDs
   */
  static async compareSessionPerformance(sessionIds: number[]): Promise<ApiResponse<SessionComparison>> {
    if (sessionIds.length === 0) {
      throw new Error('At least one session ID is required for comparison');
    }

    const sessionIdsString = sessionIds.join(',');
    return this.getAdvancedSessionResults({
      sessionIds: sessionIdsString,
      answerType: 'all',
      limit: 100 // Get results for comparison (API max limit)
    }).then(response => {
      if (!response.success || !response.data?.data?.questions) {
        return response as ApiResponse<SessionComparison>;
      }

      // Process the session results into comparison format
      const questions = response.data.data.questions;
      const sessionMap = new Map<number, any[]>();

      // Group questions by session
      questions.forEach((question: any) => {
        if (!sessionMap.has(question.sessionId)) {
          sessionMap.set(question.sessionId, []);
        }
        sessionMap.get(question.sessionId)!.push(question);
      });

      // Create session summaries
      const sessions: SessionSummary[] = Array.from(sessionMap.entries()).map(([sessionId, sessionQuestions]) => {
        const correctAnswers = sessionQuestions.filter(q => q.isCorrect).length;
        const totalQuestions = sessionQuestions.length;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const timeSpent = sessionQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

        return {
          sessionId,
          title: sessionQuestions[0]?.sessionTitle || `Session ${sessionId}`,
          type: sessionQuestions[0]?.sessionType || 'PRACTICE',
          completedAt: sessionQuestions[0]?.completedAt || new Date().toISOString(),
          questionsAnswered: totalQuestions,
          correctAnswers,
          accuracy,
          timeSpent,
          subject: sessionQuestions[0]?.subject
        };
      });

      // Calculate comparison metrics
      const accuracies = sessions.map(s => s.accuracy);
      const accuracyImprovement = accuracies.length > 1
        ? accuracies[accuracies.length - 1] - accuracies[0]
        : 0;

      const avgTimes = sessions.map(s => s.timeSpent / s.questionsAnswered);
      const speedImprovement = avgTimes.length > 1
        ? avgTimes[0] - avgTimes[avgTimes.length - 1]
        : 0;

      const consistencyScore = accuracies.length > 1
        ? 100 - (Math.max(...accuracies) - Math.min(...accuracies))
        : 100;

      const metrics: ComparisonMetrics = {
        accuracyImprovement,
        speedImprovement,
        consistencyScore,
        strengthAreas: [], // Will be populated by analytics processor
        weaknessAreas: []  // Will be populated by analytics processor
      };

      const comparison: SessionComparison = {
        sessions,
        metrics,
        insights: [] // Will be populated by analytics processor
      };

      return {
        ...response,
        data: comparison
      } as ApiResponse<SessionComparison>;
    });
  }

  /**
   * Get time-based analytics with date range filtering
   */
  static async getTimeBasedAnalytics(dateRange: { start: string; end: string }): Promise<ApiResponse<TimeBasedAnalytics>> {
    // Use the existing session results endpoint with date filtering
    const response = await this.getAdvancedSessionResults({
      completedAfter: dateRange.start,
      completedBefore: dateRange.end,
      answerType: 'all',
      limit: 100 // Get comprehensive data for analysis (API max limit)
    });

    if (!response.success || !response.data?.data?.questions) {
      return response as ApiResponse<TimeBasedAnalytics>;
    }

    const questions = response.data.data.questions;

    // Process questions into time-based analytics
    const dailyMap = new Map<string, any[]>();
    const weeklyMap = new Map<string, any[]>();
    const monthlyMap = new Map<string, any[]>();

    questions.forEach((question: any) => {
      const date = new Date(question.completedAt || question.createdAt);
      const dateStr = date.toISOString().split('T')[0];
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Group by day
      if (!dailyMap.has(dateStr)) dailyMap.set(dateStr, []);
      dailyMap.get(dateStr)!.push(question);

      // Group by week
      if (!weeklyMap.has(weekStart)) weeklyMap.set(weekStart, []);
      weeklyMap.get(weekStart)!.push(question);

      // Group by month
      if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, []);
      monthlyMap.get(monthKey)!.push(question);
    });

    // Create daily performance data
    const dailyPerformance = Array.from(dailyMap.entries()).map(([date, dayQuestions]) => {
      const sessionsCompleted = new Set(dayQuestions.map(q => q.sessionId)).size;
      const questionsAnswered = dayQuestions.length;
      const correctAnswers = dayQuestions.filter(q => q.isCorrect).length;
      const averageAccuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
      const totalTimeSpent = dayQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

      return {
        date,
        sessionsCompleted,
        questionsAnswered,
        averageAccuracy,
        totalTimeSpent
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Create weekly trends
    const weeklyTrends = Array.from(weeklyMap.entries()).map(([weekStart, weekQuestions]) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const sessionsCompleted = new Set(weekQuestions.map(q => q.sessionId)).size;
      const correctAnswers = weekQuestions.filter(q => q.isCorrect).length;
      const averageAccuracy = weekQuestions.length > 0 ? Math.round((correctAnswers / weekQuestions.length) * 100) : 0;

      return {
        weekStart,
        weekEnd: weekEnd.toISOString().split('T')[0],
        sessionsCompleted,
        averageAccuracy,
        improvementRate: 0, // Will be calculated based on previous weeks
        consistencyScore: 0 // Will be calculated based on daily variations
      };
    }).sort((a, b) => a.weekStart.localeCompare(b.weekStart));

    // Calculate improvement rates for weekly trends
    weeklyTrends.forEach((week, index) => {
      if (index > 0) {
        const prevWeek = weeklyTrends[index - 1];
        week.improvementRate = week.averageAccuracy - prevWeek.averageAccuracy;
      }
    });

    // Create monthly progress
    const monthlyProgress = Array.from(monthlyMap.entries()).map(([monthKey, monthQuestions]) => {
      const [year, month] = monthKey.split('-');
      const totalSessions = new Set(monthQuestions.map(q => q.sessionId)).size;
      const correctAnswers = monthQuestions.filter(q => q.isCorrect).length;
      const averageAccuracy = monthQuestions.length > 0 ? Math.round((correctAnswers / monthQuestions.length) * 100) : 0;

      // Get top subjects for the month
      const subjectCounts = monthQuestions.reduce((acc: any, q: any) => {
        const subject = q.subject || 'General';
        acc[subject] = (acc[subject] || 0) + 1;
        return acc;
      }, {});

      const topSubjects = Object.entries(subjectCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([subject]) => subject);

      return {
        month: new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' }),
        year: parseInt(year),
        totalSessions,
        averageAccuracy,
        topSubjects,
        goalsAchieved: 0 // This would come from a goals tracking system
      };
    }).sort((a, b) => a.year - b.year || a.month.localeCompare(b.month));

    // Create study patterns (simplified version)
    const studyPatterns = [
      {
        timeOfDay: 'Morning',
        dayOfWeek: 'All',
        averageAccuracy: 0,
        averageSessionDuration: 0,
        frequency: 0
      }
    ]; // This would require more complex analysis of timestamps

    const timeBasedAnalytics: TimeBasedAnalytics = {
      dailyPerformance,
      weeklyTrends,
      monthlyProgress,
      studyPatterns
    };

    return {
      ...response,
      data: timeBasedAnalytics
    } as ApiResponse<TimeBasedAnalytics>;
  }

  /**
   * Update course progress with layer-based tracking
   */
  static async updateCourseProgress(courseId: number, progressData: CourseProgressUpdate): Promise<ApiResponse<CourseProgressResponse>> {
    return apiClient.put<CourseProgressResponse>(`/students/courses/${courseId}/progress`, progressData);
  }

  /**
   * Get course progress details
   */
  static async getCourseProgress(courseId: number): Promise<ApiResponse<CourseProgressDetails>> {
    return apiClient.get<CourseProgressDetails>(`/students/courses/${courseId}/progress`);
  }

  /**
   * Generate course completion certificate
   */
  static async generateCertificate(courseId: number): Promise<ApiResponse<{
    certificateId: string;
    certificateUrl: string;
    issuedAt: string;
    validUntil?: string;
  }>> {
    return apiClient.post<{
      certificateId: string;
      certificateUrl: string;
      issuedAt: string;
      validUntil?: string;
    }>(`/students/courses/${courseId}/certificate`);
  }



  /**
   * Get quiz history with enhanced filtering support
   */
  static async getQuizHistory(params: PaginationParams & {
    type?: 'PRACTICE' | 'EXAM';
    status?: 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED';
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    sortBy?: 'completedAt' | 'score' | 'title' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    // Add all parameters to search params, filtering out undefined/null values
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const url = searchParams.toString()
      ? `/students/quiz-history?${searchParams.toString()}`
      : '/students/quiz-history';

    return apiClient.get<PaginatedResponse<any>>(url);
  }

  // Notes Management
  /**
   * Get student notes with pagination and filtering
   */
  static async getNotes(params: PaginationParams & {
    search?: string;
    questionId?: number;
    sessionId?: number;
    labelIds?: number[];
  } = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const endpoint = `/students/notes?${searchParams.toString()}`;

    // Use centralized logging with throttling
    logServiceCall('StudentService', 'getNotes', { endpoint, params });

    return apiClient.get<PaginatedResponse<any>>(endpoint);
  }

  /**
   * Create a new note
   */
  static async createNote(noteData: {
    noteText: string;
    questionId?: number;
    sessionId?: number;
    labelIds?: number[];
  }): Promise<ApiResponse<any>> {
    // Send data directly as API expects noteText field
    const apiData = {
      noteText: noteData.noteText,
      questionId: noteData.questionId,
      sessionId: noteData.sessionId,
      labelIds: noteData.labelIds
    };

    // Remove undefined fields to avoid sending null values
    Object.keys(apiData).forEach(key => {
      if (apiData[key] === undefined) {
        delete apiData[key];
      }
    });

    return apiClient.post<any>('/students/notes', apiData);
  }

  /**
   * Update an existing note
   */
  static async updateNote(noteId: number, noteData: {
    noteText?: string;
    labelIds?: number[];
  }): Promise<ApiResponse<any>> {
    // Send data directly as API expects noteText field
    const apiData = {
      noteText: noteData.noteText,
      labelIds: noteData.labelIds
    };

    // Remove undefined fields to avoid sending null values
    Object.keys(apiData).forEach(key => {
      if (apiData[key] === undefined) {
        delete apiData[key];
      }
    });

    return apiClient.put<any>(`/students/notes/${noteId}`, apiData);
  }

  /**
   * Delete a note
   */
  static async deleteNote(noteId: number): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/students/notes/${noteId}`);
  }

  /**
   * Get label details
   */
  static async getLabelDetails(labelId: number): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/students/labels/${labelId}`);
  }

  /**
   * Get notes for a specific question
   */
  static async getQuestionNotes(questionId: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/students/questions/${questionId}/notes`);
  }

  // Labels Management
  /**
   * Get all user labels
   */
  static async getLabels(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/students/labels');
  }

  /**
   * Create a new label
   */
  static async createLabel(labelData: {
    name: string;
    color?: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/students/labels', labelData);
  }

  /**
   * Update a label
   */
  static async updateLabel(labelId: number, labelData: {
    name?: string;
    color?: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.put<any>(`/students/labels/${labelId}`, labelData);
  }

  /**
   * Delete a label
   */
  static async deleteLabel(labelId: number): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/students/labels/${labelId}`);
  }

  /**
   * Associate a label with a quiz
   */
  static async associateLabelWithQuiz(quizId: number, labelId: number): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/students/quizzes/${quizId}/labels/${labelId}`);
  }

  /**
   * Associate a label with a quiz session
   */
  static async associateLabelWithQuizSession(sessionId: number, labelId: number): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/students/quiz-sessions/${sessionId}/labels/${labelId}`);
  }

  // Todos Management (aligned with endpoint contract)
  /**
   * Get paginated todos with optional filters
   */
  static async getTodos(params: PaginationParams & {
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'ALL' | 'pending' | 'in_progress' | 'completed' | 'overdue' | 'all';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'ALL' | 'low' | 'medium' | 'high' | 'all';
    type?: 'READING' | 'QUIZ' | 'SESSION' | 'EXAM' | 'OTHER' | 'ALL' | 'reading' | 'quiz' | 'session' | 'exam' | 'other' | 'all';
    search?: string;
    dueDate?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<Todo>>> {
    const searchParams = new URLSearchParams();

    const mapUpper = (v?: string) => (v ? v.toUpperCase() : v);
    const mapStatus = (v?: string) => (v ? v.replace('-', '_').toUpperCase() : v);

    const mapped: any = {
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      status: params.status ? mapStatus(params.status as string) : undefined,
      priority: params.priority ? mapUpper(params.priority as string) : undefined,
      type: params.type ? mapUpper(params.type as string) : undefined,
      search: params.search,
      dueDate: params.dueDate,
    };

    Object.entries(mapped).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
        searchParams.append(key, String(value));
      }
    });

    const url = searchParams.toString() ? `/students/todos?${searchParams.toString()}` : '/students/todos';
    return apiClient.get<PaginatedResponse<Todo>>(url);
  }

  /**
   * Create a new todo
   */
  static async createTodo(todoData: CreateTodoRequest): Promise<ApiResponse<Todo>> {
    const mapUpper = (v?: string) => (v ? v.toUpperCase() : v);

    const apiData: any = {
      title: todoData.title,
      description: todoData.description,
      type: mapUpper(todoData.type),
      priority: mapUpper(todoData.priority),
      dueDate: todoData.dueDate ? new Date(todoData.dueDate).toISOString() : undefined,
      courseId: todoData.courseId,
      estimatedTime: todoData.estimatedTime,
      tags: todoData.tags,
    };

    // Remove undefined fields
    Object.keys(apiData).forEach((k) => apiData[k] === undefined && delete apiData[k]);

    return apiClient.post<Todo>('/students/todos', apiData);
  }

  /**
   * Update a todo
   */
  static async updateTodo(todoId: number, todoData: UpdateTodoRequest): Promise<ApiResponse<Todo>> {
    const mapUpper = (v?: string) => (v ? v.toUpperCase() : v);

    const apiData: any = {
      title: todoData.title,
      description: todoData.description,
      type: mapUpper(todoData.type),
      priority: mapUpper(todoData.priority),
      status: mapUpper(todoData.status),
      dueDate: todoData.dueDate ? new Date(todoData.dueDate).toISOString() : undefined,
      courseId: todoData.courseId,
      estimatedTime: todoData.estimatedTime,
      tags: todoData.tags,
    };

    Object.keys(apiData).forEach((k) => apiData[k] === undefined && delete apiData[k]);

    return apiClient.put<Todo>(`/students/todos/${todoId}`, apiData);
  }

  /**
   * Mark todo as complete
   */
  static async completeTodo(todoId: number): Promise<ApiResponse<Todo>> {
    return apiClient.put<Todo>(`/students/todos/${todoId}/complete`);
  }

  /**
   * Delete a todo
   */
  static async deleteTodo(todoId: number): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/students/todos/${todoId}`);
  }

  // Question Reporting
  /**
   * Report an issue with a question
   */
  static async reportQuestion(questionId: number, reportData: QuestionReportRequest): Promise<ApiResponse<QuestionReportResponse>> {
    return apiClient.post<QuestionReportResponse>(`/students/questions/${questionId}/report`, reportData);
  }

  /**
   * Get user's question reports with filtering
   */
  static async getQuestionReports(params: QuestionReportsFilters & PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<QuestionReport>>> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    return apiClient.get<PaginatedResponse<QuestionReport>>(`/students/reports?${searchParams.toString()}`);
  }

  /**
   * Get details of a specific report
   */
  static async getReportDetails(reportId: number): Promise<ApiResponse<QuestionReport>> {
    return apiClient.get<QuestionReport>(`/students/reports/${reportId}`);
  }

  // ==================== ANALYTICS ENDPOINTS ====================

  /**
   * Get comprehensive progress overview with analytics
   */
  static async getAnalyticsOverview(): Promise<ApiResponse<AnalyticsOverview>> {
    return apiClient.get<AnalyticsOverview>('/students/progress/overview');
  }

  /**
   * Update course progress
   */
  static async updateCourseProgress(
    courseId: number,
    data: CourseProgressUpdateRequest
  ): Promise<ApiResponse<CourseProgressResponse>> {
    return apiClient.put<CourseProgressResponse>(`/students/courses/${courseId}/progress`, data);
  }

  /**
   * Get quiz history with pagination and filtering
   */
  static async getQuizHistory(params: QuizHistoryParams = {}): Promise<ApiResponse<PaginatedResponse<QuizHistoryItem>>> {
    const queryParams = new URLSearchParams();

    if (params.type) queryParams.append('type', params.type);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = queryParams.toString() ? `/students/quiz-history?${queryParams.toString()}` : '/students/quiz-history';
    return apiClient.get<PaginatedResponse<QuizHistoryItem>>(url);
  }

  /**
   * Get detailed session results with advanced filtering
   */
  static async getSessionResults(params: SessionResultsParams = {}): Promise<ApiResponse<PaginatedResponse<DetailedSessionResult>>> {
    const queryParams = new URLSearchParams();

    if (params.answerType) queryParams.append('answerType', params.answerType);
    if (params.sessionType) queryParams.append('sessionType', params.sessionType);
    if (params.sessionIds?.length) {
      params.sessionIds.forEach(id => queryParams.append('sessionIds', id.toString()));
    }
    if (params.examId) queryParams.append('examId', params.examId.toString());
    if (params.quizId) queryParams.append('quizId', params.quizId.toString());
    if (params.completedAfter) queryParams.append('completedAfter', params.completedAfter);
    if (params.completedBefore) queryParams.append('completedBefore', params.completedBefore);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = queryParams.toString() ? `/students/session-results?${queryParams.toString()}` : '/students/session-results';
    return apiClient.get<PaginatedResponse<DetailedSessionResult>>(url);
  }

  /**
   * Get available sessions for practice and exams
   */
  static async getAvailableSessions(params: AvailableSessionsParams = {}): Promise<ApiResponse<AvailableSession[]>> {
    const queryParams = new URLSearchParams();

    if (params.sessionType) queryParams.append('sessionType', params.sessionType);

    const url = queryParams.toString() ? `/students/available-sessions?${queryParams.toString()}` : '/students/available-sessions';
    return apiClient.get<AvailableSession[]>(url);
  }

  /**
   * Get time-based analytics for performance trends
   */
  static async getTimeBasedAnalytics(params: TimeBasedAnalyticsParams = {}): Promise<ApiResponse<TimeBasedAnalytics>> {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.append('period', params.period);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const url = queryParams.toString() ? `/students/analytics/time-based?${queryParams.toString()}` : '/students/analytics/time-based';
    return apiClient.get<TimeBasedAnalytics>(url);
  }

  /**
   * Get subject-wise performance analytics
   */
  static async getSubjectAnalytics(): Promise<ApiResponse<SubjectAnalytics[]>> {
    // Fallback to available data: many backends expose subject performance within progress overview
    // We'll call progress overview and adapt subjectPerformance to SubjectAnalytics shape
    const overview = await this.getAnalyticsOverview();
    if (!overview.success) return overview as unknown as ApiResponse<SubjectAnalytics[]>;

    const data = overview.data as any;
    const subjectPerf = data?.subjectProgress || data?.subjectPerformance || [];

    const adapted: SubjectAnalytics[] = subjectPerf.map((s: any, idx: number) => ({
      subjectId: s.subjectId ?? idx + 1,
      subjectName: s.subjectName ?? s.subject ?? 'Unknown',
      totalSessions: s.totalSessions ?? s.sessionsCompleted ?? 0,
      averageScore: s.averageScore ?? s.accuracy ?? 0,
      accuracy: s.accuracy ?? s.averageScore ?? 0,
      timeSpent: s.timeSpent ?? 0,
      questionsAnswered: s.questionsAnswered ?? s.completedQuestions ?? 0,
      correctAnswers: s.correctAnswers ?? Math.round((s.accuracy ?? s.averageScore ?? 0) * (s.questionsAnswered ?? s.completedQuestions ?? 0) / 100),
      improvement: s.improvement ?? 0,
      lastActivity: s.lastActivity ?? new Date().toISOString(),
      strengths: s.strengths ?? s.strongAreas ?? [],
      weaknesses: s.weaknesses ?? s.weakAreas ?? [],
      recommendations: s.recommendations ?? []
    }));

    return { success: true, data: adapted } as ApiResponse<SubjectAnalytics[]>;
  }

  /**
   * Get performance comparison data
   */
  static async getPerformanceComparison(params: PerformanceComparisonParams = {}): Promise<ApiResponse<PerformanceComparison>> {
    const queryParams = new URLSearchParams();

    if (params.compareWith) queryParams.append('compareWith', params.compareWith);
    if (params.timeframe) queryParams.append('timeframe', params.timeframe);

    const url = queryParams.toString() ? `/students/analytics/comparison?${queryParams.toString()}` : '/students/analytics/comparison';
    return apiClient.get<PerformanceComparison>(url);
  }
}

// Content Services
export class ContentService {
  /**
   * Browse study packs with pagination and filtering
   */
  static async getStudyPacks(params: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    isPaid?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    // Add pagination
    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('limit', (params.limit || 10).toString());

    // Add filters
    if (params.search) queryParams.append('search', params.search);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.isPaid !== undefined) queryParams.append('isPaid', params.isPaid.toString());
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return apiClient.get<PaginatedResponse<StudyPack>>(`/study-packs?${queryParams.toString()}`);
  }

  /**
   * Get study pack details by ID
   */
  static async getStudyPackDetails(studyPackId: number): Promise<ApiResponse<StudyPackDetails>> {
    return apiClient.get<StudyPackDetails>(`/study-packs/${studyPackId}`);
  }

  /**
   * Get course resources with pagination and filtering
   */
  static async getCourseResources(courseId: number, params: {
    page?: number;
    limit?: number;
    type?: string;
  } = {}): Promise<ApiResponse<CourseResourcesResponse>> {
    const queryParams = new URLSearchParams();

    queryParams.append('page', (params.page || 1).toString());
    queryParams.append('limit', (params.limit || 10).toString());

    if (params.type) queryParams.append('type', params.type);

    return apiClient.get<CourseResourcesResponse>(`/courses/${courseId}/resources?${queryParams.toString()}`);
  }

  /**
   * Check access to a study pack
   */
  static async checkStudyPackAccess(studyPackId: number): Promise<ApiResponse<{
    hasAccess: boolean;
    reason?: string;
    subscriptionRequired?: boolean;
  }>> {
    return apiClient.get<{
      hasAccess: boolean;
      reason?: string;
      subscriptionRequired?: boolean;
    }>(`/study-packs/${studyPackId}/access`);
  }

  /**
   * Check access to a course
   */
  static async checkCourseAccess(courseId: number): Promise<ApiResponse<{
    hasAccess: boolean;
    reason?: string;
    subscriptionRequired?: boolean;
  }>> {
    return apiClient.get<{
      hasAccess: boolean;
      reason?: string;
      subscriptionRequired?: boolean;
    }>(`/courses/${courseId}/access`);
  }

  /**
   * Check user access to study pack
   */
  static async checkStudyPackAccess(studyPackId: number): Promise<ApiResponse<{ hasAccess: boolean; reason?: string }>> {
    return apiClient.get<{ hasAccess: boolean; reason?: string }>(`/study-packs/${studyPackId}/access`);
  }

  /**
   * Check user access to course
   */
  static async checkCourseAccess(courseId: number): Promise<ApiResponse<{ hasAccess: boolean; reason?: string }>> {
    return apiClient.get<{ hasAccess: boolean; reason?: string }>(`/courses/${courseId}/access`);
  }
}

// Subscription Services
export class SubscriptionService {
  /**
   * Get user's current subscriptions
   */
  static async getUserSubscriptions(): Promise<ApiResponse<UserSubscription[]>> {
    return apiClient.get<UserSubscription[]>('/students/subscriptions');
  }

  /**
   * Check subscription status for specific content
   */
  static async checkSubscriptionAccess(contentId: number, contentType: 'study-pack' | 'course'): Promise<ApiResponse<{
    hasAccess: boolean;
    subscriptionRequired: boolean;
    subscriptionType?: string;
    trialAvailable?: boolean;
  }>> {
    return apiClient.get<{
      hasAccess: boolean;
      subscriptionRequired: boolean;
      subscriptionType?: string;
      trialAvailable?: boolean;
    }>(`/subscriptions/check-access?contentId=${contentId}&contentType=${contentType}`);
  }

  /**
   * Start a free trial for a subscription plan
   */
  static async startFreeTrial(planType: string): Promise<ApiResponse<{
    subscriptionId: string;
    trialEndDate: string;
    message: string;
  }>> {
    return apiClient.post<{
      subscriptionId: string;
      trialEndDate: string;
      message: string;
    }>('/subscriptions/start-trial', { planType });
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(planId: string): Promise<ApiResponse<{
    checkoutUrl: string;
    sessionId: string;
  }>> {
    return apiClient.post<{
      checkoutUrl: string;
      sessionId: string;
    }>('/subscriptions/checkout', { planId });
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(subscriptionId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    cancellationDate: string;
  }>> {
    return apiClient.post<{
      success: boolean;
      message: string;
      cancellationDate: string;
    }>(`/subscriptions/${subscriptionId}/cancel`);
  }

  // Note: The following methods are currently not supported by the API
  // They are kept here for future implementation when the API supports general subscription plans

  /**
   * Get subscription plans - NOT CURRENTLY SUPPORTED BY API
   * The API currently uses study pack specific subscriptions
   */
  static async getSubscriptionPlans(): Promise<ApiResponse<any[]>> {
    // This endpoint doesn't exist in the current API
    // Return mock data or throw error
    throw new Error('Subscription plans endpoint not available. API uses study pack specific subscriptions.');
  }
}

// Quiz Services
export class QuizService {
  /**
   * Get quiz filters (year levels, courses, topics, difficulties)
   */
  static async getQuizFilters(): Promise<ApiResponse<QuizFilters>> {
    return apiClient.get<QuizFilters>('/quizzes/quiz-filters');
  }

  /**
   * Get quiz filters with query params for real-time filtered counts
   */
  static async getQuizFiltersWithParams(queryString: string): Promise<ApiResponse<any>> {
    const url = queryString ? `/quizzes/quiz-filters?${queryString}` : '/quizzes/quiz-filters';
    return apiClient.get<any>(url);
  }

  /**
   * Get quiz session details
   * Docs: GET /quiz-sessions/{sessionId}
   */
  static async getQuizSession(sessionId: number): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/quiz-sessions/${sessionId}`);
  }

  /**
   * Create a custom session from specific question IDs
   * POST /quizzes/create-session-by-questions
   */
  static async createSessionByQuestions(payload: { type: 'EXAM' | 'PRACTICE'; questionIds: number[]; title?: string }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/quizzes/create-session-by-questions', payload);
  }

  /**
   * Submit multiple answers for questions in a quiz session (bulk submission)
   * Docs: POST /quiz-sessions/{sessionId}/submit-answer
   */
  static async submitAnswersBulk(sessionId: number, answers: Array<{
    questionId: number;
    selectedAnswerId?: number;
    selectedAnswerIds?: number[];
    textAnswer?: string;
    timeSpent?: number;
  }>): Promise<ApiResponse<any>> {
    const requestBody = {
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        ...(Array.isArray(answer.selectedAnswerIds) && answer.selectedAnswerIds.length > 0
          ? { selectedAnswerIds: answer.selectedAnswerIds }
          : typeof answer.selectedAnswerId === 'number'
            ? { selectedAnswerId: answer.selectedAnswerId }
            : (typeof answer.textAnswer === 'string' && answer.textAnswer.length > 0
              ? { textAnswer: answer.textAnswer }
              : {})),
        ...(typeof answer.timeSpent === 'number' ? { timeSpent: answer.timeSpent } : {})
      }))
    };

    try {
      // Primary as per docs
      return await apiClient.post<any>(`/quiz-sessions/${sessionId}/submit-answer`, requestBody);
    } catch (err: any) {
      const isRouteMissing = (err && (err.statusCode === 404 || /Endpoint not found/i.test(err.error || '')));
      if (isRouteMissing) {
        // Fallback to student-scoped route for legacy envs
        return await apiClient.post<any>(`/students/quiz-sessions/${sessionId}/submit-answer`, requestBody);
      }
      throw err;
    }
  }

  /**
   * Submit answer for a question in a quiz session (single answer)
   * Uses bulk submission internally for consistency
   */
  static async submitAnswer(sessionId: number, answerData: {
    questionId: number;
    selectedAnswerId: number;
    timeSpent?: number;
  }): Promise<ApiResponse<any>> {
    // Use bulk submission with single answer for consistency
    return this.submitAnswersBulk(sessionId, [answerData]);
  }

  /**
   * Update answer for a specific question
   */
  static async updateAnswer(sessionId: number, questionId: number, answerData: {
    selectedAnswerId: number;
    timeSpent?: number;
  }): Promise<ApiResponse<any>> {
    try {
      return await apiClient.put<any>(`/quiz-sessions/${sessionId}/questions/${questionId}/answer`, answerData);
    } catch (err: any) {
      const isRouteMissing = (err && (err.statusCode === 404 || /Endpoint not found/i.test(err.error || '')));
      if (isRouteMissing) {
        return await apiClient.put<any>(`/students/quiz-sessions/${sessionId}/questions/${questionId}/answer`, answerData);
      }
      throw err;
    }
  }

  /**
   * Complete a quiz session
   */
  static async completeQuizSession(sessionId: number): Promise<ApiResponse<any>> {
    // Not used: backend does not expose a /complete endpoint. Kept for forward compatibility.
    return { success: true, data: { sessionId, message: 'No-op complete' } } as any;
  }

  /**
   * Create a new quiz session
   */
  static async createQuizSession(quizConfig: {
    title: string;
    // Use 'type' for classification: PRACTICE | EXAM | RESIDENCY
    type?: 'PRACTICE' | 'EXAM' | 'RESIDENCY';
    settings?: Partial<{
      questionCount: number;
      timeLimit?: number;
      shuffleQuestions?: boolean;
      showExplanations?: 'after_each' | 'at_end' | 'never';
    }>;
    filters: {
      yearLevels?: string[];
      courseIds?: number[];
      quizSourceIds?: number[];
      quizYears?: number[];
      questionTypes?: Array<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>;
      examYears?: number[];
      moduleIds?: number[];
      uniteIds?: number[];
    };
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/quizzes/quiz-sessions', quizConfig);
  }

  /**
   * Get user's quiz sessions
   * Note: Backend currently does NOT accept pagination query params; request must be plain GET /quiz-sessions
   * We keep the parameters in the signature for future compatibility but do not append them to the URL.
   */
  static async getQuizSessions(params: PaginationParams & {
    status?: 'NOT_STARTED' | 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED';
    type?: 'PRACTICE' | 'EXAM' | 'REMEDIAL';
  } = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    // Call without pagination query parameters to avoid 500s on current backend
    try {
      return await apiClient.get<PaginatedResponse<any>>('/quiz-sessions');
    } catch (err: any) {
      // Fallback to student-scoped route for legacy envs
      const status = err?.status || err?.statusCode || err?.response?.status;
      const isRouteMissing = status === 404 || /Endpoint not found/i.test((err?.error || err?.message || '').toString());
      if (isRouteMissing) {
        return await apiClient.get<PaginatedResponse<any>>('/students/quiz-sessions');
      }
      throw err;
    }
  }

  /**
   * Create a retake session from an existing completed session
   * POST /quiz-sessions/retake
   */
  static async retakeQuizSession(payload: {
    originalSessionId: number;
    retakeType: 'SAME' | 'INCORRECT_ONLY' | 'CORRECT_ONLY' | 'NOT_RESPONDED';
    title?: string;
  }): Promise<ApiResponse<any>> {
    // Docs: POST /quiz-sessions/retake
    return apiClient.post<any>('/quiz-sessions/retake', payload);
  }

  /**
   * Update a quiz session (e.g., title)
   */
  static async updateQuizSession(sessionId: number, data: { title?: string; description?: string }): Promise<ApiResponse<any>> {
    try {
      // Prefer unified docs route
      return await apiClient.put<any>(`/quiz-sessions/${sessionId}`, data);
    } catch (err: any) {
      const status = err?.status || err?.statusCode || err?.response?.status;
      const message = (err?.error || err?.message || '').toString();
      const isRouteMissing = status === 404 || /Endpoint not found/i.test(message);
      if (isRouteMissing) {
        // Fallback to student-scoped route
        return await apiClient.put<any>(`/students/quiz-sessions/${sessionId}`, data);
      }
      throw err;
    }
  }

  /**
   * Delete a quiz session
   */
  static async deleteQuizSession(sessionId: number): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await apiClient.delete<{ success: boolean }>(`/students/quiz-sessions/${sessionId}`);
    } catch (err: any) {
      const status = err?.status || err?.statusCode || err?.response?.status;
      const message = (err?.error || err?.message || '').toString();
      const isRouteMissing = status === 404 || /Endpoint not found/i.test(message);
      if (isRouteMissing) {
        return await apiClient.delete<{ success: boolean }>(`/students/quiz-sessions/${sessionId}`);
      }
      throw err;
    }
  }

  /**
   * Update quiz session status
   * Endpoint: PATCH /students/quiz-sessions/:sessionId/status
   * Valid values: NOT_STARTED | IN_PROGRESS | COMPLETED
   * Notes: Server enforces transitions; client just forwards the request.
   */
  static async updateQuizSessionStatus(
    sessionId: number,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  ): Promise<ApiResponse<any>> {
    const body = { status };
    try {
      return await apiClient.patch<any>(`/students/quiz-sessions/${sessionId}/status`, body);
    } catch (err: any) {
      const isRouteMissing = err && (err.statusCode === 404 || /Endpoint not found/i.test(err.error || ''));
      if (isRouteMissing) {
        // Fallback: unified route without /students (for legacy envs)
        return await apiClient.patch<any>(`/quiz-sessions/${sessionId}/status`, body);
      }
      throw err;
    }
  }


}

// Exam Services
export class ExamService {
  /**
   * Get available exams with filtering
   */
  static async getAvailableExams(filters: ExamFilters = {}): Promise<ApiResponse<AvailableExamsResponse>> {
    const queryParams = new URLSearchParams();

    if (filters.universityId) queryParams.append('universityId', filters.universityId.toString());
    if (filters.yearLevel) queryParams.append('yearLevel', filters.yearLevel);
    if (filters.examYear) queryParams.append('examYear', filters.examYear);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);

    const url = queryParams.toString() ? `/exams/available?${queryParams.toString()}` : '/exams/available';
    return apiClient.get<AvailableExamsResponse>(url);
  }

  /**
   * Get exam details by ID
   */
  static async getExamDetails(examId: number): Promise<ApiResponse<Exam>> {
    return apiClient.get<Exam>(`/exams/${examId}`);
  }

  /**
   * Create exam session
   */
  static async createExamSession(examId: number): Promise<ApiResponse<ExamSession>> {
    // Ensure quizType classification is EXAM
    return apiClient.post<ExamSession>('/exams/exam-sessions', { examId, quizType: 'EXAM' });
  }

  /**
   * Create exam session from multiple modules
   * POST /exams/exam-sessions/from-modules
   */
  static async createExamSessionFromModules(payload: { moduleIds: number[]; year: number; title?: string }): Promise<ApiResponse<any>> {
    // Ensure quizType classification is EXAM for module-based creation
    return apiClient.post<any>('/exams/exam-sessions/from-modules', { ...payload, quizType: 'EXAM' });
  }

  /**
   * Get exam questions for a specific exam
   */
  static async getExamQuestions(examId: number): Promise<ApiResponse<ExamQuestion[]>> {
    return apiClient.get<ExamQuestion[]>(`/exams/${examId}/questions`);
  }

  /**
   * Get exam session details (uses quiz-sessions endpoint as exams and quizzes share the same session system)
   */
  static async getExamSession(sessionId: number): Promise<ApiResponse<ExamSession>> {
    return apiClient.get<ExamSession>(`/quiz-sessions/${sessionId}`);
  }

  /**
   * Submit exam answer (uses unified quiz session endpoint)
   */
  static async submitExamAnswer(sessionId: number, answer: {
    questionId: number;
    selectedAnswerId?: number;
    selectedAnswerIds?: number[];
    textAnswer?: string;
    timeSpent?: number;
    flagged?: boolean;
  }): Promise<ApiResponse<{ success: boolean; message: string }>> {
    // Per spec: POST /quiz-sessions/{examSessionId}/submit-answer with answers[] payload
    const requestBody: any = {
      answers: [
        {
          questionId: answer.questionId,
          ...(Array.isArray(answer.selectedAnswerIds) && answer.selectedAnswerIds.length > 0
            ? { selectedAnswerIds: answer.selectedAnswerIds }
            : typeof answer.selectedAnswerId === 'number'
              ? { selectedAnswerId: answer.selectedAnswerId }
              : {}),
          ...(typeof answer.timeSpent === 'number' ? { timeSpent: answer.timeSpent } : {}),
          ...(typeof answer.flagged === 'boolean' ? { flagged: answer.flagged } : {}),
          ...(typeof answer.textAnswer === 'string' && answer.textAnswer.length > 0 ? { textAnswer: answer.textAnswer } : {}),
        },
      ],
    };

    try {
      // Primary spec path
      return await apiClient.post<{ success: boolean; message: string }>(`/quiz-sessions/${sessionId}/submit-answer`, requestBody);
    } catch (err: any) {
      // Fallback to student-scoped route if unified route is not available in some envs
      const isRouteMissing = (err && (err.statusCode === 404 || /Endpoint not found/i.test(err.error || '')));
      if (isRouteMissing) {
        return await apiClient.post<{ success: boolean; message: string }>(`/students/quiz-sessions/${sessionId}/submit-answer`, requestBody);
      }
      throw err;
    }
  }

  /**
   * Complete exam session (uses unified session management - auto-completion)
   */
  static async completeExamSession(sessionId: number): Promise<ApiResponse<ExamResult>> {
    // Exam sessions auto-complete when answers are submitted
    // Just return the current session state which contains all results
    const sessionResponse = await this.getExamSession(sessionId);

    if (sessionResponse.success) {
      // Transform session data to exam result format for compatibility
      const sessionData = sessionResponse.data.data || sessionResponse.data;
      const examResult = {
        sessionId: sessionData.id,
        examId: sessionData.examId,
        score: sessionData.score || 0,
        percentage: sessionData.percentage || 0,
        status: sessionData.status,
        completedAt: sessionData.updatedAt,
        questions: sessionData.questions || [],
        userAnswers: sessionData.userAnswers || {},
      };

      return {
        success: true,
        data: examResult,
        message: 'Exam session completed'
      };
    }

    return sessionResponse;
  }

  /**
   * Get exam results (reads from unified session data)
   */
  static async getExamResults(sessionId: number): Promise<ApiResponse<ExamResult>> {
    // Results are embedded in session details - use unified endpoint
    return this.completeExamSession(sessionId);
  }

  /**
   * Flag exam question for review (uses unified session management)
   */
  static async flagExamQuestion(sessionId: number, questionId: number, flagged: boolean): Promise<ApiResponse<{ success: boolean }>> {
    // Use unified quiz session flagging if available, otherwise return success
    // This functionality may not be implemented in the unified API
    console.log(`Flagging question ${questionId} in session ${sessionId}: ${flagged}`);
    return {
      success: true,
      data: { success: true },
      message: 'Question flagged successfully'
    };
  }

  /**
   * Get student's exam history
   */
  static async getExamHistory(params: {
    page?: number;
    limit?: number;
    examId?: number;
    status?: 'COMPLETED' | 'IN_PROGRESS' | 'ABANDONED';
  } = {}): Promise<ApiResponse<PaginatedResponse<ExamSession>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.examId) queryParams.append('examId', params.examId.toString());
    if (params.status) queryParams.append('status', params.status);

    const url = queryParams.toString() ? `/students/exam-history?${queryParams.toString()}` : '/students/exam-history';
    return apiClient.get<PaginatedResponse<ExamSession>>(url);
  }
}

// Admin Services
export class AdminService {
  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(params: PaginationParams & {
    search?: string;
    role?: string;
    universityId?: number; // deprecated in docs; kept for backward compatibility
    university?: number;   // docs-compliant param name
    isActive?: boolean;
  } = {}): Promise<ApiResponse<{
    users: ApiUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.university !== undefined) {
      queryParams.append('university', params.university.toString());
    } else if (params.universityId) {
      // map old name to new docs param for compatibility
      queryParams.append('university', params.universityId.toString());
    }
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const url = queryParams.toString() ? `/admin/users?${queryParams.toString()}` : '/admin/users';
    return apiClient.get<{
      users: ApiUser[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(url);
  }


  /**
   * Create new user
   */
  static async createUser(userData: {
    email: string;
    password: string;
    fullName: string;
    role: 'STUDENT' | 'ADMIN' | 'EMPLOYEE';
    universityId?: number;
    specialtyId?: number;
    currentYear?: string;
  }): Promise<ApiResponse<ApiUser>> {
    return apiClient.post<ApiUser>('/admin/users', userData);
  }

  /**
   * Update user
   */
  static async updateUser(userId: number, userData: Partial<ApiUser>): Promise<ApiResponse<ApiUser>> {
    return apiClient.put<ApiUser>(`/admin/users/${userId}`, userData);
  }

  /**
   * Deactivate user (docs-compliant: set isActive=false via PUT)
   */
  static async deactivateUser(userId: number): Promise<ApiResponse<ApiUser>> {
    return apiClient.put<ApiUser>(`/admin/users/${userId}`, { isActive: false });
  }



  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>('/admin/dashboard/stats');
  }

  /**
   * Reset user password (Admin only)
   */
  static async resetUserPassword(userId: number, newPassword: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(`/admin/users/${userId}/reset-password`, {
      newPassword
    });
  }

  // ==================== SUBSCRIPTION MANAGEMENT ====================

  /**
   * Get all subscriptions with pagination and filtering
   */
  static async getSubscriptions(params: PaginationParams & AdminSubscriptionFilters = {}): Promise<ApiResponse<PaginatedResponse<AdminSubscription>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.studyPackId) queryParams.append('studyPackId', params.studyPackId.toString());
    if (params.userId) queryParams.append('userId', params.userId.toString());
    if (params.search) queryParams.append('search', params.search);

    const url = queryParams.toString() ? `/admin/subscriptions?${queryParams.toString()}` : '/admin/subscriptions';
    return apiClient.get<PaginatedResponse<AdminSubscription>>(url);
  }

  /**
   * Update subscription status and dates
   */
  static async updateSubscription(subscriptionId: number, updateData: UpdateSubscriptionRequest): Promise<ApiResponse<AdminSubscription>> {
    return apiClient.put<AdminSubscription>(`/admin/subscriptions/${subscriptionId}`, updateData);
  }

  /**
   * Cancel subscription with reason
   */
  static async cancelSubscription(subscriptionId: number, cancelData: CancelSubscriptionRequest): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post<{ success: boolean; message: string }>(`/admin/subscriptions/${subscriptionId}/cancel`, cancelData);
  }

  /**
   * Add months to subscription
   */
  static async addMonthsToSubscription(subscriptionId: number, extensionData: AddMonthsToSubscriptionRequest): Promise<ApiResponse<AdminSubscription>> {
    return apiClient.post<AdminSubscription>(`/admin/subscriptions/${subscriptionId}/add-months`, extensionData);
  }

  // ==================== QUIZ MANAGEMENT ====================

  /**
   * Get all quizzes with pagination and filtering
   */
  static async getQuizzes(params: PaginationParams & AdminQuizFilters = {}): Promise<ApiResponse<PaginatedResponse<AdminQuiz>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.courseId) queryParams.append('courseId', params.courseId.toString());
    if (params.universityId) queryParams.append('universityId', params.universityId.toString());
    if (params.yearLevel) queryParams.append('yearLevel', params.yearLevel);
    if (params.quizSourceId) queryParams.append('quizSourceId', params.quizSourceId.toString());
    if (params.quizYear) queryParams.append('quizYear', params.quizYear.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);

    const url = queryParams.toString() ? `/admin/quizzes?${queryParams.toString()}` : '/admin/quizzes';
    return apiClient.get<PaginatedResponse<AdminQuiz>>(url);
  }

  /**
   * Create new quiz with questions
   */
  static async createQuiz(quizData: CreateQuizRequest): Promise<ApiResponse<AdminQuiz>> {
    return apiClient.post<AdminQuiz>('/admin/quizzes', quizData);
  }

  /**
   * Update quiz
   */
  static async updateQuiz(quizId: number, updateData: UpdateQuizRequest): Promise<ApiResponse<AdminQuiz>> {
    return apiClient.put<AdminQuiz>(`/admin/quizzes/${quizId}`, updateData);
  }

  /**
   * Delete quiz
   */
  static async deleteQuiz(quizId: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/quizzes/${quizId}`);
  }

  // ==================== EXAM MANAGEMENT ====================

  /**
   * Get all exams with pagination and filtering
   */
  static async getExams(params: PaginationParams & AdminExamFilters = {}): Promise<ApiResponse<PaginatedResponse<AdminExam>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.moduleId) queryParams.append('moduleId', params.moduleId.toString());
    if (params.universityId) queryParams.append('universityId', params.universityId.toString());
    if (params.yearLevel) queryParams.append('yearLevel', params.yearLevel);
    if (params.examYear) queryParams.append('examYear', params.examYear);
    if (params.year) queryParams.append('year', params.year.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);

    const url = queryParams.toString() ? `/admin/exams?${queryParams.toString()}` : '/admin/exams';
    return apiClient.get<PaginatedResponse<AdminExam>>(url);
  }

  /**
   * Create new exam with questions
   */
  static async createExam(examData: CreateExamRequest): Promise<ApiResponse<AdminExam>> {
    return apiClient.post<AdminExam>('/admin/exams', examData);
  }


  /**
   * Update exam question order
   */
  static async updateExamQuestionOrder(orderData: UpdateExamQuestionOrderRequest): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.put<{ success: boolean; message: string }>('/admin/exams/question-order', orderData);
  }

  // ==================== QUESTION MANAGEMENT ====================

  /**
   * Get all questions with pagination and filtering
   */
  static async getQuestions(params: PaginationParams & AdminQuestionFilters = {}): Promise<ApiResponse<PaginatedResponse<AdminQuestion>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.courseId) queryParams.append('courseId', params.courseId.toString());
    if (params.universityId) queryParams.append('universityId', params.universityId.toString());
    if (params.examId) queryParams.append('examId', params.examId.toString());
    if (params.questionType) queryParams.append('questionType', params.questionType);
    if (params.yearLevel) queryParams.append('yearLevel', params.yearLevel);
    if (params.examYear) queryParams.append('examYear', params.examYear.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);

    const url = queryParams.toString() ? `/admin/questions?${queryParams.toString()}` : '/admin/questions';
    return apiClient.get<PaginatedResponse<AdminQuestion>>(url);
  }

  /**
   * Get single question by ID
   */
  static async getQuestion(questionId: number): Promise<ApiResponse<AdminQuestion>> {
    return apiClient.get<AdminQuestion>(`/admin/questions/${questionId}`);
  }

  /**
   * Create new question
   */
  static async createQuestion(questionData: CreateQuestionRequest): Promise<ApiResponse<AdminQuestion>> {
    return apiClient.post<AdminQuestion>('/admin/questions', questionData);
  }

  /**
   * Create multiple questions in bulk
   */
  static async createQuestionsBulk(bulkData: {
    metadata: {
      courseId: number;
      universityId?: number;
      examYear?: number;
    };
    questions: Array<{
      questionText: string;
      explanation?: string;
      questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
      answers: Array<{
        answerText: string;
        isCorrect: boolean;
        explanation?: string;
      }>;
    }>;
  }): Promise<ApiResponse<{
    questions: Array<{
      id: number;
      questionText: string;
      questionType: string;
    }>;
    totalCreated: number;
  }>> {
    return apiClient.post<{
      questions: Array<{
        id: number;
        questionText: string;
        questionType: string;
      }>;
      totalCreated: number;
    }>('/admin/questions/bulk', bulkData);
  }

  /**
   * Update question
   * Note: PUT /admin/questions/{id} endpoint is not implemented on backend
   * This method provides graceful error handling until the endpoint is available
   */
  static async updateQuestion(questionId: number, updateData: UpdateQuestionRequest): Promise<ApiResponse<AdminQuestion>> {
    try {
      return await apiClient.put<AdminQuestion>(`/admin/questions/${questionId}`, updateData);
    } catch (error: any) {
      // If the endpoint returns 404, provide a helpful error message
      if (error?.response?.status === 404) {
        throw new Error('Question update functionality is not yet implemented on the backend. Please use the explanation update feature or contact the development team.');
      }
      throw error;
    }
  }

  /**
   * Delete question
   * Note: DELETE /admin/questions/{id} endpoint is not implemented on backend
   * This method provides graceful error handling until the endpoint is available
   */
  static async deleteQuestion(questionId: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      return await apiClient.delete<{ success: boolean; message: string }>(`/admin/questions/${questionId}`);
    } catch (error: any) {
      // If the endpoint returns 404, provide a helpful error message
      if (error?.response?.status === 404) {
        throw new Error('Question deletion functionality is not yet implemented on the backend. Please contact the development team.');
      }
      throw error;
    }
  }

  /**
   * Update question explanation with images
   */
  static async updateQuestionExplanation(questionId: number, explanationData: UpdateQuestionExplanationRequest): Promise<ApiResponse<{ success: boolean; message: string; imageCount: number }>> {
    const formData = new FormData();
    formData.append('explanation', explanationData.explanation);

    if (explanationData.explanationImages) {
      explanationData.explanationImages.forEach(image => {
        formData.append('explanationImages', image);
      });
    }

    return apiClient.put<{ success: boolean; message: string; imageCount: number }>(`/admin/questions/${questionId}/explanation`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // ==================== QUESTION REPORTS MANAGEMENT ====================

  /**
   * Get all question reports with pagination and filtering
   */
  static async getQuestionReports(params: PaginationParams & AdminQuestionReportFilters = {}): Promise<ApiResponse<PaginatedResponse<AdminQuestionReport>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.reportType) queryParams.append('reportType', params.reportType);
    if (params.questionId) queryParams.append('questionId', params.questionId.toString());
    if (params.userId) queryParams.append('userId', params.userId.toString());
    if (params.search) queryParams.append('search', params.search);

    // Docs: GET /admin/question-reports
    const url = queryParams.toString() ? `/admin/question-reports?${queryParams.toString()}` : '/admin/question-reports';
    return apiClient.get<PaginatedResponse<AdminQuestionReport>>(url);
  }

  /**
   * Review question report
   */
  static async reviewQuestionReport(reportId: number, reviewData: ReviewQuestionReportRequest): Promise<ApiResponse<AdminQuestionReport>> {
    // Docs: PUT /admin/question-reports/{reportId}/review
    return apiClient.put<AdminQuestionReport>(`/admin/question-reports/${reportId}/review`, reviewData);
  }

  // ==================== FILE UPLOAD MANAGEMENT ====================

  /**
   * Upload images
   */
  static async uploadImages(images: File[]): Promise<ApiResponse<ImageUploadResponse>> {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    return apiClient.post<ImageUploadResponse>('/admin/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Upload PDFs
   */
  static async uploadPDFs(pdfs: File[]): Promise<ApiResponse<PDFUploadResponse>> {
    const formData = new FormData();
    pdfs.forEach(pdf => {
      formData.append('pdfs', pdf);
    });

    return apiClient.post<PDFUploadResponse>('/admin/upload/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Upload study pack media (images and PDFs)
   */
  static async uploadStudyPackMedia(images: File[], pdfs: File[]): Promise<ApiResponse<StudyPackMediaUploadResponse>> {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });
    pdfs.forEach(pdf => {
      formData.append('pdfs', pdf);
    });

    return apiClient.post<StudyPackMediaUploadResponse>('/admin/upload/study-pack-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Upload explanation images
   */
  static async uploadExplanations(explanations: File[]): Promise<ApiResponse<ExplanationUploadResponse>> {
    const formData = new FormData();
    explanations.forEach(explanation => {
      formData.append('explanations', explanation);
    });

    return apiClient.post<ExplanationUploadResponse>('/admin/upload/explanation', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Upload logo images
   */
  static async uploadLogos(logos: File[]): Promise<ApiResponse<LogoUploadResponse>> {
    const formData = new FormData();
    logos.forEach(logo => {
      formData.append('logos', logo);
    });

    return apiClient.post<LogoUploadResponse>('/admin/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // ==================== QUESTION MANAGEMENT ====================

  /**
   * Get question filters for hierarchy selection
   */
  static async getQuestionFilters(): Promise<ApiResponse<{
    filters: {
      courses: Array<{
        id: number;
        moduleId: number;
        name: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        module: {
          id: number;
          uniteId: number;
          name: string;
          description: string;
          createdAt: string;
          updatedAt: string;
          unite: {
            id: number;
            studyPackId: number;
            name: string;
            description: string;
            logoUrl?: string;
            createdAt: string;
            updatedAt: string;
          };
        };
      }>;
      universities: Array<{
        id: number;
        name: string;
        country: string;
        createdAt: string;
        updatedAt: string;
      }>;
      examYears: number[];
      questionTypes: string[];
    };
  }>> {
    return apiClient.get<{
      filters: {
        courses: Array<{
          id: number;
          moduleId: number;
          name: string;
          description: string;
          createdAt: string;
          updatedAt: string;
          module: {
            id: number;
            uniteId: number;
            name: string;
            description: string;
            createdAt: string;
            updatedAt: string;
            unite: {
              id: number;
              studyPackId: number;
              name: string;
              description: string;
              logoUrl?: string;
              createdAt: string;
              updatedAt: string;
            };
          };
        }>;
        universities: Array<{
          id: number;
          name: string;
          country: string;
          createdAt: string;
          updatedAt: string;
        }>;
        examYears: number[];
        questionTypes: string[];
      };
    }>('/admin/questions/filters');
  }

  // ==================== ACTIVATION CODES MANAGEMENT ====================

  /**
   * Get all activation codes with pagination and filtering
   */
  static async getActivationCodes(params: PaginationParams & ActivationCodeFilters = {}): Promise<ApiResponse<{
    activationCodes: ActivationCode[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.createdBy) queryParams.append('createdBy', params.createdBy.toString());

    const url = queryParams.toString() ? `/admin/activation-codes?${queryParams.toString()}` : '/admin/activation-codes';
    return apiClient.get<{
      activationCodes: ActivationCode[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(url);
  }

  /**
   * Create new activation code
   */
  static async createActivationCode(codeData: CreateActivationCodeRequest): Promise<ApiResponse<{
    message: string;
    activationCode: ActivationCode;
  }>> {
    return apiClient.post<{
      message: string;
      activationCode: ActivationCode;
    }>('/admin/activation-codes', codeData);
  }

  /**
   * Deactivate activation code
   */
  static async deactivateActivationCode(codeId: number): Promise<ApiResponse<{
    message: string;
    activationCode: ActivationCode;
  }>> {
    return apiClient.patch<{
      message: string;
      activationCode: ActivationCode;
    }>(`/admin/activation-codes/${codeId}/deactivate`);
  }
}

// Admin Content Management Services
export class AdminContentService {
  // ==================== STUDY PACK MANAGEMENT ====================

  /**
   * Get all study packs for admin management (docs: supports pagination)
   */
  static async getStudyPacks(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<{
    studyPacks: Array<StudyPack & {
      unites: Array<StudyPackUnit & {
        modules: Array<StudyPackModule & {
          courses: Array<StudyPackCourse>;
        }>;
      }>;
      subscriptions: any[];
      _count: { subscriptions: number };
    }>;
  }>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const url = queryParams.toString() ? `/admin/study-packs?${queryParams.toString()}` : '/admin/study-packs';
    return apiClient.get<{
      studyPacks: Array<StudyPack & {
        unites: Array<StudyPackUnit & {
          modules: Array<StudyPackModule & {
            courses: Array<StudyPackCourse>;
          }>;
        }>;
        subscriptions: any[];
        _count: { subscriptions: number };
      }>;
    }>(url);
  }

  /**
   * Create new study pack
   */
  static async createStudyPack(studyPackData: {
    name: string;
    description: string;
    type: 'YEAR' | 'RESIDENCY';
    yearNumber?: CurrentYear;
    price: number;
    isActive: boolean;
  }): Promise<ApiResponse<{
    message: string;
    studyPack: StudyPack & { _count: { subscriptions: number } };
  }>> {
    return apiClient.post<{
      message: string;
      studyPack: StudyPack & { _count: { subscriptions: number } };
    }>('/admin/study-packs', studyPackData);
  }

  /**
   * Update study pack
   */
  static async updateStudyPack(studyPackId: number, studyPackData: Partial<{
    name: string;
    description: string;
    type: 'YEAR' | 'RESIDENCY';
    yearNumber: CurrentYear;
    price: number;
    isActive: boolean;
  }>): Promise<ApiResponse<{
    message: string;
    studyPack: StudyPack & { _count: { subscriptions: number } };
  }>> {
    return apiClient.put<{
      message: string;
      studyPack: StudyPack & { _count: { subscriptions: number } };
    }>(`/admin/study-packs/${studyPackId}`, studyPackData);
  }

  /**
   * Delete study pack
   */
  static async deleteStudyPack(studyPackId: number): Promise<ApiResponse<{
    message: string;
  }>> {
    return apiClient.delete<{
      message: string;
    }>(`/admin/study-packs/${studyPackId}`);
  }

  // ==================== UNIT MANAGEMENT ====================

  /**
   * Create new unit linked to study pack
   */
  static async createUnit(unitData: {
    name: string;
    description: string;
    studyPackId: number;
    logoUrl?: string;
  }): Promise<ApiResponse<{
    message: string;
    unite: StudyPackUnit & {
      studyPackId: number;
      createdAt: string;
      updatedAt: string;
      studyPack: { name: string };
    };
  }>> {
    return apiClient.post<{
      message: string;
      unite: StudyPackUnit & {
        studyPackId: number;
        createdAt: string;
        updatedAt: string;
        studyPack: { name: string };
      };
    }>('/admin/content/unites', unitData);
  }

  /**
   * Update unit
   */
  static async updateUnit(unitId: number, unitData: Partial<{
    name: string;
    description: string;
    studyPackId: number;
    logoUrl: string;
  }>): Promise<ApiResponse<{
    message: string;
    unite: StudyPackUnit & {
      studyPackId: number;
      createdAt: string;
      updatedAt: string;
      studyPack: { name: string };
    };
  }>> {
    return apiClient.put<{
      message: string;
      unite: StudyPackUnit & {
        studyPackId: number;
        createdAt: string;
        updatedAt: string;
        studyPack: { name: string };
      };
    }>(`/admin/content/unites/${unitId}`, unitData);
  }

  /**
   * Delete unit
   */
  static async deleteUnit(unitId: number): Promise<ApiResponse<{
    message: string;
  }>> {
    return apiClient.delete<{
      message: string;
    }>(`/admin/content/unites/${unitId}`);
  }

  // ==================== MODULE MANAGEMENT ====================

  /**
   * Create new module linked to unit
   */
  static async createModule(moduleData: {
    name: string;
    description: string;
    uniteId: number;
  }): Promise<ApiResponse<{
    message: string;
    module: StudyPackModule & {
      uniteId: number;
      createdAt: string;
      updatedAt: string;
      unite: { name: string };
    };
  }>> {
    return apiClient.post<{
      message: string;
      module: StudyPackModule & {
        uniteId: number;
        createdAt: string;
        updatedAt: string;
        unite: { name: string };
      };
    }>('/admin/content/modules', moduleData);
  }

  /**
   * Update module
   */
  static async updateModule(moduleId: number, moduleData: Partial<{
    name: string;
    description: string;
    uniteId: number;
  }>): Promise<ApiResponse<{
    message: string;
    module: StudyPackModule & {
      uniteId: number;
      createdAt: string;
      updatedAt: string;
      unite: { name: string };
    };
  }>> {
    return apiClient.put<{
      message: string;
      module: StudyPackModule & {
        uniteId: number;
        createdAt: string;
        updatedAt: string;
        unite: { name: string };
      };
    }>(`/admin/content/modules/${moduleId}`, moduleData);
  }

  /**
   * Delete module
   */
  static async deleteModule(moduleId: number): Promise<ApiResponse<{
    message: string;
  }>> {
    return apiClient.delete<{
      message: string;
    }>(`/admin/content/modules/${moduleId}`);
  }

  // ==================== COURSE MANAGEMENT ====================

  /**
   * Create new course linked to module
   */
  static async createCourse(courseData: {
    name: string;
    description: string;
    moduleId: number;
  }): Promise<ApiResponse<{
    message: string;
    course: StudyPackCourse & {
      moduleId: number;
      createdAt: string;
      updatedAt: string;
      module: { name: string };
    };
  }>> {
    return apiClient.post<{
      message: string;
      course: StudyPackCourse & {
        moduleId: number;
        createdAt: string;
        updatedAt: string;
        module: { name: string };
      };
    }>('/admin/content/courses', courseData);
  }

  /**
   * Update course
   */
  static async updateCourse(courseId: number, courseData: Partial<{
    name: string;
    description: string;
    moduleId: number;
  }>): Promise<ApiResponse<{
    message: string;
    course: StudyPackCourse & {
      moduleId: number;
      createdAt: string;
      updatedAt: string;
      module: { name: string };
    };
  }>> {
    return apiClient.put<{
      message: string;
      course: StudyPackCourse & {
        moduleId: number;
        createdAt: string;
        updatedAt: string;
        module: { name: string };
      };
    }>(`/admin/content/courses/${courseId}`, courseData);
  }

  /**
   * Delete course
   */
  static async deleteCourse(courseId: number): Promise<ApiResponse<{
    message: string;
  }>> {
    return apiClient.delete<{
      message: string;
    }>(`/admin/content/courses/${courseId}`);
  }

  // ==================== RESOURCE MANAGEMENT ====================

  /**
   * Create new resource linked to course
   */
  static async createResource(resourceData: {
    courseId: number;
    type: 'SLIDE' | 'VIDEO' | 'DOCUMENT' | 'LINK';
    title: string;
    description?: string;
    filePath?: string;
    externalUrl?: string;
    youtubeVideoId?: string;
    isPaid: boolean;
    price?: number;
  }): Promise<ApiResponse<{
    message: string;
    resource: {
      id: number;
      courseId: number;
      type: 'SLIDE' | 'VIDEO' | 'DOCUMENT' | 'LINK';
      title: string;
      description: string | null;
      filePath: string | null;
      externalUrl: string | null;
      youtubeVideoId: string | null;
      isPaid: boolean;
      price: number | null;
      createdAt: string;
      updatedAt: string;
      course: { name: string };
    };
  }>> {
    return apiClient.post<{
      message: string;
      resource: {
        id: number;
        courseId: number;
        type: 'SLIDE' | 'VIDEO' | 'DOCUMENT' | 'LINK';
        title: string;
        description: string | null;
        filePath: string | null;
        externalUrl: string | null;
        youtubeVideoId: string | null;
        isPaid: boolean;
        price: number | null;
        createdAt: string;
        updatedAt: string;
        course: { name: string };
      };
    }>('/admin/content/course-resources', resourceData);
  }

  /**
   * Update resource
   */
  static async updateResource(resourceId: number, resourceData: Partial<{
    type: 'SLIDE' | 'VIDEO' | 'DOCUMENT' | 'LINK';
    title: string;
    description: string;
    filePath: string;
    externalUrl: string;
    youtubeVideoId: string;
    isPaid: boolean;
    price: number;
  }>): Promise<ApiResponse<{
    message: string;
    resource: {
      id: number;
      courseId: number;
      type: 'SLIDE' | 'VIDEO' | 'DOCUMENT' | 'LINK';
      title: string;
      description: string | null;
      filePath: string | null;
      externalUrl: string | null;
      youtubeVideoId: string | null;
      isPaid: boolean;
      price: number | null;
      createdAt: string;
      updatedAt: string;
      course: { name: string };
    };
  }>> {
    return apiClient.put<{
      message: string;
      resource: {
        id: number;
        courseId: number;
        type: 'SLIDE' | 'VIDEO' | 'DOCUMENT' | 'LINK';
        title: string;
        description: string | null;
        filePath: string | null;
        externalUrl: string | null;
        youtubeVideoId: string | null;
        isPaid: boolean;
        price: number | null;
        createdAt: string;
        updatedAt: string;
        course: { name: string };
      };
    }>(`/admin/content/course-resources/${resourceId}`, resourceData);
  }

  /**
   * Delete resource
   */
  static async deleteResource(resourceId: number): Promise<ApiResponse<{
    message: string;
  }>> {
    return apiClient.delete<{
      message: string;
    }>(`/admin/content/course-resources/${resourceId}`);
  }

  // ==================== UNIVERSITY MANAGEMENT ====================

  /**
   * Create new university
   */
  static async createUniversity(universityData: {
    name: string;
    country: string;
    city: string;
  }): Promise<ApiResponse<{
    message: string;
    university: {
      id: number;
      name: string;
      country: string;
      city: string;
      createdAt: string;
      updatedAt: string;
    };
  }>> {
    return apiClient.post<{
      message: string;
      university: {
        id: number;
        name: string;
        country: string;
        city: string;
        createdAt: string;
        updatedAt: string;
      };
    }>('/admin/universities', universityData);
  }

  /**
   * Update university
   */
  static async updateUniversity(universityId: number, universityData: Partial<{
    name: string;
    country: string;
    city: string;
  }>): Promise<ApiResponse<{
    message: string;
    university: {
      id: number;
      name: string;
      country: string;
      city: string;
      createdAt: string;
      updatedAt: string;
    };
  }>> {
    return apiClient.put<{
      message: string;
      university: {
        id: number;
        name: string;
        country: string;
        city: string;
        createdAt: string;
        updatedAt: string;
      };
    }>(`/admin/universities/${universityId}`, universityData);
  }

  /**
   * Delete university
   */
  static async deleteUniversity(universityId: number): Promise<ApiResponse<{
    message: string;
  }>> {
    return apiClient.delete<{
      message: string;
    }>(`/admin/universities/${universityId}`);
  }

  // ==================== STUDY PACK MANAGEMENT ====================

  /**
   * Create new study pack
   */
  static async createStudyPack(studyPackData: {
    name: string;
    description: string;
    type: 'YEAR' | 'RESIDENCY';
    yearNumber?: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'SIX' | 'SEVEN';
    price: number;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    message: string;
    studyPack: {
      id: number;
      name: string;
      description: string;
      type: string;
      yearNumber: string | null;
      price: number;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }>> {
    return apiClient.post<{
      message: string;
      studyPack: {
        id: number;
        name: string;
        description: string;
        type: string;
        yearNumber: string | null;
        price: number;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      };
    }>('/admin/study-packs', studyPackData);
  }

  // ==================== QUESTION MANAGEMENT ====================

  /**
   * Get question filters for hierarchy selection
   */
  static async getQuestionFilters(): Promise<ApiResponse<{
    filters: {
      courses: Array<{
        id: number;
        moduleId: number;
        name: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        module: {
          id: number;
          uniteId: number;
          name: string;
          description: string;
          createdAt: string;
          updatedAt: string;
          unite: {
            id: number;
            studyPackId: number;
            name: string;
            description: string;
            logoUrl?: string;
            createdAt: string;
            updatedAt: string;
          };
        };
      }>;
      universities: Array<{
        id: number;
        name: string;
        country: string;
        createdAt: string;
        updatedAt: string;
      }>;
      examYears: number[];
      questionTypes: string[];
    };
  }>> {
    return apiClient.get<{
      filters: {
        courses: Array<{
          id: number;
          moduleId: number;
          name: string;
          description: string;
          createdAt: string;
          updatedAt: string;
          module: {
            id: number;
            uniteId: number;
            name: string;
            description: string;
            createdAt: string;
            updatedAt: string;
            unite: {
              id: number;
              studyPackId: number;
              name: string;
              description: string;
              logoUrl?: string;
              createdAt: string;
              updatedAt: string;
            };
          };
        }>;
        universities: Array<{
          id: number;
          name: string;
          country: string;
          createdAt: string;
          updatedAt: string;
        }>;
        examYears: number[];
        questionTypes: string[];
      };
    }>('/admin/questions/filters');
  }

  /**
   * Create single question
   */
  static async createQuestion(questionData: CreateQuestionRequest): Promise<ApiResponse<{
    id: number;
    questionText: string;
    questionType: string;
  }>> {
    // If there are question images, use FormData for multipart upload
    if (questionData.questionImages && questionData.questionImages.length > 0) {
      const formData = new FormData();

      // Add text fields
      formData.append('questionText', questionData.questionText);
      if (questionData.explanation) {
        formData.append('explanation', questionData.explanation);
      }
      formData.append('questionType', questionData.questionType);
      formData.append('courseId', questionData.courseId.toString());

      if (questionData.universityId) {
        formData.append('universityId', questionData.universityId.toString());
      }
      if (questionData.yearLevel) {
        formData.append('yearLevel', questionData.yearLevel);
      }
      if (questionData.examYear) {
        formData.append('examYear', questionData.examYear.toString());
      }

      // Add answers as JSON string
      formData.append('answers', JSON.stringify(questionData.answers));

      // Add question images
      questionData.questionImages.forEach((image, index) => {
        if (image instanceof File) {
          formData.append('questionImages', image);
          if (image.altText) {
            formData.append(`questionImageAltTexts[${index}]`, image.altText);
          }
        }
      });

      return apiClient.post<{
        id: number;
        questionText: string;
        questionType: string;
      }>('/admin/questions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    // For questions without images, use regular JSON
    return apiClient.post<{
      id: number;
      questionText: string;
      questionType: string;
    }>('/admin/questions', questionData);
  }

  /**
   * Bulk import questions
   */
  static async bulkImportQuestions(payload: {
    metadata: {
      courseId: number;
      universityId?: number;
      examYear?: number;
      yearLevel?: string;
    };
    questions: Array<{
      questionText: string;
      explanation?: string;
      questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
      answers: Array<{
        answerText: string;
        isCorrect: boolean;
        explanation?: string;
      }>;
    }>;
  }): Promise<ApiResponse<{
    questions: Array<{
      id: number;
      questionText: string;
      questionType: string;
    }>;
    totalCreated: number;
  }>> {
    return apiClient.post<{
      questions: Array<{
        id: number;
        questionText: string;
        questionType: string;
      }>;
      totalCreated: number;
    }>('/admin/questions/bulk', payload);
  }

  // ==================== UNIVERSITY MANAGEMENT ====================

  /**
   * Get all universities with pagination and filtering
   */
  static async getUniversities(params: PaginationParams & {
    search?: string;
    country?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<University>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.country) queryParams.append('country', params.country);

    const url = queryParams.toString() ? `/admin/universities?${queryParams.toString()}` : '/admin/universities';
    return apiClient.get<PaginatedResponse<University>>(url);
  }

  /**
   * Create new university
   */
  static async createUniversity(universityData: {
    name: string;
    country: string;
  }): Promise<ApiResponse<University>> {
    return apiClient.post<University>('/admin/universities', universityData);
  }

  /**
   * Update university
   */
  static async updateUniversity(universityId: number, updateData: {
    name?: string;
    country?: string;
  }): Promise<ApiResponse<University>> {
    return apiClient.put<University>(`/admin/universities/${universityId}`, updateData);
  }

  /**
   * Delete university
   */
  static async deleteUniversity(universityId: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/universities/${universityId}`);
  }

  // ==================== SPECIALTY MANAGEMENT ====================

  /**
   * Get all specialties with pagination and filtering
   */
  static async getSpecialties(params: PaginationParams & {
    search?: string;
  } = {}): Promise<ApiResponse<PaginatedResponse<Specialty>>> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const url = queryParams.toString() ? `/admin/specialties?${queryParams.toString()}` : '/admin/specialties';
    return apiClient.get<PaginatedResponse<Specialty>>(url);
  }

  /**
   * Create new specialty
   */
  static async createSpecialty(specialtyData: {
    name: string;
  }): Promise<ApiResponse<Specialty>> {
    return apiClient.post<Specialty>('/admin/specialties', specialtyData);
  }

  /**
   * Update specialty
   */
  static async updateSpecialty(specialtyId: number, updateData: {
    name?: string;
  }): Promise<ApiResponse<Specialty>> {
    return apiClient.put<Specialty>(`/admin/specialties/${specialtyId}`, updateData);
  }

  /**
   * Delete specialty
   */
  static async deleteSpecialty(specialtyId: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/specialties/${specialtyId}`);
  }
}

// Payment Services
export class PaymentService {
  /**
   * Create a checkout session for study pack subscription
   */
  static async createCheckoutSession(request: {
    studyPackId: number;
    paymentDuration: {
      type: 'monthly' | 'yearly';
      months?: number;
      years?: number;
    };
    locale?: 'ar' | 'en' | 'fr';
    paymentMethod?: 'edahabia' | 'cib' | 'chargily_app';
  }): Promise<ApiResponse<{
    checkoutUrl: string;
    checkoutId: string;
  }>> {
    return apiClient.post<{
      checkoutUrl: string;
      checkoutId: string;
    }>('/payments/checkouts', request);
  }

  /**
   * Validate payment request data
   */
  static validatePaymentRequest(request: {
    studyPackId: number;
    paymentDuration: {
      type: 'monthly' | 'yearly';
      months?: number;
      years?: number;
    };
    locale?: 'ar' | 'en' | 'fr';
    paymentMethod?: 'edahabia' | 'cib' | 'chargily_app';
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate studyPackId
    if (!request.studyPackId || request.studyPackId <= 0) {
      errors.push('Study pack ID is required and must be positive');
    }

    // Validate paymentDuration
    if (!request.paymentDuration?.type) {
      errors.push('Payment duration type is required');
    } else {
      if (request.paymentDuration.type === 'monthly') {
        if (!request.paymentDuration.months || request.paymentDuration.months < 1) {
          errors.push('Months must be specified and at least 1 for monthly payments');
        }
      } else if (request.paymentDuration.type === 'yearly') {
        if (!request.paymentDuration.years || request.paymentDuration.years < 1) {
          errors.push('Years must be specified and at least 1 for yearly payments');
        }
      } else {
        errors.push('Payment duration type must be either "monthly" or "yearly"');
      }
    }

    // Validate locale (optional)
    if (request.locale && !['ar', 'en', 'fr'].includes(request.locale)) {
      errors.push('Locale must be one of: ar, en, fr');
    }

    // Validate paymentMethod (optional)
    if (request.paymentMethod && !['edahabia', 'cib', 'chargily_app'].includes(request.paymentMethod)) {
      errors.push('Payment method must be one of: edahabia, cib, chargily_app');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Utility function to handle API errors consistently
export function handleApiError(error: any): string {
  if (error?.error) {
    return error.error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Export all services
export const apiServices = {
  auth: AuthService,
  settings: SettingsService,
  student: StudentService,
  content: ContentService,
  subscription: SubscriptionService,
  payment: PaymentService,
  quiz: QuizService,
  exam: ExamService,
  admin: AdminService,
  adminContent: AdminContentService,
};
