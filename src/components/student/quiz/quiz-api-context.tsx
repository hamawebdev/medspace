// @ts-nocheck
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo } from 'react';
import { useQuizAnswerSubmission } from '@/hooks/use-quiz-api';
import { QuizService } from '@/lib/api-services';
import { quizStorage, QuizSessionState, QuizAnswer } from '@/lib/quiz-storage';
import { toast } from 'sonner';
import { debounce } from 'lodash';

// Re-export types from the original context for compatibility
export type {
  QuizQuestion,
  UserAnswer,
  QuizSession,
  QuizTimer,
} from './quiz-context';

// Enhanced quiz state with API integration and client-side storage
interface ApiQuizState {
  session: any; // QuizSession from original context
  timer: any; // QuizTimer from original context
  currentQuestion: any | null; // QuizQuestion from original context, can be null
  isAnswerRevealed: boolean;
  showExplanation: boolean;
  sidebarOpen: boolean;
  // API-specific state
  apiSessionId?: number;
  submittingAnswer: boolean;
  lastSubmissionError: string | null;
  autoSave: boolean;
  // Client-side storage state
  clientStorageEnabled: boolean;
  pendingSubmission: boolean;
  localAnswers: Record<number, QuizAnswer>;
  // UI hint to trigger edit mode in review
  editTriggerAt: number | null;
}

// Enhanced quiz actions with API integration
type ApiQuizAction =
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREVIOUS_QUESTION' }
  | { type: 'GO_TO_QUESTION'; questionIndex: number }
  | { type: 'SUBMIT_ANSWER'; answer: any; submitToApi?: boolean }
  | { type: 'ANSWER_SUBMITTED'; success: boolean; error?: string }
  | { type: 'REVEAL_ANSWER' }
  | { type: 'TOGGLE_EXPLANATION' }
  | { type: 'PAUSE_QUIZ' }
  | { type: 'RESUME_QUIZ' }
  | { type: 'UPDATE_TIMER'; totalTime: number; questionTime: number }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'BOOKMARK_QUESTION'; questionId: string }
  | { type: 'ADD_NOTE'; questionId: string; note: string }
  | { type: 'FLAG_QUESTION'; questionId: string; flag: 'difficult' | 'review_later' | 'report_error' }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'SET_AUTO_SAVE'; enabled: boolean }
  | { type: 'CLEAR_SUBMISSION_ERROR' }
  | { type: 'LOAD_LOCAL_ANSWERS'; answers: Record<number, QuizAnswer> }
  | { type: 'SAVE_LOCAL_ANSWER'; answer: QuizAnswer }
  | { type: 'SET_PENDING_SUBMISSION'; pending: boolean }
  | { type: 'TRIGGER_EDIT'; at: number };

