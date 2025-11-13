import { API_CONFIG, createHeaders } from './config/api.config';
import { ImageAsset } from './types/auth.types';

export type AlertCategory = 'EMERGENCY' | 'PRECAUTION' | 'INFO' | 'COMMUNITY';
export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'CANCELLED' | 'EXPIRED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

/**
 * Alert Statistics DTO
 */
export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  cancelledAlerts: number;
  alertsByCategory: Record<string, number>;
  alertsByVerificationStatus: Record<string, number>;
  falseReportsPercentage: number;
  totalUsers: number;
  activeUsers: number;
  timeRange: string;
}

/**
 * Media attachment DTO
 */
export interface MediaDto {
  id: string;
  url: string; // Relative URL to fetch the file
  mimeType: string;
  wasBlurred: boolean; // Indicates if faces were blurred
  createdAt: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  status: AlertStatus;
  verificationStatus: VerificationStatus;
  latitude: number;
  longitude: number;
  radiusM: number;
  address?: string;
  cityId?: string;
  isAnonymous: boolean;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  media?: MediaDto[]; // Media attachments
}

export interface SaveAlertDto {
  category: AlertCategory;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  cityId?: string;
  address?: string;
  isAnonymous: boolean;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  count: number;
  intensity: number;
}

class AlertService {
  /**
   * Crear nueva alerta
   */
  async createAlert(data: SaveAlertDto): Promise<Alert> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/alerts`, {
        method: 'POST',
        headers: await createHeaders('json'),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al crear alerta: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Obtener alertas cercanas a una ubicación
   */
  async getNearbyAlerts(
    latitude: number,
    longitude: number,
    radiusM: number = 5000,
    activeOnly: boolean = true
  ): Promise<Alert[]> {
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        radiusM: radiusM.toString(),
        activeOnly: activeOnly.toString(),
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/alerts/nearby?${params}`,
        {
          method: 'GET',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener alertas cercanas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting nearby alerts:', error);
      throw error;
    }
  }

  /**
   * Obtener alertas en la zona configurada del usuario
   */
  async getMyZoneAlerts(): Promise<Alert[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/alerts/my-zone`, {
        method: 'GET',
        headers: await createHeaders('json'),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('[AlertService] ❌ Error getting my zone alerts:', response.status, text);
        throw new Error(text || `Error al obtener alertas de tu zona (status ${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.error('[AlertService] ❌ Error getting my zone alerts (CATCH):', error);
      throw error;
    }
  }

  /**
   * Obtener datos de heatmap para un área
   */
  async getHeatmapData(
    swLat: number,
    swLon: number,
    neLat: number,
    neLon: number,
    gridSizeM: number = 1000
  ): Promise<HeatmapPoint[]> {
    try {
      const params = new URLSearchParams({
        swLat: swLat.toString(),
        swLon: swLon.toString(),
        neLat: neLat.toString(),
        neLon: neLon.toString(),
        gridSizeM: gridSizeM.toString(),
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/alerts/heatmap?${params}`,
        {
          method: 'GET',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener datos de heatmap');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting heatmap data:', error);
      throw error;
    }
  }

  /**
   * Obtener detalle de una alerta
   */
  async getAlertById(alertId: string): Promise<Alert> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/alerts/${alertId}`,
        {
          method: 'GET',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener detalle de alerta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting alert detail:', error);
      throw error;
    }
  }

  /**
   * Obtener alertas recientes
   */
  async getRecentAlerts(page: number = 0, size: number = 20): Promise<Alert[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/alerts/recent?${params}`,
        {
          method: 'GET',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener alertas recientes');
      }

      const data = await response.json();
      return data.content || data; // Maneja paginación de Spring
    } catch (error) {
      console.error('Error getting recent alerts:', error);
      throw error;
    }
  }

  /**
   * Create alert with media attachments (evidence).
   * Images will be automatically processed to blur faces.
   *
   * @param data - Alert data
   * @param files - Array of image/video files (max 5)
   * @returns Created alert with media attachments
   */
  async createAlertWithMedia(
    data: SaveAlertDto,
    files: ImageAsset[]
  ): Promise<Alert> {
    try {
      const formData = new FormData();

      // Add alert data as JSON string (not Blob - React Native doesn't handle Blobs well)
      formData.append('alert', JSON.stringify(data));

      // Add files - React Native FormData expects objects with uri, name, and type
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', {
            uri: file.uri,
            name: file.name,
            type: file.type,
          } as any);
        });
      }

      // Get headers but remove Content-Type to let the platform set it with boundary
      const headers = await createHeaders('multipart');
      delete headers['Content-Type'];

      const response = await fetch(`${API_CONFIG.BASE_URL}/alerts/with-media`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Parse error response
        try {
          const errorJson = JSON.parse(errorText);

          // Handle file size exceeded error
          if (errorJson.details?.includes('Maximum upload size exceeded') ||
              errorJson.message?.includes('Maximum upload size exceeded')) {
            throw new Error('Los archivos seleccionados son demasiado grandes. Por favor, selecciona archivos más pequeños (máximo 10MB por archivo).');
          }

          // Handle other errors with message from backend
          throw new Error(errorJson.message || errorJson.error || 'Error al crear alerta');
        } catch (parseError) {
          // If error is not JSON, throw original error text
          if (errorText.includes('Maximum upload size exceeded')) {
            throw new Error('Los archivos seleccionados son demasiado grandes. Por favor, selecciona archivos más pequeños (máximo 10MB por archivo).');
          }
          throw new Error(`Error al crear alerta: ${errorText}`);
        }
      }

      return await response.json();
    } catch (error) {
      console.error('[AlertService] Error creating alert with media:', error);
      throw error;
    }
  }

  /**
   * Get media URL for displaying
   */
  getMediaUrl(relativePath: string): string {
    // Remove /api from BASE_URL and add the relative path
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    return `${baseUrl}${relativePath}`;
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(timeRange: string = '7d', cityId?: string): Promise<AlertStats> {
    try {
      const params = new URLSearchParams({ timeRange });
      if (cityId) params.append('cityId', cityId);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/alerts/stats?${params}`,
        {
          method: 'GET',
          headers: await createHeaders('json'),
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      return await response.json();
    } catch (error) {
      console.error('[AlertService] Error getting stats:', error);
      throw error;
    }
  }
}

export const alertService = new AlertService();
