/**
 * Pruebas unitarias para AlertService
 */
import { alertService } from '../alert.service';
import { API_CONFIG } from '../config/api.config';
import * as SecureStore from 'expo-secure-store';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('AlertService', () => {
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);
  });

  describe('createAlert', () => {
    it('debería crear una alerta exitosamente', async () => {
      const mockAlert = {
        id: '1',
        title: 'Robo reportado',
        description: 'Robo en progreso',
        category: 'EMERGENCY',
        status: 'ACTIVE',
        latitude: 10.0,
        longitude: -84.0,
        radiusM: 500,
      };

      const alertData = {
        category: 'EMERGENCY' as const,
        title: 'Robo reportado',
        description: 'Robo en progreso',
        latitude: 10.0,
        longitude: -84.0,
        radiusM: 500,
        isAnonymous: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockAlert,
      } as Response);

      const result = await alertService.createAlert(alertData);

      expect(result).toEqual(mockAlert);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/alerts`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(alertData),
        })
      );
    });

    it('debería manejar error al crear alerta', async () => {
      const alertData = {
        category: 'EMERGENCY' as const,
        title: 'Test',
        description: 'Test',
        latitude: 10.0,
        longitude: -84.0,
        radiusM: 500,
        isAnonymous: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Datos inválidos',
      } as Response);

      await expect(alertService.createAlert(alertData)).rejects.toThrow(
        'Error al crear alerta'
      );
    });
  });

  describe('getNearbyAlerts', () => {
    it('debería obtener alertas cercanas', async () => {
      const mockAlerts = [
        {
          id: '1',
          title: 'Alerta 1',
          category: 'EMERGENCY',
          latitude: 10.0,
          longitude: -84.0,
        },
        {
          id: '2',
          title: 'Alerta 2',
          category: 'INFO',
          latitude: 10.01,
          longitude: -84.01,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      } as Response);

      const result = await alertService.getNearbyAlerts(10.0, -84.0, 5000, true);

      expect(result).toEqual(mockAlerts);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/alerts/nearby'),
        expect.any(Object)
      );
    });

    it('debería usar valores por defecto para radius y activeOnly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await alertService.getNearbyAlerts(10.0, -84.0);

      const callUrl = (mockFetch.mock.calls[0][0] as string);
      expect(callUrl).toContain('radiusM=5000');
      expect(callUrl).toContain('activeOnly=true');
    });

    it('debería manejar error al obtener alertas cercanas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(
        alertService.getNearbyAlerts(10.0, -84.0)
      ).rejects.toThrow('Error al obtener alertas cercanas');
    });
  });

  describe('getMyZoneAlerts', () => {
    it('debería obtener alertas de la zona del usuario', async () => {
      const mockAlerts = [
        { id: '1', title: 'Alerta zona 1' },
        { id: '2', title: 'Alerta zona 2' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      } as Response);

      const result = await alertService.getMyZoneAlerts();

      expect(result).toEqual(mockAlerts);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/alerts/my-zone`,
        expect.any(Object)
      );
    });

    it('debería manejar error al obtener alertas de zona', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Zona no configurada',
      } as Response);

      await expect(alertService.getMyZoneAlerts()).rejects.toThrow();
    });
  });

  describe('getHeatmapData', () => {
    it('debería obtener datos de heatmap', async () => {
      const mockHeatmap = [
        { latitude: 10.0, longitude: -84.0, count: 5, intensity: 0.8 },
        { latitude: 10.1, longitude: -84.1, count: 3, intensity: 0.5 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockHeatmap,
      } as Response);

      const result = await alertService.getHeatmapData(
        9.9, -84.1, 10.1, -83.9, 1000
      );

      expect(result).toEqual(mockHeatmap);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/alerts/heatmap'),
        expect.any(Object)
      );
    });

    it('debería usar gridSizeM por defecto', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await alertService.getHeatmapData(9.9, -84.1, 10.1, -83.9);

      const callUrl = (mockFetch.mock.calls[0][0] as string);
      expect(callUrl).toContain('gridSizeM=1000');
    });
  });

  describe('getAlertById', () => {
    it('debería obtener detalle de una alerta', async () => {
      const mockAlert = {
        id: '123',
        title: 'Alerta detallada',
        description: 'Descripción completa',
        category: 'EMERGENCY',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlert,
      } as Response);

      const result = await alertService.getAlertById('123');

      expect(result).toEqual(mockAlert);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/alerts/123`,
        expect.any(Object)
      );
    });

    it('debería manejar error cuando alerta no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(alertService.getAlertById('999')).rejects.toThrow(
        'Error al obtener detalle de alerta'
      );
    });
  });

  describe('getRecentAlerts', () => {
    it('debería obtener alertas recientes con paginación', async () => {
      const mockAlerts = [
        { id: '1', title: 'Reciente 1' },
        { id: '2', title: 'Reciente 2' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: mockAlerts }),
      } as Response);

      const result = await alertService.getRecentAlerts(0, 20);

      expect(result).toEqual(mockAlerts);
    });

    it('debería manejar respuesta sin paginación', async () => {
      const mockAlerts = [
        { id: '1', title: 'Alerta 1' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      } as Response);

      const result = await alertService.getRecentAlerts();

      expect(result).toEqual(mockAlerts);
    });

    it('debería usar valores por defecto para paginación', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

      await alertService.getRecentAlerts();

      const callUrl = (mockFetch.mock.calls[0][0] as string);
      expect(callUrl).toContain('page=0');
      expect(callUrl).toContain('size=20');
    });
  });

  describe('createAlertWithMedia', () => {
    it('debería crear alerta con archivos multimedia', async () => {
      const alertData = {
        category: 'EMERGENCY' as const,
        title: 'Alerta con evidencia',
        description: 'Descripción',
        latitude: 10.0,
        longitude: -84.0,
        radiusM: 500,
        isAnonymous: false,
      };

      const files = [
        {
          uri: 'file://image1.jpg',
          name: 'image1.jpg',
          type: 'image/jpeg',
        },
        {
          uri: 'file://image2.jpg',
          name: 'image2.jpg',
          type: 'image/jpeg',
        },
      ];

      const mockResponse = {
        id: '1',
        ...alertData,
        media: [
          { id: '1', url: '/uploads/image1.jpg', mimeType: 'image/jpeg' },
          { id: '2', url: '/uploads/image2.jpg', mimeType: 'image/jpeg' },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await alertService.createAlertWithMedia(alertData, files);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/alerts/with-media`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('debería manejar error de archivos muy grandes', async () => {
      const alertData = {
        category: 'EMERGENCY' as const,
        title: 'Test',
        description: 'Test',
        latitude: 10.0,
        longitude: -84.0,
        radiusM: 500,
        isAnonymous: false,
      };

      const files = [
        {
          uri: 'file://large.jpg',
          name: 'large.jpg',
          type: 'image/jpeg',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 413,
        text: async () => JSON.stringify({
          message: 'Maximum upload size exceeded',
        }),
      } as Response);

      await expect(
        alertService.createAlertWithMedia(alertData, files)
      ).rejects.toThrow('Los archivos seleccionados son demasiado grandes');
    });

    it('debería manejar otros errores del servidor', async () => {
      const alertData = {
        category: 'EMERGENCY' as const,
        title: 'Test',
        description: 'Test',
        latitude: 10.0,
        longitude: -84.0,
        radiusM: 500,
        isAnonymous: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({
          message: 'Datos inválidos',
        }),
      } as Response);

      await expect(
        alertService.createAlertWithMedia(alertData, [])
      ).rejects.toThrow('Datos inválidos');
    });
  });

  describe('getMediaUrl', () => {
    it('debería generar URL completa para media', () => {
      const relativePath = '/uploads/image.jpg';
      const fullUrl = alertService.getMediaUrl(relativePath);

      expect(fullUrl).toContain(relativePath);
      expect(fullUrl).not.toContain('/api');
    });
  });

  describe('getAlertStats', () => {
    it('debería obtener estadísticas de alertas', async () => {
      const mockStats = {
        totalAlerts: 100,
        activeAlerts: 50,
        resolvedAlerts: 45,
        cancelledAlerts: 5,
        alertsByCategory: {
          EMERGENCY: 30,
          PRECAUTION: 40,
          INFO: 30,
        },
        alertsByVerificationStatus: {
          VERIFIED: 60,
          PENDING: 30,
          REJECTED: 10,
        },
        falseReportsPercentage: 10,
        totalUsers: 500,
        activeUsers: 200,
        timeRange: '7d',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      } as Response);

      const result = await alertService.getAlertStats('7d');

      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/alerts/stats'),
        expect.any(Object)
      );
    });

    it('debería incluir cityId si se proporciona', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await alertService.getAlertStats('30d', 'city-123');

      const callUrl = (mockFetch.mock.calls[0][0] as string);
      expect(callUrl).toContain('timeRange=30d');
      expect(callUrl).toContain('cityId=city-123');
    });

    it('debería usar timeRange por defecto', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await alertService.getAlertStats();

      const callUrl = (mockFetch.mock.calls[0][0] as string);
      expect(callUrl).toContain('timeRange=7d');
    });

    it('debería manejar error al obtener estadísticas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(alertService.getAlertStats()).rejects.toThrow(
        'Error al obtener estadísticas'
      );
    });
  });
});
