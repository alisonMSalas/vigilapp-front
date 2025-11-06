import MapWrapper, { MapCircle, MapMarker } from "@/components/MapWrapper";
import { ThemedText } from "@/components/themed-text";
import { alertService, HeatmapPoint } from "@/services/alert.service";
import { userZoneService } from "@/services/user-zone.service";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapScreen() {
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: -1.2476,
    longitude: -78.6186,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [userZoneCenter, setUserZoneCenter] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [userZoneRadius, setUserZoneRadius] = useState<number | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Cargar zona del usuario al montar
  useEffect(() => {
    loadUserZone();
  }, []);

  // Cargar heatmap inicial
  useEffect(() => {
    loadHeatmapData(mapRegion);
  }, []);

  const loadUserZone = async () => {
    try {
      const zone = await userZoneService.getUserZone();
      if (zone) {
        setUserZoneCenter({
          lat: zone.centerLatitude,
          lon: zone.centerLongitude,
        });
        setUserZoneRadius(zone.radiusM);
        setMapRegion({
          latitude: zone.centerLatitude,
          longitude: zone.centerLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error("Error loading user zone:", error);
    }
  };

  const loadHeatmapData = async (region: MapRegion) => {
    try {
      setLoading(true);

      // Calcular bounding box del área visible
      const swLat = region.latitude - region.latitudeDelta / 2;
      const swLon = region.longitude - region.longitudeDelta / 2;
      const neLat = region.latitude + region.latitudeDelta / 2;
      const neLon = region.longitude + region.longitudeDelta / 2;

      const data = await alertService.getHeatmapData(
        swLat,
        swLon,
        neLat,
        neLon,
        1000 // Grid size en metros
      );

      setHeatmapData(data);
    } catch (error) {
      console.error("Error loading heatmap:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (region: MapRegion) => {
    setMapRegion(region);

    // Throttle: actualizar heatmap después de 1 segundo de inactividad
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      loadHeatmapData(region);
    }, 1000);
  };

  // Obtener color según intensidad (0-1) y cantidad de alertas
  const getColorForIntensity = (intensity: number, count: number): string => {
    console.log(intensity, count);
    // Si solo hay 1 alerta, usar verde claro
    if (count === 1) return "rgba(76, 175, 80, 0.3)";

    // Para 2-3 alertas, amarillo
    if (count <= 3) return "rgba(255, 235, 59, 0.4)";

    // Para más alertas, usar escala basada en intensidad
    if (intensity < 0.3) return "rgba(76, 175, 80, 0.3)"; // Verde
    if (intensity < 0.5) return "rgba(255, 235, 59, 0.4)"; // Amarillo
    if (intensity < 0.7) return "rgba(255, 152, 0, 0.5)"; // Naranja
    if (intensity < 0.85) return "rgba(255, 87, 34, 0.6)"; // Naranja oscuro
    return "rgba(244, 67, 54, 0.7)"; // Rojo
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color="#005677" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Mapa de Calor</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Mapa */}
        <View style={styles.mapContainer}>
          <MapWrapper
            region={mapRegion}
            onRegionChangeComplete={handleRegionChange}
          >
            {/* Zona del usuario */}
            {userZoneCenter && userZoneRadius && (
              <MapCircle
                center={{
                  latitude: userZoneCenter.lat,
                  longitude: userZoneCenter.lon,
                }}
                radius={userZoneRadius}
                strokeColor="rgba(0, 86, 119, 0.5)"
                fillColor="rgba(0, 86, 119, 0.1)"
                strokeWidth={2}
              />
            )}

            {/* Marcador de zona del usuario */}
            {userZoneCenter && (
              <MapMarker
                coordinate={{
                  latitude: userZoneCenter.lat,
                  longitude: userZoneCenter.lon,
                }}
                title="Tu zona"
              />
            )}

            {/* Capa de calor */}
            {heatmapData.map((point, index) => (
              <MapCircle
                key={`heatmap-${index}`}
                center={{
                  latitude: point.latitude,
                  longitude: point.longitude,
                }}
                radius={500} // Radio de visualización del punto
                fillColor={getColorForIntensity(point.intensity, point.count)}
                strokeColor="transparent"
                strokeWidth={0}
              />
            ))}
          </MapWrapper>

          {/* Indicador de carga */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#005677" />
              <ThemedText style={styles.loadingText}>
                Cargando datos...
              </ThemedText>
            </View>
          )}
        </View>

        {/* Leyenda */}
        <View style={styles.legend}>
          <ThemedText style={styles.legendTitle}>
            Densidad de Alertas
          </ThemedText>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: "rgba(76, 175, 80, 0.6)" },
                ]}
              />
              <ThemedText style={styles.legendLabel}>Baja</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: "rgba(255, 235, 59, 0.6)" },
                ]}
              />
              <ThemedText style={styles.legendLabel}>Media</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: "rgba(255, 152, 0, 0.6)" },
                ]}
              />
              <ThemedText style={styles.legendLabel}>Alta</ThemedText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: "rgba(244, 67, 54, 0.7)" },
                ]}
              />
              <ThemedText style={styles.legendLabel}>Muy Alta</ThemedText>
            </View>
          </View>
        </View>

        {/* Botón para centrar en mi zona */}
        {userZoneCenter && (
          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => {
              setMapRegion({
                latitude: userZoneCenter.lat,
                longitude: userZoneCenter.lon,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              });
            }}
          >
            <Feather name="target" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#005677",
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#005677",
    fontWeight: "600",
  },
  legend: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  legendLabel: {
    fontSize: 13,
    color: "#666",
  },
  centerButton: {
    position: "absolute",
    bottom: 160,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#005677",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
