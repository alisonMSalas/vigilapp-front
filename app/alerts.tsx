import AlertCard from "@/components/AlertCard";
import BottomNavbar, { BottomTabKey } from "@/components/BottomNavbar";
import { ThemedText } from "@/components/themed-text";
import TopHeader from "@/components/TopHeader";
import {
  AlertCategory,
  alertService,
  Alert as AlertType,
} from "@/services/alert.service";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AlertData {
  id: string;
  type: "emergency" | "warning" | "community" | "info";
  title: string;
  description: string;
  distance: string;
  time: string;
  city: string;
  status: string;
  reports: string;
  isNew?: boolean;
  icon: keyof typeof Feather.glyphMap;
}

export default function AlertsScreen() {
  const [active, setActive] = useState<BottomTabKey>("alerts");
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"all" | AlertCategory>(
    "all"
  );
  const [selectedTypeLabel, setSelectedTypeLabel] = useState("Todos los tipos");
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const myZoneAlerts = await alertService.getMyZoneAlerts();

      // Sort by createdAt descending (newest first)
      const sortedAlerts = [...myZoneAlerts].sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      const mappedAlerts = sortedAlerts.map((alert) =>
        mapAlertToFrontend(alert)
      );
      setAlerts(mappedAlerts);
      console.log("[Alerts] ✅ Alertas cargadas:", mappedAlerts.length);
    } catch (error) {
      console.log(
        "[Alerts] ℹ️ No se pudieron cargar alertas (puede ser que no haya zona configurada)"
      );
      setAlerts([]);
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
      distance: "Calculando...",
      time: getRelativeTime(alert.createdAt),
      city: alert.cityId || "Sin ciudad",
      status: getStatusLabel(alert.status),
      reports: "-- reportes",
      isNew: isAlertNew(alert.createdAt),
      icon: getIconForCategory(alert.category),
    };
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
        return "info";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "ACTIVE":
        return "Activa";
      case "RESOLVED":
        return "Resuelta";
      case "CANCELLED":
        return "Cancelada";
      case "EXPIRED":
        return "Expirada";
      default:
        return status;
    }
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

  const filteredAlerts =
    selectedType === "all"
      ? alerts
      : alerts.filter(
          (alert) =>
            alert.type === mapCategoryToType(selectedType as AlertCategory)
        );

  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => a.status === "Activa").length,
    verified: alerts.filter((a) => a.status === "Verificada").length,
    resolved: alerts.filter((a) => a.status === "Resuelta").length,
  };

  const alertTypes = [
    { label: "Todos los tipos", value: "all" as const, color: null },
    {
      label: "Emergencia",
      value: "EMERGENCY" as AlertCategory,
      color: "#f44336",
    },
    {
      label: "Precaución",
      value: "PRECAUTION" as AlertCategory,
      color: "#ffc107",
    },
    { label: "Informativa", value: "INFO" as AlertCategory, color: "#2196f3" },
    {
      label: "Comunitaria",
      value: "COMMUNITY" as AlertCategory,
      color: "#4caf50",
    },
  ];

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === "home") {
      router.push("/home");
    } else if (tab === "map") {
      router.push("/map");
    } else if (tab === "create") {
      router.push("/create-alert");
    }
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

  const handleLogout = () => {
    router.replace("/login");
  };

  const handleNotificationsPress = () => {
    router.push("/notifications");
  };

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <TopHeader
            notificationsCount={0}
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
          {/* Filters Section */}
          <View style={styles.filtersSection}>
            <View style={styles.filterHeader}>
              <Feather name="filter" size={20} color="#005677" />
              <ThemedText style={styles.filtersTitle}>Filtros</ThemedText>
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowTypeFilter(!showTypeFilter)}
            >
              <ThemedText style={styles.filterLabel}>Tipo de Alerta</ThemedText>
              <View style={styles.filterValue}>
                <ThemedText style={styles.filterValueText}>
                  {selectedTypeLabel}
                </ThemedText>
                <Feather
                  name={showTypeFilter ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#666"
                />
              </View>
            </TouchableOpacity>

            {/* Type Filter Dropdown */}
            {showTypeFilter && (
              <View style={styles.filterDropdown}>
                {alertTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={styles.filterOption}
                    onPress={() => {
                      setSelectedType(type.value);
                      setSelectedTypeLabel(type.label);
                      setShowTypeFilter(false);
                    }}
                  >
                    {type.color && (
                      <View
                        style={[
                          styles.typeIndicator,
                          { backgroundColor: type.color },
                        ]}
                      />
                    )}
                    <ThemedText style={styles.filterOptionText}>
                      {type.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Stats Summary Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{stats.total}</ThemedText>
              <ThemedText style={styles.statLabel} numberOfLines={2}>
                Total Alertas
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{stats.active}</ThemedText>
              <ThemedText style={styles.statLabel} numberOfLines={2}>
                Activas
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {stats.verified}
              </ThemedText>
              <ThemedText style={styles.statLabel} numberOfLines={2}>
                Verificadas
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {stats.resolved}
              </ThemedText>
              <ThemedText style={styles.statLabel} numberOfLines={2}>
                Resueltas
              </ThemedText>
            </View>
          </View>

          {/* Alerts List Header */}
          <View style={styles.listHeader}>
            <ThemedText style={styles.listTitle}>Alertas Recientes</ThemedText>
            <ThemedText style={styles.listSubtitle}>
              Mostrando {filteredAlerts.length} de {stats.total} resultados
            </ThemedText>
          </View>

          {/* Alerts List */}
          <View style={styles.alertsList}>
            {filteredAlerts.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="bell-off" size={48} color="#ccc" />
                <ThemedText style={styles.emptyText}>
                  No hay alertas para mostrar
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  {selectedType === "all"
                    ? "Aún no hay alertas en tu zona"
                    : "No hay alertas de este tipo"}
                </ThemedText>
              </View>
            ) : (
              filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onPress={handleAlertPress}
                  showDetailedMeta={true}
                />
              ))
            )}
          </View>
        </ScrollView>
        </View>
      </SafeAreaView>
      <BottomNavbar active={active} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  safe: {
    flex: 1,
    backgroundColor: "#fafafa",
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  filtersSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#005677",
  },
  filterButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  filterValue: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterValueText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  filterDropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterOptionText: {
    fontSize: 16,
    color: "#333",
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    flexWrap: "wrap",
  },
  statItem: {
    width: "48%",
    alignItems: "center",
    padding: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2196f3",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  listSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  alertsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
});
