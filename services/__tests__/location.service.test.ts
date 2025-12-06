/**
 * Pruebas unitarias para LocationService
 */
import * as Location from 'expo-location';
import { locationService } from '../location.service';

jest.mock('expo-location');

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    locationService.clearCache();
  });

  describe('getCurrentLocation', () => {
    it('debería obtener ubicación actual con permisos otorgados', async () => {
      const mockLocation = {
        coords: {
          latitude: 10.0,
          longitude: -84.0,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce(mockLocation);

      const result = await locationService.getCurrentLocation();

      expect(result).toEqual({
        latitude: 10.0,
        longitude: -84.0,
      });
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.Balanced,
      });
    });

    it('debería retornar null si no hay permisos', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await locationService.getCurrentLocation();

      expect(result).toBeNull();
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('debería usar ubicación en cache si no ha expirado', async () => {
      const mockLocation = {
        coords: {
          latitude: 10.0,
          longitude: -84.0,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce(mockLocation);

      // Primera llamada obtiene ubicación
      const result1 = await locationService.getCurrentLocation();
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);

      // Segunda llamada usa cache
      const result2 = await locationService.getCurrentLocation();
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(result1);
    });

    it('debería actualizar cache si ha expirado', async () => {
      const mockLocation1 = {
        coords: { latitude: 10.0, longitude: -84.0 },
        timestamp: Date.now(),
      };

      const mockLocation2 = {
        coords: { latitude: 10.1, longitude: -84.1 },
        timestamp: Date.now(),
      };

      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (Location.getCurrentPositionAsync as jest.Mock)
        .mockResolvedValueOnce(mockLocation1 as any)
        .mockResolvedValueOnce(mockLocation2 as any);

      // Primera llamada
      await locationService.getCurrentLocation();

      // Forzar expiración del cache
      const cacheExpirationMs = 5 * 60 * 1000 + 1000;
      jest.spyOn(Date, 'now').mockReturnValue(Date.now() + cacheExpirationMs);

      // Segunda llamada debe obtener nueva ubicación
      const result = await locationService.getCurrentLocation();

      expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        latitude: 10.1,
        longitude: -84.1,
      });
    });

    it('debería manejar error al obtener ubicación', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValueOnce(
        new Error('GPS error')
      );

      const result = await locationService.getCurrentLocation();

      expect(result).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('debería limpiar el cache de ubicación', async () => {
      const mockLocation = {
        coords: { latitude: 10.0, longitude: -84.0 },
        timestamp: Date.now(),
      };

      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation as any);

      // Obtener ubicación para llenar cache
      await locationService.getCurrentLocation();

      // Limpiar cache
      locationService.clearCache();

      // Siguiente llamada debe obtener nueva ubicación
      await locationService.getCurrentLocation();
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(2);
    });
  });

  describe('hasPermissions', () => {
    it('debería retornar true si hay permisos', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const result = await locationService.hasPermissions();

      expect(result).toBe(true);
    });

    it('debería retornar false si no hay permisos', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await locationService.hasPermissions();

      expect(result).toBe(false);
    });
  });

  describe('requestPermissions', () => {
    it('debería solicitar y retornar permisos otorgados', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const result = await locationService.requestPermissions();

      expect(result).toBe(true);
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('debería manejar permisos denegados', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await locationService.requestPermissions();

      expect(result).toBe(false);
    });
  });
});
