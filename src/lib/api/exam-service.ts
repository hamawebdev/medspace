/**
 * Exam API Service
 *
 * Service layer for the new exam endpoints that provide enhanced module filtering,
 * multi-module sessions, and exam-specific functionality.
 */

import { apiClient } from '../api-client';

export interface ExamModule {
  id: number;
  name: string;
  unite?: {
    id?: number;
    name: string;
    studyPack?: {
      name: string;
    };
  };
}

export interface ExamResponse {
  id: number;
  title: string;
  university: string;
  yearLevel: string;
  year: number;
  module: ExamModule;
}

export interface ExamsByYearResponse {
  examsByYear: Array<{
    year: string;
    exams: ExamResponse[];
  }>;
  residencyExams: {
    available: boolean;
    yearsAvailable: string[];
    exams: ExamResponse[];
  };
}

export interface MultiModuleSessionRequest {
  moduleIds: number[];
  year: number;
  // Optional fields supported by the API
  questionCount?: number;
  title?: string;
  timeLimit?: number;
  settings?: {
    shuffleQuestions?: boolean;
    showResults?: boolean;
    allowReview?: boolean;
  };
}

export interface MultiModuleSessionResponse {
  sessionId: number;
  message: string;
  examCount: number;
  questionCount: number;
}

export interface ModuleAvailabilityCheck {
  moduleId: number;
  year: number;
  hasQuestions: boolean;
  questionCount: number;
  examCount: number;
}

export interface ValidationResult {
  isValid: boolean;
  availableModules: ModuleAvailabilityCheck[];
  unavailableModules: ModuleAvailabilityCheck[];
  totalQuestions: number;
  message?: string;
}

export interface DetailedExamResponse {
  id: number;
  title: string;
  description: string;
  moduleId: number;
  universityId: number;
  yearLevel: string;
  examYear: string;
  year: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  module: {
    id: number;
    uniteId: number;
    name: string;
    description: string;
    unite: {
      id: number;
      studyPackId: number;
      name: string;
      description: string;
      logoUrl: string;
      studyPack: {
        name: string;
      };
    };
  };
  university: {
    name: string;
  };
}

// Filters endpoint types
export interface ExamSessionFilters {
  unites: Array<{
    id: number;
    title: string;
    modules: Array<{
      id: number;
      title: string;
      universities: Array<{
        id: number;
        name: string;
        years: Array<{
          year: number;
          questionSingleCount: number;
          questionMultipleCount: number;
          questionSingleChoiceIds: number[];
          questionMultipleChoiceIds: number[];
        }>;
      }>;
    }>;
  }>;
}

export class ExamService {
  static createMultiModuleSession: any;
  /**
   * Filter exams by module ID
   * GET /exams/available?moduleId=24
   * Response: { success, data: { success, data: { examsByYear: [...], residencyExams: {...} } } }
   */
  static async getExamsByModule(moduleId: number): Promise<ExamsByYearResponse> {
    const response = await apiClient.get<any>(`/exams/available?moduleId=${moduleId}`);

    // Extract from nested structure: response.data.data.examsByYear[].exams[]
    const data = response.data?.data?.data || response.data?.data || response.data;
    return data as ExamsByYearResponse;
  }

