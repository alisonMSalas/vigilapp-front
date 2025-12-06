/**
 * Pruebas de integración para el flujo completo de autenticación
 */
import authService from '@/services/auth.service';
import { API_CONFIG } from '@/services/config/api.config';
import * as SecureStore from 'expo-secure-store';

// Mock de expo-secure-store
jest.mock('expo-secure-store');

// Mock de fetch global
global.fetch = jest.fn();

describe('Integration: Auth Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Complete Registration Flow', () => {
    it('should complete full registration with face verification', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({
          message: 'Usuario registrado exitosamente',
          user: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
            verified: true,
          },
          token: 'mock-jwt-token-12345',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const credentials = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        fotoCedula: {
          uri: 'file://cedula.jpg',
          type: 'image',
          name: 'cedula.jpg',
        },
        selfie: {
          uri: 'file://selfie.jpg',
          type: 'image',
          name: 'selfie.jpg',
        },
      };

      const result = await authService.register(credentials);

      expect(result.success).toBe(true);
      expect(result.user?.firstName).toBe('John');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'mock-jwt-token-12345');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user', expect.any(String));
    });

    it('should handle face verification failure during registration', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Los rostros no coinciden',
          error: 'FACE_MISMATCH',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const credentials = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        fotoCedula: {
          uri: 'file://cedula.jpg',
          type: 'image',
          name: 'cedula.jpg',
        },
        selfie: {
          uri: 'file://selfie.jpg',
          type: 'image',
          name: 'selfie.jpg',
        },
      };

      const result = await authService.register(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('rostros no coinciden');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should handle ID validation failure', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          message: 'No parece ser una cédula válida',
          error: 'INVALID_ID',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const credentials = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        fotoCedula: {
          uri: 'file://not-an-id.jpg',
          type: 'image',
          name: 'not-an-id.jpg',
        },
        selfie: {
          uri: 'file://selfie.jpg',
          type: 'image',
          name: 'selfie.jpg',
        },
      };

      const result = await authService.register(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toContain('cédula válida');
    });
  });

  describe('Complete Login Flow', () => {
    it('should login and store credentials successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          token: 'mock-login-token',
          user: {
            id: 1,
            email: 'john@test.com',
            firstName: 'John',
            lastName: 'Doe',
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login('john@test.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-login-token');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'mock-login-token');
    });

    it('should handle invalid credentials', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          message: 'Credenciales inválidas',
          error: 'UNAUTHORIZED',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login('john@test.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('incorrectos');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('Token Management Flow', () => {
    it('should retrieve stored token after login', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('stored-token');

      const token = await SecureStore.getItemAsync('token');

      expect(token).toBe('stored-token');
    });

    it('should clear token on logout', async () => {
      await authService.logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user');
    });
  });

  describe('Session Validation Flow', () => {
    it('should validate session with valid token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('valid-token');

      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({
          valid: true,
          user: {
            id: 1,
            email: 'john@test.com',
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.validateSession();

      expect(result.valid).toBe(true);
    });

    it('should invalidate session with expired token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('expired-token');

      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          message: 'Token expirado',
          error: 'TOKEN_EXPIRED',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.validateSession();

      expect(result.valid).toBe(false);
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network timeout during registration', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network timeout'));

      const credentials = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        fotoCedula: {
          uri: 'file://cedula.jpg',
          type: 'image',
          name: 'cedula.jpg',
        },
        selfie: {
          uri: 'file://selfie.jpg',
          type: 'image',
          name: 'selfie.jpg',
        },
      };

      const result = await authService.register(credentials);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle network error during login', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      const result = await authService.login('john@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});
