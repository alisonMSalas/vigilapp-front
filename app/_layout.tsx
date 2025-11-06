import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Verificar si la app se abrió desde una notificación (cuando estaba cerrada)
    Notifications.getLastNotificationResponseAsync()
      .then(response => {
        if (response) {
          console.log('[App] 🚀 App abierta desde notificación:', response);
          const data = response.notification.request.content.data;

          if (data.alertId) {
            console.log('[App] 🔄 Navegando a alerta:', data.alertId);
            // Dar tiempo para que la navegación esté lista
            setTimeout(() => {
              router.push({
                pathname: '/alert-detail',
                params: {
                  id: data.alertId,
                  type: data.category?.toLowerCase() || 'info',
                },
              });
            }, 1000);
          }
        }
      });

    // Listener para cuando llega una notificación mientras la app está abierta
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[App] 📨 Notificación recibida:', notification);
    });

    // Listener para cuando el usuario toca una notificación (app en foreground o background)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[App] 👆 Notificación tocada:', response);

      const data = response.notification.request.content.data;

      // Si la notificación tiene alertId, navegar al detalle
      if (data.alertId) {
        console.log('[App] 🔄 Navegando a alerta:', data.alertId);
        router.push({
          pathname: '/alert-detail',
          params: {
            id: data.alertId,
            type: data.category?.toLowerCase() || 'info',
          },
        });
      }
    });

    // Cleanup listeners al desmontar
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="location" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="alerts" options={{ headerShown: false }} />
          <Stack.Screen name="create-alert" options={{ headerShown: false }} />
          <Stack.Screen name="alert-detail" options={{ headerShown: false }} />
          <Stack.Screen name="map" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
