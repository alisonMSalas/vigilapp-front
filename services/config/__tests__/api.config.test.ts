/**
 * Pruebas unitarias para API Config
 */
import {
  API_CONFIG,
  getCommonHeaders,
  getJsonHeaders,
  createHeaders,
  handleApiError,
} from '../api.config';
import * as SecureStore from 'expo-secure-store';

type Headers = Record<string, string>;

describe('API Config', () => {
  describe('API_CONFIG', () => {
    it('debería tener la URL base configurada', () => {
      expect(API_CONFIG.BASE_URL).toBeDefined();
      expect(typeof API_CONFIG.BASE_URL).toBe('string');
    });

    it('debería tener timeout configurado', () => {
      expect(API_CONFIG.TIMEOUT).toBeDefined();
      expect(typeof API_CONFIG.TIMEOUT).toBe('number');
    });
  });

  describe('getCommonHeaders', () => {
    it('debería retornar headers vacíos sin token', () => {
      const headers = getCommonHeaders() as Headers;
      expect(headers).toEqual({});
    });

    it('debería incluir Authorization header con token', () => {
      const token = 'test-token';
      const headers = getCommonHeaders(token) as Headers;
      
      expect(headers).toHaveProperty('Authorization');
      expect(headers['Authorization']).toBe(`Bearer ${token}`);
    });

    it('debería manejar token null', () => {
      const headers = getCommonHeaders(null) as Headers;
      expect(headers).toEqual({});
    });
  });

  describe('getJsonHeaders', () => {
    it('debería incluir Content-Type para JSON', () => {
      const headers = getJsonHeaders() as Headers;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('debería incluir Authorization con token', () => {
      const token = 'test-token';
      const headers = getJsonHeaders(token) as Headers;
      
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe(`Bearer ${token}`);
    });
  });

  describe('createHeaders', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('debería crear headers con token del storage', async () => {
      const mockToken = 'stored-token';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockToken);

      const headers = await createHeaders('json') as Headers;

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe(`Bearer ${mockToken}`);
    });

    it('debería crear headers comunes sin especificar tipo', async () => {
      const mockToken = 'stored-token';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockToken);

      const headers = await createHeaders() as Headers;

      expect(headers['Authorization']).toBe(`Bearer ${mockToken}`);
      expect(headers['Content-Type']).toBeUndefined();
    });

    it('debería manejar error al obtener token', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const headers = await createHeaders('json') as Headers;

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBeUndefined();
    });

    it('debería retornar headers vacíos si no hay token y no es JSON', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);

      const headers = await createHeaders();

      expect(Object.keys(headers).length).toBe(0);
    });
  });

  describe('handleApiError', () => {
    it('debería manejar error 404', async () => {
      const mockResponse = {
        status: 404,
        json: async () => ({ message: 'No encontrado' }),
      } as Response;

      const error = await handleApiError(mockResponse);

      expect(error.status).toBe(404);
      expect(error.message).toContain('No encontrado');
    });

    it('debería manejar error 401', async () => {
      const mockResponse = {
        status: 401,
        json: async () => ({ message: 'No autorizado' }),
      } as Response;

      const error = await handleApiError(mockResponse);

      expect(error.status).toBe(401);
    });

    it('debería manejar error 500', async () => {
      const mockResponse = {
        status: 500,
        json: async () => ({ message: 'Error del servidor' }),
      } as Response;

      const error = await handleApiError(mockResponse);

      expect(error.status).toBe(500);
    });

    it('debería manejar respuesta sin JSON válido', async () => {
      const mockResponse = {
        status: 400,
        json: async () => {
          throw new Error('Invalid JSON');
        },
        text: async () => 'Error text',
      } as unknown as Response;

      const error = await handleApiError(mockResponse);

      expect(error.status).toBe(400);
      expect(error.message).toBeDefined();
    });

    it('debería convertir mensajes técnicos en amigables', async () => {
      const mockResponse = {
        status: 400,
        json: async () => ({ message: 'No se detectó ningún rostro en la selfie' }),
      } as Response;

      const error = await handleApiError(mockResponse);

      expect(error.message).toContain('rostro');
      expect(error.message).toContain('selfie');
    });
  });
});
