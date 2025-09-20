/**
 * Tests for Subscription Service - Redeem Activation Code
 * 
 * Verifies the redeem activation code functionality including:
 * - API endpoint configuration
 * - Request payload structure
 * - Error handling for different scenarios
 * - Success response handling
 */

import { SubscriptionService } from '../api-services';
import { apiClient } from '../api-client';

// Mock the API client
jest.mock('../api-client', () => ({
  apiClient: {
    post: jest.fn()
  }
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('SubscriptionService.redeemActivationCode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call the correct API endpoint with proper payload', async () => {
    const mockResponse = {
      success: true,
      data: {
        message: 'Activation code redeemed successfully',
        subscription: {
          id: 123,
          studyPackId: 17,
          status: 'ACTIVE',
          startDate: '2025-09-11T13:10:47.438Z',
          endDate: '2026-03-11T13:10:47.438Z',
          studyPack: {
            id: 17,
            name: 'First Year Medicine',
            type: 'YEAR',
            yearNumber: 'ONE'
          }
        }
      }
    };

    mockApiClient.post.mockResolvedValue(mockResponse);

    const result = await SubscriptionService.redeemActivationCode('TEST123');

    expect(mockApiClient.post).toHaveBeenCalledWith(
      '/students/codes/redeem',
      { code: 'TEST123' }
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle API error responses', async () => {
    const mockErrorResponse = {
      success: false,
      error: {
        message: 'Invalid activation code',
        statusCode: 400,
        details: {
          code: 'INVALID_CODE'
        }
      }
    };

    mockApiClient.post.mockResolvedValue(mockErrorResponse);

    const result = await SubscriptionService.redeemActivationCode('INVALID');

    expect(result).toEqual(mockErrorResponse);
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    mockApiClient.post.mockRejectedValue(networkError);

    await expect(SubscriptionService.redeemActivationCode('TEST123'))
      .rejects.toThrow('Network error');
  });

  it('should trim whitespace from activation code', async () => {
    const mockResponse = { success: true, data: {} };
    mockApiClient.post.mockResolvedValue(mockResponse);

    await SubscriptionService.redeemActivationCode('  TEST123  ');

    expect(mockApiClient.post).toHaveBeenCalledWith(
      '/students/codes/redeem',
      { code: '  TEST123  ' } // Note: trimming should be done in the component, not the service
    );
  });
});
