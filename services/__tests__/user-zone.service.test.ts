import { userZoneService } from '../user-zone.service';
import * as apiConfig from '../config/api.config';

// Mock de SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

describe('UserZoneService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('saveUserZone', () => {
    it('should save user zone successfully', async () => {
      const zoneData = {
        centerLatitude: 10.0,
        centerLongitude: -84.0,
        radiusM: 1000,
      };

      const mockResponse = {
        id: '123',
        userId: 'user-123',
        ...zoneData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await userZoneService.saveUserZone(zoneData);
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/user-zones'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should throw error when save fails', async () => {
      const zoneData = {
        centerLatitude: 10.0,
        centerLongitude: -84.0,
        radiusM: 1000,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad request',
      });

      await expect(userZoneService.saveUserZone(zoneData)).rejects.toThrow();
    });
  });

  describe('getUserZone', () => {
    it('should retrieve user zone successfully', async () => {
      const mockZone = {
        id: '123',
        userId: 'user-123',
        centerLatitude: 10.0,
        centerLongitude: -84.0,
        radiusM: 1000,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockZone,
      });

      const result = await userZoneService.getUserZone();
      
      expect(result).toEqual(mockZone);
    });

    it('should return null when no zone exists', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      });

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();
    });
  });

  describe('deleteUserZone', () => {
    it('should delete user zone successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await userZoneService.deleteUserZone();
      expect(result).toBe(true);
    });

    it('should handle delete errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await userZoneService.deleteUserZone();
      expect(result).toBe(false);
    });

    it('should handle network errors during delete', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await userZoneService.deleteUserZone();
      expect(result).toBe(false);
    });
  });

  describe('Additional user zone scenarios', () => {
    it('should handle zones with different radii', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const result = await userZoneService.saveUserZone({
        centerLatitude: 10,
        centerLongitude: -84,
        radiusM: 500,
      });

      expect(result.success).toBe(true);
    });

    it('should handle zones at different coordinates', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const result = await userZoneService.saveUserZone({
        centerLatitude: 9.5,
        centerLongitude: -83.5,
        radiusM: 1500,
      });

      expect(result.success).toBe(true);
    });

    it('should handle getUserZone with network timeout', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Timeout'));

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should delete user zone successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await expect(userZoneService.deleteUserZone()).resolves.not.toThrow();
    });

    it('should handle 401 unauthorized when getting user zone', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();
    });

    it('should handle 403 forbidden when getting user zone', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
      });

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();
    });

    it('should handle 500 with "Access Denied" message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          details: 'Access Denied due to invalid token',
        }),
      });

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();
    });

    it('should handle 500 without Access Denied (normal error)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Internal server error',
        }),
        text: async () => 'Internal server error',
      });

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();
    });

    it('should handle 500 with JSON parse error (fallback to text)', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error('JSON parse error')),
      });

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();
    });

    it('should handle non-ok response with API error handler', async () => {
      const mockHandleApiError = jest.spyOn(apiConfig, 'handleApiError').mockResolvedValue({
        message: 'Custom error',
        status: 422,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({ error: 'Validation error' }),
      });

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();
      expect(mockHandleApiError).toHaveBeenCalled();

      mockHandleApiError.mockRestore();
    });

    it('should handle error when handleApiError throws', async () => {
      const mockHandleApiError = jest.spyOn(apiConfig, 'handleApiError').mockRejectedValue(
        new Error('API error handler failed')
      );

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 422,
        text: async () => 'Validation failed',
      });

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();

      mockHandleApiError.mockRestore();
    });

    it('should handle text() failure in error path', async () => {
      const mockHandleApiError = jest.spyOn(apiConfig, 'handleApiError').mockRejectedValue(
        new Error('Handler error')
      );

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockRejectedValue(new Error('Text parse error')),
      });

      const result = await userZoneService.getUserZone();
      expect(result).toBeNull();

      mockHandleApiError.mockRestore();
    });

    it('should normalize non-Error objects in saveUserZone catch', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('String error, not Error object');

      await expect(userZoneService.saveUserZone({
        centerLatitude: 10,
        centerLongitude: -84,
        radiusM: 1000,
      })).rejects.toThrow('Error al guardar zona');
    });

    it('should pass through Error objects in saveUserZone catch', async () => {
      const customError = new Error('Custom network error');
      (global.fetch as jest.Mock).mockRejectedValue(customError);

      await expect(userZoneService.saveUserZone({
        centerLatitude: 10,
        centerLongitude: -84,
        radiusM: 1000,
      })).rejects.toThrow('Custom network error');
    });
  });
});
