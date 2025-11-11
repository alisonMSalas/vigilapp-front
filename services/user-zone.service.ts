import { API_CONFIG, createHeaders, handleApiError } from "./config/api.config";

export interface UserZone {
  id: string;
  userId: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusM: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveUserZoneDto {
  centerLatitude: number;
  centerLongitude: number;
  radiusM: number;
}

class UserZoneService {
  /**
   * Guardar/actualizar configuración de zona del usuario
   */
  async saveUserZone(data: SaveUserZoneDto): Promise<UserZone> {
    console.log("[UserZoneService] 🚀 saveUserZone called with data:", data);
    try {
      console.log("[UserZoneService] 🔑 Getting headers...");
      const headers = await createHeaders("json");
      console.log("[UserZoneService] ✅ Headers obtained:", headers);
      
      const url = `${API_CONFIG.BASE_URL}/user-zones`;
      const body = JSON.stringify(data);
      console.log("[UserZoneService] 📡 Making fetch to:", url);
      console.log("[UserZoneService] 📦 Request body:", body);
      
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body,
      });
      
      console.log("[UserZoneService] 📬 Response received, status:", response.status);

      if (!response.ok) {
        // Intentar parsear el error y retornar información útil
        try {
          const apiError = await handleApiError(response);
          console.error("[UserZoneService] Error saving user zone:", apiError);
          throw new Error(
            apiError.message ||
              `Error al guardar zona (status ${response.status})`
          );
        } catch (e) {
          const text = await response.text().catch(() => "");
          console.error(
            "[UserZoneService] Error saving user zone (raw):",
            response.status,
            text
          );
          throw new Error(
            text || `Error al guardar zona (status ${response.status})`
          );
        }
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving user zone (CATCH):", error);
      // Normalizar el error para que el frontend pueda mostrar mensajes amistosos
      if (error instanceof Error) throw error;
      throw new Error("Error al guardar zona");
    }
  }

  /**
   * Obtener configuración de zona del usuario actual
   */
  async getUserZone(): Promise<UserZone | null> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/user-zones/me`, {
        method: "GET",
        headers: await createHeaders("json"),
      });

      // Usuario no tiene zona configurada
      if (response.status === 404) {
        console.log("[UserZoneService] ℹ️ User has no zone configured (404)");
        return null;
      }

      // Access denied - treat as if user has no zone (token might be invalid)
      if (response.status === 401 || response.status === 403) {
        console.log("[UserZoneService] ⚠️ Access denied (401/403) - treating as no zone");
        return null;
      }

      // Server error with "Access Denied" - also treat as no zone
      if (response.status === 500) {
        try {
          const errorData = await response.json();
          if (errorData.details?.includes("Access Denied")) {
            console.log("[UserZoneService] ⚠️ Access Denied (500) - treating as no zone");
            return null;
          }
        } catch {
          // Continue with normal error handling
        }
      }

      if (!response.ok) {
        try {
          const apiError = await handleApiError(response);
          console.error(
            "[UserZoneService] ❌ Error getting user zone:",
            apiError
          );
          // Return null instead of throwing to allow app to continue
          return null;
        } catch (e) {
          const text = await response.text().catch(() => "");
          console.error(
            "[UserZoneService] ❌ Error getting user zone (raw):",
            response.status,
            text
          );
          // Return null instead of throwing
          return null;
        }
      }

      return await response.json();
    } catch (error) {
      console.error(
        "[UserZoneService] ❌ Error getting user zone (CATCH):",
        error
      );
      // Return null instead of throwing to allow app to continue
      return null;
    }
  }

  /**
   * Eliminar configuración de zona del usuario
   */
  async deleteUserZone(): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/user-zones/me`, {
        method: "DELETE",
        headers: await createHeaders("json"),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar zona");
      }
    } catch (error) {
      console.error("Error deleting user zone:", error);
      throw error;
    }
  }
}

export const userZoneService = new UserZoneService();
