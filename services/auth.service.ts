// Servicio de autenticación para VigilApp
import { AuthResponse, LoginCredentials, RegisterCredentials } from './types/auth.types';

export { AuthResponse, LoginCredentials, RegisterCredentials };

class AuthService {
  private baseUrl = 'https://your-api-url.com/api'; // Cambia por tu URL real
  private token: string | null = null;

  // Obtener token del storage
  async getStoredToken(): Promise<string | null> {
    try {
      // En Expo, usarías SecureStore o AsyncStorage
      // const token = await SecureStore.getItemAsync('auth_token');
      // return token;
      return this.token;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  // Guardar token en storage
  async setStoredToken(token: string): Promise<void> {
    try {
      // await SecureStore.setItemAsync('auth_token', token);
      this.token = token;
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  // Limpiar token del storage
  async clearStoredToken(): Promise<void> {
    try {
      // await SecureStore.deleteItemAsync('auth_token');
      this.token = null;
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await this.setStoredToken(data.token);
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al iniciar sesión',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta nuevamente.',
      };
    }
  }

  // Registro
  async register(userData: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await this.setStoredToken(data.token);
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al registrarse',
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta nuevamente.',
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    await this.clearStoredToken();
    // Aquí podrías hacer una llamada al servidor para invalidar el token
  }

  // Verificar si el usuario está autenticado
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }

  // Obtener información del usuario actual
  async getCurrentUser(): Promise<any | null> {
    try {
      const token = await this.getStoredToken();
      if (!token) return null;

      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}

// Exportar una instancia singleton
export const authService = new AuthService();
export default authService;
