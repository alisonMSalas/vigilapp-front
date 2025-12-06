/**
 * Configuración centralizada de la API
 * Punto único para configurar la URL base y headers comunes
 */
import * as SecureStore from 'expo-secure-store';

// URL base del backend Spring Boot
// TODO: Cambiar a la IP/URL real del servidor en producción
export const API_CONFIG = {
  BASE_URL: 'http://192.168.100.6:8080/api',
  TIMEOUT: 30000,
} as const;

/**
 * Headers comunes para todas las peticiones
 */
export const getCommonHeaders = (token?: string | null): HeadersInit => {
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Headers para peticiones JSON
 */
export const getJsonHeaders = (token?: string | null): HeadersInit => {
  return {
    ...getCommonHeaders(token),
    'Content-Type': 'application/json',
  };
};

/**
 * Crea headers con token de autenticación desde el almacenamiento
 * Uso: await createHeaders('json') o await createHeaders()
 */
export const createHeaders = async (type?: 'json', token?: string | null): Promise<HeadersInit> => {
  console.log("[API_CONFIG] 🔑 createHeaders called, type:", type);
  try {
    // Si no se pasa token, intentar obtenerlo de SecureStore
    let authToken = token;
    if (!authToken) {
      try {
        authToken = await SecureStore.getItemAsync('token');
      } catch (e) {
        console.log("[API_CONFIG] No token found in SecureStore");
      }
    }
    console.log("[API_CONFIG] 🎟️ Token:", authToken ? `${authToken.substring(0, 20)}...` : "NULL");
    
    if (type === 'json') {
      const headers = getJsonHeaders(authToken);
      console.log("[API_CONFIG] 📦 Returning JSON headers");
      return headers;
    }
    
    const headers = getCommonHeaders(authToken);
    console.log("[API_CONFIG] 📦 Returning common headers");
    return headers;
  } catch (error) {
    console.error('[API Config] Error creating headers:', error);
    // Retornar headers sin token si hay error
    return type === 'json' ? { 'Content-Type': 'application/json' } : {};
  }
};

/**
 * Manejo de errores HTTP
 */
export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

/**
 * Convierte mensajes técnicos del backend en mensajes amigables
 */
const getFriendlyErrorMessage = (technicalMessage: string): string => {
  const message = technicalMessage.toLowerCase();

  // Errores de verificación facial
  if (message.includes('no se detectó ningún rostro') || message.includes('no face detected')) {
    if (message.includes('cédula') || message.includes('id')) {
      return 'No se detectó un rostro en la foto de la cédula. Por favor, asegúrate de que la foto sea clara y el rostro sea visible.';
    }
    if (message.includes('selfie')) {
      return 'No se detectó tu rostro en la selfie. Por favor, toma una foto clara donde tu rostro sea visible.';
    }
    return 'No se pudo detectar un rostro en la imagen. Por favor, intenta con una foto más clara.';
  }

  // Errores de coincidencia de rostros
  if (message.includes('rostros no coinciden') || message.includes('faces do not match')) {
    return 'Los rostros no coinciden. Por favor, verifica que la foto de tu cédula y tu selfie sean de la misma persona.';
  }

  // Errores de validación de documento
  if (message.includes('no parece ser una cédula válida') || message.includes('not a valid id')) {
    return 'La imagen no parece ser una cédula válida. Por favor, toma una foto clara de tu documento de identidad.';
  }

  // Errores de imagen
  if (message.includes('imagen borrosa') || message.includes('blurry image')) {
    return 'La imagen está muy borrosa. Por favor, toma una foto más nítida.';
  }

  if (message.includes('imagen muy oscura') || message.includes('too dark')) {
    return 'La imagen está muy oscura. Por favor, toma la foto con mejor iluminación.';
  }

  // Errores de campos obligatorios
  if (message.includes('foto de la cédula es obligatoria')) {
    return 'Debes proporcionar una foto de tu cédula.';
  }

  if (message.includes('selfie es obligatorio')) {
    return 'Debes proporcionar una selfie.';
  }

  // Errores de usuario
  if (message.includes('ya existe un usuario registrado')) {
    return 'Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.';
  }

  if (message.includes('credenciales inválidas') || message.includes('bad credentials')) {
    return 'Email o contraseña incorrectos. Por favor, verifica tus datos.';
  }

  // Errores de verificación
  if (message.includes('error al verificar rostros') || message.includes('error verificando rostros')) {
    return 'Hubo un problema al verificar tu identidad. Por favor, intenta nuevamente con fotos más claras.';
  }

  // Si no coincide con ningún patrón, intentar limpiar el mensaje técnico
  // Eliminar stack traces y detalles técnicos
  const cleanMessage = technicalMessage
    .split('\n')[0] // Solo la primera línea
    .replace(/Error validando documento de identidad: /gi, '')
    .replace(/Error verificando rostros: /gi, '')
    .replace(/RuntimeException: /gi, '')
    .replace(/ResponseStatusException: /gi, '')
    .trim();

  // Si el mensaje limpiado es muy largo (>150 caracteres), mostrar uno genérico
  if (cleanMessage.length > 150) {
    return 'No se pudo completar la verificación. Por favor, asegúrate de usar fotos claras y bien iluminadas.';
  }

  return cleanMessage;
};

/**
 * Maneja la respuesta de error de la API
 */
export const handleApiError = async (response: Response): Promise<ApiError> => {
  let message = 'Error de conexión con el servidor';
  let details: string | undefined;

  try {
    const errorData = await response.json();
    const technicalMessage = errorData.message || errorData.error || message;

    // Convertir mensaje técnico a mensaje amigable
    message = getFriendlyErrorMessage(technicalMessage);
    details = errorData.details;
  } catch {
    // Si no se puede parsear el error, usar el statusText
    message = response.statusText || message;
  }

  return {
    message,
    status: response.status,
    details,
  };
};
