/**
 * Servicio simple para cachear ubicación seleccionada temporalmente
 * Usado para pasar datos entre location screen y create-alert screen
 */

interface CachedLocation {
  address: string;
  lat: number;
  lon: number;
}

class LocationCacheService {
  private cachedLocation: CachedLocation | null = null;

  /**
   * Guardar ubicación en cache
   */
  setLocation(location: CachedLocation): void {
    this.cachedLocation = location;
  }

  /**
   * Obtener y limpiar ubicación del cache
   */
  getAndClearLocation(): CachedLocation | null {
    const location = this.cachedLocation;
    this.cachedLocation = null;
    return location;
  }

  /**
   * Verificar si hay ubicación en cache
   */
  hasLocation(): boolean {
    return this.cachedLocation !== null;
  }
}

export const locationCacheService = new LocationCacheService();
