/**
 * Pruebas unitarias para NotificationService
 */
import * as ExpoNotifications from 'expo-notifications';
import { notificationService } from '../notification.service';
import { API_CONFIG } from '../config/api.config';
import * as SecureStore from 'expo-secure-store';

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('NotificationService', () => {
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);
  });

  describe('hasPermissions', () => {
    it('debería retornar true si hay permisos', async () => {
      (ExpoNotifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const result = await notificationService.hasPermissions();

      expect(result).toBe(true);
    });

    it('debería retornar false si no hay permisos', async () => {
      (ExpoNotifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await notificationService.hasPermissions();

      expect(result).toBe(false);
    });

    it('debería manejar error al verificar permisos', async () => {
      (ExpoNotifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Permission error')
      );

      const result = await notificationService.hasPermissions();

      expect(result).toBe(false);
    });
  });

  describe('requestPermissions', () => {
    it('debería solicitar y retornar permisos otorgados', async () => {
      (ExpoNotifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const result = await notificationService.requestPermissions();

      expect(result).toBe(true);
    });

    it('debería manejar permisos denegados', async () => {
      (ExpoNotifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await notificationService.requestPermissions();

      expect(result).toBe(false);
    });

    it('debería manejar error al solicitar permisos', async () => {
      (ExpoNotifications.requestPermissionsAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Permission error')
      );

      const result = await notificationService.requestPermissions();

      expect(result).toBe(false);
    });
  });

  describe('showAlertNotification', () => {
    it('debería mostrar notificación local', async () => {
      (ExpoNotifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('notification-id');

      await notificationService.showAlertNotification(
        'Alerta de emergencia',
        'Robo en progreso',
        'EMERGENCY',
        'alert-123'
      );

      expect(ExpoNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Alerta de emergencia',
          body: 'Robo en progreso',
          data: { alertId: 'alert-123', category: 'EMERGENCY' },
          sound: true,
          priority: ExpoNotifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    });

    it('no debería mostrar notificación sin título', async () => {
      await notificationService.showAlertNotification(
        '',
        'Body',
        'EMERGENCY',
        'alert-123'
      );

      expect(ExpoNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('no debería mostrar notificación sin body', async () => {
      await notificationService.showAlertNotification(
        'Title',
        '',
        'EMERGENCY',
        'alert-123'
      );

      expect(ExpoNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('debería manejar error al mostrar notificación', async () => {
      (ExpoNotifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Notification error')
      );

      await expect(
        notificationService.showAlertNotification(
          'Title',
          'Body',
          'EMERGENCY',
          'alert-123'
        )
      ).resolves.not.toThrow();
    });
  });

  describe('getNotifications', () => {
    it('debería obtener lista de notificaciones', async () => {
      const mockNotifications = [
        {
          id: '1',
          userId: 'user-1',
          alertId: 'alert-1',
          alertTitle: 'Alerta 1',
          alertDescription: 'Descripción 1',
          alertCategory: 'EMERGENCY',
          isRead: false,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          userId: 'user-1',
          alertId: 'alert-2',
          alertTitle: 'Alerta 2',
          alertDescription: 'Descripción 2',
          alertCategory: 'INFO',
          isRead: true,
          createdAt: '2024-01-02T00:00:00Z',
          readAt: '2024-01-02T01:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: mockNotifications }),
      } as Response);

      const result = await notificationService.getNotifications();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].type).toBe('ALERT_NEARBY');
      expect(result[1].type).toBe('ALERT_UPDATE');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications'),
        expect.any(Object)
      );
    });

    it('debería manejar respuesta sin paginación', async () => {
      const mockNotifications = [
        {
          id: '1',
          userId: 'user-1',
          alertId: 'alert-1',
          alertTitle: 'Test',
          alertDescription: 'Test',
          alertCategory: 'EMERGENCY',
          isRead: false,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotifications,
      } as Response);

      const result = await notificationService.getNotifications();

      expect(result).toHaveLength(1);
    });

    it('debería retornar array vacío si endpoint no existe', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      } as Response);

      const result = await notificationService.getNotifications();

      expect(result).toEqual([]);
    });

    it('debería manejar error de red', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await notificationService.getNotifications();

      expect(result).toEqual([]);
    });
  });

  describe('getUnreadCount', () => {
    it('debería obtener contador de notificaciones no leídas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 5 }),
      } as Response);

      const result = await notificationService.getUnreadCount();

      expect(result).toBe(5);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/notifications/unread/count`,
        expect.any(Object)
      );
    });

    it('debería retornar 0 si no hay count en respuesta', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const result = await notificationService.getUnreadCount();

      expect(result).toBe(0);
    });

    it('debería manejar error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await notificationService.getUnreadCount();

      expect(result).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('debería marcar notificación como leída', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      await notificationService.markAsRead('notif-123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/notifications/notif-123/read`,
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('debería manejar error al marcar como leída', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(
        notificationService.markAsRead('notif-999')
      ).rejects.toThrow('Error al marcar notificación como leída');
    });
  });

  describe('markAllAsRead', () => {
    it('debería marcar todas las notificaciones como leídas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      await notificationService.markAllAsRead();

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/notifications/read-all`,
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('debería manejar error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(
        notificationService.markAllAsRead()
      ).rejects.toThrow('Error al marcar todas como leídas');
    });
  });

  describe('deleteNotification', () => {
    it('debería eliminar notificación', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      await notificationService.deleteNotification('notif-123');

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/notifications/notif-123`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('debería manejar error al eliminar', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(
        notificationService.deleteNotification('notif-999')
      ).rejects.toThrow('Error al eliminar notificación');
    });
  });
});
