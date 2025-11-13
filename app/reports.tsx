import { StatCard } from "@/components/StatCard";
import { ThemedText } from "@/components/themed-text";
import { alertService, AlertStats } from "@/services/alert.service";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setError(null);
      const data = await alertService.getAlertStats("24h"); // Today's stats
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Error al cargar estadísticas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <StatusBar style="dark" />
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#005677" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Reportes</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#005677" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <StatusBar style="dark" />
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#005677" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Reportes</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#f44336" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadStats}>
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const emergencyCount = stats?.alertsByCategory?.["EMERGENCY"] || 0;
  const precautionCount = stats?.alertsByCategory?.["PRECAUTION"] || 0;
  const activeUsers = stats?.activeUsers || 0;
  const totalAlertsToday = stats?.totalAlerts || 0;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#005677" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Reportes</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color="#005677" />
          <ThemedText style={styles.infoText}>
            Estadísticas de las últimas 24 horas
          </ThemedText>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Emergencias"
            value={emergencyCount}
            icon="alert-triangle"
            color="#f44336"
          />
          <StatCard
            title="Precaución"
            value={precautionCount}
            icon="alert-circle"
            color="#ffc107"
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Usuarios Activos"
            value={activeUsers}
            icon="users"
            color="#4caf50"
          />
          <StatCard
            title="Alertas Hoy"
            value={totalAlertsToday}
            icon="activity"
            color="#2196f3"
          />
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Por Categoría</ThemedText>
          <View style={styles.categoryList}>
            {Object.entries(stats?.alertsByCategory || {}).map(
              ([category, count]) => (
                <View key={category} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Feather
                      name={
                        category === "EMERGENCY"
                          ? "alert-triangle"
                          : category === "PRECAUTION"
                          ? "alert-circle"
                          : category === "INFO"
                          ? "info"
                          : "message-circle"
                      }
                      size={20}
                      color={
                        category === "EMERGENCY"
                          ? "#f44336"
                          : category === "PRECAUTION"
                          ? "#ffc107"
                          : category === "INFO"
                          ? "#2196f3"
                          : "#4caf50"
                      }
                    />
                    <ThemedText style={styles.categoryName}>
                      {category === "EMERGENCY"
                        ? "Emergencia"
                        : category === "PRECAUTION"
                        ? "Precaución"
                        : category === "INFO"
                        ? "Información"
                        : "Comunidad"}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.categoryCount}>{count}</ThemedText>
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: "#fafafa",
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#005677",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    marginTop: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#005677",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#005677",
    marginLeft: 12,
    flex: 1,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  categoryList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  categoryCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#005677",
  },
});
