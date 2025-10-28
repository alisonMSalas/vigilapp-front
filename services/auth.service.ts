/**
 * Servicio de autenticación para VigilApp
 * Conecta con el backend Spring Boot
 *
 * Endpoints:
 * - POST /api/register - Registro con multipart/form-data
 * - POST /api/login - Login con JSON
 */

import { API_CONFIG, getJsonHeaders, handleApiError } from './config/api.config';
import {
  ImageAsset,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
  User,
} from './types/auth.types';

// Re-exportar tipos para facilitar importaciones
export type {
  LoginCredentials,
  RegisterCredentials,
  User,
  ImageAsset,
  RegisterResponse,
  LoginResponse,
};

/**
 * Resultado de operaciones de autenticación
 */
export interface AuthResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class AuthService {
  private token: string | null = null;

  /**
   * Obtener token del storage
   * TODO: Implementar SecureStore o AsyncStorage para persistencia
   */
  async getStoredToken(): Promise<string | null> {
    try {
      // Implementación temporal en memoria
      // En producción usar:
      // import * as SecureStore from 'expo-secure-store';
      // return await SecureStore.getItemAsync('auth_token');
      return this.token;
    } catch (error) {
      console.error('[AuthService] Error getting stored token:', error);
      return null;
    }
  }

  /**
   * Guardar token en storage seguro
   */
  private async setStoredToken(token: string): Promise<void> {
    try {
      // TODO: Implementar SecureStore
      // await SecureStore.setItemAsync('auth_token', token);
      this.token = token;
    } catch (error) {
      console.error('[AuthService] Error storing token:', error);
    }
  }

  /**
   * Limpiar token del storage
   */
  async clearStoredToken(): Promise<void> {
    try {
      // TODO: Implementar SecureStore
      // await SecureStore.deleteItemAsync('auth_token');
      this.token = null;
    } catch (error) {
      console.error('[AuthService] Error clearing token:', error);
    }
  }

  /**
   * Login de usuario
   * Endpoint: POST /api/login
   * Content-Type: application/json
   */
  async login(credentials: LoginCredentials): Promise<AuthResult<string>> {
    try {
      console.log('[AuthService] 🔐 Intentando login...');
      console.log('[AuthService] 🌐 URL:', `${API_CONFIG.BASE_URL}/login`);
      console.log('[AuthService] 📧 Email:', credentials.email);

      const response = await fetch(`${API_CONFIG.BASE_URL}/login`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(credentials),
      });

      console.log('[AuthService] 📡 Response status:', response.status);
      console.log('[AuthService] ✅ Response ok:', response.ok);

      if (!response.ok) {
        const error = await handleApiError(response);
        console.error('[AuthService] ❌ Server error:', error);
        return {
          success: false,
          message: error.message || 'Error al iniciar sesión',
        };
      }

      // El backend devuelve directamente el token como string
      const token = await response.text();
      console.log('[AuthService] 🎟️ Token recibido:', token ? `Sí (${token.substring(0, 20)}...)` : 'No');

      if (token) {
        await this.setStoredToken(token);
        console.log('[AuthService] ✅ Login exitoso');
        return {
          success: true,
          data: token,
          message: 'Inicio de sesión exitoso',
        };
      }

      return {
        success: false,
        message: 'No se recibió el token de autenticación',
      };
    } catch (error) {
      console.error('[AuthService] ❌ Login error (CATCH):', error);
      console.error('[AuthService] 🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        name: error instanceof Error ? error.name : 'N/A',
      });

      return {
        success: false,
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Verifica que el backend esté corriendo en ${API_CONFIG.BASE_URL}'}`,
      };
    }
  }

  /**
   * Registro de usuario con fotos
   * Endpoint: POST /api/register
   * Content-Type: multipart/form-data
   */
  async register(userData: RegisterCredentials): Promise<AuthResult<RegisterResponse>> {
    try {
      console.log('[AuthService] 📝 Intentando registro...');
      console.log('[AuthService] 🌐 URL:', `${API_CONFIG.BASE_URL}/register`);
      console.log('[AuthService] 👤 Usuario:', `${userData.firstName} ${userData.lastName}`);
      console.log('[AuthService] 📧 Email:', userData.email);
      console.log('[AuthService] 📷 Foto cédula:', userData.fotoCedula ? 'Sí' : 'No');
      console.log('[AuthService] 🤳 Selfie:', userData.selfie ? 'Sí' : 'No');

      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('firstName', userData.firstName);
      formData.append('lastName', userData.lastName);
      formData.append('email', userData.email);
      formData.append('password', userData.password);

      // Adjuntar foto de cédula
      if (userData.fotoCedula) {
        formData.append('fotoCedula', {
          uri: userData.fotoCedula.uri,
          type: userData.fotoCedula.type,
          name: userData.fotoCedula.name,
        } as any);
        console.log('[AuthService] ✅ Foto cédula adjuntada');
      }

      // Adjuntar selfie
      if (userData.selfie) {
        formData.append('selfie', {
          uri: userData.selfie.uri,
          type: userData.selfie.type,
          name: userData.selfie.name,
        } as any);
        console.log('[AuthService] ✅ Selfie adjuntada');
      }

      console.log('[AuthService] 🚀 Enviando petición...');

      const response = await fetch(`${API_CONFIG.BASE_URL}/register`, {
        method: 'POST',
        // No establecer headers para FormData, fetch lo hace automáticamente
        body: formData,
      });

      console.log('[AuthService] 📡 Response status:', response.status);
      console.log('[AuthService] ✅ Response ok:', response.ok);

      if (!response.ok) {
        const error = await handleApiError(response);
        console.error('[AuthService] ❌ Server error:', error);
        return {
          success: false,
          message: error.message || 'Error al registrarse',
        };
      }

      const data: RegisterResponse = await response.json();
      console.log('[AuthService] ✅ Registro exitoso:', data);

      return {
        success: true,
        data,
        message: 'Registro exitoso. Ahora puedes iniciar sesión.',
      };
    } catch (error) {
      console.error('[AuthService] ❌ Register error (CATCH):', error);
      console.error('[AuthService] 🔍 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error,
        name: error instanceof Error ? error.name : 'N/A',
      });

      return {
        success: false,
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Verifica que el backend esté corriendo en ${API_CONFIG.BASE_URL}'}`,
      };
    }
  }

  /**
   * Cerrar sesión del usuario
   */
  async logout(): Promise<void> {
    await this.clearStoredToken();
    // TODO: Si el backend implementa invalidación de tokens, hacer la llamada aquí
  }

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }

  /**
   * Obtener información del usuario actual
   * TODO: Implementar endpoint /api/auth/me en el backend
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getStoredToken();
      if (!token) return null;

      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
        headers: getJsonHeaders(token),
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error('[AuthService] Error getting current user:', error);
      return null;
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
export default authService;
