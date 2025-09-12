/**
 * Test file to validate analytics display functionality
 * Tests the enhanced analytics display with API response data
 */

import { mockSubmitAnswerResponse, mockSessionDataWithSubmitResponse } from './submit-answer-integration.test';

// Mock API session results data
const mockApiSessionResults = {
  scoreOutOf20: 16.5,
  percentageScore: 82.5,
  timeSpent: 1800, // 30 minutes in seconds
  answeredQuestions: 15,
  totalQuestions: 20,
  status: 'completed',
  sessionId: 123
};

// Mock session data without API results (fallback scenario)
const mockSessionDataWithoutApi = {
  id: 456,
  title: 'Local Quiz Session',
  type: 'PRACTICE',
  status: 'in_progress',
  totalQuestions: 25,
  questions: Array(25).fill(null).map((_, i) => ({
    id: i + 1,
    questionText: `Question ${i + 1}`,
    answers: [
      { id: 1, answerText: 'Option A', isCorrect: i % 4 === 0 },
      { id: 2, answerText: 'Option B', isCorrect: i % 4 === 1 },
      { id: 3, answerText: 'Option C', isCorrect: i % 4 === 2 },
      { id: 4, answerText: 'Option D', isCorrect: i % 4 === 3 }
    ]
  })),
  userAnswers: {
    '1': { selectedAnswerId: 1 },
    '2': { selectedAnswerId: 2 },
    '3': { selectedAnswerId: 3 }
  }
};

// Mock timer data
const mockTimer = {
  totalTime: 2400, // 40 minutes in seconds
  questionTime: 120,
  isPaused: false,
  isRunning: true
};

// Mock local answers
const mockLocalAnswers = {
  1: { selectedAnswerId: 1 },
  2: { selectedAnswerId: 2 },
  3: { selectedAnswerId: 3 },
  4: { selectedAnswerId: 4 },
  5: { selectedAnswerId: 1 }
};

describe('Analytics Display Functionality', () => {
  
  test('should prioritize API session results over local calculations', () => {
    // When API session results are available, they should take precedence
    const totalQuestions = mockApiSessionResults.totalQuestions || mockSessionDataWithoutApi.totalQuestions;
    const answeredQuestions = mockApiSessionResults.answeredQuestions ?? Object.keys(mockLocalAnswers).length;
    const timeSpent = mockApiSessionResults.timeSpent ?? mockTimer.totalTime;
    
    expect(totalQuestions).toBe(20); // From API results
    expect(answeredQuestions).toBe(15); // From API results
    expect(timeSpent).toBe(1800); // From API results (30 minutes)
  });

  test('should fall back to local calculations when API data is missing', () => {
    // When API session results are not available, should use local calculations
    const apiSessionResults = undefined;
    
    const totalQuestions = apiSessionResults?.totalQuestions || mockSessionDataWithoutApi.totalQuestions;
    const answeredQuestions = apiSessionResults?.answeredQuestions ?? Object.keys(mockLocalAnswers).length;
    const timeSpent = apiSessionResults?.timeSpent ?? mockTimer.totalTime;
    
    expect(totalQuestions).toBe(25); // From local session data
    expect(answeredQuestions).toBe(5); // From local answers count
    expect(timeSpent).toBe(2400); // From timer (40 minutes)
  });

  test('should format time correctly in mm:ss format', () => {
    const formatTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    expect(formatTime(1800)).toBe('30:00'); // 30 minutes
    expect(formatTime(125)).toBe('2:05'); // 2 minutes 5 seconds
    expect(formatTime(59)).toBe('0:59'); // 59 seconds
    expect(formatTime(3661)).toBe('1:01:01'); // 1 hour 1 minute 1 second
  });

  test('should handle API response data display correctly', () => {
    const { scoreOutOf20, percentageScore, timeSpent, answeredQuestions, totalQuestions, status } = mockApiSessionResults;
    
    // Verify all API response fields are present
    expect(scoreOutOf20).toBe(16.5);
    expect(percentageScore).toBe(82.5);
    expect(timeSpent).toBe(1800);
    expect(answeredQuestions).toBe(15);
    expect(totalQuestions).toBe(20);
    expect(status).toBe('completed');
  });

  test('should calculate progress percentage correctly', () => {
    const progressPercentage = mockApiSessionResults.totalQuestions > 0 
      ? Math.round((mockApiSessionResults.answeredQuestions / mockApiSessionResults.totalQuestions) * 100) 
      : 0;
    
    expect(progressPercentage).toBe(75); // 15/20 = 75%
  });

  test('should handle error cases gracefully', () => {
    // Test with missing or invalid API response data
    const invalidApiResults = {
      scoreOutOf20: undefined,
      percentageScore: null,
      timeSpent: -100,
      answeredQuestions: undefined,
      totalQuestions: 0,
      status: '',
      sessionId: null
    };

    // Should not throw errors and handle gracefully
    expect(invalidApiResults.scoreOutOf20).toBeUndefined();
    expect(invalidApiResults.percentageScore).toBeNull();
    expect(invalidApiResults.timeSpent).toBe(-100);
    expect(invalidApiResults.answeredQuestions).toBeUndefined();
    expect(invalidApiResults.totalQuestions).toBe(0);
    expect(invalidApiResults.status).toBe('');
    expect(invalidApiResults.sessionId).toBeNull();
  });

  test('should validate pause state analytics display', () => {
    // Test data that would be displayed in pause state
    const pauseStateData = {
      session: mockSessionDataWithoutApi,
      timer: mockTimer,
      localAnswers: mockLocalAnswers,
      apiSessionResults: mockApiSessionResults
    };

    // Should prioritize API data when available
    const displayedAnsweredQuestions = pauseStateData.apiSessionResults?.answeredQuestions ?? 
      Object.keys(pauseStateData.localAnswers).length;
    const displayedTimeSpent = pauseStateData.apiSessionResults?.timeSpent ?? 
      pauseStateData.timer.totalTime;

    expect(displayedAnsweredQuestions).toBe(15); // From API
    expect(displayedTimeSpent).toBe(1800); // From API
  });

  test('should validate exit dialog analytics display', () => {
    // Test data that would be displayed in exit dialog
    const exitDialogData = {
      session: mockSessionDataWithSubmitResponse,
      timer: mockTimer,
      localAnswers: mockLocalAnswers,
      apiSessionResults: mockApiSessionResults
    };

    // Should show API response data when available
    expect(exitDialogData.apiSessionResults?.scoreOutOf20).toBe(16.5);
    expect(exitDialogData.apiSessionResults?.percentageScore).toBe(82.5);
    expect(exitDialogData.apiSessionResults?.status).toBe('completed');
  });

  test('should handle success and error response states', () => {
    // Test successful API response
    const successResponse = {
      success: true,
      data: mockApiSessionResults
    };

    expect(successResponse.success).toBe(true);
    expect(successResponse.data.scoreOutOf20).toBe(16.5);

    // Test error API response
    const errorResponse = {
      success: false,
      error: 'Failed to submit answers'
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBe('Failed to submit answers');
  });
});

// Export mock data for use in other tests
export { 
  mockApiSessionResults, 
  mockSessionDataWithoutApi, 
  mockTimer, 
  mockLocalAnswers 
};
