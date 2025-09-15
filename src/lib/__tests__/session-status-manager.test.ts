/**
 * Tests for Session Status Manager
 * 
 * Verifies the session status management functionality including:
 * - Status determination logic
 * - Validation of input parameters
 * - Error handling and retry logic
 * - Enum value validation
 */

import { SessionStatusManager } from '../session-status-manager';

// Mock the QuizService
jest.mock('../api-services', () => ({
  QuizService: {
    updateQuizSessionStatusWithRetry: jest.fn()
  }
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn()
  }
}));

describe('SessionStatusManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SessionStatusManager.clearPendingUpdates();
  });

  describe('determineStatus', () => {
    it('should return COMPLETED when all questions are answered', () => {
      const status = SessionStatusManager.determineStatus(10, 10, false);
      expect(status).toBe('COMPLETED');
    });

    it('should return COMPLETED when all questions are answered even when exiting', () => {
      const status = SessionStatusManager.determineStatus(10, 10, true);
      expect(status).toBe('COMPLETED');
    });

    it('should return IN_PROGRESS when exiting with unanswered questions', () => {
      const status = SessionStatusManager.determineStatus(10, 5, true);
      expect(status).toBe('IN_PROGRESS');
    });

    it('should return IN_PROGRESS when not exiting with unanswered questions', () => {
      const status = SessionStatusManager.determineStatus(10, 5, false);
      expect(status).toBe('IN_PROGRESS');
    });

    it('should return IN_PROGRESS when no questions are answered', () => {
      const status = SessionStatusManager.determineStatus(10, 0, false);
      expect(status).toBe('IN_PROGRESS');
    });
  });

  describe('validateSessionData', () => {
    it('should validate correct session data', () => {
      const result = SessionStatusManager.validateSessionData(123, 10, 5);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid sessionId', () => {
      const result = SessionStatusManager.validateSessionData(-1, 10, 5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid sessionId: -1. Must be a positive integer.');
    });

    it('should reject invalid totalQuestions', () => {
      const result = SessionStatusManager.validateSessionData(123, 0, 5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid totalQuestions: 0. Must be a positive integer.');
    });

    it('should reject invalid answeredQuestions', () => {
      const result = SessionStatusManager.validateSessionData(123, 10, -1);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid answeredQuestions: -1. Must be a non-negative integer.');
    });

    it('should reject when answeredQuestions exceeds totalQuestions', () => {
      const result = SessionStatusManager.validateSessionData(123, 10, 15);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid state: answeredQuestions (15) cannot exceed totalQuestions (10).');
    });

    it('should collect multiple validation errors', () => {
      const result = SessionStatusManager.validateSessionData(-1, 0, -1);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('isValidStatus', () => {
    it('should validate IN_PROGRESS status', () => {
      expect(SessionStatusManager.isValidStatus('IN_PROGRESS')).toBe(true);
    });

    it('should validate COMPLETED status', () => {
      expect(SessionStatusManager.isValidStatus('COMPLETED')).toBe(true);
    });

    it('should reject invalid status values', () => {
      expect(SessionStatusManager.isValidStatus('NOT_STARTED')).toBe(false);
      expect(SessionStatusManager.isValidStatus('INVALID')).toBe(false);
      expect(SessionStatusManager.isValidStatus('')).toBe(false);
    });
  });

  describe('handleBeforeUnload', () => {
    // Mock navigator.sendBeacon
    const mockSendBeacon = jest.fn();
    
    beforeEach(() => {
      Object.defineProperty(navigator, 'sendBeacon', {
        value: mockSendBeacon,
        writable: true
      });
      mockSendBeacon.mockClear();
    });

    it('should send beacon when there are unanswered questions', () => {
      mockSendBeacon.mockReturnValue(true);
      
      SessionStatusManager.handleBeforeUnload(123, 10, 5);
      
      expect(mockSendBeacon).toHaveBeenCalledWith(
        '/api/students/quiz-sessions/123/status',
        expect.any(Blob)
      );
    });

    it('should not send beacon when all questions are answered', () => {
      SessionStatusManager.handleBeforeUnload(123, 10, 10);
      
      expect(mockSendBeacon).not.toHaveBeenCalled();
    });

    it('should not send beacon when no questions are answered', () => {
      SessionStatusManager.handleBeforeUnload(123, 10, 0);
      
      expect(mockSendBeacon).not.toHaveBeenCalled();
    });

    it('should handle invalid input gracefully', () => {
      // Should not throw or call sendBeacon with invalid data
      SessionStatusManager.handleBeforeUnload(-1, 10, 5);
      SessionStatusManager.handleBeforeUnload(123, -1, 5);
      SessionStatusManager.handleBeforeUnload(123, 10, -1);
      
      expect(mockSendBeacon).not.toHaveBeenCalled();
    });
  });

  describe('updateBasedOnCompletion', () => {
    it('should handle validation errors gracefully', async () => {
      const result = await SessionStatusManager.updateBasedOnCompletion(-1, 10, 5);
      
      expect(result).toBe(false);
    });

    it('should determine correct status and call appropriate method', async () => {
      // Mock the API service to return success
      const { QuizService } = require('../api-services');
      QuizService.updateQuizSessionStatusWithRetry.mockResolvedValue({ success: true });

      // Test COMPLETED status
      const completedResult = await SessionStatusManager.updateBasedOnCompletion(123, 10, 10);
      expect(completedResult).toBe(true);

      // Test IN_PROGRESS status
      const inProgressResult = await SessionStatusManager.updateBasedOnCompletion(123, 10, 5, true);
      expect(inProgressResult).toBe(true);
    });
  });

  describe('pending updates management', () => {
    it('should track pending updates count', () => {
      expect(SessionStatusManager.getPendingUpdatesCount()).toBe(0);
    });

    it('should clear pending updates', () => {
      SessionStatusManager.clearPendingUpdates();
      expect(SessionStatusManager.getPendingUpdatesCount()).toBe(0);
    });
  });
});
