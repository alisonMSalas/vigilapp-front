import { ThemedText } from '@/components/themed-text';
import { notificationService } from '@/services/notification.service';
import { Notification, NotificationType } from '@/services/types/notification.types';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Función helper para navegar hacia atrás de forma segura
  const safeGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      console.log('[Notifications] => Cargando notificaciones...');
      const data = await notificationService.getNotifications();
      console.log('[Notifications]  Notificaciones cargadas:', data.length);
      setNotifications(data);
    } catch (error) {
      console.error('[Notifications] ❌ Error cargando notificaciones:', error);
      // Don't show alert - service already handles errors gracefully
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark as read if not read
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      }

      // Navigate based on notification type
      if (notification.data?.alertId) {
        router.push({
          pathname: '/alert-detail',
          params: { id: notification.data.alertId },
        });
      }
    } catch (error) {
      console.error('[Notifications] Error handling notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      Alert.alert('Éxito', 'Todas las notificaciones han sido marcadas como leídas');
    } catch (error) {
      console.error('[Notifications] Error marking all as read:', error);
      Alert.alert('Error', 'No se pudieron marcar las notificaciones como leídas');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro de que deseas eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notificationId);
              setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            } catch (error) {
              console.error('[Notifications] Error deleting notification:', error);
              Alert.alert('Error', 'No se pudo eliminar la notificación');
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: NotificationType): keyof typeof Feather.glyphMap => {
    switch (type) {
      case NotificationType.ALERT_CREATED:
        return 'alert-circle';
      case NotificationType.ALERT_NEARBY:
        return 'map-pin';
      case NotificationType.ALERT_RESOLVED:
        return 'check-circle';
      case NotificationType.ZONE_UPDATE:
        return 'map';
      case NotificationType.SYSTEM:
        return 'info';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.ALERT_CREATED:
        return '#f44336';
      case NotificationType.ALERT_NEARBY:
        return '#ff9800';
      case NotificationType.ALERT_RESOLVED:
        return '#4caf50';
      case NotificationType.ZONE_UPDATE:
        return '#2196f3';
      case NotificationType.SYSTEM:
        return '#9e9e9e';
      default:
        return '#005677';
    }
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = Date.now();
    const diff = now - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const color = getNotificationColor(item.type);
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.notificationUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Feather name={icon} size={24} color={color} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <ThemedText style={styles.notificationTitle}>
              {item.title || 'Sin título'}
            </ThemedText>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <ThemedText style={styles.notificationMessage}>
            {item.message || 'Sin descripción'}
          </ThemedText>
          <ThemedText style={styles.notificationTime}>{getRelativeTime(item.createdAt)}</ThemedText>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={20} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell-off" size={64} color="#ccc" />
      <ThemedText style={styles.emptyTitle}>No hay notificaciones</ThemedText>
      <ThemedText style={styles.emptySubtext}>
        Cuando recibas alertas o actualizaciones, aparecerán aquí
      </ThemedText>
    </View>
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={safeGoBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Notificaciones</ThemedText>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <ThemedText style={styles.markAllText}>Marcar todas</ThemedText>
            </TouchableOpacity>
          )}
          {unreadCount === 0 && <View style={{ width: 100 }} />}
        </View>

        {/* Unread counter */}
        {unreadCount > 0 && (
          <View style={styles.unreadCounter}>
            <Feather name="bell" size={16} color="#005677" />
            <ThemedText style={styles.unreadCounterText}>
              {unreadCount} sin leer
            </ThemedText>
          </View>
        )}

        {/* Notifications List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005677" />
            <ThemedText style={styles.loadingText}>Cargando notificaciones...</ThemedText>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={
              notifications.length === 0 ? styles.emptyList : styles.list
            }
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#005677"
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005677',
  },
  unreadCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#e3f2fd',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  unreadCounterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005677',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  notificationUnread: {
    backgroundColor: '#f8fbfd',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#005677',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
