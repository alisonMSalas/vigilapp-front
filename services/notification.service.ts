/**
 * Notification Service
 * Handles all notification-related API calls
 */

import { API_CONFIG, createHeaders } from './config/api.config';
import { Notification, NotificationPreferences } from './types/notification.types';

class NotificationService {
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
        throw new Error('Error al obtener notificaciones');
      }

      const data = await response.json();
      return data.content || data; // Handle Spring pagination
    } catch (error) {
      console.error('[NotificationService] Error getting notifications:', error);
      throw error;
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

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notifications/preferences`,
        {
          method: 'GET',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener preferencias');
      }

      return await response.json();
    } catch (error) {
      console.error('[NotificationService] Error getting preferences:', error);
      // Return default preferences if error
      return {
        alertsNearby: true,
        alertsResolved: true,
        zoneUpdates: true,
        systemNotifications: true,
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notifications/preferences`,
        {
          method: 'PUT',
          headers: await createHeaders('json'),
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        throw new Error('Error al actualizar preferencias');
      }
    } catch (error) {
      console.error('[NotificationService] Error updating preferences:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