  /**
   * Get exams by module and year
   * GET /api/v1/exams/by-module/24/2024
   */
  static async getExamsByModuleAndYear(moduleId: number, year: number): Promise<DetailedExamResponse[]> {
    const response = await apiClient.get<any>(`/exams/by-module/${moduleId}/${year}`);

    // Response structure: { success, data: { success, data: [...] } }
    const data = response.data?.data?.data || [];
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Create single exam session
   * POST /api/v1/exams/exam-sessions
   */
  static async createExamSession(request: { examId: number }): Promise<MultiModuleSessionResponse> {
    // Ensure we pass quizType: 'EXAM' per classification
    const response = await apiClient.post<any>('/exams/exam-sessions', { examId: request.examId, quizType: 'EXAM' });
    const data = response.data?.data?.data || response.data?.data || response.data;
    return data;
  }

  /**
   * Get exam details by ID
   * GET /api/v1/exams/{examId}
   */
  static async getExamDetails(examId: number): Promise<DetailedExamResponse> {
    const response = await apiClient.get<any>(`/exams/${examId}`);
    // { success, data: { success, data: { exam: {...}, questionsCount, canAccess } } }
    const data = response.data?.data?.data || {};
    return data as DetailedExamResponse;
  }

  /**
   * Get exam questions by exam ID
   * GET /api/v1/exams/{examId}/questions
   */
  static async getExamQuestions(examId: number): Promise<any[]> {
    const response = await apiClient.get<any>(`/exams/${examId}/questions`);
    // Response: { success, data: { success, data: { questions: [...] } } }
    const inner = response.data?.data?.data || {};
    return Array.isArray(inner?.questions) ? inner.questions : [];
  }

/**
   * Get enhanced available exams with year filter
   * GET /api/v1/exams/available?year=2024
   */
  static async getAvailableExamsByYear(year: number): Promise<ExamsByYearResponse> {
    const response = await apiClient.get<any>(`/exams/available?year=${year}`);
    // Nested structure: { success, data: { success, data: { examsByYear, residencyExams } } }
    const data = response.data?.data?.data || {};
    return data as ExamsByYearResponse;
  }

  /**
   * Get all enhanced available exams
   * GET /api/v1/exams/available
   */
  static async getAllAvailableExams(): Promise<ExamsByYearResponse> {
    const response = await apiClient.get<any>('/exams/available');
    const data = response.data?.data?.data || {};
    return data as ExamsByYearResponse;
  }

  /**
   * Get Exam Session Filters (unite → module → university → year)
   * GET /quizzes/exam-session-filters
   */
  static async getExamSessionFilters(): Promise<ExamSessionFilters> {
    const res = await apiClient.get<ExamSessionFilters>('/quizzes/exam-session-filters');
    // Our ApiResponse wraps payload in .data; backend may nest again under .data.data
    const anyRes = res as any;
    const payload = anyRes?.data?.data ?? anyRes?.data ?? anyRes;
    return payload as ExamSessionFilters;
  }

  /**
   * Get available modules for exam creation
   * Now derives from /quizzes/exam-session-filters
   */
  static async getAvailableModules(): Promise<ExamModule[]> {
    try {
      const filters = await this.getExamSessionFilters();

      const byId = new Map<number, ExamModule>();
      const unites = Array.isArray(filters?.unites) ? filters.unites : [];

      for (const u of unites) {
        const uniteId = typeof u?.id === 'number' ? u.id : undefined;
        // New structure uses `title`
        const uniteName = (u as any)?.title ?? (u as any)?.name;
        const modules = Array.isArray((u as any)?.modules) ? (u as any).modules : [];
        for (const m of modules) {
          const modId = (m as any)?.id;
          const modName = (m as any)?.title ?? (m as any)?.name;
          if (typeof modId === 'number' && !byId.has(modId)) {
            byId.set(modId, {
              id: modId,
              name: modName,
              unite: uniteId ? { id: uniteId, name: uniteName } : undefined,
            });
          }
        }
      }

      return Array.from(byId.values());
    } catch (error) {
      console.error('Failed to fetch available modules:', error);
      throw error;
    }
  }

  /**
   * Get available years for exam filtering (aggregated across all unites/modules/universities)
   */
  static async getAvailableYears(): Promise<number[]> {
    try {
      const filters = await this.getExamSessionFilters();
      const yearsSet = new Set<number>();

      const unites = Array.isArray(filters?.unites) ? filters.unites : [];
      for (const u of unites) {
        const modules = Array.isArray((u as any)?.modules) ? (u as any).modules : [];
        for (const m of modules) {
          const universities = Array.isArray((m as any)?.universities) ? (m as any).universities : [];
          for (const uni of universities) {
            const years = Array.isArray((uni as any)?.years) ? (uni as any).years : [];
            for (const y of years) {
              const yr = Number((y as any)?.year);
              if (!Number.isNaN(yr)) yearsSet.add(yr);
            }
          }
        }
      }

      return Array.from(yearsSet).sort((a, b) => b - a);
    } catch (error) {
      console.error('Failed to fetch available years:', error);
      throw error;
    }
  }

  /**
   * Validate module availability for a specific year
   * This checks if questions exist for the given modules and year before creating an exam session
   */
  static async validateModuleAvailability(moduleIds: number[], year: number): Promise<ValidationResult> {
    try {
      const availableModules: ModuleAvailabilityCheck[] = [];
      const unavailableModules: ModuleAvailabilityCheck[] = [];
      let totalQuestions = 0;

      // Check each module individually
      for (const moduleId of moduleIds) {
        try {
          const exams = await this.getExamsByModuleAndYear(moduleId, year);

          // Count total questions from all exams for this module
          let moduleQuestionCount = 0;
          if (Array.isArray(exams) && exams.length > 0) {
            // For now, we estimate questions per exam (this could be enhanced with actual question counts)
            moduleQuestionCount = exams.length * 10; // Rough estimate
          }

          const moduleCheck: ModuleAvailabilityCheck = {
            moduleId,
            year,
            hasQuestions: exams.length > 0,
            questionCount: moduleQuestionCount,
            examCount: exams.length
          };

          if (moduleCheck.hasQuestions) {
            availableModules.push(moduleCheck);
            totalQuestions += moduleQuestionCount;
          } else {
            unavailableModules.push(moduleCheck);
          }
        } catch (error) {
          // If we get an error (like 404), treat as unavailable
          unavailableModules.push({
            moduleId,
            year,
            hasQuestions: false,
            questionCount: 0,
            examCount: 0
          });
        }
      }

      const isValid = availableModules.length > 0;
      let message = '';

      if (!isValid) {
        message = `No questions found for the selected modules in year ${year}. Please try selecting different modules or a different year.`;
      } else if (unavailableModules.length > 0) {
        message = `Some modules don't have questions available for year ${year}. Only ${availableModules.length} out of ${moduleIds.length} modules have questions.`;
      }

      return {
        isValid,
        availableModules,
        unavailableModules,
        totalQuestions,
        message
      };
    } catch (error) {
      console.error('Failed to validate module availability:', error);
      throw error;
    }
  }

  /**
   * Get module availability status for all modules in a specific year
   * This is useful for showing availability indicators in the UI
   */
  static async getModuleAvailabilityForYear(year: number): Promise<Map<number, ModuleAvailabilityCheck>> {
    try {
      const modules = await this.getAvailableModules();
      const availabilityMap = new Map<number, ModuleAvailabilityCheck>();

      // Check availability for each module
      for (const module of modules) {
        try {
          const exams = await this.getExamsByModuleAndYear(module.id, year);
          const questionCount = exams.length * 10; // Rough estimate

          availabilityMap.set(module.id, {
            moduleId: module.id,
            year,
            hasQuestions: exams.length > 0,
            questionCount,
            examCount: exams.length
          });
        } catch (error) {
          // If error, mark as unavailable
          availabilityMap.set(module.id, {
            moduleId: module.id,
            year,
            hasQuestions: false,
            questionCount: 0,
            examCount: 0
          });
        }
      }

      return availabilityMap;
    } catch (error) {
      console.error('Failed to get module availability for year:', error);
      throw error;
    }
  }

  /**
   * Pre-validate exam session creation
   * This should be called before attempting to create an exam session
   */
  static async preValidateExamSession(request: MultiModuleSessionRequest): Promise<ValidationResult> {
    return this.validateModuleAvailability(request.moduleIds, request.year);
  }
}

export default ExamService;
