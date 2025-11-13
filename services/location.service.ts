/**
 * Servicio de ubicación GPS
 * Obtiene y cachea la ubicación actual del usuario
 */

import * as Location from 'expo-location';

interface CachedLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

class LocationService {
  private cachedLocation: CachedLocation | null = null;
  private cacheExpirationMs = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener ubicación actual del usuario
   * Usa cache si está disponible y no ha expirado
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // Verificar si hay cache válido
      if (this.cachedLocation) {
        const now = Date.now();
        const timeSinceCache = now - this.cachedLocation.timestamp;

        if (timeSinceCache < this.cacheExpirationMs) {
          console.log('[LocationService] 📍 Usando ubicación en cache');
          return {
            latitude: this.cachedLocation.latitude,
            longitude: this.cachedLocation.longitude,
          };
        }
      }

      // Verificar permisos
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('[LocationService] ⚠️ Permisos de ubicación no otorgados');
        return null;
      }

      // Obtener ubicación actual
      console.log('[LocationService] 🌍 Obteniendo ubicación GPS...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Guardar en cache
      this.cachedLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: Date.now(),
      };

      console.log('[LocationService] ✅ Ubicación obtenida:', {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('[LocationService] ❌ Error obteniendo ubicación:', error);
      return null;
    }
  }

  /**
   * Limpiar cache de ubicación
   */
  clearCache(): void {
    this.cachedLocation = null;
  }

  /**
   * Verificar si hay permisos de ubicación
   */
  async hasPermissions(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Solicitar permisos de ubicación
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }
}

export const locationService = new LocationService();
export default locationService;
