import BottomNavbar, { BottomTabKey } from "@/components/BottomNavbar";
import TopHeader from "@/components/TopHeader";
import { ThemedText } from "@/components/themed-text";
import {
  AlertCategory,
  alertService,
  Alert as AlertType,
} from "@/services/alert.service";
import { locationService } from "@/services/location.service";
import { notificationService } from "@/services/notification.service";
import { calculateDistance, formatDistance } from "@/services/utils/geolocation.utils";
import { userZoneService } from "@/services/user-zone.service";
import {
  AlertNotification,
  webSocketService,
} from "@/services/websocket.service";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AlertData {
  id: string;
  type: "warning" | "community" | "info" | "emergency";
  title: string;
  description: string;
  distance: string;
  time: string;
  isNew?: boolean;
  icon: keyof typeof Feather.glyphMap;
}

const securityTips = [
  {
    icon: "phone",
    title: "Números de Emergencia",
    description:
      "Mantén siempre a mano los números 911, 101 (Policía) y 102 (Bomberos)",
  },
  {
    icon: "map-pin",
    title: "Comparte tu Ubicación",
    description:
      "Activa la ubicación en tiempo real para recibir alertas más precisas",
  },
];

export default function HomeScreen() {
  const [active, setActive] = useState<BottomTabKey>("home");
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAlertsCount, setNewAlertsCount] = useState(0);
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);
  const userName = "Rafa"; // TODO: Obtener del usuario autenticado
  const router = useRouter();

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Solicitar permisos de notificaciones
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      const hasPermissions = await notificationService.hasPermissions();
      if (!hasPermissions) {
        console.log('[Home] 📢 Solicitando permisos de notificación...');
        await notificationService.requestPermissions();
      }
    };
    requestNotificationPermissions();
  }, []);

  // Conectar al WebSocket
  useEffect(() => {
    webSocketService.connect();

    const unsubscribe = webSocketService.onMessage(
      (notification: AlertNotification) => {
        handleNewAlert(notification);
      }
    );

    return () => {
      unsubscribe();
      webSocketService.disconnect();
    };
  }, []);

  // Recargar datos cuando la pantalla recupera el foco
  useFocusEffect(
    useCallback(() => {
      console.log("[Home] 🔄 Pantalla enfocada, recargando datos...");
      loadInitialData();
    }, [])
  );

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Cargar zona del usuario
      try {
        const userZone = await userZoneService.getUserZone();
        if (userZone) {
          setRadiusKm(userZone.radiusM / 1000);
          console.log("[Home] ✅ Zona cargada:", userZone);
        } else {
          console.log("[Home] ℹ️ Usuario sin zona configurada");
        }
      } catch (zoneError) {
        console.error("[Home] ⚠️ Error cargando zona:", zoneError);
        const errorMsg =
          zoneError instanceof Error ? zoneError.message : "Error desconocido";
        console.log("[Home] ℹ️ Mensaje de error:", errorMsg);
        // No es un error crítico, continuar sin zona
      }

      // Cargar alertas de la zona del usuario
      try {
        const myZoneAlerts = await alertService.getMyZoneAlerts();

        // Sort by createdAt descending (newest first)
        const sortedAlerts = [...myZoneAlerts].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Mapear alertas del backend al formato del frontend
        const mappedAlerts = sortedAlerts.map((alert) =>
          mapAlertToFrontend(alert)
        );
        setAlerts(mappedAlerts);

        // Contar alertas activas
        const activeCount = myZoneAlerts.filter(
          (a) => a.status === "ACTIVE"
        ).length;
        setActiveAlertsCount(activeCount);

        console.log("[Home] ✅ Alertas cargadas:", mappedAlerts.length);
      } catch (alertsError) {
        console.error("[Home] ⚠️ Error cargando alertas:", alertsError);
        const errorMsg =
          alertsError instanceof Error
            ? alertsError.message
            : "Error desconocido";
        console.log("[Home] ℹ️ Mensaje de error:", errorMsg);
        // No es un error crítico, continuar sin alertas
        setAlerts([]);
      }
    } catch (error) {
      console.error("[Home] ❌ Error loading initial data:", error);
      // No mostrar alert al usuario, solo log
    } finally {
      setLoading(false);
    }
  };

  const mapAlertToFrontend = (alert: AlertType): AlertData => {
    return {
      id: alert.id,
      type: mapCategoryToType(alert.category),
      title: alert.title,
      description: alert.description,
      distance: "Calculando...", // TODO: calcular distancia real
      time: getRelativeTime(alert.createdAt),
      isNew: isAlertNew(alert.createdAt),
      icon: getIconForCategory(alert.category),
    };
  };

  const isAlertNew = (createdAt: string): boolean => {
    const alertTime = new Date(createdAt).getTime();
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    return now - alertTime < oneHour;
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = Date.now();
    const diff = now - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "hace un momento";
    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours} hora${hours > 1 ? "s" : ""}`;
    return `hace ${days} día${days > 1 ? "s" : ""}`;
  };

  const handleNewAlert = async (notification: AlertNotification) => {
    try {
      console.log('[Home] 🔔 Nueva alerta recibida:', notification.alertTitle);

      // 1. Obtener ubicación actual del usuario
      const userLocation = await locationService.getCurrentLocation();
      if (!userLocation) {
        console.log('[Home] ⚠️ No se pudo obtener ubicación del usuario, mostrando alerta sin filtrar');
        // Si no hay ubicación, mostrar la alerta de todas formas
        showAlertNotification(notification, "Distancia desconocida");
        return;
      }

      // 2. Obtener radio configurado del usuario
      const userZone = await userZoneService.getUserZone();
      if (!userZone) {
        console.log('[Home] ⚠️ Usuario sin zona configurada, mostrando alerta sin filtrar');
        // Si no hay zona configurada, mostrar la alerta
        showAlertNotification(notification, "Distancia desconocida");
        return;
      }

      // 3. Calcular distancia entre usuario y alerta
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        notification.latitude,
        notification.longitude
      );

      console.log('[Home] 📏 Distancia calculada:', formatDistance(distance));
      console.log('[Home] 📍 Radio configurado:', formatDistance(userZone.radiusM));

      // 4. Verificar si está dentro del rango
      if (distance <= userZone.radiusM) {
        console.log('[Home] ✅ Alerta dentro del rango, mostrando notificación');
        showAlertNotification(notification, formatDistance(distance));
      } else {
        console.log('[Home] ❌ Alerta fuera del rango, ignorando');
        console.log(`  Distancia: ${formatDistance(distance)} > Radio: ${formatDistance(userZone.radiusM)}`);
      }
    } catch (error) {
      console.error('[Home] ❌ Error procesando nueva alerta:', error);
      // En caso de error, mostrar la alerta para no perder información importante
      showAlertNotification(notification, "Error calculando distancia");
    }
  };

  /**
   * Mostrar notificación y agregar alerta a la lista
   */
  const showAlertNotification = (notification: AlertNotification, distance: string) => {
    // Mostrar notificación nativa
    notificationService.showAlertNotification(
      notification.alertTitle,
      notification.alertDescription,
      notification.alertCategory,
      notification.alertId
    );

    // Agregar alerta a la lista
    const newAlert: AlertData = {
      id: notification.alertId,
      type: mapCategoryToType(notification.alertCategory),
      title: notification.alertTitle,
      description: notification.alertDescription,
      distance: distance,
      time: "hace un momento",
      isNew: true,
      icon: getIconForCategory(notification.alertCategory),
    };

    setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
    setNewAlertsCount((prev) => prev + 1);
    setActiveAlertsCount((prev) => prev + 1);

    console.log('[Home] ✅ Alerta agregada a la lista');
  };

  const mapCategoryToType = (category: AlertCategory): AlertData["type"] => {
    switch (category) {
      case "EMERGENCY":
        return "emergency";
      case "PRECAUTION":
        return "warning";
      case "COMMUNITY":
        return "community";
      case "INFO":
      default:
        return "info";
    }
  };

  const getIconForCategory = (
    category: AlertCategory
  ): keyof typeof Feather.glyphMap => {
    switch (category) {
      case "EMERGENCY":
      case "PRECAUTION":
        return "alert-triangle";
      case "COMMUNITY":
        return "users";
      case "INFO":
      default:
        return "info";
    }
  };

  const handleTabPress = (tab: BottomTabKey) => {
    setActive(tab);
    if (tab === "alerts") {
      router.push("/alerts");
    } else if (tab === "create") {
      router.push("/create-alert");
    } else if (tab === "map") {
      router.push("/map");
    }
  };

  const handleReportIncident = () => {
    router.push("/create-alert");
  };

  const handleViewMap = () => {
    router.push("/map");
  };

  const handleConfigure = () => {
    router.push("/settings");
  };

  const handleAlertPress = (alert: AlertData) => {
    router.push({
      pathname: "/alert-detail",
      params: {
        id: alert.id,
        type: alert.type,
      },
    });
  };

  const handleProfilePress = () => {
    // El menú se maneja dentro del componente TopHeader
  };

  const handleLogout = () => {
    router.replace("/login");
  };

  const handleNotificationsPress = () => {
    router.push("/notifications");
  };

  const getAlertIconColor = (type: AlertData["type"]) => {
    switch (type) {
      case "emergency":
        return "#f44336";
      case "warning":
        return "#ffc107";
      case "community":
        return "#4caf50";
      case "info":
        return "#2196f3";
      default:
        return "#757575";
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <TopHeader
          notificationsCount={newAlertsCount}
          onLogout={handleLogout}
          onPressNotifications={handleNotificationsPress}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005677" />
            <ThemedText style={styles.loadingText}>
              Cargando alertas...
            </ThemedText>
          </View>
        )}

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Blue Header Section */}
          <View style={styles.blueSection}>
            <ThemedText style={styles.greeting}>¡Hola, {userName}!</ThemedText>
            <ThemedText style={styles.subtitle}>
              Mantente informada sobre la seguridad en tu zona
            </ThemedText>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={handleReportIncident}
                activeOpacity={0.9}
              >
                <ThemedText style={styles.reportButtonText}>
                  Reportar Incidencia
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleViewMap}
                activeOpacity={0.9}
              >
                <ThemedText style={styles.mapButtonText}>Ver Mapa</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* White Content Section */}
          <View style={styles.whiteSection}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <Feather name="map-pin" size={18} color="#333" />
                <ThemedText style={styles.sectionTitleText}>
                  Estado de Mi Zona
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.configButton}
                onPress={handleConfigure}
              >
                <ThemedText style={styles.configButtonText}>
                  Configurar
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>
                  {radiusKm ? `${radiusKm.toFixed(1)} km` : "--"}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Radio</ThemedText>
              </View>

              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>
                  {activeAlertsCount}
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Alertas Activas
                </ThemedText>
              </View>

              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>--</ThemedText>
                <ThemedText style={styles.statLabel}>
                  Vecinos Activos
                </ThemedText>
              </View>

              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>--</ThemedText>
                <ThemedText style={styles.statLabel}>Confiabilidad</ThemedText>
              </View>
            </View>

            {/* Security Status Bar */}
            <View style={styles.securityBar}>
              <Feather name="check-circle" size={20} color="#4caf50" />
              <ThemedText style={styles.securityText}>
                Tu zona está segura
              </ThemedText>
            </View>
          </View>

          {/* Recent Alerts Section */}
          <View style={styles.alertsSection}>
            <View style={styles.alertsHeader}>
              <View style={styles.alertsTitle}>
                <Feather name="alert-triangle" size={20} color="#fff" />
                <ThemedText style={styles.alertsTitleText}>
                  Alertas Recientes
                </ThemedText>
              </View>
              <TouchableOpacity>
                <ThemedText style={styles.seeAllText}>Ver todas</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.alertsList}>
              {!radiusKm && alerts.length === 0 && (
                <View style={styles.emptyState}>
                  <Feather name="map-pin" size={48} color="#ccc" />
                  <ThemedText style={styles.emptyStateTitle}>
                    Configura tu zona
                  </ThemedText>
                  <ThemedText style={styles.emptyStateText}>
                    Para recibir alertas relevantes, primero debes configurar tu
                    ubicación y radio de vigilancia
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.configureZoneButton}
                    onPress={handleConfigure}
                  >
                    <Feather name="settings" size={20} color="#fff" />
                    <ThemedText style={styles.configureZoneButtonText}>
                      Configurar ahora
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
              {alerts.map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  style={styles.alertCard}
                  onPress={() => handleAlertPress(alert)}
                >
                  <View style={styles.alertIconContainer}>
                    <View
                      style={[
                        styles.alertIcon,
                        { backgroundColor: getAlertIconColor(alert.type) },
                      ]}
                    >
                      <Feather name={alert.icon} size={20} color="#000" />
                    </View>
                  </View>
                  <View style={styles.alertContent}>
                    <View style={styles.alertHeader}>
                      <ThemedText style={styles.alertTitle}>
                        {alert.title}
                      </ThemedText>
                      {alert.isNew && (
                        <View style={styles.newBadge}>
                          <ThemedText style={styles.newBadgeText}>
                            NUEVA
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText style={styles.alertDescription}>
                      {alert.description}
                    </ThemedText>
                    <View style={styles.alertMeta}>
                      <View style={styles.alertMetaItem}>
                        <Feather name="map-pin" size={12} color="#666" />
                        <ThemedText style={styles.alertMetaText}>
                          {alert.distance}
                        </ThemedText>
                      </View>
                      <View style={styles.alertMetaItem}>
                        <Feather name="clock" size={12} color="#666" />
                        <ThemedText style={styles.alertMetaText}>
                          {alert.time}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Security Tips Section */}
          <View style={styles.tipsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <Feather name="shield" size={18} color="#005677" />
                <ThemedText style={styles.sectionTitleText}>
                  Consejos de Seguridad
                </ThemedText>
              </View>
            </View>

            {securityTips.map((tip, index) => (
              <TouchableOpacity key={index} style={styles.tipCard}>
                <View style={styles.tipIcon}>
                  <Feather
                    name={tip.icon as keyof typeof Feather.glyphMap}
                    size={20}
                    color="#fff"
                  />
                </View>
                <View style={styles.tipContent}>
                  <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
                  <ThemedText style={styles.tipDescription}>
                    {tip.description}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <BottomNavbar active={active} onTabPress={handleTabPress} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  scroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#005677",
    fontWeight: "600",
  },
  blueSection: {
    backgroundColor: "#005677",
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 12,
  },
  reportButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#005677",
  },
  mapButton: {
    backgroundColor: "#006fa3",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  whiteSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  configButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  configButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    flex: 1,
    minWidth: "45%",
    maxWidth: "48%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  securityBar: {
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  securityText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4caf50",
  },
  alertsSection: {
    backgroundColor: "#fff",
    paddingTop: 24,
    paddingBottom: 24,
  },
  alertsHeader: {
    backgroundColor: "#005677",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  alertsTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  alertsTitleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  alertsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIconContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  alertTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  newBadge: {
    backgroundColor: "#005677",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  alertDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 4,
  },
  alertMeta: {
    flexDirection: "row",
    gap: 16,
  },
  alertMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alertMetaText: {
    fontSize: 12,
    color: "#666",
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#005677",
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  configureZoneButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#005677",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  configureZoneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
