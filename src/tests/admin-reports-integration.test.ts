/**
 * Integration tests for the new admin reports API implementation
 * 
 * This test file validates that the admin reports functionality
 * correctly uses the new API endpoints and data structures.
 */

import { AdminService } from '@/lib/api-services';
import { AdminQuestionReport, ReviewQuestionReportRequest } from '@/types/api';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe('Admin Reports API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AdminService.getQuestionReports', () => {
    it('should use the correct endpoint', async () => {
      const mockResponse = {
        success: true,
        data: {
          reports: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            limit: 10,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        },
      };

      const { apiClient } = require('@/lib/api-client');
      apiClient.get.mockResolvedValue(mockResponse);

      await AdminService.getQuestionReports({ page: 1, limit: 10 });

      expect(apiClient.get).toHaveBeenCalledWith('/admin/questions/reports?page=1&limit=10');
    });

    it('should handle filters correctly', async () => {
      const mockResponse = {
        success: true,
        data: { reports: [], pagination: {} },
      };

      const { apiClient } = require('@/lib/api-client');
      apiClient.get.mockResolvedValue(mockResponse);

      await AdminService.getQuestionReports({
        page: 1,
        limit: 10,
        status: 'PENDING',
        reportType: 'TYPO',
        search: 'test',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/admin/questions/reports?page=1&limit=10&status=PENDING&reportType=TYPO&search=test'
      );
    });
  });

  describe('AdminService.reviewQuestionReport', () => {
    it('should use the correct endpoint and request structure', async () => {
      const mockResponse = {
        success: true,
        data: {} as AdminQuestionReport,
      };

      const { apiClient } = require('@/lib/api-client');
      apiClient.put.mockResolvedValue(mockResponse);

      const reviewData: ReviewQuestionReportRequest = {
        action: 'RESOLVED',
        response: 'Issue has been fixed',
      };

      await AdminService.reviewQuestionReport(123, reviewData);

      expect(apiClient.put).toHaveBeenCalledWith('/admin/questions/reports/123', reviewData);
    });

    it('should handle DISMISSED status correctly', async () => {
      const mockResponse = {
        success: true,
        data: {} as AdminQuestionReport,
      };

      const { apiClient } = require('@/lib/api-client');
      apiClient.put.mockResolvedValue(mockResponse);

      const reviewData: ReviewQuestionReportRequest = {
        action: 'DISMISSED',
        response: 'Not actionable',
      };

      await AdminService.reviewQuestionReport(456, reviewData);

      expect(apiClient.put).toHaveBeenCalledWith('/admin/questions/reports/456', reviewData);
    });
  });

  describe('Data Structure Validation', () => {
    it('should handle the new AdminQuestionReport structure', () => {
      const mockReport: AdminQuestionReport = {
        id: 15,
        userId: 202,
        questionId: 1048,
        reportType: 'TYPO',
        description: 'Test description',
        status: 'PENDING',
        reviewedById: null,
        adminResponse: null,
        createdAt: '2025-09-16T18:56:42.825Z',
        updatedAt: '2025-09-16T18:56:42.825Z',
        user: {
          fullName: 'Ahmed Ben Ali',
          email: 'student1@university.dz',
        },
        question: {
          id: 1048,
          courseId: 1439,
          examId: 159,
          sourceId: 27,
          questionText: 'What is the primary function of the stomach?',
          explanation: 'The stomach digests food.',
          questionType: 'SINGLE_CHOICE',
          universityId: 30,
          yearLevel: 'ONE',
          examYear: 2024,
          rotation: null,
          metadata: '{"difficulty":"beginner","topic":"stomach","category":"anatomy","estimatedTime":60}',
          createdById: 204,
          createdAt: '2025-09-14T18:00:17.007Z',
          updatedAt: '2025-09-14T18:00:17.007Z',
          questionAnswers: [
            {
              id: 4224,
              questionId: 1048,
              answerText: 'Digests food',
              isCorrect: true,
              explanation: 'This is the correct answer.',
              createdAt: '2025-09-14T18:00:17.013Z',
            },
          ],
          course: {
            name: 'Basic Anatomy',
          },
        },
        reviewedBy: null,
      };

      // Validate that the structure matches our type definitions
      expect(mockReport.id).toBe(15);
      expect(mockReport.user.fullName).toBe('Ahmed Ben Ali');
      expect(mockReport.question.questionText).toBe('What is the primary function of the stomach?');
      expect(mockReport.question.questionAnswers).toHaveLength(1);
      expect(mockReport.question.course.name).toBe('Basic Anatomy');
    });

    it('should handle the new ReviewQuestionReportRequest structure', () => {
      const reviewRequest: ReviewQuestionReportRequest = {
        action: 'RESOLVED',
        response: 'Issue has been fixed',
      };

      expect(reviewRequest.action).toBe('RESOLVED');
      expect(reviewRequest.response).toBe('Issue has been fixed');
    });
  });
});
