import { ThemedText } from "@/components/themed-text";
import { alertService, Alert as AlertType } from "@/services/alert.service";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AlertDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingMediaIndex, setViewingMediaIndex] = useState<number | null>(
    null
  );
  const insets = useSafeAreaInsets();

  // Función helper para navegar hacia atrás de forma segura
  const safeGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  useEffect(() => {
    loadAlertDetail();
  }, [params.id]);

  const loadAlertDetail = async () => {
    if (!params.id) {
      Alert.alert("Error", "ID de alerta no proporcionado");
      safeGoBack();
      return;
    }

    try {
      console.log("[AlertDetail] 📥 Cargando alerta:", params.id);
      const alertData = await alertService.getAlertById(params.id as string);
      console.log("[AlertDetail] ✅ Alerta cargada:", alertData);
      setAlert(alertData);
    } catch (error) {
      console.error("[AlertDetail] ❌ Error cargando alerta:", error);
      Alert.alert("Error", "No se pudo cargar el detalle de la alerta");
      safeGoBack();
    } finally {
      setLoading(false);
    }
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

  const getAlertConfig = (category: AlertType["category"]) => {
    switch (category) {
      case "EMERGENCY":
        return {
          color: "#f44336",
          bgColor: "#ffebee",
          icon: "alert-circle",
          label: "Emergencia",
        };
      case "PRECAUTION":
        return {
          color: "#ff9800",
          bgColor: "#fff3e0",
          icon: "alert-triangle",
          label: "Precaución",
        };
      case "COMMUNITY":
        return {
          color: "#4caf50",
          bgColor: "#e8f5e9",
          icon: "users",
          label: "Comunitaria",
        };
      case "INFO":
        return {
          color: "#2196f3",
          bgColor: "#e3f2fd",
          icon: "info",
          label: "Informativa",
        };
      default:
        return {
          color: "#757575",
          bgColor: "#f5f5f5",
          icon: "alert-circle",
          label: "Alerta",
        };
    }
  };

  const getStatusConfig = (status: AlertType["status"]) => {
    switch (status) {
      case "ACTIVE":
        return { color: "#ff9800", label: "Activa" };
      case "RESOLVED":
        return { color: "#4caf50", label: "Resuelta" };
      case "CANCELLED":
        return { color: "#757575", label: "Cancelada" };
      case "EXPIRED":
        return { color: "#f44336", label: "Expirada" };
      default:
        return { color: "#757575", label: "Desconocida" };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <StatusBar style="dark" />
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#005677" />
          <ThemedText style={styles.loadingText}>Cargando alerta...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!alert) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <StatusBar style="dark" />
        <View style={[styles.container, styles.loadingContainer]}>
          <Feather name="alert-circle" size={48} color="#ccc" />
          <ThemedText style={styles.loadingText}>
            Alerta no encontrada
          </ThemedText>
          <TouchableOpacity style={styles.backHomeButton} onPress={safeGoBack}>
            <ThemedText style={styles.backHomeButtonText}>Volver</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const config = getAlertConfig(alert.category);
  const statusConfig = getStatusConfig(alert.status);

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={safeGoBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Detalle de Alerta</ThemedText>
          <View style={styles.placeholderView} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Alert Card */}
          <View style={[styles.alertCard, { backgroundColor: "#005677" }]}>
            <View style={styles.alertHeader}>
              <View
                style={[styles.alertType, { backgroundColor: config.bgColor }]}
              >
                <Feather
                  name={config.icon as keyof typeof Feather.glyphMap}
                  size={14}
                  color={config.color}
                />
                <ThemedText
                  style={[styles.alertTypeText, { color: config.color }]}
                >
                  {config.label}
                </ThemedText>
              </View>
              <View style={styles.statusBadge}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusConfig.color },
                  ]}
                />
                <ThemedText style={styles.statusText}>
                  {statusConfig.label}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
            <ThemedText style={styles.alertDescription}>
              {alert.description}
            </ThemedText>
          </View>

          {/* Details Cards */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailCard}>
              <Feather name="map-pin" size={20} color="#005677" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Ubicación</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {alert.address ||
                    `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(
                      4
                    )}`}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Feather name="clock" size={20} color="#005677" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Reportado</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {getRelativeTime(alert.createdAt)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Feather name="user" size={20} color="#005677" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>
                  Reportado por
                </ThemedText>
                <ThemedText style={styles.detailValue}>
                  {alert.isAnonymous ? "Anónimo" : alert.createdByUserName}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Feather name="map" size={20} color="#005677" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Radio</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {alert.radiusM >= 1000
                    ? `${(alert.radiusM / 1000).toFixed(1)} km`
                    : `${alert.radiusM} m`}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Detailed Description */}
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.descriptionTitle}>
              Descripción Detallada
            </ThemedText>
            <ThemedText style={styles.descriptionText}>
              {alert.description}
            </ThemedText>
          </View>

          {/* Media Evidence */}
          {alert.media && alert.media.length > 0 && (
            <View style={styles.photoSection}>
              <ThemedText style={styles.photoTitle}>
                Evidencia adjunta
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mediaScrollView}
              >
                {alert.media.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.mediaItemContainer}
                    onPress={() => setViewingMediaIndex(index)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: alertService.getMediaUrl(item.url) }}
                      style={styles.mediaThumb}
                      resizeMode="cover"
                    />
                    {item.wasBlurred && (
                      <View style={styles.blurBadge}>
                        <Feather name="eye-off" size={12} color="#fff" />
                      </View>
                    )}
                    {item.mimeType.startsWith("video") && (
                      <View style={styles.videoBadge}>
                        <Feather name="play-circle" size={24} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {alert.media.some((m) => m.wasBlurred) && (
                <ThemedText style={styles.blurNotice}>
                  ℹ️ Algunas imágenes fueron procesadas para proteger la
                  privacidad
                </ThemedText>
              )}
            </View>
          )}

          {/* Validation Card */}
          <View style={styles.validationCard}>
            <ThemedText style={styles.validationQuestion}>
              ¿Esta alerta sigue siendo válida?
            </ThemedText>
            <ThemedText style={styles.validationSubtext}>
              Tu validación ayuda a mantener la información actualizada para
              toda la comunidad
            </ThemedText>

            <View style={styles.validationButtons}>
              <TouchableOpacity style={styles.confirmButton}>
                <Feather name="check-circle" size={20} color="#fff" />
                <ThemedText style={styles.confirmButtonText}>
                  Sí, es cierto
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reportButton}>
                <Feather name="alert-triangle" size={20} color="#fff" />
                <ThemedText style={styles.reportButtonText}>
                  Reportar como falsa
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Community Stats */}
            <View style={styles.communityStats}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>23</ThemedText>
                <ThemedText style={styles.statLabel}>Confirmaciones</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, styles.statValueDark]}>
                  2
                </ThemedText>
                <ThemedText style={styles.statLabel}>
                  Reportes falsos
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>92%</ThemedText>
                <ThemedText style={styles.statLabel}>Confiabilidad</ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Full-screen Image Viewer Modal */}
      {viewingMediaIndex !== null && alert?.media && (
        <Modal
          visible={true}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setViewingMediaIndex(null)}
        >
          <View style={styles.imageViewerContainer}>
            {/* Header */}
            <View
              style={[styles.imageViewerHeader, { paddingTop: insets.top }]}
            >
              <TouchableOpacity
                onPress={() => setViewingMediaIndex(null)}
                style={styles.closeViewerButton}
              >
                <Feather name="x" size={28} color="#fff" />
              </TouchableOpacity>
              <ThemedText style={styles.imageViewerTitle}>
                {viewingMediaIndex + 1} / {alert.media.length}
              </ThemedText>
              <View style={styles.imageViewerPlaceholder} />
            </View>

            {/* Image */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH
                );
                setViewingMediaIndex(newIndex);
              }}
              contentOffset={{ x: viewingMediaIndex * SCREEN_WIDTH, y: 0 }}
            >
              {alert.media.map((item, index) => (
                <View key={item.id} style={styles.imageViewerSlide}>
                  <Image
                    source={{ uri: alertService.getMediaUrl(item.url) }}
                    style={styles.imageViewerImage}
                    resizeMode="contain"
                  />
                  {item.wasBlurred && (
                    <View style={styles.imageViewerBadge}>
                      <Feather name="eye-off" size={16} color="#fff" />
                      <ThemedText style={styles.imageViewerBadgeText}>
                        Imagen procesada para proteger privacidad
                      </ThemedText>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {/* Navigation Arrows */}
            {alert.media.length > 1 && (
              <>
                {viewingMediaIndex > 0 && (
                  <TouchableOpacity
                    style={[styles.navArrow, styles.navArrowLeft]}
                    onPress={() => setViewingMediaIndex(viewingMediaIndex - 1)}
                  >
                    <Feather name="chevron-left" size={32} color="#fff" />
                  </TouchableOpacity>
                )}
                {viewingMediaIndex < alert.media.length - 1 && (
                  <TouchableOpacity
                    style={[styles.navArrow, styles.navArrowRight]}
                    onPress={() => setViewingMediaIndex(viewingMediaIndex + 1)}
                  >
                    <Feather name="chevron-right" size={32} color="#fff" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </Modal>
      )}
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
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  backHomeButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#005677",
    borderRadius: 8,
  },
  backHomeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  placeholderView: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  alertCard: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  alertType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  alertTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 24,
    opacity: 0.9,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    width: "48%",
    flexDirection: "column",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  detailContent: {
    flex: 1,
    width: "100%",
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
  },
  photoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: "row",
    gap: 12,
  },
  photoPlaceholder: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  mediaScrollView: {
    marginBottom: 12,
  },
  mediaItemContainer: {
    marginRight: 12,
    position: "relative",
  },
  mediaThumb: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
  },
  blurBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 12,
    padding: 4,
  },
  videoBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 24,
    padding: 4,
  },
  blurNotice: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  validationCard: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  validationQuestion: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  validationSubtext: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  validationButtons: {
    gap: 12,
    marginBottom: 24,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4caf50",
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f44336",
    paddingVertical: 14,
    borderRadius: 12,
  },
  reportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  communityStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2196f3",
    marginBottom: 4,
  },
  statValueDark: {
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  imageViewerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeViewerButton: {
    padding: 8,
  },
  imageViewerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  imageViewerPlaceholder: {
    width: 44,
  },
  imageViewerSlide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  imageViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  imageViewerBadge: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  imageViewerBadgeText: {
    flex: 1,
    fontSize: 13,
    color: "#fff",
  },
  navArrow: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -28 }],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  navArrowLeft: {
    left: 20,
  },
  navArrowRight: {
    right: 20,
  },
});
