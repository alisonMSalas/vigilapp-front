/**
 * Notification Service
 * Handles all notification-related API calls and push notifications
 */

import * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';
import { API_CONFIG, createHeaders } from './config/api.config';
import { Notification } from './types/notification.types';
import { AlertCategory } from './alert.service';

// Configure how notifications should be displayed
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  /**
   * Check if the app has notification permissions
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await ExpoNotifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[NotificationService] Error checking permissions:', error);
      return false;
    }
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[NotificationService] Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Show a local notification for a new alert
   */
  async showAlertNotification(
    title: string,
    body: string,
    category: AlertCategory,
    alertId: string
  ): Promise<void> {
    try {
      // Validate inputs
      if (!title || !body) {
        console.error('[NotificationService] Cannot show notification: title or body is missing');
        return;
      }

      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: String(title),
          body: String(body),
          data: { alertId, category },
          sound: true,
          priority: ExpoNotifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });

      console.log('[NotificationService] ✅ Notification shown:', title);
    } catch (error) {
      console.error('[NotificationService] Error showing notification:', error);
    }
  }
  /**
   * Get all notifications for the current user
   */
  async getNotifications(page: number = 0, size: number = 20): Promise<Notification[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notifications?${params}`,
        {
          method: 'GET',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        // If endpoint doesn't exist (404) or not implemented (501), return empty array
        if (response.status === 404 || response.status === 501) {
          console.log('[NotificationService] ℹ️ Endpoint de notificaciones no disponible aún');
          return [];
        }
        const errorText = await response.text().catch(() => '');
        console.error('[NotificationService] Error response:', response.status, errorText);
        throw new Error('Error al obtener notificaciones');
      }

      const data = await response.json();
      return data.content || data; // Handle Spring pagination
    } catch (error) {
      console.error('[NotificationService] Error getting notifications:', error);
      // Return empty array instead of throwing to allow UI to work
      return [];
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notifications/unread/count`,
        {
          method: 'GET',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener contador de notificaciones');
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('[NotificationService] Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al marcar notificación como leída');
      }
    } catch (error) {
      console.error('[NotificationService] Error marking as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notifications/read-all`,
        {
          method: 'PUT',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al marcar todas como leídas');
      }
    } catch (error) {
      console.error('[NotificationService] Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar notificación');
      }
    } catch (error) {
      console.error('[NotificationService] Error deleting notification:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