// Enhanced quiz reducer with API integration
function apiQuizReducer(state: ApiQuizState, action: ApiQuizAction): ApiQuizState {
  switch (action.type) {
    case 'NEXT_QUESTION':
      if (state.session.currentQuestionIndex < state.session.totalQuestions - 1) {
        const nextIndex = state.session.currentQuestionIndex + 1;
        const nextQuestion = state.session.questions?.[nextIndex] || null;
        const newState = {
          ...state,
          session: {
            ...state.session,
            currentQuestionIndex: nextIndex,
          },
          currentQuestion: nextQuestion,
          isAnswerRevealed: false,
          showExplanation: false,
          timer: {
            ...state.timer,
            questionTime: 0,
          },
        } as ApiQuizState;
        // Persist current question index for resume-on-reenter
        if (state.apiSessionId) {
          try { quizStorage.updateSessionProgress(state.apiSessionId, { currentQuestionIndex: nextIndex }); } catch {}
        }
        return newState;
      }
      return state;

    case 'PREVIOUS_QUESTION':
      if (state.session.currentQuestionIndex > 0) {
        const prevIndex = state.session.currentQuestionIndex - 1;
        const prevQuestion = state.session.questions?.[prevIndex] || null;
        const newState = {
          ...state,
          session: {
            ...state.session,
            currentQuestionIndex: prevIndex,
          },
          currentQuestion: prevQuestion,
          isAnswerRevealed: false,
          showExplanation: false,
          timer: {
            ...state.timer,
            questionTime: 0,
          },
        } as ApiQuizState;
        if (state.apiSessionId) {
          try { quizStorage.updateSessionProgress(state.apiSessionId, { currentQuestionIndex: prevIndex }); } catch {}
        }
        return newState;
      }
      return state;

    case 'GO_TO_QUESTION':
      if (action.questionIndex >= 0 && action.questionIndex < state.session.totalQuestions) {
        const targetQuestion = state.session.questions?.[action.questionIndex] || null;
        const newIndex = action.questionIndex;
        const newState = {
          ...state,
          session: {
            ...state.session,
            currentQuestionIndex: newIndex,
          },
          currentQuestion: targetQuestion,
          isAnswerRevealed: false,
          showExplanation: false,
          timer: {
            ...state.timer,
            questionTime: 0,
          },
        } as ApiQuizState;
        if (state.apiSessionId) {
          try { quizStorage.updateSessionProgress(state.apiSessionId, { currentQuestionIndex: newIndex }); } catch {}
        }
        return newState;
      }
      return state;

    case 'SUBMIT_ANSWER':
      if (!state.currentQuestion) {
        console.warn('Cannot submit answer: currentQuestion is undefined');
        return state;
      }

      const currentQuestionId = state.currentQuestion.id;
      const userAnswer = {
        questionId: currentQuestionId,
        timeSpent: state.timer.questionTime,
        timestamp: new Date(),
        ...action.answer,
      };

      // Store answer locally if client storage is enabled
      const newLocalAnswers = state.clientStorageEnabled
        ? { ...state.localAnswers, [currentQuestionId]: userAnswer }
        : state.localAnswers;

      return {
        ...state,
        session: {
          ...state.session,
          userAnswers: {
            ...state.session.userAnswers,
            [currentQuestionId]: userAnswer,
          },
        },
        localAnswers: newLocalAnswers,
        isAnswerRevealed: state.session.showAnswers,
        submittingAnswer: action.submitToApi || false,
        lastSubmissionError: null,
      };

    case 'ANSWER_SUBMITTED':
      return {
        ...state,
        submittingAnswer: false,
        lastSubmissionError: action.success ? null : (action.error || 'Submission failed'),
      };

    case 'REVEAL_ANSWER':
      return {
        ...state,
        isAnswerRevealed: true,
        showExplanation: true,
      };

    case 'TOGGLE_EXPLANATION':
      return {
        ...state,
        showExplanation: !state.showExplanation,
      };

    case 'PAUSE_QUIZ':
      return {
        ...state,
        session: {
          ...state.session,
          status: 'paused',
        },
        timer: {
          ...state.timer,
          isPaused: true,
          isRunning: false,
        },
      };

    case 'RESUME_QUIZ':
      return {
        ...state,
        session: {
          ...state.session,
          status: 'active',
        },
        timer: {
          ...state.timer,
          isPaused: false,
          isRunning: true,
        },
      };

    case 'UPDATE_TIMER':
      return {
        ...state,
        timer: {
          ...state.timer,
          totalTime: action.totalTime,
          questionTime: action.questionTime,
        },
      };

    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };

    case 'BOOKMARK_QUESTION':
      const bookmarkAnswer = state.session.userAnswers[action.questionId] || {
        questionId: action.questionId,
        timeSpent: 0,
        timestamp: new Date(),
      };

      return {
        ...state,
        session: {
          ...state.session,
          userAnswers: {
            ...state.session.userAnswers,
            [action.questionId]: {
              ...bookmarkAnswer,
              isBookmarked: !bookmarkAnswer.isBookmarked,
            },
          },
        },
      };

    case 'ADD_NOTE':
      const noteAnswer = state.session.userAnswers[action.questionId] || {
        questionId: action.questionId,
        timeSpent: 0,
        timestamp: new Date(),
      };

      return {
        ...state,
        session: {
          ...state.session,
          userAnswers: {
            ...state.session.userAnswers,
            [action.questionId]: {
              ...noteAnswer,
              notes: action.note,
            },
          },
        },
      };

    case 'FLAG_QUESTION':
      const flagAnswer = state.session.userAnswers[action.questionId] || {
        questionId: action.questionId,
        timeSpent: 0,
        timestamp: new Date(),
      };

      const currentFlags = flagAnswer.flags || [];
      const hasFlag = currentFlags.includes(action.flag);
      const newFlags = hasFlag
        ? currentFlags.filter(f => f !== action.flag)
        : [...currentFlags, action.flag];

      return {
        ...state,
        session: {
          ...state.session,
          userAnswers: {
            ...state.session.userAnswers,
            [action.questionId]: {
              ...flagAnswer,
              flags: newFlags,
            },
          },
        },
      };

    case 'COMPLETE_QUIZ':
      return {
        ...state,
        session: {
          ...state.session,
          status: 'COMPLETED',
        },
        timer: {
          ...state.timer,
          isRunning: false,
          isPaused: false,
        },
        showExplanation: true,
        isAnswerRevealed: true,
      };

    case 'SET_AUTO_SAVE':
      return {
        ...state,
        autoSave: action.enabled,
      };

    case 'CLEAR_SUBMISSION_ERROR':
      return {
        ...state,
        lastSubmissionError: null,
      };

    case 'LOAD_LOCAL_ANSWERS':
      return {
        ...state,
        localAnswers: action.answers,
      };

    case 'SAVE_LOCAL_ANSWER':
      return {
        ...state,
        localAnswers: {
          ...state.localAnswers,
          [action.answer.questionId]: action.answer,
        },
      };

    case 'SET_PENDING_SUBMISSION':
      return {
        ...state,
        pendingSubmission: action.pending,
      };

    case 'TRIGGER_EDIT':
      return {
        ...state,
        editTriggerAt: action.at,
      };

    default:
      return state;
  }
}

