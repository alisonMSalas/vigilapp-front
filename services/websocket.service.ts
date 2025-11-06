import { authService } from './auth.service';

export interface AlertNotification {
  event: 'NEW_ALERT';
  alertId: string;
  alertTitle: string;
  alertCategory: string;
  alertDescription: string;
  latitude: number;
  longitude: number;
  createdByUserName: string;
  timestamp: number;
}

type MessageCallback = (message: AlertNotification) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private messageCallbacks: MessageCallback[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private userId: string | null = null;

  /**
   * Conectar al WebSocket del backend
   */
  async connect(): Promise<void> {
    try {
      // Verificar que hay un token (usuario autenticado)
      const token = await authService.getStoredToken();
      if (!token) {
        console.log('[WebSocket] No hay token, no se puede conectar');
        return;
      }

      // Intentar obtener usuario, pero continuar sin él si no está disponible
      const user = await authService.getCurrentUser();
      if (user) {
        this.userId = user.id;
      } else {
        console.log('[WebSocket] No se pudo obtener info del usuario, conectando sin ID');
      }

      // Conectar al endpoint WebSocket
      const wsUrl = 'ws://192.168.100.6:8080/ws/alerts';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] ✅ Conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // Registrar usuario en el servidor si tenemos ID
        if (this.userId) {
          this.registerUser();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: AlertNotification = JSON.parse(event.data);
          console.log('[WebSocket] 📨 Mensaje recibido:', message);

          // Notificar a todos los callbacks
          this.messageCallbacks.forEach(callback => callback(message));
        } catch (error) {
          console.error('[WebSocket] ❌ Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] ❌ Error:', error);
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] 🔌 Desconectado');
        this.isConnected = false;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[WebSocket] ❌ Error connecting:', error);
    }
  }

  /**
   * Registrar usuario en el servidor WebSocket
   */
  private registerUser(): void {
    if (!this.isConnected || !this.ws || !this.userId) {
      return;
    }

    const registerMessage = JSON.stringify({
      type: 'REGISTER',
      userId: this.userId,
    });

    this.ws.send(registerMessage);
    console.log('Usuario registrado en WebSocket');
  }

  /**
   * Intentar reconectar al WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Máximo de intentos de reconexión alcanzado');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(`Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Desconectar del WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      // Desregistrar usuario antes de cerrar
      if (this.isConnected && this.userId) {
        const unregisterMessage = JSON.stringify({
          type: 'UNREGISTER',
          userId: this.userId,
        });
        this.ws.send(unregisterMessage);
      }

      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
    this.messageCallbacks = [];
    this.userId = null;
  }

  /**
   * Suscribirse a mensajes de alertas
   */
  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);

    // Retornar función para desuscribirse
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Verificar si está conectado
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
