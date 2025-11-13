/**
 * Servicio de autenticación para VigilApp
 * Conecta con el backend Spring Boot
 *
 * Endpoints:
 * - POST /api/register - Registro con multipart/form-data
 * - POST /api/login - Login con JSON
 */

import * as SecureStore from 'expo-secure-store';
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
  private currentUser: User | null = null;
  private readonly TOKEN_KEY = 'vigilapp_auth_token';

  /**
   * Decodificar JWT y extraer información del usuario
   */
  private decodeToken(token: string): User | null {
    try {
      console.log('[AuthService] 🔓 Intentando decodificar token...');

      // JWT tiene formato: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('[AuthService] ❌ Token JWT inválido, partes:', parts.length);
        return null;
      }

      // Decodificar el payload (segunda parte)
      const payload = parts[1];
      // Convertir base64url a base64 estándar
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      // Agregar padding si es necesario
      const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');

      console.log('[AuthService] 📦 Payload base64 (primeros 50 chars):', paddedBase64.substring(0, 50));

      const decoded = JSON.parse(atob(paddedBase64));

      console.log('[AuthService] 🔍 Token decodificado completo:');
      console.log(JSON.stringify(decoded, null, 2));
      console.log('[AuthService] 🔑 Claves disponibles:', Object.keys(decoded).join(', '));

      // Extraer información del usuario del JWT
      // Probar todas las posibles ubicaciones de userId y email
      const user = {
        id: decoded.userId || decoded.user_id || decoded.sub || decoded.id || decoded.jti || '',
        email: decoded.email || decoded.username || decoded.sub || '',
        firstName: decoded.firstName || decoded.first_name || decoded.given_name || '',
        lastName: decoded.lastName || decoded.last_name || decoded.family_name || '',
      };

      console.log('[AuthService] 👤 Usuario extraído:', JSON.stringify(user));

      if (!user.id) {
        console.error('[AuthService] ⚠️ No se pudo extraer userId del token');
        console.error('[AuthService] 📋 Payload completo para debug:', decoded);
      }

      return user;
    } catch (error) {
      console.error('[AuthService] ❌ Error decodificando token:', error);
      console.error('[AuthService] 📄 Token (primeros 100 chars):', token.substring(0, 100));
      return null;
    }
  }

  /**
   * Obtener token del storage
   */
  async getStoredToken(): Promise<string | null> {
    try {
      // Primero intentar desde memoria (más rápido)
      if (this.token) {
        return this.token;
      }

      // Si no está en memoria, recuperar de SecureStore
      const storedToken = await SecureStore.getItemAsync(this.TOKEN_KEY);
      if (storedToken) {
        this.token = storedToken;
        // También decodificar y cargar usuario
        this.currentUser = this.decodeToken(storedToken);
      }
      
      return storedToken;
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
      // Guardar en SecureStore (persistente)
      await SecureStore.setItemAsync(this.TOKEN_KEY, token);
      
      // También guardar en memoria para acceso rápido
      this.token = token;

      // Decodificar token y guardar usuario
      this.currentUser = this.decodeToken(token);
      console.log('[AuthService] Usuario guardado:', this.currentUser);
    } catch (error) {
      console.error('[AuthService] Error storing token:', error);
    }
  }

  /**
   * Limpiar token del storage
   */
  async clearStoredToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
      this.token = null;
      this.currentUser = null;
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
   * Obtener información del usuario actual del token JWT
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // Si ya tenemos el usuario en memoria, devolverlo
      if (this.currentUser) {
        return this.currentUser;
      }

      // Si no, intentar decodificar el token
      const token = await this.getStoredToken();
      if (!token) {
        console.log('[AuthService] No hay token');
        return null;
      }

      // Decodificar y guardar
      this.currentUser = this.decodeToken(token);
      return this.currentUser;
    } catch (error) {
      console.error('[AuthService] Error getting current user:', error);
      return null;
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();
export default authService;
