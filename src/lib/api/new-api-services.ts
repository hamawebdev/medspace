/**
 * New API Services
 *
 * Service layer for the new API endpoints that provide enhanced module filtering,
 * session type separation, and content organization according to the new API specifications.
 */

import { apiClient } from '../api-client';
import { ApiResponse } from '../api-client';

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleApiError(error: any, context: string): never {
  console.error(`API Error in ${context}:`, error);

  if (error?.response?.data?.message) {
    throw new ApiError(error.response.data.message, error.response.status, error.response.data);
  } else if (error?.message) {
    throw new ApiError(error.message, error?.response?.status);
  } else {
    throw new ApiError(`Failed to ${context}`, error?.response?.status);
  }
}

// Type definitions for the new API structure
export interface ContentFilters {
  unites?: Array<{
    id: number;
    name: string;
    logoUrl?: string;
    modules?: Array<{
      id: number;
      name: string;
      description?: string;
      logoUrl?: string;
      courses?: Array<{
        id: number;
        name: string;
        description?: string;
      }>;
    }>;
  }>;
  independentModules?: Array<{
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
    courses?: Array<{
      id: number;
      name: string;
      description?: string;
    }>;
  }>;
}

export interface SessionFilters {
  unites: Array<{
    id: number;
    name: string;
    sessionsCount: number;
    modules: Array<{
      id: number;
      name: string;
      sessionsCount: number;
      courses: Array<{
        id: number;
        name: string;
        description?: string;
      }>;
    }>;
  }>;
  independentModules: Array<{
    id: number;
    name: string;
    sessionsCount: number;
    courses: Array<{
      id: number;
      name: string;
      description?: string;
    }>;
  }>;
}

export interface PracticeSession {
  sessionId: number;
  title: string;
  status: string;
  type: 'PRACTICE' | 'EXAM';
  timeSpent: number;
  totalQuestions: number;
  questionsAnswered: number;
  questionsNotAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  percentage: number;
  averageTimePerQuestion: number;
  completedAt: string;
}

export interface PracticeSessionsResponse {
  filterInfo: {
    uniteId?: number;
    moduleId?: number;
    uniteName?: string;
    moduleName?: string;
    sessionType: 'PRACTICE' | 'EXAM';
  };
  totalSessions: number;
  sessions: PracticeSession[];
  aggregateStats: {
    totalTimeSpent: number;
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
    overallAccuracy: number;
    averageSessionScore: number;
  };
}

export interface ExamSessionFilters {
  universities: Array<{
    id: number;
    name: string;
    country: string;
    questionCount: number;
  }>;
  questionSources: Array<{
    id: number;
    name: string;
    questionCount: number;
  }>;
  examYears: Array<{
    year: number;
    questionCount: number;
  }>;
  rotations: Array<{
    rotation: string;
    questionCount: number;
  }>;
  unites: Array<{
    id: number;
    name: string;
    questionCount: number;
    modules: Array<{
      id: number;
      name: string;
      questionCount: number;
    }>;
  }>;
  individualModules: Array<{
    id: number;
    name: string;
    questionCount: number;
  }>;
  totalQuestionCount: number;
}

export interface Question {
  id: number;
  questionText: string;
  questionType: string;
  universityId: number;
  yearLevel: string;
  examYear: number;
  rotation?: string;
  metadata: string;
  sourceId: number;
  createdAt: string;
  updatedAt: string;
  university: {
    id: number;
    name: string;
    country: string;
  };
  course: {
    id: number;
    name: string;
    module: {
      id: number;
      name: string;
      unite?: {
        id: number;
        name: string;
      };
    };
  };
  source: {
    id: number;
    name: string;
  };
}

export interface QuestionsResponse {
  questions: Question[];
  totalCount: number;
  filterInfo: {
    uniteId?: number;
    moduleId?: number;
    uniteName?: string;
    moduleName?: string;
  };
}

/**
 * New API Services Class
 * Implements the new API endpoints according to the specifications
 */
