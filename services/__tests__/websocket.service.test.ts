import { webSocketService } from '../websocket.service';
import { authService } from '../auth.service';

// Mock authService
jest.mock('../auth.service', () => ({
  authService: {
    getCurrentUser: jest.fn(),
  },
}));

// Mock WebSocket
let mockWebSocketInstance: MockWebSocket | null = null;

class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  
  send = jest.fn();
  close = jest.fn();

  constructor(public url: string) {
    mockWebSocketInstance = this;
  }
}

global.WebSocket = MockWebSocket as any;

describe('WebSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    webSocketService.disconnect();
  });

  describe('connect', () => {
    it('should not connect if no user is found', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);

      await webSocketService.connect();

      expect(authService.getCurrentUser).toHaveBeenCalled();
    });

    it('should connect successfully when user exists', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@test.com',
      });

      await webSocketService.connect();

      expect(authService.getCurrentUser).toHaveBeenCalled();
    });

    it('should handle user without id', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
      });

      await webSocketService.connect();

      expect(authService.getCurrentUser).toHaveBeenCalled();
    });
  });

  describe('isWebSocketConnected', () => {
    it('should return false when not connected', () => {
      expect(webSocketService.isWebSocketConnected()).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', () => {
      webSocketService.disconnect();
      expect(webSocketService.isWebSocketConnected()).toBe(false);
    });

    it('should disconnect multiple times safely', () => {
      webSocketService.disconnect();
      webSocketService.disconnect();
      expect(webSocketService.isWebSocketConnected()).toBe(false);
    });
  });

  describe('onMessage', () => {
    it('should register message callback and return unsubscribe function', () => {
      const callback = jest.fn();
      const unsubscribe = webSocketService.onMessage(callback);
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should handle multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const unsubscribe1 = webSocketService.onMessage(callback1);
      const unsubscribe2 = webSocketService.onMessage(callback2);
      
      expect(typeof unsubscribe1).toBe('function');
      expect(typeof unsubscribe2).toBe('function');
      
      unsubscribe1();
      unsubscribe2();
    });

    it('should call all registered callbacks when message is received', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@test.com',
      });

      const callback1 = jest.fn();
      const callback2 = jest.fn();
      webSocketService.onMessage(callback1);
      webSocketService.onMessage(callback2);

      await webSocketService.connect();

      // Simular onopen
      if (mockWebSocketInstance?.onopen) mockWebSocketInstance.onopen();

      // Simular mensaje recibido
      const testMessage = {
        event: 'NEW_ALERT',
        alertId: 'alert-123',
        alertTitle: 'Test Alert',
        alertCategory: 'Emergency',
        alertDescription: 'Test description',
        latitude: 40.7128,
        longitude: -74.0060,
        createdByUserName: 'John Doe',
        timestamp: Date.now(),
      };

      if (mockWebSocketInstance?.onmessage) {
        mockWebSocketInstance.onmessage({ data: JSON.stringify(testMessage) });
      }

      expect(callback1).toHaveBeenCalledWith(testMessage);
      expect(callback2).toHaveBeenCalledWith(testMessage);
    });

    it('should unsubscribe specific callback', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: '123',
        email: 'test@test.com',
      });

      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const unsubscribe1 = webSocketService.onMessage(callback1);
      webSocketService.onMessage(callback2);

      await webSocketService.connect();

      // Simular onopen
      if (mockWebSocketInstance?.onopen) mockWebSocketInstance.onopen();

      // Desuscribir callback1
      unsubscribe1();

      // Simular mensaje
      const testMessage = {
        event: 'NEW_ALERT' as const,
        alertId: 'alert-456',
        alertTitle: 'Another Alert',
        alertCategory: 'Warning',
        alertDescription: 'Test',
        latitude: 0,
        longitude: 0,
        createdByUserName: 'Jane',
        timestamp: Date.now(),
      };

      if (mockWebSocketInstance?.onmessage) {
        mockWebSocketInstance.onmessage({ data: JSON.stringify(testMessage) });
      }

      // callback1 NO debería haber sido llamado
      expect(callback1).not.toHaveBeenCalled();
      // callback2 SÍ debería haber sido llamado
      expect(callback2).toHaveBeenCalledWith(testMessage);
    });
  });

  describe('WebSocket lifecycle', () => {
    it('should trigger onopen and register user', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-789',
        email: 'test@test.com',
      });

      await webSocketService.connect();
      
      // Simular onopen
      if (mockWebSocketInstance?.onopen) mockWebSocketInstance.onopen();

      expect(webSocketService.isWebSocketConnected()).toBe(true);
      expect(mockWebSocketInstance?.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'REGISTER', userId: 'user-789' })
      );
    });

    it('should handle onclose and attempt reconnection', async () => {
      jest.useFakeTimers();
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-reconnect',
        email: 'reconnect@test.com',
      });

      await webSocketService.connect();
      
      // Simular onopen primero
      if (mockWebSocketInstance?.onopen) mockWebSocketInstance.onopen();
      expect(webSocketService.isWebSocketConnected()).toBe(true);

      // Simular onclose
      if (mockWebSocketInstance?.onclose) mockWebSocketInstance.onclose();

      expect(webSocketService.isWebSocketConnected()).toBe(false);

      // Avanzar timer para reconexión (primer intento: 2000ms)
      jest.advanceTimersByTime(2000);

      jest.useRealTimers();
    });

    it('should handle onerror', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-error',
        email: 'error@test.com',
      });

      await webSocketService.connect();
      
      // Simular error
      if (mockWebSocketInstance?.onerror) {
        mockWebSocketInstance.onerror(new Error('WebSocket error test'));
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should handle message parsing errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-parse-error',
        email: 'parse@test.com',
      });

      await webSocketService.connect();

      if (mockWebSocketInstance?.onopen) mockWebSocketInstance.onopen();

      // Simular mensaje con JSON inválido
      if (mockWebSocketInstance?.onmessage) {
        mockWebSocketInstance.onmessage({ data: 'invalid json {' });
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error parsing WebSocket message:',
        expect.any(SyntaxError)
      );
      consoleErrorSpy.mockRestore();
    });

    it('should send UNREGISTER message on disconnect when connected', async () => {
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-unregister',
        email: 'unregister@test.com',
      });

      await webSocketService.connect();

      if (mockWebSocketInstance?.onopen) mockWebSocketInstance.onopen();

      expect(webSocketService.isWebSocketConnected()).toBe(true);

      // Desconectar
      webSocketService.disconnect();

      expect(mockWebSocketInstance?.send).toHaveBeenCalledWith(
        JSON.stringify({ type: 'UNREGISTER', userId: 'user-unregister' })
      );
      expect(mockWebSocketInstance?.close).toHaveBeenCalled();
    });

    it('should not send UNREGISTER when disconnecting while not connected', () => {
      const mockWs = {
        send: jest.fn(),
        close: jest.fn(),
      };

      // No conectar, solo desconectar
      webSocketService.disconnect();

      expect(mockWs.send).not.toHaveBeenCalled();
    });

    it('should stop reconnection attempts after max attempts', async () => {
      jest.useFakeTimers();
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-max-reconnect',
        email: 'max@test.com',
      });

      await webSocketService.connect();

      if (mockWebSocketInstance?.onopen) mockWebSocketInstance.onopen();

      // Simular 5 desconexiones (max attempts)
      for (let i = 0; i < 5; i++) {
        if (mockWebSocketInstance?.onclose) mockWebSocketInstance.onclose();
        jest.advanceTimersByTime(20000); // Avanzar suficiente para todos los intentos
      }

      // En el sexto intento, debería detenerse
      if (mockWebSocketInstance?.onclose) mockWebSocketInstance.onclose();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Máximo de intentos de reconexión alcanzado')
      );

      consoleLogSpy.mockRestore();
      jest.useRealTimers();
    });

    it('should clear reconnect timeout on disconnect', async () => {
      jest.useFakeTimers();
      (authService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-clear-timeout',
        email: 'clear@test.com',
      });

      await webSocketService.connect();

      if (mockWebSocketInstance?.onopen) mockWebSocketInstance.onopen();
      if (mockWebSocketInstance?.onclose) mockWebSocketInstance.onclose();

      // Desconectar antes de que se complete el reconnect timeout
      webSocketService.disconnect();

      // Avanzar el tiempo - no debería reconectar porque se canceló
      jest.advanceTimersByTime(30000);

      expect(webSocketService.isWebSocketConnected()).toBe(false);

      jest.useRealTimers();
    });

    it('should handle connection error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (authService.getCurrentUser as jest.Mock).mockRejectedValue(
        new Error('Connection failed')
      );

      await webSocketService.connect();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error connecting to WebSocket:',
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
