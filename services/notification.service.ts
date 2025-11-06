/**
 * Servicio de notificaciones nativas
 * Maneja notificaciones locales usando expo-notifications
 */

import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  /**
   * Solicitar permisos de notificaciones
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NotificationService] ⚠️ Permisos de notificación denegados');
        return false;
      }

      // Configurar canal de notificaciones en Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('alerts', {
          name: 'Alertas de VigilApp',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#005677',
          sound: 'default',
        });
      }

      console.log('[NotificationService] ✅ Permisos de notificación otorgados');
      return true;
    } catch (error) {
      console.error('[NotificationService] ❌ Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Mostrar notificación de nueva alerta
   */
  async showAlertNotification(
    title: string,
    body: string,
    category: string,
    alertId: string
  ): Promise<void> {
    try {
      // Vibrar
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      // Obtener ícono según categoría
      const icon = this.getCategoryIcon(category);

      // Mostrar notificación
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${icon} Nueva Alerta`,
          body: `${title}\n${body}`,
          data: {
            alertId,
            category,
            type: 'alert',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: null, // Mostrar inmediatamente
      });

      console.log('[NotificationService] ✅ Notificación mostrada:', title);
    } catch (error) {
      console.error('[NotificationService] ❌ Error mostrando notificación:', error);
    }
  }

  /**
   * Obtener el ícono correcto según la categoría
   */
  private getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      EMERGENCY: '🚨',
      PRECAUTION: '⚠️',
      INFO: 'ℹ️',
      COMMUNITY: '👥',
    };
    return icons[category] || '🔔';
  }

  /**
   * Limpiar todas las notificaciones
   */
  async clearAll(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      console.log('[NotificationService] ✅ Notificaciones limpiadas');
    } catch (error) {
      console.error('[NotificationService] ❌ Error limpiando notificaciones:', error);
    }
  }

  /**
   * Verificar si hay permisos
   */
  async hasPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Agregar listener para cuando se toca una notificación
   * Retorna función para remover el listener
   */
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(callback);
    return () => {
      Notifications.removeNotificationSubscription(subscription);
    };
  }

  /**
   * Obtener la última notificación que se tocó (útil para deep linking)
   */
  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return await Notifications.getLastNotificationResponseAsync();
  }
}

export const notificationService = new NotificationService();
export default notificationService;
