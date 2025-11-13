import MapWrapper, { MapMarker } from "@/components/MapWrapper";
import { ThemedText } from "@/components/themed-text";
import { SaveUserZoneDto, userZoneService } from "@/services/user-zone.service";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

interface Address {
  display_name: string;
  lat: string;
  lon: string;
}

export default function SettingsScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [searchResults, setSearchResults] = useState<Address[]>([]);
  const [searching, setSearching] = useState(false);
  const [radiusM, setRadiusM] = useState<number>(5000);
  const [mapRegion, setMapRegion] = useState({
    latitude: -1.2476,
    longitude: -78.6186,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: -1.2476,
    lng: -78.6186,
  });
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Función helper para navegar hacia atrás de forma segura
  const safeGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  // Cargar configuración actual al montar
  useEffect(() => {
    loadCurrentZone();
  }, []);

  const loadCurrentZone = async () => {
    try {
      const zone = await userZoneService.getUserZone();
      if (zone) {
        setRadiusM(zone.radiusM);
        setSelectedAddress({
          display_name: `Lat: ${zone.centerLatitude}, Lon: ${zone.centerLongitude}`,
          lat: zone.centerLatitude.toString(),
          lon: zone.centerLongitude.toString(),
        });
        setMarkerPosition({
          lat: zone.centerLatitude,
          lng: zone.centerLongitude,
        });
        setMapRegion({
          latitude: zone.centerLatitude,
          longitude: zone.centerLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error("Error loading zone:", error);
    }
  };

  const searchAddresses = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}, Ecuador&format=json&limit=10`;

      const response = await fetch(url, {
        headers: { "User-Agent": "VigilApp/1.0" },
      });

      const data = await response.json();
      setSearchResults(data.slice(0, 5));
    } catch (error) {
      console.error("Error buscando direcciones:", error);
      setSearchResults([]);
      Alert.alert("Error", "No se pudo buscar direcciones");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText) {
        searchAddresses(searchText);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permisos denegados", "Necesitamos acceso a tu ubicación");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "User-Agent": "VigilApp/1.0" } }
      );
      const data = await response.json();

      setSelectedAddress({
        display_name: data.display_name || "Ubicación actual",
        lat: latitude.toString(),
        lon: longitude.toString(),
      });
      setMarkerPosition({ lat: latitude, lng: longitude });
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setShowLocationPicker(false);
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      Alert.alert("Error", "No se pudo obtener tu ubicación");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    const lat = parseFloat(address.lat);
    const lon = parseFloat(address.lon);

    setSelectedAddress(address);
    setMapRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMarkerPosition({ lat, lng: lon });
    setSearchText(address.display_name);
    setSearchResults([]);
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ lat: latitude, lng: longitude });

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: { "User-Agent": "VigilApp/1.0" },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setSelectedAddress({
          display_name: data.display_name || "Ubicación seleccionada",
          lat: latitude.toString(),
          lon: longitude.toString(),
        });
        setSearchText(data.display_name || "Ubicación seleccionada");
      })
      .catch(() => {
        setSelectedAddress({
          display_name: "Ubicación seleccionada",
          lat: latitude.toString(),
          lon: longitude.toString(),
        });
      });
  };

  const handleSaveConfiguration = async () => {
    console.log("[Settings] 🎯 handleSaveConfiguration called");
    console.log("[Settings] 📍 selectedAddress:", selectedAddress);
    console.log("[Settings] 📏 radiusM:", radiusM);

    if (!selectedAddress) {
      Alert.alert("Error", "Por favor selecciona una ubicación");
      return;
    }

    if (radiusM < 100 || radiusM > 50000) {
      Alert.alert("Error", "El radio debe estar entre 100 y 50,000 metros");
      return;
    }

    setSaving(true);
    console.log("[Settings] 💾 Starting save process...");
    try {
      const data: SaveUserZoneDto = {
        centerLatitude: parseFloat(selectedAddress.lat),
        centerLongitude: parseFloat(selectedAddress.lon),
        radiusM: Math.round(radiusM),
      };

      console.log(
        "[Settings] 📤 Calling userZoneService.saveUserZone with:",
        data
      );
      await userZoneService.saveUserZone(data);
      console.log("[Settings] ✅ Save completed successfully");

      Alert.alert("Éxito", "Configuración guardada correctamente", [
        { text: "OK", onPress: safeGoBack },
      ]);
    } catch (error) {
      console.error("[Settings] ❌ Error saving configuration:", error);
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la configuración";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
      console.log("[Settings] 🏁 Save process finished");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={safeGoBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#005677" />
          </TouchableOpacity>
          <ThemedText style={styles.title}>Configuración de Zona</ThemedText>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ubicación</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Configura tu ubicación para recibir alertas relevantes
          </ThemedText>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowLocationPicker(true)}
          >
            <Feather name="map-pin" size={20} color="#005677" />
            <View style={styles.locationInfo}>
              <ThemedText style={styles.locationLabel}>
                {selectedAddress
                  ? selectedAddress.display_name
                  : "Seleccionar ubicación"}
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Radio */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Radio de Alerta</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Define el área en la que deseas recibir alertas (en metros)
          </ThemedText>

          <View style={styles.radiusContainer}>
            <ThemedText style={styles.radiusValue}>
              {Math.round(radiusM)}m
            </ThemedText>
            <ThemedText style={styles.radiusSubValue}>
              {(radiusM / 1000).toFixed(1)} km
            </ThemedText>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={100}
            maximumValue={50000}
            step={100}
            value={radiusM}
            onValueChange={setRadiusM}
            minimumTrackTintColor="#005677"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#005677"
          />

          <View style={styles.radiusLabels}>
            <ThemedText style={styles.radiusLabel}>100m</ThemedText>
            <ThemedText style={styles.radiusLabel}>50km</ThemedText>
          </View>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!selectedAddress || saving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveConfiguration}
          disabled={!selectedAddress || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="save" size={20} color="#fff" />
              <ThemedText style={styles.saveButtonText}>
                Guardar Configuración
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal para seleccionar ubicación */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer} edges={["bottom"]}>
          <View style={[styles.modalHeader, { paddingTop: insets.top }]}>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              Selecciona ubicación
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(false)}
              disabled={!selectedAddress}
            >
              <ThemedText
                style={[
                  styles.confirmButton,
                  !selectedAddress && styles.confirmButtonDisabled,
                ]}
              >
                Listo
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Botón ubicación actual */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleGetCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#005677" />
            ) : (
              <>
                <Feather name="navigation" size={20} color="#005677" />
                <ThemedText style={styles.currentLocationText}>
                  Usar mi ubicación actual
                </ThemedText>
              </>
            )}
          </TouchableOpacity>

          {/* Buscador */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar dirección..."
              value={searchText}
              onChangeText={setSearchText}
            />
            {searching && <ActivityIndicator size="small" color="#005677" />}
          </View>

          {/* Resultados */}
          {searchResults.length > 0 && (
            <ScrollView style={styles.searchResults}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resultItem}
                  onPress={() => handleSelectAddress(result)}
                >
                  <Feather name="map-pin" size={18} color="#005677" />
                  <ThemedText style={styles.resultText}>
                    {result.display_name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Mapa */}
          <View style={styles.mapContainer}>
            <MapWrapper region={mapRegion} onPress={handleMapPress}>
              <MapMarker
                coordinate={{
                  latitude: markerPosition.lat,
                  longitude: markerPosition.lng,
                }}
                title="Tu ubicación"
              />
            </MapWrapper>
          </View>

          {selectedAddress && (
            <View style={styles.selectedLocation}>
              <Feather name="check-circle" size={20} color="#4caf50" />
              <ThemedText style={styles.selectedLocationText}>
                {selectedAddress.display_name}
              </ThemedText>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#005677",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: "#333",
  },
  radiusContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  radiusValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#005677",
  },
  radiusSubValue: {
    fontSize: 16,
    color: "#666",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  radiusLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  radiusLabel: {
    fontSize: 12,
    color: "#999",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#005677",
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  confirmButton: {
    fontSize: 16,
    fontWeight: "700",
    color: "#005677",
  },
  confirmButtonDisabled: {
    color: "#ccc",
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 12,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#005677",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  searchResults: {
    maxHeight: 200,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  mapContainer: {
    flex: 1,
  },
  selectedLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "#e8f5e9",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingBottom: 24,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 14,
    color: "#4caf50",
    fontWeight: "600",
  },
});
