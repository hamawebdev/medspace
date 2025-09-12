'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuizFilters } from '@/hooks/use-quiz-api';
import { useQuestionCalculation } from './use-question-calculation';
import { QuizService } from '@/lib/api-services';
import { NewApiService } from '@/lib/api/new-api-services';
import { toast } from 'sonner';
import { 
  QuizCreationConfig, 
  QuizCreationStep, 
  UseQuizCreationReturn,
  ValidationError 
} from '../types';

// Generate default title with date and time
const generateDefaultTitle = () => {
  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  return `Practice Quiz - ${date} at ${time}`;
};

// Default quiz configuration
const DEFAULT_CONFIG: QuizCreationConfig = {
  type: 'PRACTICE',
  title: generateDefaultTitle(),
  description: '',
  settings: {
    questionCount: 10,
    shuffleQuestions: true,
    showExplanations: 'after_each'
  },
  filters: {
    yearLevels: [],
    courseIds: [],
    quizSourceIds: [],
    quizYears: [],
    questionTypes: [],
    examYears: [],
    moduleIds: [],
    uniteIds: []
  }
};

// Quiz creation steps configuration (Quiz Type step removed since it's selected in modal)
const QUIZ_STEPS: QuizCreationStep[] = [
  {
    id: 1,
    title: 'Select Courses',
    description: 'Choose courses for your quiz questions',
    component: null as any,
  },
  {
    id: 2,
    title: 'Advanced Options',
    description: 'Optional filters and sources',
    component: null as any,
    optional: true,
  },
  {
    id: 3,
    title: 'Question Count',
    description: 'Set the number of questions and customize quiz settings',
    component: null as any,
  },
];

