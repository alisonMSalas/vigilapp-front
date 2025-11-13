/**
 * Notification related types
 */

export enum NotificationType {
  ALERT_CREATED = 'ALERT_CREATED',
  ALERT_NEARBY = 'ALERT_NEARBY',
  ALERT_RESOLVED = 'ALERT_RESOLVED',
  ZONE_UPDATE = 'ZONE_UPDATE',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // Datos adicionales (ej: alertId, coordenadas, etc.)
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
