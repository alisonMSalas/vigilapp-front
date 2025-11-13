import MapWrapper, { MapMarker } from "@/components/MapWrapper";
import { ShieldIcon } from "@/components/ShieldIcon";
import { ThemedText } from "@/components/themed-text";
import { locationCacheService } from "@/services/location-cache.service";
import { SaveUserZoneDto, userZoneService } from "@/services/user-zone.service";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  lat: number;
  lon: number;
}

export default function LocationScreen() {
  const [loading, setLoading] = useState(false);
  const [showManualPicker, setShowManualPicker] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [searchResults, setSearchResults] = useState<Address[]>([]);
  const [searching, setSearching] = useState(false);
  const [isManualSearch, setIsManualSearch] = useState(false);
  const [radiusM, setRadiusM] = useState(5000); // Radio por defecto de 5km
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
  const params = useLocalSearchParams();
  const returnTo = params.returnTo as string;
  const insets = useSafeAreaInsets();

  // Función helper para navegar hacia atrás de forma segura
  const safeGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  // Buscar direcciones usando Nominatim API
  const searchAddresses = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Buscar en Ecuador, priorizando Ambato y Tungurahua
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}, Ecuador&format=json&limit=10&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          "User-Agent": "VigilApp/1.0",
        },
      });

      const data = await response.json();

      // Filtrar y priorizar resultados de Ambato/Tungurahua
      const filteredResults = data.filter((result: any) => {
        const display = result.display_name.toLowerCase();
        const region =
          display.includes("ambato") || display.includes("tungurahua");
        return region;
      });

      // Si hay resultados filtrados, usarlos; si no, mostrar todos
      setSearchResults(
        filteredResults.length > 0
          ? filteredResults.slice(0, 5)
          : data.slice(0, 5)
      );

      console.log("Resultados de búsqueda:", data);
    } catch (error) {
      console.error("Error buscando direcciones:", error);
      setSearchResults([]);
      Alert.alert(
        "Error",
        "No se pudo buscar direcciones. Verifica tu conexión a internet."
      );
    } finally {
      setSearching(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    // Solo buscar si es una búsqueda manual
    if (!isManualSearch) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      if (searchText) {
        searchAddresses(searchText);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, isManualSearch]);

  const handleGetLocation = async () => {
    setLoading(true);

    try {
      // Solicitar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos denegados",
          "Necesitamos acceso a tu ubicación para continuar. Por favor, permite el acceso en la configuración de tu dispositivo.",
          [{ text: "OK" }]
        );
        setLoading(false);
        return;
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      console.log("Ubicación obtenida:", { latitude, longitude });

      // Obtener la dirección mediante reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          {
            headers: { "User-Agent": "VigilApp/1.0" },
          }
        );
        const data = await response.json();
        const address = data.display_name || "Ubicación actual";

        // Navegar según el origen
        if (returnTo === "create-alert") {
          // Guardar en cache y volver a create-alert preservando su estado
          locationCacheService.setLocation({
            address: address,
            lat: latitude,
            lon: longitude,
          });
          safeGoBack();
        } else {
          // Guardar zona en el backend con radio por defecto de 5000m
          console.log("[Location] 💾 Guardando zona en el backend...");
          console.log("[Location] 📍 Coordenadas:", { latitude, longitude });

          try {
            const zoneData: SaveUserZoneDto = {
              centerLatitude: latitude,
              centerLongitude: longitude,
              radiusM: Math.round(radiusM),
            };

            console.log(
              "[Location] 📤 Llamando userZoneService.saveUserZone con:",
              zoneData
            );
            await userZoneService.saveUserZone(zoneData);
            console.log("[Location] ✅ Zona guardada exitosamente");

            router.replace("/home");
          } catch (saveError) {
            console.error("[Location] ❌ Error guardando zona:", saveError);
            const errorMsg =
              saveError instanceof Error
                ? saveError.message
                : "No se pudo guardar la zona";
            Alert.alert(
              "Error",
              `No se pudo guardar tu zona: ${errorMsg}. Puedes configurarla más tarde desde Ajustes.`,
              [{ text: "OK", onPress: () => router.replace("/home") }]
            );
          }
        }
      } catch (geocodeError) {
        console.error("Error obteniendo dirección:", geocodeError);
        // Si falla el geocoding, navegar igual con coordenadas
        if (returnTo === "create-alert") {
          locationCacheService.setLocation({
            address: `Lat: ${latitude}, Lon: ${longitude}`,
            lat: latitude,
            lon: longitude,
          });
          safeGoBack();
        } else {
          router.replace("/home");
        }
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      Alert.alert(
        "Error",
        "No se pudo obtener tu ubicación. Verifica que el GPS esté activado e intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "¿Saltar configuración?",
      "Para usar todas las funciones de VigilApp, necesitamos tu ubicación. ¿Deseas continuar sin configurar tu ubicación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Saltar",
          onPress: () => router.replace("/home"),
          style: "destructive",
        },
      ]
    );
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    const lat = parseFloat(address.lat);
    const lon = parseFloat(address.lon);

    console.log("Dirección seleccionada:", address);
    console.log("Coordenadas:", { latitude: lat, longitude: lon });

    // Actualizar mapa
    setMapRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    setMarkerPosition({ lat, lng: lon });
    setSearchText(address.display_name);
  };

  const handleConfirmLocation = async () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Por favor selecciona una ubicación primero");
      return;
    }

    const lat = selectedAddress.lat;
    const lon = selectedAddress.lon;

    console.log("[Location] Ubicación confirmada:", {
      direccion: selectedAddress.display_name,
      latitud: lat,
      longitud: lon,
    });

    // Navegar a la pantalla correcta según el origen
    if (returnTo === "create-alert") {
      // Guardar en cache y volver a create-alert preservando su estado
      locationCacheService.setLocation({
        address: selectedAddress.display_name,
        lat: typeof lat === "number" ? lat : parseFloat(lat),
        lon: typeof lon === "number" ? lon : parseFloat(lon),
      });
      router.back();
    } else {
      // Guardar zona en el backend con radio por defecto de 5000m
      setLoading(true);
      console.log("[Location] 💾 Guardando zona (selección manual)...");
      console.log("[Location] 📍 Coordenadas:", { lat, lon });

      try {
        const zoneData: SaveUserZoneDto = {
          centerLatitude: typeof lat === "number" ? lat : parseFloat(lat),
          centerLongitude: typeof lon === "number" ? lon : parseFloat(lon),
          radiusM: Math.round(radiusM),
        };

        console.log(
          "[Location] 📤 Llamando userZoneService.saveUserZone con:",
          zoneData
        );
        await userZoneService.saveUserZone(zoneData);
        console.log("[Location] ✅ Zona guardada exitosamente");

        setLoading(false);
        router.replace("/home");
      } catch (saveError) {
        setLoading(false);
        console.error("[Location] ❌ Error guardando zona:", saveError);
        const errorMsg =
          saveError instanceof Error
            ? saveError.message
            : "No se pudo guardar la zona";
        Alert.alert(
          "Error",
          `No se pudo guardar tu zona: ${errorMsg}. Puedes configurarla más tarde desde Ajustes.`,
          [{ text: "OK", onPress: () => router.replace("/home") }]
        );
      }
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ lat: latitude, lng: longitude });

    // Actualizar la región del mapa
    setMapRegion({
      ...mapRegion,
      latitude,
      longitude,
    });

    // Buscar dirección inversa
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
      {
        headers: {
          "User-Agent": "VigilApp/1.0",
        },
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
      .catch((err) => {
        console.error("Error obteniendo dirección inversa:", err);
        setSelectedAddress({
          display_name: "Ubicación seleccionada",
          lat: latitude.toString(),
          lon: longitude.toString(),
        });
        setSearchText("Ubicación seleccionada");
      });
  };

  const handleContinueWithSelection = async () => {
    if (!selectedAddress) return;

    console.log("Ubicación final:", {
      direccion: selectedAddress.name,
      sector: selectedAddress.sector,
      latitud: selectedAddress.lat,
      longitud: selectedAddress.lng,
    });

    // TODO: Guardar en storage o enviar al backend
    // await saveLocationToStorage({ latitude: selectedAddress.lat, longitude: selectedAddress.lng });

    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          {returnTo === "create-alert" ? (
            <>
              <View style={styles.backButtonContainer}>
                <TouchableOpacity
                  onPress={safeGoBack}
                  style={styles.backButton}
                >
                  <Feather name="arrow-left" size={24} color="#005677" />
                </TouchableOpacity>
              </View>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Feather name="map-pin" size={40} color="#005677" />
                </View>
              </View>
              <ThemedText style={styles.title}>¿Dónde ocurrió?</ThemedText>
              <ThemedText style={styles.subtitle}>
                Selecciona la ubicación exacta del incidente para ayudar a tu
                comunidad
              </ThemedText>
            </>
          ) : (
            <>
              <ShieldIcon size={64} color="#005677" />
              <ThemedText style={styles.title}>
                Configura tu Ubicación
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Para proporcionarte alertas relevantes y mantenerte informado
                sobre tu zona, necesitamos conocer tu ubicación
              </ThemedText>
            </>
          )}
        </View>

        {returnTo !== "create-alert" && (
          <View style={styles.content}>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Feather name="shield" size={20} color="#005677" />
                <ThemedText style={styles.infoText}>
                  Recibe alertas de seguridad en tu área
                </ThemedText>
              </View>
              <View style={styles.infoItem}>
                <Feather name="users" size={20} color="#005677" />
                <ThemedText style={styles.infoText}>
                  Conéctate con vecinos cercanos
                </ThemedText>
              </View>
              <View style={styles.infoItem}>
                <Feather name="map" size={20} color="#005677" />
                <ThemedText style={styles.infoText}>
                  Visualiza incidentes en el mapa
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetLocation}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="navigation" size={20} color="#fff" />
                <ThemedText style={styles.primaryButtonText}>
                  Usar mi ubicación actual
                </ThemedText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => setShowManualPicker(true)}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Feather name="map-pin" size={20} color="#005677" />
            <ThemedText style={styles.manualButtonText}>
              Seleccionar otra ubicación
            </ThemedText>
          </TouchableOpacity>

          {returnTo !== "create-alert" && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkip}
              disabled={loading}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Configurar más tarde
              </ThemedText>
            </TouchableOpacity>
          )}

          <ThemedText style={styles.privacyText}>
            Tu ubicación solo se usará para mejorar tu experiencia. No se
            compartirá con terceros.
          </ThemedText>
        </View>
      </View>

      {/* Modal para seleccionar ubicación */}
      <Modal
        visible={showManualPicker}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowManualPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: insets.top }]}>
            <TouchableOpacity
              onPress={() => setShowManualPicker(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              Selecciona tu ubicación
            </ThemedText>
            <TouchableOpacity
              onPress={handleConfirmLocation}
              disabled={!selectedAddress}
            >
              <ThemedText
                style={[
                  styles.confirmButton,
                  !selectedAddress && styles.confirmButtonDisabled,
                ]}
              >
                Confirmar
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar dirección en Ambato o Tungurahua..."
                value={searchText}
                onChangeText={(text) => {
                  setSearchText(text);
                  setIsManualSearch(true);
                }}
                autoFocus
              />
              {searching ? (
                <ActivityIndicator size="small" color="#005677" />
              ) : searchText.length > 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    setSearchText("");
                    setSelectedAddress(null);
                    setSearchResults([]);
                    setIsManualSearch(false);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="x" size={20} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Radio de alerta - solo mostrar cuando NO es para create-alert */}
            {returnTo !== "create-alert" && (
              <View style={styles.radiusSection}>
                <View style={styles.radiusSectionHeader}>
                  <ThemedText style={styles.radiusSectionTitle}>
                    Radio de Alerta
                  </ThemedText>
                  <View style={styles.radiusValueContainer}>
                    <ThemedText style={styles.radiusValue}>
                      {Math.round(radiusM)}m
                    </ThemedText>
                    <ThemedText style={styles.radiusSubValue}>
                      ({(radiusM / 1000).toFixed(1)} km)
                    </ThemedText>
                  </View>
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
            )}

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 ? (
              <View style={styles.searchResultsContainer}>
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.resultItem}
                    onPress={() => handleSelectAddress(result)}
                  >
                    <Feather name="map-pin" size={18} color="#005677" />
                    <View style={styles.resultText}>
                      <ThemedText style={styles.resultTitle}>
                        {result.display_name}
                      </ThemedText>
                    </View>
                    <Feather name="chevron-right" size={20} color="#ccc" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : isManualSearch &&
              searchText.length >= 3 &&
              !searching &&
              searchResults.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Feather name="search" size={24} color="#999" />
                <ThemedText style={styles.noResultsText}>
                  No se encontraron resultados
                </ThemedText>
                <ThemedText style={styles.noResultsSubtext}>
                  Intenta buscar por nombre de barrio, calle o lugar específico
                </ThemedText>
              </View>
            ) : null}

            {/* Mapa */}
            <View style={styles.mapContainer}>
              <MapWrapper region={mapRegion} onPress={handleMapPress}>
                {markerPosition && (
                  <MapMarker
                    coordinate={{
                      latitude: markerPosition.lat,
                      longitude: markerPosition.lng,
                    }}
                    title="Tu ubicación"
                  />
                )}
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
          </ScrollView>
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#005677",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  footer: {
    paddingTop: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#005677",
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  privacyText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 16,
  },
  manualButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#005677",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  manualButtonText: {
    color: "#005677",
    fontSize: 16,
    fontWeight: "700",
  },
  // Modal styles
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
    backgroundColor: "#fff",
  },
  modalContent: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  placeholderView: {
    width: 40,
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
  citiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  cityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e3f2fd",
    alignItems: "center",
    justifyContent: "center",
  },
  cityInfo: {
    flex: 1,
    gap: 2,
  },
  cityName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cityProvince: {
    fontSize: 14,
    color: "#666",
  },
  confirmButton: {
    fontSize: 16,
    fontWeight: "700",
    color: "#005677",
  },
  confirmButtonDisabled: {
    color: "#ccc",
  },
  searchResultsContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 12,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    color: "#333",
  },
  mapContainer: {
    height: 300, // Altura fija para evitar overflow en iPhone
  },
  map: {
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
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 14,
    color: "#4caf50",
    fontWeight: "600",
  },
  noResultsContainer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  backButtonContainer: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f8ff",
  },
  radiusSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  radiusSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  radiusSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  radiusValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  radiusValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#005677",
  },
  radiusSubValue: {
    fontSize: 14,
    color: "#666",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  radiusLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  radiusLabel: {
    fontSize: 12,
    color: "#999",
  },
});