export class NewApiService {
  /**
   * Get content filters with hierarchical structure (unites and independent modules)
   * GET /api/v1/students/content/filters
   */
  static async getContentFilters(): Promise<ApiResponse<ContentFilters>> {
    try {
      const url = '/students/content/filters';

      // Log the API request details
      console.log('🏗️ [API Request] getContentFilters:', {
        endpoint: url,
        fullUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'}${url}`,
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.get<ContentFilters>(url);

      // Log the full API response for inspection and debugging
      console.log('📥 [API Response] getContentFilters - FULL RESPONSE OBJECT:', {
        fullResponse: response,
        success: response.success,
        status: response.status,
        data: response.data,
        dataKeys: response.data ? Object.keys(response.data) : null,
        error: response.error,
        timestamp: new Date().toISOString()
      });

      // Handle the standard API response structure: response.data.data
      // Based on other working endpoints, the actual data is in response.data.data
      let actualData = response.data;

      // Check if the data is in the nested structure (response.data.data)
      if (actualData && typeof actualData === 'object' && (actualData as any).data) {
        console.log('📥 [NewApiService] Using nested data structure (response.data.data)');
        actualData = (actualData as any).data;
      } else {
        console.log('📥 [NewApiService] Using direct data structure (response.data)');
      }

      if (actualData?.unites) {
        console.log('📥 [NewApiService] Unites details:', actualData.unites);
        actualData.unites.forEach((unite, index) => {
          console.log(`📥 [NewApiService] Unite ${index + 1}:`, {
            id: unite.id,
            name: unite.name,
            modulesCount: unite.modules?.length || 0,
            modules: unite.modules
          });
        });
      } else {
        console.log('📥 [NewApiService] No unites found in response');
      }

      if (actualData?.independentModules) {
        console.log('📥 [NewApiService] Independent modules details:', actualData.independentModules);
        actualData.independentModules.forEach((module, index) => {
          console.log(`📥 [NewApiService] Independent Module ${index + 1}:`, {
            id: module.id,
            name: module.name,
            coursesCount: module.courses?.length || 0,
            courses: module.courses
          });
        });
      } else {
        console.log('📥 [NewApiService] No independent modules found in response');
      }

      // Return the response with the correct data structure
      return {
        ...response,
        data: actualData
      };
    } catch (error) {
      console.error('💥 [NewApiService] Content filters error:', error);
      console.error('💥 [NewApiService] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      handleApiError(error, 'fetch content filters');
    }
  }

  /**
   * Get session filters with hierarchical structure and session counts
   * GET /api/v1/students/sessions/filters?sessionType=PRACTICE
   * Note: sessionType is REQUIRED according to new API specification
   */
  static async getSessionFilters(sessionType: 'PRACTICE' | 'EXAM'): Promise<ApiResponse<SessionFilters>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('sessionType', sessionType);
      const url = `/students/sessions/filters?${queryParams.toString()}`;
      return await apiClient.get<SessionFilters>(url);
    } catch (error) {
      handleApiError(error, `fetch ${sessionType.toLowerCase()} session filters`);
    }
  }

  /**
   * Get practice sessions with unite/module filtering and session type
   * GET /api/v1/students/practise-sessions?moduleId=1&sessionType=PRACTICE
   * GET /api/v1/students/practise-sessions?uniteId=1&sessionType=EXAM
   */
  static async getPracticeSessions(params: {
    sessionType: 'PRACTICE' | 'EXAM';
    moduleId?: number;
    uniteId?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PracticeSessionsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('sessionType', params.sessionType);

      // Validate mutually exclusive parameters
      if (params.moduleId && params.uniteId) {
        throw new ApiError('Cannot provide both uniteId and moduleId. Please select only one.');
      }

      if (params.moduleId) {
        queryParams.append('moduleId', params.moduleId.toString());
      } else if (params.uniteId) {
        queryParams.append('uniteId', params.uniteId.toString());
      } else {
        throw new ApiError('Either moduleId or uniteId must be provided');
      }

      // Add pagination parameters if provided
      if (params.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `/students/practise-sessions?${queryParams.toString()}`;

      // Log the API request details
      console.log('🎯 [API Request] getPracticeSessions:', {
        endpoint: url,
        fullUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'}${url}`,
        params: {
          sessionType: params.sessionType,
          moduleId: params.moduleId,
          uniteId: params.uniteId,
          page: params.page,
          limit: params.limit
        },
        timestamp: new Date().toISOString()
      });

      const response = await apiClient.get<PracticeSessionsResponse>(url);

      // Log the full API response for inspection and debugging
      console.log('📥 [API Response] getPracticeSessions - FULL RESPONSE OBJECT:', {
        fullResponse: response,
        success: response.success,
        status: response.status,
        data: response.data,
        dataKeys: response.data ? Object.keys(response.data) : null,
        sessionsCount: response.data?.sessions?.length || 0,
        pagination: response.data?.pagination,
        error: response.error,
        timestamp: new Date().toISOString(),
        requestParams: params
      });

      return response;
    } catch (error) {
      console.error('💥 [API Error] getPracticeSessions failed:', {
        error,
        params,
        timestamp: new Date().toISOString()
      });
      if (error instanceof ApiError) throw error;
      handleApiError(error, 'fetch practice sessions');
    }
  }

  /**
   * Get student notes with unite/module filtering
   * GET /api/v1/students/notes/by-module?moduleId=1
   * GET /api/v1/students/notes/by-module?uniteId=1
   */
  static async getStudentNotes(params: {
    moduleId?: number;
    uniteId?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    if (params.moduleId) {
      queryParams.append('moduleId', params.moduleId.toString());
    } else if (params.uniteId) {
      queryParams.append('uniteId', params.uniteId.toString());
    } else {
      throw new Error('Either moduleId or uniteId must be provided');
    }

    const url = `/students/notes/by-module?${queryParams.toString()}`;

    // Log the API request details
    console.log('📝 [API Request] getStudentNotes:', {
      endpoint: url,
      fullUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'}${url}`,
      params: {
        moduleId: params.moduleId,
        uniteId: params.uniteId
      },
      timestamp: new Date().toISOString()
    });

    const response = await apiClient.get<any>(url);

    // Log the full API response for inspection and debugging
    console.log('📥 [API Response] getStudentNotes - FULL RESPONSE OBJECT:', {
      fullResponse: response,
      success: response.success,
      status: response.status,
      data: response.data,
      dataKeys: response.data ? Object.keys(response.data) : null,
      notesCount: response.data?.notes?.length || 0,
      coursesCount: response.data?.courses?.length || 0,
      error: response.error,
      timestamp: new Date().toISOString(),
      requestParams: params
    });

    return response;
  }

  /**
   * Get student labels with unite/module filtering
   * GET /api/v1/students/labels/by-module?moduleId=1
   * GET /api/v1/students/labels/by-module?uniteId=1
   */
  static async getStudentLabels(params: {
    moduleId?: number;
    uniteId?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    if (params.moduleId) {
      queryParams.append('moduleId', params.moduleId.toString());
    } else if (params.uniteId) {
      queryParams.append('uniteId', params.uniteId.toString());
    } else {
      throw new Error('Either moduleId or uniteId must be provided');
    }

    const url = `/students/labels/by-module?${queryParams.toString()}`;
    return apiClient.get<any>(url);
  }

  /**
   * Get student courses with unite/module filtering
   * GET /api/v1/students/courses/by-module?moduleId=1
   * GET /api/v1/students/courses/by-module?uniteId=1
   */
  static async getStudentCourses(params: {
    moduleId?: number;
    uniteId?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();

    if (params.moduleId) {
      queryParams.append('moduleId', params.moduleId.toString());
    } else if (params.uniteId) {
      queryParams.append('uniteId', params.uniteId.toString());
    } else {
      throw new Error('Either moduleId or uniteId must be provided');
    }

    const url = `/students/courses/by-module?${queryParams.toString()}`;
    return apiClient.get<any>(url);
  }

  /**
   * Get exam session filters for question-based filtering
   * DEPRECATED: Use getQuizSessionFilters() instead
   * GET /quizzes/session-filters
   */
  static async getExamSessionFilters(): Promise<ApiResponse<ExamSessionFilters>> {
    console.warn('[DEPRECATED] getExamSessionFilters() is deprecated. Use getQuizSessionFilters() instead.');
    return this.getQuizSessionFilters();
  }

  /**
   * Get questions by unite or module for exam session creation
   * GET /api/v1/quizzes/questions-by-unite-or-module?uniteId=5
   * GET /api/v1/quizzes/questions-by-unite-or-module?moduleId=12
   */
  static async getQuestionsByUniteOrModule(params: {
    uniteId?: number;
    moduleId?: number;
  }): Promise<ApiResponse<QuestionsResponse>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.uniteId) {
        queryParams.append('uniteId', params.uniteId.toString());
      } else if (params.moduleId) {
        queryParams.append('moduleId', params.moduleId.toString());
      } else {
        throw new Error('Either uniteId or moduleId must be provided');
      }

      const url = `/quizzes/questions-by-unite-or-module?${queryParams.toString()}`;
      console.log('🚀 [NewApiService] Making request to:', url);
      console.log('🚀 [NewApiService] Params:', params);

      const response = await apiClient.get<any>(url);

      console.log('📥 [NewApiService] Questions response:', {
        success: response.success,
        status: response.status,
        hasData: !!response.data,
        dataStructure: response.data ? Object.keys(response.data) : 'null',
        nestedDataStructure: response.data?.data ? Object.keys(response.data.data) : 'null',
        questionsCount: response.data?.data?.questions?.length || response.data?.questions?.length || 0
      });

      // Handle nested response structure: response.data.data.questions
      let actualData = response.data;
      if (actualData && typeof actualData === 'object' && actualData.data) {
        console.log('📥 [NewApiService] Using nested data structure (response.data.data)');
        actualData = actualData.data;
      } else {
        console.log('📥 [NewApiService] Using direct data structure (response.data)');
      }

      return {
        ...response,
        data: actualData
      };
    } catch (error) {
      console.error('💥 [NewApiService] Questions fetch error:', error);
      handleApiError(error, 'fetch questions by unite or module');
    }
  }

  // REMOVED: Legacy createExamSessionByQuestions endpoint
  // Use only documented POST /quizzes/sessions endpoint for session creation

  /**
   * Get session filters for quiz creation (NEW ENDPOINT)
   * GET /quizzes/session-filters
   */
  static async getQuizSessionFilters(): Promise<ApiResponse<any>> {
    try {
      const url = '/quizzes/session-filters';
      console.log('🚀 [NewApiService] Fetching quiz session filters:', { url });

      const response = await apiClient.get<any>(url);

      console.log('📋 [NewApiService] Session filters response:', {
        success: response.success,
        status: response.status,
        data: response.data,
        dataKeys: response.data ? Object.keys(response.data) : null
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Session filters error:', error);
      handleApiError(error, 'fetch quiz session filters');
    }
  }

  /**
   * Get question count based on filters (NEW ENDPOINT)
   * POST /quizzes/question-count
   */
  static async getQuestionCount(
    filters: {
      courseIds: number[];
      questionTypes?: Array<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>;
      years?: number[];
      rotations?: Array<'R1' | 'R2' | 'R3' | 'R4'>;
      universityIds?: number[];
      questionSourceIds?: number[];
    },
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<any>> {
    try {
      const url = '/quizzes/question-count';
      console.log('🚀 [NewApiService] Getting question count:', { url, filters });

      const response = await apiClient.post<any>(
        url,
        filters,
        options?.signal ? { signal: options.signal } : undefined
      );

      console.log('📋 [NewApiService] Question count response:', {
        success: response.success,
        status: response.status,
        data: response.data,
        totalQuestionCount: response.data?.totalQuestionCount,
        accessibleQuestionCount: response.data?.accessibleQuestionCount
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Question count error:', error);

      // Return a failed response instead of throwing to prevent loading state from getting stuck
      return {
        success: false,
        error: error?.response?.data?.message || error?.message || 'Failed to get question count',
        status: error?.response?.status || 500,
        data: null
      };
    }
  }

  /**
   * Create session using new endpoint (NEW ENDPOINT)
   * POST /quizzes/sessions
   */
  static async createQuizSession(sessionData: {
    title: string;
    courseIds: number[];
    sessionType: 'PRACTISE' | 'EXAM';
    questionTypes?: Array<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'>;
    years?: number[];
    rotations?: Array<'R1' | 'R2' | 'R3' | 'R4'>;
    universityIds?: number[];
    questionSourceIds?: number[];
  }): Promise<ApiResponse<any>> {
    try {
      const url = '/quizzes/sessions';
      console.log('🚀 [NewApiService] Creating quiz session:', { url, sessionData });

      const response = await apiClient.post<any>(url, sessionData);

      console.log('📋 [NewApiService] Session creation response:', {
        success: response.success,
        status: response.status,
        data: response.data,
        sessionId: response.data?.sessionId
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Session creation error:', error);

      // For session creation, return error response instead of throwing
      // This allows the UI to handle errors gracefully
      if (error?.response?.data) {
        return {
          success: false,
          error: error.response.data.message || error.response.data.error || 'Session creation failed',
          statusCode: error.response.status,
          data: null
        };
      }

      // For other errors, still throw to maintain existing behavior
      handleApiError(error, 'create quiz session');
    }
  }

  /**
   * Get quiz session by ID (NEW ENDPOINT)
   * GET /quiz-sessions/{sessionId}
   */
  static async getQuizSession(sessionId: number): Promise<ApiResponse<any>> {
    try {
      const url = `/quiz-sessions/${sessionId}`;
      console.log('🚀 [NewApiService] Fetching quiz session:', { url, sessionId });

      const response = await apiClient.get<any>(url);

      console.log('📋 [NewApiService] Quiz session response:', {
        success: response.success,
        status: response.status,
        hasData: !!response.data,
        sessionId: response.data?.id
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Quiz session fetch error:', error);
      handleApiError(error, 'fetch quiz session');
    }
  }

  /**
   * Get Residency filters (universities, years, parts)
   * GET /api/v1/students/sessions/residency-filters
   */
  static async getResidencyFilters(): Promise<ApiResponse<any>> {
    try {
      const url = '/students/sessions/residency-filters';
      console.log('🩺 [NewApiService] Fetching residency filters:', { url });
      const response = await apiClient.get<any>(url);
      return response;
    } catch (error) {
      handleApiError(error, 'fetch residency filters');
    }
  }

  /**
   * Create Residency session
   * POST /api/v1/quizzes/residency-sessions
   */
  static async createResidencySession(params: {
    title: string;
    examYear: number;
    universityId: number;
    parts?: string[];
  }): Promise<ApiResponse<any>> {
    try {
      const url = '/quizzes/residency-sessions';
      console.log('🩺 [NewApiService] Creating residency session:', { url, params });
      const response = await apiClient.post<any>(url, params);
      console.log('🩺 [NewApiService] Residency session created:', {
        success: response.success,
        status: response.status,
        sessionId: response.data?.data?.sessionId || response.data?.sessionId,
      });
      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Residency session creation error:', error);
      if (error?.response?.data) {
        return {
          success: false,
          error: error.response.data?.error?.message || error.response.data?.message || 'Session creation failed',
          statusCode: error.response.status,
          data: null,
        } as any;
      }
      handleApiError(error, 'create residency session');
    }
  }


  // ==================== COURSE LAYERS & CARDS API ====================

  /**
   * Create or Update Course Layer (Upsert)
   * POST /api/v1/students/course-layers
   */
  static async upsertCourseLayer(params: {
    courseId: number;
    layerNumber: number;
    completed: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      const url = '/students/course-layers';
      console.log('📚 [NewApiService] Upserting course layer:', params);

      const response = await apiClient.post<any>(url, params);

      console.log('📥 [NewApiService] Course layer upsert response:', {
        success: response.success,
        data: response.data,
        message: response.message
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Course layer upsert error:', error);
      handleApiError(error, 'upsert course layer');
    }
  }

  /**
   * Get Course Layers by Course
   * GET /api/v1/students/courses/:courseId/layers
   */
  static async getCourseLayersByCourse(courseId: number): Promise<ApiResponse<any>> {
    try {
      const url = `/students/courses/${courseId}/layers`;
      console.log('📚 [NewApiService] Getting course layers for course:', courseId);

      const response = await apiClient.get<any>(url);

      console.log('📥 [NewApiService] Course layers response:', {
        success: response.success,
        courseId,
        layersCount: response.data?.layers?.length || 0
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Get course layers error:', error);
      handleApiError(error, 'get course layers');
    }
  }

  /**
   * Create Card
   * POST /api/v1/students/cards
   */
  static async createCard(params: {
    title: string;
    description?: string;
    courseIds?: number[];
  }): Promise<ApiResponse<any>> {
    try {
      const url = '/students/cards';
      console.log('🃏 [NewApiService] Creating card:', {
        title: params.title,
        description: params.description,
        courseIds: params.courseIds,
        courseIdsCount: params.courseIds?.length || 0,
        courseIdsType: typeof params.courseIds,
        isArray: Array.isArray(params.courseIds)
      });

      const response = await apiClient.post<any>(url, params);

      console.log('📥 [NewApiService] Card creation response:', {
        success: response.success,
        cardId: response.data?.id,
        nestedCardId: response.data?.data?.id,
        message: response.message,
        hasData: !!response.data,
        dataType: typeof response.data,
        responseKeys: response ? Object.keys(response) : 'no response',
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        nestedDataKeys: response.data?.data ? Object.keys(response.data.data) : 'no nested data'
      });

      // Validate response structure - check both possible locations for ID
      const actualData = response.data?.data || response.data;
      if (response.success && actualData && typeof actualData.id === 'undefined') {
        console.warn('⚠️ [NewApiService] Warning: Successful response but no ID found in either location:', {
          originalData: response.data,
          actualData,
          possibleLocations: {
            'response.data.id': response.data?.id,
            'response.data.data.id': response.data?.data?.id
          }
        });
      } else if (response.success && actualData?.id) {
        console.log('✅ [NewApiService] Card created successfully with ID:', actualData.id);
      }

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Card creation error:', error);
      handleApiError(error, 'create card');
    }
  }

  /**
   * Get All Cards
   * GET /api/v1/students/cards
   */
  static async getAllCards(): Promise<ApiResponse<any>> {
    try {
      const url = '/students/cards';
      console.log('🃏 [NewApiService] Getting all cards');

      const response = await apiClient.get<any>(url);

      console.log('📥 [NewApiService] All cards response:', {
        success: response.success,
        cardsCount: response.data?.length || 0
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Get all cards error:', error);
      handleApiError(error, 'get all cards');
    }
  }

  /**
   * Get Cards by Unit ID or Module ID
   * GET /api/v1/students/cards/filter-by-unit-module?uniteId=1
   * GET /api/v1/students/cards/filter-by-unit-module?moduleId=1
   */
  static async getCardsByUnitOrModule(params: {
    uniteId?: number;
    moduleId?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const queryParams = new URLSearchParams();

      if (params.uniteId) {
        queryParams.append('uniteId', params.uniteId.toString());
      } else if (params.moduleId) {
        queryParams.append('moduleId', params.moduleId.toString());
      } else {
        throw new Error('Either uniteId or moduleId must be provided');
      }

      const url = `/students/cards/filter-by-unit-module?${queryParams.toString()}`;
      console.log('🃏 [NewApiService] Getting cards by unit/module:', params);

      const response = await apiClient.get<any>(url);

      console.log('📥 [NewApiService] Cards by unit/module response:', {
        success: response.success,
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        cardsCount: Array.isArray(response.data) ? response.data.length : 0,
        hasNestedData: !!response.data?.data,
        nestedDataType: typeof response.data?.data,
        isNestedArray: Array.isArray(response.data?.data),
        nestedCardsCount: Array.isArray(response.data?.data) ? response.data.data.length : 0,
        params,
        responseKeys: response.data ? Object.keys(response.data) : 'no data'
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Get cards by unit/module error:', error);
      handleApiError(error, 'get cards by unit or module');
    }
  }

  /**
   * Get Card by ID
   * GET /api/v1/students/cards/:cardId
   */
  static async getCardById(cardId: number): Promise<ApiResponse<any>> {
    try {
      const url = `/students/cards/${cardId}`;
      console.log('🃏 [NewApiService] Getting card by ID:', cardId);

      const response = await apiClient.get<any>(url);

      console.log('📥 [NewApiService] Card by ID response:', {
        success: response.success,
        cardId,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        coursesCount: response.data?.cardCourses?.length || 0,
        cardCoursesExists: !!response.data?.cardCourses,
        cardCoursesType: typeof response.data?.cardCourses,
        cardCoursesIsArray: Array.isArray(response.data?.cardCourses),
        firstCardCourse: response.data?.cardCourses?.[0] || 'no card courses',
        // Check for nested structure
        hasNestedData: !!response.data?.data,
        nestedDataKeys: response.data?.data ? Object.keys(response.data.data) : 'no nested data',
        nestedCardCourses: response.data?.data?.cardCourses,
        nestedCoursesCount: response.data?.data?.cardCourses?.length || 0,
        fullResponse: response
      });

      // Handle potential nested response structure
      if (response.success && response.data?.data && !response.data?.cardCourses) {
        console.log('🔄 [NewApiService] Detected nested card data structure, extracting...');
        return {
          ...response,
          data: response.data.data
        };
      }

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Get card by ID error:', error);
      handleApiError(error, 'get card by ID');
    }
  }

  /**
   * Update Card
   * PUT /api/v1/students/cards/:cardId
   */
  static async updateCard(cardId: number, params: {
    title?: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const url = `/students/cards/${cardId}`;
      console.log('🃏 [NewApiService] Updating card:', { cardId, ...params });

      const response = await apiClient.put<any>(url, params);

      console.log('📥 [NewApiService] Card update response:', {
        success: response.success,
        cardId,
        message: response.message
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Card update error:', error);
      handleApiError(error, 'update card');
    }
  }

  /**
   * Delete Card
   * DELETE /api/v1/students/cards/:cardId
   */
  static async deleteCard(cardId: number): Promise<ApiResponse<any>> {
    try {
      const url = `/students/cards/${cardId}`;
      console.log('🃏 [NewApiService] Deleting card:', cardId);

      const response = await apiClient.delete<any>(url);

      console.log('📥 [NewApiService] Card deletion response:', {
        success: response.success,
        cardId,
        message: response.message
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Card deletion error:', error);
      handleApiError(error, 'delete card');
    }
  }

  /**
   * Add Course to Card
   * POST /api/v1/students/cards/:cardId/courses/:courseId
   */
  static async addCourseToCard(cardId: number, courseId: number): Promise<ApiResponse<any>> {
    try {
      const url = `/students/cards/${cardId}/courses/${courseId}`;
      console.log('🃏 [NewApiService] Adding course to card:', { cardId, courseId });

      const response = await apiClient.post<any>(url);

      console.log('📥 [NewApiService] Add course to card response:', {
        success: response.success,
        cardId,
        courseId,
        message: response.message
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Add course to card error:', error);
      handleApiError(error, 'add course to card');
    }
  }

  /**
   * Remove Course from Card
   * DELETE /api/v1/students/cards/:cardId/courses/:courseId
   */
  static async removeCourseFromCard(cardId: number, courseId: number): Promise<ApiResponse<any>> {
    try {
      const url = `/students/cards/${cardId}/courses/${courseId}`;
      console.log('🃏 [NewApiService] Removing course from card:', { cardId, courseId });

      const response = await apiClient.delete<any>(url);

      console.log('📥 [NewApiService] Remove course from card response:', {
        success: response.success,
        cardId,
        courseId,
        message: response.message
      });

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Remove course from card error:', error);
      handleApiError(error, 'remove course from card');
    }
  }

  /**
   * Get Card Progress
   * GET /api/v1/students/cards/:cardId/progress
   */
  static async getCardProgress(cardId: number): Promise<ApiResponse<any>> {
    try {
      const url = `/students/cards/${cardId}/progress`;
      console.log('🃏 [NewApiService] Getting card progress:', cardId);

      const response = await apiClient.get<any>(url);

      console.log('📥 [NewApiService] Card progress response:', {
        success: response.success,
        cardId,
        progressPercentage: response.data?.cardProgressPercentage,
        coursesCount: response.data?.courseProgress?.length || 0,
        totalCourses: response.data?.totalCourses,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'no data',
        courseProgressExists: !!response.data?.courseProgress,
        courseProgressType: typeof response.data?.courseProgress,
        courseProgressIsArray: Array.isArray(response.data?.courseProgress),
        firstCourse: response.data?.courseProgress?.[0] || 'no courses',
        // Check for nested structure like other APIs
        hasNestedData: !!response.data?.data,
        nestedDataKeys: response.data?.data ? Object.keys(response.data.data) : 'no nested data',
        nestedCourseProgress: response.data?.data?.courseProgress,
        nestedCoursesCount: response.data?.data?.courseProgress?.length || 0,
        fullResponse: response
      });

      // Handle potential nested response structure
      if (response.success && response.data?.data && !response.data?.courseProgress) {
        console.log('🔄 [NewApiService] Detected nested progress data structure, extracting...');
        return {
          ...response,
          data: response.data.data
        };
      }

      return response;
    } catch (error) {
      console.error('💥 [NewApiService] Get card progress error:', error);
      handleApiError(error, 'get card progress');
    }
  }
}
