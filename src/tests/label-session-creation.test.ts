// @ts-nocheck
/**
 * Test for Label Session Creation Feature
 * 
 * This test verifies the new workflow:
 * 1. POST /api/v1/quiz-sessions/practice/{labelId} - Create session
 * 2. GET /api/v1/quiz-sessions/{sessionId} - Fetch session details
 * 3. Redirect to /session/{sessionId}
 */

import { QuizService } from '@/lib/api-services';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Label Session Creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('QuizService.createLabelSession', () => {
    it('should call the correct endpoint with label ID', async () => {
      const mockResponse = {
        success: true,
        data: {
          sessionId: 123,
          questionCount: 15,
          title: 'Practice: My Label Name'
        }
      };

      const { apiClient } = require('@/lib/api-client');
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await QuizService.createLabelSession(1);

      expect(apiClient.post).toHaveBeenCalledWith('/quiz-sessions/practice/1');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors correctly', async () => {
      const mockError = {
        success: false,
        error: 'Label not found'
      };

      const { apiClient } = require('@/lib/api-client');
      apiClient.post.mockResolvedValue(mockError);

      const result = await QuizService.createLabelSession(999);

      expect(apiClient.post).toHaveBeenCalledWith('/quiz-sessions/practice/999');
      expect(result).toEqual(mockError);
    });
  });

  describe('Session Creation Workflow', () => {
    it('should follow the complete workflow successfully', async () => {
      const mockCreateResponse = {
        success: true,
        data: {
          sessionId: 123,
          questionCount: 15,
          title: 'Practice: My Label Name'
        }
      };

      const mockSessionResponse = {
        success: true,
        data: {
          id: 123,
          title: 'Practice: My Label Name',
          questions: [
            { id: 1, questionText: 'Test question 1' },
            { id: 2, questionText: 'Test question 2' }
          ],
          status: 'NOT_STARTED'
        }
      };

      const { apiClient } = require('@/lib/api-client');
      apiClient.post.mockResolvedValue(mockCreateResponse);
      apiClient.get.mockResolvedValue(mockSessionResponse);

      // Step 1: Create session
      const createResult = await QuizService.createLabelSession(1);
      expect(createResult.success).toBe(true);
      expect(createResult.data.sessionId).toBe(123);

      // Step 2: Fetch session details
      const sessionResult = await QuizService.getQuizSession(123);
      expect(sessionResult.success).toBe(true);
      expect(sessionResult.data.id).toBe(123);

      // Verify API calls
      expect(apiClient.post).toHaveBeenCalledWith('/quiz-sessions/practice/1');
      expect(apiClient.get).toHaveBeenCalledWith('/quiz-sessions/123');
    });

    it('should handle create session failure', async () => {
      const mockError = {
        success: false,
        error: 'Unable to create label session'
      };

      const { apiClient } = require('@/lib/api-client');
      apiClient.post.mockResolvedValue(mockError);

      const result = await QuizService.createLabelSession(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unable to create label session');
    });

    it('should handle session fetch failure', async () => {
      const mockCreateResponse = {
        success: true,
        data: {
          sessionId: 123,
          questionCount: 15,
          title: 'Practice: My Label Name'
        }
      };

      const mockSessionError = {
        success: false,
        error: 'Session not found'
      };

      const { apiClient } = require('@/lib/api-client');
      apiClient.post.mockResolvedValue(mockCreateResponse);
      apiClient.get.mockResolvedValue(mockSessionError);

      // Step 1: Create session (success)
      const createResult = await QuizService.createLabelSession(1);
      expect(createResult.success).toBe(true);

      // Step 2: Fetch session details (failure)
      const sessionResult = await QuizService.getQuizSession(123);
      expect(sessionResult.success).toBe(false);
      expect(sessionResult.error).toBe('Session not found');
    });
  });
});
