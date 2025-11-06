import { authService } from './auth.service';
import { API_CONFIG } from './config/api.config';

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
      // Convertir URL HTTP a WebSocket (http:// → ws://, https:// → wss://)
      const wsUrl = API_CONFIG.BASE_URL
        .replace('http://', 'ws://')
        .replace('https://', 'wss://')
        .replace('/api', '') + '/ws/alerts';

      console.log('[WebSocket] 🔌 Intentando conectar a:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] ✅ Conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        if (this.userId) {
          this.registerUser();
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] 📨 Mensaje recibido:', message);

          // Manejar mensajes de control del servidor
          if (message.type === 'CONNECTION_ESTABLISHED') {
            console.log('[WebSocket] ✅ Servidor confirmó conexión');
            return;
          }

          if (message.type === 'REGISTERED') {
            console.log('[WebSocket] ✅ Usuario registrado en el servidor');
            return;
          }

          if (message.type === 'ERROR') {
            console.error('[WebSocket] ❌ Error del servidor:', message.message);
            return;
          }

          // Procesar notificación de alerta
          if (message.event === 'NEW_ALERT') {
            // Notificar a todos los callbacks
            this.messageCallbacks.forEach(callback => callback(message as AlertNotification));
          }
        } catch (error) {
          console.error('[WebSocket] ❌ Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] ❌ Error de conexión:', {
          error: error,
          readyState: this.ws?.readyState,
          url: wsUrl,
        });

        // Solo mostrar consejos si es el primer intento
        if (this.reconnectAttempts === 0) {
          console.log('[WebSocket] 💡 Verifica que:');
          console.log('  1. El backend está corriendo');
          console.log('  2. La URL es correcta:', wsUrl);
          console.log('  3. No hay firewall bloqueando WebSocket');
        }
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
      console.log('[WebSocket] ⚠️ No se puede registrar: conexión no lista');
      return;
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      console.log('[WebSocket] ⚠️ WebSocket no está abierto, estado:', this.ws.readyState);
      return;
    }

    const registerMessage = JSON.stringify({
      type: 'REGISTER',
      userId: this.userId,
    });

    this.ws.send(registerMessage);
    console.log('[WebSocket] ✅ Usuario registrado en WebSocket');
  }

  /**
   * Intentar reconectar al WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] ⚠️ Máximo de intentos de reconexión alcanzado');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(`[WebSocket] 🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

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
      if (this.isConnected && this.userId && this.ws.readyState === WebSocket.OPEN) {
        try {
          const unregisterMessage = JSON.stringify({
            type: 'UNREGISTER',
            userId: this.userId,
          });
          this.ws.send(unregisterMessage);
          console.log('[WebSocket] ✅ Usuario desregistrado');
        } catch (error) {
          console.error('[WebSocket] ⚠️ Error al desregistrar usuario:', error);
        }
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
