/**
 * Pruebas unitarias para AuthService
 */
import * as SecureStore from 'expo-secure-store';
import { authService } from '../auth.service';
import { API_CONFIG } from '../config/api.config';

// Mock de fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpiar el token almacenado
    (authService as any).token = null;
    (authService as any).currentUser = null;
  });

  describe('login', () => {
    it('debería realizar login exitoso y almacenar el token', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJmaXJzdE5hbWUiOiJKb2huIiwibGFzdE5hbWUiOiJEb2UifQ.abc123';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockToken,
      } as Response);

      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockToken);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/login`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'password123',
          }),
        })
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'vigilapp_auth_token',
        mockToken
      );
    });

    it('debería manejar error de credenciales inválidas', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Credenciales inválidas' }),
      } as Response);

      const result = await authService.login({
        email: 'wrong@test.com',
        password: 'wrongpass',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Email o contraseña incorrectos');
      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('debería manejar error de conexión', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Error de conexión');
    });

    it('debería manejar respuesta sin token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
      } as Response);

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('No se recibió el token');
    });
  });

  describe('register', () => {
    it('debería registrar usuario exitosamente con fotos', async () => {
      const mockResponse = {
        id: '123',
        email: 'newuser@test.com',
        firstName: 'New',
        lastName: 'User',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      } as Response);

      const result = await authService.register({
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fotoCedula: {
          uri: 'file://cedula.jpg',
          type: 'image/jpeg',
          name: 'cedula.jpg',
        },
        selfie: {
          uri: 'file://selfie.jpg',
          type: 'image/jpeg',
          name: 'selfie.jpg',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}/register`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('debería manejar error de registro con email duplicado', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'El email ya está registrado' }),
      } as Response);

      const result = await authService.register({
        firstName: 'New',
        lastName: 'User',
        email: 'existing@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fotoCedula: null,
        selfie: null,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('El email ya está registrado');
    });

    it('debería manejar error de conexión en registro', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.register({
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@test.com',
        password: 'password123',
        confirmPassword: 'password123',
        fotoCedula: null,
        selfie: null,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Error de conexión');
    });
  });

  describe('logout', () => {
    it('debería limpiar el token al hacer logout', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Simular que hay un token almacenado
      (authService as any).token = 'some-token';
      (authService as any).currentUser = { id: '123', email: 'test@test.com' };

      await authService.logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('vigilapp_auth_token');
      expect((authService as any).token).toBeNull();
      expect((authService as any).currentUser).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('debería retornar true si hay token almacenado', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('some-token');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('debería retornar false si no hay token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('debería retornar el usuario decodificado del token', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJmaXJzdE5hbWUiOiJKb2huIiwibGFzdE5hbWUiOiJEb2UifQ.abc123';
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockToken);

      const user = await authService.getCurrentUser();

      expect(user).not.toBeNull();
      expect(user?.id).toBe('123');
      expect(user?.email).toBe('test@test.com');
      expect(user?.firstName).toBe('John');
      expect(user?.lastName).toBe('Doe');
    });

    it('debería retornar null si no hay token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('debería retornar usuario de memoria si ya está cargado', async () => {
      const mockUser = {
        id: '123',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      
      (authService as any).currentUser = mockUser;

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('getStoredToken', () => {
    it('debería recuperar token del storage', async () => {
      const mockToken = 'stored-token';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockToken);

      const token = await authService.getStoredToken();

      expect(token).toBe(mockToken);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('vigilapp_auth_token');
    });

    it('debería retornar token de memoria si está disponible', async () => {
      const mockToken = 'memory-token';
      (authService as any).token = mockToken;

      const token = await authService.getStoredToken();

      expect(token).toBe(mockToken);
      expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it('debería manejar error al recuperar token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const token = await authService.getStoredToken();

      expect(token).toBeNull();
    });
  });
});
