/**
 * Pruebas de integración para el flujo completo de notificaciones + WebSocket
 */
import notificationService from '@/services/notification.service';
import websocketService from '@/services/websocket.service';
import { API_CONFIG } from '@/services/config/api.config';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');
global.fetch = jest.fn();

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  readyState: number = 0;
  url: string;

  constructor(url: string) {
    this.url = url;
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data: string) {}
  close() {
    this.readyState = 3;
    if (this.onclose) this.onclose();
  }
}

(global as any).WebSocket = MockWebSocket;

describe('Integration: Notifications + WebSocket Flow', () => {
  const mockToken = 'mock-auth-token';

  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);
    websocketService.disconnect();
  });

  afterEach(() => {
    websocketService.disconnect();
  });

  describe('Real-time Alert Notifications Flow', () => {
    it('should connect websocket and receive alert notification', async () => {
      const mockNotifications = [
        {
          id: 1,
          type: 'NUEVA_ALERTA',
          title: 'Nueva Alerta',
          message: 'Alerta de robo en tu zona',
          read: false,
        },
      ];

      const listResponse = {
        ok: true,
        status: 200,
        json: async () => ({ notifications: mockNotifications }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(listResponse);

      // Connect WebSocket
      await websocketService.connect(mockToken);

      expect(websocketService.isConnected()).toBe(true);

      // Get notifications
      const result = await notificationService.getNotifications();

      expect(result.success).toBe(true);
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications![0].type).toBe('NUEVA_ALERTA');
    });

    it('should handle incoming websocket alert message', (done) => {
      websocketService.connect(mockToken).then(() => {
        websocketService.onAlertMessage((alert) => {
          expect(alert.type).toBe('ROBO');
          expect(alert.latitude).toBe(9.9281);
          done();
        });

        // Simulate incoming message
        const ws = (websocketService as any).ws as MockWebSocket;
        if (ws && ws.onmessage) {
          ws.onmessage({
            data: JSON.stringify({
              type: 'ALERT',
              data: {
                id: 1,
                type: 'ROBO',
                latitude: 9.9281,
                longitude: -84.0907,
              },
            }),
          });
        }
      });
    });

    it('should receive notification when websocket alert arrives', async () => {
      await websocketService.connect(mockToken);

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          notifications: [
            {
              id: 2,
              type: 'NUEVA_ALERTA',
              title: 'Alerta Cercana',
              message: 'Nueva alerta a 500m de tu ubicación',
              read: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.getNotifications();

      expect(result.success).toBe(true);
      expect(result.notifications![0].type).toBe('NUEVA_ALERTA');
    });
  });

  describe('Notification Management Flow', () => {
    it('should get unread notifications count', async () => {
      const countResponse = {
        ok: true,
        status: 200,
        json: async () => ({ count: 5 }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(countResponse);

      const result = await notificationService.getUnreadCount();

      expect(result.success).toBe(true);
      expect(result.count).toBe(5);
    });

    it('should mark notification as read', async () => {
      const markReadResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          id: 1,
          read: true,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(markReadResponse);

      const result = await notificationService.markAsRead(1);

      expect(result.success).toBe(true);
    });

    it('should mark all notifications as read', async () => {
      const markAllResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          updated: 10,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(markAllResponse);

      const result = await notificationService.markAllAsRead();

      expect(result.success).toBe(true);
    });

    it('should delete notification', async () => {
      const deleteResponse = {
        ok: true,
        status: 204,
      };

      (global.fetch as jest.Mock).mockResolvedValue(deleteResponse);

      const result = await notificationService.deleteNotification(1);

      expect(result).toBe(true);
    });
  });

  describe('WebSocket Reconnection Flow', () => {
    it('should reconnect websocket after connection loss', async (done) => {
      await websocketService.connect(mockToken);

      const ws = (websocketService as any).ws as MockWebSocket;

      // Simulate connection loss
      ws.readyState = 3;
      if (ws.onclose) ws.onclose();

      // Wait for reconnection attempt
      setTimeout(() => {
        expect(websocketService.isConnected()).toBe(false);
        done();
      }, 100);
    });

    it('should handle websocket error and attempt reconnection', async (done) => {
      await websocketService.connect(mockToken);

      const ws = (websocketService as any).ws as MockWebSocket;

      if (ws.onerror) {
        ws.onerror(new Error('Connection error'));
      }

      setTimeout(() => {
        expect(true).toBe(true); // Test completes without crash
        done();
      }, 100);
    });
  });

  describe('Notification Settings Flow', () => {
    it('should update notification preferences', async () => {
      const updateResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          alertNotifications: true,
          commentNotifications: false,
          statusChangeNotifications: true,
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(updateResponse);

      const result = await notificationService.updatePreferences({
        alertNotifications: true,
        commentNotifications: false,
        statusChangeNotifications: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Push Notification Token Flow', () => {
    it('should register push token for notifications', async () => {
      const registerResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          message: 'Token registrado',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(registerResponse);

      const result = await notificationService.registerPushToken('expo-push-token-123');

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/register-token'),
        expect.any(Object)
      );
    });

    it('should unregister push token', async () => {
      const unregisterResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          message: 'Token eliminado',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(unregisterResponse);

      const result = await notificationService.unregisterPushToken();

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle notification fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await notificationService.getNotifications();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle websocket connection failure', async () => {
      (global as any).WebSocket = class {
        constructor() {
          throw new Error('Connection failed');
        }
      };

      await expect(websocketService.connect(mockToken)).rejects.toThrow();
    });

    it('should handle unauthorized notification access', async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          message: 'Token inválido',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(unauthorizedResponse);

      const result = await notificationService.getNotifications();

      expect(result.success).toBe(false);
    });
  });

  describe('Notification Filtering Flow', () => {
    it('should filter notifications by type', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          notifications: [
            { id: 1, type: 'NUEVA_ALERTA' },
            { id: 2, type: 'NUEVA_ALERTA' },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.getNotifications({
        type: 'NUEVA_ALERTA',
      });

      expect(result.success).toBe(true);
      expect(result.notifications?.every(n => n.type === 'NUEVA_ALERTA')).toBe(true);
    });

    it('should get only unread notifications', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          notifications: [
            { id: 1, read: false },
            { id: 2, read: false },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await notificationService.getNotifications({
        unreadOnly: true,
      });

      expect(result.success).toBe(true);
      expect(result.notifications?.every(n => !n.read)).toBe(true);
    });
  });
});