export function useQuizCreation(
  userProfile: { yearLevel: string },
  initialConfig?: Partial<QuizCreationConfig>
): UseQuizCreationReturn {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [config, setConfig] = useState<QuizCreationConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig, // Apply initial config overrides
    filters: {
      ...DEFAULT_CONFIG.filters,
      ...initialConfig?.filters, // Apply initial filter overrides
      yearLevels: [userProfile.yearLevel], // Auto-set from user profile
    }
  });

  // External hooks
  const { filters: rawFilters, loading: filtersLoading } = useQuizFilters();

  // Derive allowed year levels from a single effective subscription (fallback to profile yearLevel)
  const { selectEffectiveActiveSubscription: _select } = require('@/hooks/use-subscription');
  const { subscriptions } = require('@/hooks/use-subscription').useUserSubscriptions();
  const allowedYearLevels = useMemo(() => {
    const allowed = _select(subscriptions).allowedYearLevels;
    if (allowed.length) return allowed;
    return [userProfile.yearLevel];
  }, [subscriptions, userProfile.yearLevel]);

  // Gate unites and available years by allowedYearLevels
  const filterData = useMemo(() => {
    if (!rawFilters) return null;
    return {
      ...rawFilters,
      unites: rawFilters.unites?.filter((u: any) => allowedYearLevels.includes(u.year)) || [],
      allowedYearLevels,
      availableYears: (rawFilters.availableYears || []).filter((y: any) => allowedYearLevels.includes(String(y)))
    } as any;
  }, [rawFilters, allowedYearLevels]);

  const availableQuestions = useQuestionCalculation(config.filters, filterData);

  // Validation logic
  const validationErrors = useMemo((): ValidationError[] => {
    const errors: ValidationError[] = [];

    switch (currentStep) {
      case 1: // Course selection (was step 2)
        if (config.filters.courseIds.length === 0) {
          errors.push({
            field: 'courseIds',
            message: 'Please select at least one course',
            type: 'error'
          });
        }
        break;

      case 3: // Question count (was step 4)
        if (config.settings.questionCount > availableQuestions) {
          errors.push({
            field: 'questionCount',
            message: `Only ${availableQuestions} questions available. Please reduce the count or select more courses.`,
            type: 'error'
          });
        }
        if (config.settings.questionCount < 1) {
          errors.push({
            field: 'questionCount',
            message: 'Question count must be at least 1',
            type: 'error'
          });
        }
        break;

      case 4: // Personalization (was step 5)
        if (!config.title.trim()) {
          errors.push({
            field: 'title',
            message: 'Please provide a quiz title',
            type: 'error'
          });
        }
        break;
    }

    return errors;
  }, [config, currentStep, availableQuestions]);

  // Can proceed to next step
  const canProceed = useMemo(() => {
    return validationErrors.filter(error => error.type === 'error').length === 0;
  }, [validationErrors]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<QuizCreationConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // Auto-generate title when courses change, but only if title is empty or hasn't been manually set
      if (updates.filters?.courseIds && filterData && (!prev.title || prev.title === '')) {
        newConfig.title = generateQuizTitle(updates.filters.courseIds, filterData);
      }
      
      return newConfig;
    });
  }, [filterData]);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (canProceed && currentStep < QUIZ_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canProceed, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Create quiz
  const createQuiz = useCallback(async () => {
    if (!canProceed) {
      toast.error('Please fix validation errors before creating the quiz');
      return;
    }

    setIsCreating(true);
    try {
      const sanitizedTitle = sanitizeTitle(config.title);

      // Method 1: Complete Workflow of Filter
      // Step 1: Get Content Structure (already available via useQuizFilters)
      // Step 2: Get Available Questions by Unite or Module
      let allQuestions: any[] = [];

      // Fetch questions for each unite
      if (config.filters.uniteIds && config.filters.uniteIds.length > 0) {
        for (const uniteId of config.filters.uniteIds) {
          try {
            console.debug('[QuizCreation] Fetching questions for unite:', uniteId);
            const qRes = await NewApiService.getQuestionsByUniteOrModule({ uniteId });
            if (qRes.success && qRes.data?.questions) {
              allQuestions.push(...qRes.data.questions);
            }
          } catch (err) {
            console.warn(`Failed to fetch questions for unite ${uniteId}:`, err);
          }
        }
      }

      // Fetch questions for each module
      if (config.filters.moduleIds && config.filters.moduleIds.length > 0) {
        for (const moduleId of config.filters.moduleIds) {
          try {
            console.debug('[QuizCreation] Fetching questions for module:', moduleId);
            const qRes = await NewApiService.getQuestionsByUniteOrModule({ moduleId });
            if (qRes.success && qRes.data?.questions) {
              allQuestions.push(...qRes.data.questions);
            }
          } catch (err) {
            console.warn(`Failed to fetch questions for module ${moduleId}:`, err);
          }
        }
      }

      if (allQuestions.length === 0) {
        throw new Error('No questions available for the selected content. Please select at least one unite or module.');
      }

      // Step 3: Apply Frontend Filters
      let filteredQuestions = allQuestions;

      // Filter by question type if specified
      if (config.filters.questionTypes && config.filters.questionTypes.length > 0) {
        filteredQuestions = filteredQuestions.filter((q: any) =>
          config.filters.questionTypes!.includes(q.questionType)
        );
      }

      // Filter by exam years if specified
      if (config.filters.examYears && config.filters.examYears.length > 0) {
        filteredQuestions = filteredQuestions.filter((q: any) =>
          config.filters.examYears!.includes(q.examYear)
        );
      }

      // Remove duplicates by question ID
      const uniqueQuestions = filteredQuestions.filter((q: any, index: number, arr: any[]) =>
        arr.findIndex((item: any) => item.id === q.id) === index
      );

      // Randomize and limit to requested count
      const shuffledQuestions = uniqueQuestions.sort(() => Math.random() - 0.5);
      const questionIds: number[] = shuffledQuestions
        .slice(0, config.settings.questionCount)
        .map((q: any) => Number(q?.id))
        .filter(Boolean);

      if (questionIds.length === 0) {
        throw new Error('No questions available with current filters');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Quiz Creation - Method 1 Workflow:', {
          title: sanitizedTitle,
          type: config.type,
          totalQuestions: allQuestions.length,
          filteredQuestions: filteredQuestions.length,
          uniqueQuestions: uniqueQuestions.length,
          selectedQuestions: questionIds.length,
          filters: config.filters
        });
      }

      // Step 4: Create Session
      const result = await QuizService.createSessionByQuestions({
        type: config.type as 'PRACTICE' | 'EXAM',
        questionIds,
        title: sanitizedTitle,
      });

      if (result.success) {
        toast.success('Quiz created successfully!');

        // Handle new response structure: session data is directly in result.data
        const sessionData = result.data;

        console.log('Quiz creation successful:', {
          fullResponse: result,
          sessionData: sessionData,
          sessionId: sessionData.id
        });

        return sessionData;
      } else {
        throw new Error(result.error || 'Failed to create quiz');
      }
    } catch (error) {
      console.error('Quiz creation error:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('InsufficientQuestionsError')) {
          toast.error('Not enough questions available. Try selecting more courses or reducing the question count.');
        } else if (error.message.includes('ValidationError') || error.message.includes('invalid characters')) {
          toast.error('Quiz title contains invalid characters. Please edit the title and try again.');
        } else if (error.message.includes('title')) {
          toast.error('There was an issue with the quiz title. Please check and modify it.');
        } else {
          toast.error(error.message || 'Failed to create quiz. Please try again.');
        }
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        // Handle API error response format
        const apiError = error as any;
        if (apiError.error?.includes('invalid characters') || apiError.error?.includes('title')) {
          toast.error('Quiz title contains invalid characters. Please edit the title and try again.');
        } else {
          toast.error(apiError.error || 'Failed to create quiz. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }

      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [config, canProceed]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setConfig({
      ...DEFAULT_CONFIG,
      filters: {
        ...DEFAULT_CONFIG.filters,
        yearLevels: [userProfile.yearLevel],
      }
    });
    setIsCreating(false);
  }, [userProfile.yearLevel]);

  return {
    // State
    currentStep,
    config,
    availableQuestions,
    validationErrors,
    isCreating,
    canProceed,
    filterData,
    filtersLoading,
    steps: QUIZ_STEPS,

    // Actions
    updateConfig,
    nextStep,
    previousStep,
    setCurrentStep,
    createQuiz,
    resetWizard,
  };
}

// Helper function to generate API-safe quiz title
function generateQuizTitle(courseIds: number[], filterData: any): string {
  if (!filterData || !courseIds.length) return '';

  const courseNames: string[] = [];

  // Extract course names from the filter data
  filterData.unites?.forEach((unit: any) => {
    unit.modules?.forEach((module: any) => {
      module.courses?.forEach((course: any) => {
        if (courseIds.includes(course.id)) {
          // Clean course name to remove potentially problematic characters
          const cleanName = sanitizeTitle(course.name);
          courseNames.push(cleanName);
        }
      });
    });
  });

  if (courseNames.length === 0) return '';

  let title = '';
  if (courseNames.length === 1) {
    title = `${courseNames[0]} Practice Quiz`;
  } else if (courseNames.length <= 3) {
    // Use "and" instead of "&" to avoid special character issues
    title = `${courseNames.join(' and ')} Practice Quiz`;
  } else {
    title = `Multi-Subject Practice Quiz (${courseNames.length} courses)`;
  }

  // Final sanitization of the complete title
  return sanitizeTitle(title);
}

// Helper function to sanitize title for API compatibility
function sanitizeTitle(title: string): string {
  return title
    // Replace common problematic characters
    .replace(/&/g, 'and')           // & -> and
    .replace(/[<>]/g, '')           // Remove < >
    .replace(/['"]/g, '')           // Remove quotes
    .replace(/[{}[\]]/g, '')        // Remove brackets
    .replace(/[|\\]/g, '')          // Remove pipes and backslashes
    .replace(/[^\w\s\-().,:]/g, '') // Keep only alphanumeric, spaces, hyphens, parentheses, periods, commas, colons
    .replace(/\s+/g, ' ')           // Normalize multiple spaces to single space
    .trim()                         // Remove leading/trailing whitespace
    .substring(0, 100);             // Limit length to 100 characters
}
