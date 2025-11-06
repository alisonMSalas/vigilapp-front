import { API_CONFIG, createHeaders } from './config/api.config';

export type AlertCategory = 'EMERGENCY' | 'PRECAUTION' | 'INFO' | 'COMMUNITY';
export type AlertStatus = 'ACTIVE' | 'RESOLVED' | 'CANCELLED' | 'EXPIRED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

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
}

export const alertService = new AlertService();