// Enhanced context type with API integration
interface ApiQuizContextType {
  state: ApiQuizState;
  dispatch: React.Dispatch<ApiQuizAction>;
  // Helper functions
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitAnswer: (answer: any, submitToApi?: boolean) => Promise<void>;
  revealAnswer: () => void;
  toggleExplanation: () => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  toggleSidebar: () => void;
  bookmarkQuestion: (questionId: string) => void;
  addNote: (questionId: string, note: string) => void;
  flagQuestion: (questionId: string, flag: 'difficult' | 'review_later' | 'report_error') => void;
  completeQuiz: () => void;
  submitAllAnswers: () => Promise<boolean>;
  setAutoSave: (enabled: boolean) => void;
  clearSubmissionError: () => void;
  retrySubmission: () => Promise<void>;
  getStorageStats: () => any;
}

const ApiQuizContext = createContext<ApiQuizContextType | undefined>(undefined);

// Enhanced provider with API integration
interface ApiQuizProviderProps {
  children: React.ReactNode;
  initialSession: any;
  apiSessionId?: number;
  enableApiSubmission?: boolean;
}

export function ApiQuizProvider({
  children,
  initialSession,
  apiSessionId,
  // Disable per-question API submission by default; answers are sent only on final submit
  enableApiSubmission = false
}: ApiQuizProviderProps) {
  const [timeUpNotificationShown, setTimeUpNotificationShown] = useState(false);
  const initialState: ApiQuizState = {
    session: initialSession,
    timer: {
      totalTime: 0,
      questionTime: 0,
      isPaused: initialSession.status === 'COMPLETED',
      isRunning: initialSession.status !== 'COMPLETED',
    },
    currentQuestion: initialSession.questions?.[initialSession.currentQuestionIndex] || null,
    isAnswerRevealed: initialSession.status === 'COMPLETED',
    showExplanation: initialSession.status === 'COMPLETED',
    sidebarOpen: true,
    apiSessionId,
    submittingAnswer: false,
    lastSubmissionError: null,
    autoSave: false, // Disable auto-save for client-side storage
    clientStorageEnabled: true,
    pendingSubmission: false,
    localAnswers: {},
    editTriggerAt: null,
  };

  const [state, dispatch] = useReducer(apiQuizReducer, initialState);
  const { submitAnswer: apiSubmitAnswer, submitting } = useQuizAnswerSubmission();

  // Initialize client-side storage for the session
  useEffect(() => {
    if (apiSessionId && state.clientStorageEnabled) {
      // Load existing session state from storage
      const storedSession = quizStorage.loadSessionState(apiSessionId);

      if (storedSession) {
        // Load stored answers
        dispatch({ type: 'LOAD_LOCAL_ANSWERS', answers: storedSession.answers });
        // Restore current question index and timer
        if (typeof storedSession.currentQuestionIndex === 'number') {
          dispatch({ type: 'GO_TO_QUESTION', questionIndex: storedSession.currentQuestionIndex });
        }
        if (typeof storedSession.timeSpent === 'number') {
          dispatch({ type: 'UPDATE_TIMER', totalTime: storedSession.timeSpent, questionTime: 0 });
        }
        console.log(`📖 Loaded ${Object.keys(storedSession.answers).length} answers from client storage`);
      } else {
        // Initialize new session in storage
        const sessionState: QuizSessionState = {
          sessionId: apiSessionId,
          title: initialSession.title || 'Quiz Session',
          type: initialSession.type || 'PRACTICE',
          status: 'NOT_STARTED',
          currentQuestionIndex: initialSession.currentQuestionIndex || 0,
          totalQuestions: initialSession.totalQuestions || initialSession.questions?.length || 0,
          answers: {},
          startedAt: new Date(),
          lastUpdatedAt: new Date(),
          timeSpent: 0,
          bookmarkedQuestions: [],
          flaggedQuestions: [],
          settings: {
            showExplanations: initialSession.showExplanations || 'after_each',
            timeLimit: initialSession.timeLimit,
            shuffleQuestions: initialSession.shuffleQuestions || false,
          },
        };

        quizStorage.saveSessionState(sessionState);
        console.log(`💾 Initialized new session ${apiSessionId} in client storage`);
      }
    }
  }, [apiSessionId, state.clientStorageEnabled, initialSession]);


  // On entering a session: if status is NOT_STARTED, mark it IN_PROGRESS on server
  useEffect(() => {
    if (!apiSessionId || !enableApiSubmission) return;
    const currentStatus = (state.session?.status || 'NOT_STARTED').toString().toUpperCase();
    if (currentStatus === 'NOT_STARTED') {
      QuizService.updateQuizSessionStatus(apiSessionId, 'IN_PROGRESS')
        .catch((err) => {
          console.warn('Failed to set session IN_PROGRESS:', err);
        });
    }
  }, [apiSessionId, enableApiSubmission]);

  // Answer batching state for optimized submissions
  const [pendingAnswers, setPendingAnswers] = useState<Array<{
    questionId: number;
    selectedAnswerId: number;
    timeSpent?: number;
    timestamp: Date;
  }>>([]);

  // Track submission status for better UX
  const [batchSubmissionStatus, setBatchSubmissionStatus] = useState<{
    isSubmitting: boolean;
    lastSubmissionTime: number | null;
    failedAnswers: number[];
  }>({
    isSubmitting: false,
    lastSubmissionTime: null,
    failedAnswers: []
  });

  // Helper functions
  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  // Update answer via PUT for review/edit mode (supports QCS and QCM)
  const updateAnswer = useCallback(async (questionId: number, selected: number | number[]) => {
    if (!apiSessionId || !questionId || (!Array.isArray(selected) && !selected)) {
      toast.error('Missing session or answer information');
      throw { success: false, error: 'Missing session or answer information' };
    }
    try {
      const body = Array.isArray(selected)
        ? { selectedAnswerIds: selected.map(Number) }
        : { selectedAnswerId: Number(selected) };
      const res = await QuizService.updateAnswer(apiSessionId, questionId, body as any);
      if (!res.success) {
        throw res;
      }

      // Update local state and storage to reflect the change
      const quizAnswer: QuizAnswer = {
        questionId: Number(questionId),
        ...(Array.isArray(selected)
          ? { selectedAnswerIds: selected.map(Number) as number[] }
          : { selectedAnswerId: Number(selected), selectedAnswerIds: [Number(selected)] as number[] }),
        timeSpent: state.timer.questionTime,
        timestamp: new Date(),
        isCorrect: undefined,
      } as any;

      quizStorage.saveAnswer(apiSessionId, quizAnswer);
      dispatch({ type: 'SAVE_LOCAL_ANSWER', answer: quizAnswer });
      toast.success('Answer updated');
    } catch (err: any) {
      const msg: string = (err?.error || err?.message || '').toString();
      const status = err?.statusCode || err?.status || err?.response?.status;
      console.error('Update answer failed', err);
      if (status === 400 && /Cannot modify completed quiz session/i.test(msg)) {
        toast.info('This session is completed and cannot be edited. Create a retake to change answers.');
      } else {
        toast.error(msg || 'Failed to update answer');
      }
      throw err;
    }
  }, [apiSessionId, state.timer.questionTime]);

  const previousQuestion = useCallback(() => {
    dispatch({ type: 'PREVIOUS_QUESTION' });
  }, []);

  const goToQuestion = useCallback((index: number) => {
    dispatch({ type: 'GO_TO_QUESTION', questionIndex: index });
  }, []);

  // Legacy batch submission - DISABLED for manual submission flow
  const submitAnswersBatch = useCallback(async (answersToSubmit: any[]) => {
    console.log('⚠️ Legacy batch submission called - this should not happen in manual submission mode');
    // This function is disabled to prevent auto-submission
    return;
  }, []);

  // Legacy debounced batch submission - DISABLED
  const debouncedBatchSubmit = useMemo(
    () => ({
      cancel: () => {}, // No-op function
      flush: () => {}, // No-op function
    }),
    []
  );

  const submitAnswer = useCallback(async (answer: any) => {
    // Prevent submission when completed
    if (state.session.status === 'completed' || state.session.status === 'COMPLETED') {
      // Silently skip API submission if user is reviewing a completed session
      console.warn('Cannot submit answer: Quiz session is already completed');
      return;
    }

    // Persist locally and set session IN_PROGRESS on first answer
    dispatch({ type: 'SUBMIT_ANSWER', answer, submitToApi: false });

    if (state.clientStorageEnabled && apiSessionId && state.currentQuestion) {
      const selectedAnswerId = answer.selectedOptions?.[0];
      const quizAnswer: QuizAnswer = {
        questionId: parseInt(state.currentQuestion.id),
        selectedAnswerId: selectedAnswerId ? parseInt(selectedAnswerId) : undefined,
        selectedAnswerIds: answer.selectedOptions?.map((id: string) => parseInt(id)),
        textAnswer: answer.textAnswer,
        isCorrect: answer.isCorrect,
        timeSpent: state.timer.questionTime,
        timestamp: new Date(),
        flags: answer.flags || [],
        notes: answer.notes,
      };

      // Mark the session as IN_PROGRESS locally the first time an answer is saved
      if (quizStorage.loadSessionState(apiSessionId)?.status === 'NOT_STARTED') {
        try { quizStorage.updateSessionProgress(apiSessionId, { status: 'IN_PROGRESS' }); } catch {}
        try { await QuizService.updateQuizSessionStatus(apiSessionId, 'IN_PROGRESS'); } catch {}
      }

      quizStorage.saveAnswer(apiSessionId, quizAnswer);
      dispatch({ type: 'SAVE_LOCAL_ANSWER', answer: quizAnswer });
      console.log(`💾 Answer saved to client storage (Question ${quizAnswer.questionId})`);
      // Removed per-answer toast noise

      // Do NOT submit per-answer anymore. Answers are stored locally and submitted in bulk on final submit.
    }

    dispatch({ type: 'ANSWER_SUBMITTED', success: true });
  }, [state.clientStorageEnabled, state.currentQuestion?.id, state.timer.questionTime, apiSessionId, enableApiSubmission]);

  const revealAnswer = useCallback(() => {
    dispatch({ type: 'REVEAL_ANSWER' });
  }, []);

  const toggleExplanation = useCallback(() => {
    dispatch({ type: 'TOGGLE_EXPLANATION' });
  }, []);

  const pauseQuiz = useCallback(() => {
    dispatch({ type: 'PAUSE_QUIZ' });
  }, []);

  const resumeQuiz = useCallback(() => {
    dispatch({ type: 'RESUME_QUIZ' });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const bookmarkQuestion = useCallback((questionId: string) => {
    dispatch({ type: 'BOOKMARK_QUESTION', questionId });
  }, []);

  const addNote = useCallback((questionId: string, note: string) => {
    dispatch({ type: 'ADD_NOTE', questionId, note });
  }, []);

  // Legacy flush pending answers - DISABLED for manual submission flow
  const flushPendingAnswers = useCallback(async () => {
    console.log('⚠️ Legacy flushPendingAnswers called - this should not happen in manual submission mode');
    // This function is disabled to prevent auto-submission
    return;
  }, []);

  // Manual quiz submission - only when user explicitly submits
  const submitAllAnswers = useCallback(async () => {
    if (!apiSessionId) {
      console.error('Cannot submit quiz: No session ID');
      return false;
    }

    try {
      dispatch({ type: 'SET_PENDING_SUBMISSION', pending: true });

      // Mark session as completed in client storage
      const completedSession = quizStorage.completeSession(apiSessionId);
      if (!completedSession) {
        throw new Error('Failed to complete session in client storage');
      }

      // Get all answers for submission
      const answersForSubmission = quizStorage.getAnswersForSubmission(apiSessionId);

      if (answersForSubmission.length === 0) {
        console.warn('No answers to submit');
        toast.warning('No answers to submit');
        return false;
      }

      console.log(`📤 Submitting ${answersForSubmission.length} answers to server...`);
      toast.loading('Submitting your answers...', { id: 'quiz-submission' });

      // Build a lookup of question types to shape payload correctly
      const questionTypeById: Record<number, string> = {};
      try {
        (state.session.questions || []).forEach((q: any) => {
          const qt = (q.questionType || q.type || '').toString().toUpperCase();
          questionTypeById[Number(q.id)] = qt || 'SINGLE_CHOICE';
        });
      } catch {}

      // Convert to API format and submit
      const apiAnswers = answersForSubmission.map(answer => {
        const qType = questionTypeById[Number(answer.questionId)] || 'SINGLE_CHOICE';
        const isSingle = qType === 'SINGLE_CHOICE' || qType === 'QCS';
        const isMulti = qType === 'MULTIPLE_CHOICE' || qType === 'QCM';

        if (isSingle) {
          const selectedId = typeof answer.selectedAnswerId === 'number'
            ? answer.selectedAnswerId
            : (Array.isArray(answer.selectedAnswerIds) && answer.selectedAnswerIds.length ? Number(answer.selectedAnswerIds[0]) : undefined);
          return {
            questionId: Number(answer.questionId),
            ...(Number.isFinite(selectedId as number) ? { selectedAnswerId: Number(selectedId) } : {}),
            timeSpent: answer.timeSpent,
          } as any;
        }

        if (isMulti) {
          const ids = Array.isArray(answer.selectedAnswerIds) ? answer.selectedAnswerIds.map(Number).filter(n => Number.isFinite(n)) : [];
          return {
            questionId: Number(answer.questionId),
            ...(ids.length ? { selectedAnswerIds: ids } : {}),
            timeSpent: answer.timeSpent,
          } as any;
        }

        // Fallback: try single first, else multi array
        return {
          questionId: Number(answer.questionId),
          ...(typeof answer.selectedAnswerId === 'number' ? { selectedAnswerId: answer.selectedAnswerId }
            : (Array.isArray(answer.selectedAnswerIds) && answer.selectedAnswerIds.length ? { selectedAnswerIds: answer.selectedAnswerIds } : {})),
          timeSpent: answer.timeSpent,
        } as any;
      }).filter(entry => (entry as any).selectedAnswerId || (entry as any).selectedAnswerIds);

      if (apiAnswers.length > 0) {
        const response = await QuizService.submitAnswersBulk(apiSessionId, apiAnswers);
        if (!response.success) throw new Error(response.error || 'Failed to submit answers');
      }

      // Mark completed on server and locally
      try {
        await QuizService.updateQuizSessionStatus(apiSessionId, 'COMPLETED');
      } catch (e) {
        console.warn('Failed to set session COMPLETED:', e);
      }
      dispatch({ type: 'COMPLETE_QUIZ' });

      // Clean up client storage after successful submission
      quizStorage.removeSessionState(apiSessionId);

      toast.success('Quiz submitted successfully!', { id: 'quiz-submission' });
      console.log(`✅ Quiz ${apiSessionId} submitted successfully`);

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
      console.error('Quiz submission error:', error);
      toast.error(`Failed to submit quiz: ${errorMessage}`, { id: 'quiz-submission' });

      // Keep answers in storage for retry
      toast.info('Your answers are saved locally. You can try submitting again.');
      return false;
    } finally {
      dispatch({ type: 'SET_PENDING_SUBMISSION', pending: false });
    }
  }, [apiSessionId]);

  // Legacy completion function - now just marks as ready for submission
  const completeQuiz = useCallback(async () => {
    // Just mark the quiz as ready for submission, don't auto-submit
    if (apiSessionId) {
      quizStorage.completeSession(apiSessionId);
      dispatch({ type: 'COMPLETE_QUIZ' });
      console.log(`✅ Quiz ${apiSessionId} marked as ready for submission`);
    }
  }, [apiSessionId]);

  const flagQuestion = useCallback((questionId: string, flag: 'difficult' | 'review_later' | 'report_error') => {
    dispatch({ type: 'FLAG_QUESTION', questionId, flag });
  }, []);



  const setAutoSave = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_SAVE', enabled });
  }, []);

  const clearSubmissionError = useCallback(() => {
    dispatch({ type: 'CLEAR_SUBMISSION_ERROR' });
  }, []);

  // Retry submission of stored answers
  const retrySubmission = useCallback(async () => {
    if (!apiSessionId) return;

    const storedSession = quizStorage.loadSessionState(apiSessionId);
    if (!storedSession || storedSession.status !== 'COMPLETED') {
      console.log('No completed session found for retry');
      return;
    }

    try {
      await completeQuiz();
    } catch (error) {
      console.error('Retry submission failed:', error);
    }
  }, [apiSessionId, completeQuiz]);

  // Get client storage statistics
  const getStorageStats = useCallback(() => {
    return quizStorage.getStorageStats();
  }, []);

  // Reset time up notification when session changes
  useEffect(() => {
    setTimeUpNotificationShown(false);
  }, [apiSessionId, initialSession.id]);

  // Timer effect
  useEffect(() => {
    if (!state.timer.isRunning || state.timer.isPaused) return;

    const interval = setInterval(() => {
      const newTotalTime = state.timer.totalTime + 1;
      const newQuestionTime = state.timer.questionTime + 1;

      dispatch({
        type: 'UPDATE_TIMER',
        totalTime: newTotalTime,
        questionTime: newQuestionTime
      });

      // Check for time limit and show notification
      const timeLimit = state.session.timeLimit; // in minutes
      if (timeLimit && !timeUpNotificationShown) {
        const timeLimitSeconds = timeLimit * 60;
        if (newTotalTime >= timeLimitSeconds) {
          setTimeUpNotificationShown(true);
          toast.warning('⏰ Time is up!', {
            description: `You have reached the ${timeLimit} minute time limit for this quiz. You can continue, but your time is over.`,
            duration: 8000,
            important: true,
          });
          
          // Also dispatch an action to handle time up state
          dispatch({ type: 'PAUSE_QUIZ' });
        }
      }

      // Persist timer periodically
      if (state.apiSessionId) {
        quizStorage.updateSessionProgress(state.apiSessionId, { timeSpent: newTotalTime });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.timer.isRunning, state.timer.isPaused, state.timer.totalTime, state.timer.questionTime, state.apiSessionId, state.session.timeLimit, timeUpNotificationShown]);

  const value: ApiQuizContextType & { updateAnswer: (questionId: number, selectedAnswerId: number) => Promise<void> } = {
    state,
    dispatch,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    submitAnswer,
    revealAnswer,
    toggleExplanation,
    pauseQuiz,
    resumeQuiz,
    toggleSidebar,
    bookmarkQuestion,
    addNote,
    flagQuestion,
    completeQuiz,
    submitAllAnswers,
    setAutoSave,
    clearSubmissionError,
    retrySubmission,
    getStorageStats,
    // Legacy compatibility
    flushPendingAnswers,
    batchSubmissionStatus,
    pendingAnswersCount: Object.keys(state.localAnswers).length,
    // New
    updateAnswer,
  };

  return (
    <ApiQuizContext.Provider value={value}>
      {children}
    </ApiQuizContext.Provider>
  );
}

// Hook to use the enhanced quiz context
export function useApiQuiz() {
  const context = useContext(ApiQuizContext);
  if (context === undefined) {
    throw new Error('useApiQuiz must be used within an ApiQuizProvider');
  }
  return context;
}

// Export the API-only useQuiz hook - no fallback to ensure API-only usage
export function useQuiz() {
  return useApiQuiz();
}
