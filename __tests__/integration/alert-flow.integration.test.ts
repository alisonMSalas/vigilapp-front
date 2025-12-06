/**
 * Pruebas de integración para el flujo completo de alertas
 */
import alertService from '@/services/alert.service';
import { API_CONFIG } from '@/services/config/api.config';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');
global.fetch = jest.fn();

describe('Integration: Alert Management Flow', () => {
  const mockToken = 'mock-auth-token';

  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);
  });

  describe('Alert Creation and Retrieval Flow', () => {
    it('should create alert and retrieve it from list', async () => {
      // Mock create alert
      const createResponse = {
        ok: true,
        status: 201,
        json: async () => ({
          id: 1,
          type: 'ROBO',
          description: 'Robo en progreso',
          latitude: 9.9281,
          longitude: -84.0907,
          status: 'ACTIVA',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(createResponse);

      const alertData = {
        type: 'ROBO',
        description: 'Robo en progreso',
        latitude: 9.9281,
        longitude: -84.0907,
        mediaFiles: [],
      };

      const createResult = await alertService.createAlert(alertData);

      expect(createResult.success).toBe(true);
      expect(createResult.alert?.id).toBe(1);

      // Mock get alerts list
      const listResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          content: [
            {
              id: 1,
              type: 'ROBO',
              description: 'Robo en progreso',
              status: 'ACTIVA',
            },
          ],
          totalElements: 1,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(listResponse);

      const listResult = await alertService.getAlerts();

      expect(listResult.success).toBe(true);
      expect(listResult.alerts).toHaveLength(1);
      expect(listResult.alerts![0].id).toBe(1);
    });

    it('should create alert with media and verify upload', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({
          id: 2,
          type: 'ACCIDENTE',
          description: 'Accidente vial',
          mediaUrls: [
            'http://server/media/image1.jpg',
            'http://server/media/video1.mp4',
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const alertData = {
        type: 'ACCIDENTE',
        description: 'Accidente vial',
        latitude: 9.9281,
        longitude: -84.0907,
        mediaFiles: [
          { uri: 'file://photo.jpg', type: 'image', name: 'photo.jpg' },
          { uri: 'file://video.mp4', type: 'video', name: 'video.mp4' },
        ],
      };

      const result = await alertService.createAlert(alertData);

      expect(result.success).toBe(true);
      expect(result.alert?.mediaUrls).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/alerts'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('Alert Status Update Flow', () => {
    it('should update alert status from ACTIVA to RESUELTA', async () => {
      const updateResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          status: 'RESUELTA',
          resolvedAt: new Date().toISOString(),
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(updateResponse);

      const result = await alertService.updateAlertStatus(1, 'RESUELTA');

      expect(result.success).toBe(true);
      expect(result.alert?.status).toBe('RESUELTA');
    });

    it('should handle alert cancellation', async () => {
      const cancelResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          status: 'CANCELADA',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(cancelResponse);

      const result = await alertService.updateAlertStatus(1, 'CANCELADA');

      expect(result.success).toBe(true);
      expect(result.alert?.status).toBe('CANCELADA');
    });
  });

  describe('Alert Filtering and Pagination Flow', () => {
    it('should filter alerts by type and paginate results', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          content: [
            { id: 1, type: 'ROBO', status: 'ACTIVA' },
            { id: 2, type: 'ROBO', status: 'ACTIVA' },
          ],
          totalElements: 10,
          totalPages: 5,
          number: 0,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await alertService.getAlerts({
        type: 'ROBO',
        page: 0,
        size: 2,
      });

      expect(result.success).toBe(true);
      expect(result.alerts).toHaveLength(2);
      expect(result.pagination?.totalPages).toBe(5);
    });

    it('should filter alerts by status', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          content: [
            { id: 3, status: 'RESUELTA' },
            { id: 4, status: 'RESUELTA' },
          ],
          totalElements: 2,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await alertService.getAlerts({ status: 'RESUELTA' });

      expect(result.success).toBe(true);
      expect(result.alerts?.every(a => a.status === 'RESUELTA')).toBe(true);
    });
  });

  describe('Nearby Alerts Flow', () => {
    it('should get alerts near user location', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          alerts: [
            {
              id: 1,
              type: 'ROBO',
              latitude: 9.9281,
              longitude: -84.0907,
              distance: 0.5,
            },
            {
              id: 2,
              type: 'ACCIDENTE',
              latitude: 9.9290,
              longitude: -84.0910,
              distance: 1.2,
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await alertService.getNearbyAlerts(9.9281, -84.0907, 5000);

      expect(result.success).toBe(true);
      expect(result.alerts).toHaveLength(2);
      expect(result.alerts![0].distance).toBeLessThanOrEqual(5);
    });

    it('should handle empty nearby alerts', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          alerts: [],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await alertService.getNearbyAlerts(9.9281, -84.0907, 1000);

      expect(result.success).toBe(true);
      expect(result.alerts).toHaveLength(0);
    });
  });

  describe('Alert Comments Flow', () => {
    it('should add comment to alert and retrieve comments', async () => {
      // Mock add comment
      const addCommentResponse = {
        ok: true,
        status: 201,
        json: async () => ({
          id: 1,
          alertId: 1,
          content: 'Situación bajo control',
          createdAt: new Date().toISOString(),
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(addCommentResponse);

      const commentResult = await alertService.addComment(1, 'Situación bajo control');

      expect(commentResult.success).toBe(true);

      // Mock get comments
      const getCommentsResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          comments: [
            {
              id: 1,
              content: 'Situación bajo control',
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(getCommentsResponse);

      const commentsResult = await alertService.getAlertComments(1);

      expect(commentsResult.success).toBe(true);
      expect(commentsResult.comments).toHaveLength(1);
    });
  });

  describe('Error Handling in Alert Flow', () => {
    it('should handle unauthorized alert creation', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          message: 'No autorizado',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const alertData = {
        type: 'ROBO',
        description: 'Test',
        latitude: 9.9281,
        longitude: -84.0907,
        mediaFiles: [],
      };

      const result = await alertService.createAlert(alertData);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle network errors during alert fetch', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await alertService.getAlerts();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Descripción es obligatoria',
          errors: {
            description: 'Campo requerido',
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const alertData = {
        type: 'ROBO',
        description: '',
        latitude: 9.9281,
        longitude: -84.0907,
        mediaFiles: [],
      };

      const result = await alertService.createAlert(alertData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('obligatoria');
    });
  });

  describe('Delete Alert Flow', () => {
    it('should delete alert successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await alertService.deleteAlert(1);

      expect(result).toBe(true);
    });

    it('should handle delete failure', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        json: async () => ({
          message: 'No tienes permiso para eliminar esta alerta',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await alertService.deleteAlert(1);

      expect(result).toBe(false);
    });
  });
});
