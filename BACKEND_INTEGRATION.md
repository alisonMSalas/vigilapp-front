# Guía de Integración con Backend Spring Boot

Esta guía explica cómo conectar el frontend de VigilApp con el backend de Spring Boot.

## Configuración del Backend

### 1. URL del Servidor

El frontend se conecta al backend mediante la configuración en `services/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 30000,
} as const;
```

### 2. Configuración para Diferentes Entornos

**Desarrollo Local (Emulador/Simulador):**
```typescript
BASE_URL: 'http://localhost:8080/api'
```

**Desarrollo con Dispositivo Físico:**
```typescript
BASE_URL: 'http://192.168.1.10:8080/api' // Reemplazar con tu IP local
```

Para obtener tu IP local:
- Windows: `ipconfig` en CMD
- Mac/Linux: `ifconfig` en Terminal
- Busca la dirección IPv4 de tu red WiFi/Ethernet

**Producción:**
```typescript
BASE_URL: 'https://tu-dominio.com/api'
```

## Endpoints del Backend

### Login
```
POST /api/login
Content-Type: application/json

Request Body:
{
  "email": "usuario@ejemplo.com",
  "password": "mipassword"
}

Response: JWT Token (plain text)
```

### Registro
```
POST /api/register
Content-Type: multipart/form-data

Form Fields:
- firstName: string
- lastName: string
- email: string
- password: string
- fotoCedula: File (image)
- selfie: File (image)

Response:
{
  "id": "uuid",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "email": "email@ejemplo.com",
  "role": "USER",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

## Estructura del Código

### Servicios

**`services/auth.service.ts`**
- Maneja login y registro
- Almacena token JWT
- Gestiona autenticación

**`services/image-picker.service.ts`**
- Maneja selección de imágenes
- Solicita permisos de cámara/galería
- Formatea imágenes para envío

**`services/config/api.config.ts`**
- Configuración centralizada de API
- Headers comunes
- Manejo de errores

### Tipos TypeScript

**`services/types/auth.types.ts`**
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  fotoCedula: ImageAsset | null;
  selfie: ImageAsset | null;
}

interface ImageAsset {
  uri: string;
  type: string;
  name: string;
}
```

## Manejo de Errores

El sistema maneja errores en múltiples niveles:

1. **Errores de Red**: Capturados en catch blocks
2. **Errores HTTP**: Procesados por `handleApiError()`
3. **Errores de Validación**: Mostrados inline en formularios

```typescript
// Ejemplo de respuesta de error del backend
{
  "message": "El correo electrónico ya está registrado",
  "status": 400,
  "details": "Usuario ya existe"
}
```

## Testing de la Integración

### 1. Verificar Backend Activo
```bash
curl http://localhost:8080/api/health
```

### 2. Probar Login
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### 3. Ver Logs del Frontend
Los servicios incluyen logging con prefijo `[ServiceName]`:
```
[AuthService] Login error: ...
[ImagePickerService] Error requesting camera permission: ...
```

## CORS (Si es necesario)

Si el backend necesita configuración CORS para desarrollo:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*");
            }
        };
    }
}
```

## Seguridad

### Almacenamiento del Token

Actualmente el token se guarda en memoria. Para producción, implementar:

```typescript
import * as SecureStore from 'expo-secure-store';

async setStoredToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('auth_token', token);
}

async getStoredToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('auth_token');
}
```

### Timeout de Peticiones

El timeout por defecto es 30 segundos para permitir uploads de imágenes. Ajustar en `api.config.ts` si es necesario.

## Troubleshooting

### Error: Network request failed
- Verificar que el backend esté corriendo
- Verificar la URL en `api.config.ts`
- Si usas dispositivo físico, asegúrate de usar la IP local, no localhost

### Error: Timeout
- Aumentar `API_TIMEOUT` en `api.config.ts`
- Verificar conexión de red
- Verificar que el backend no esté sobrecargado

### Error: 400 Bad Request
- Verificar que los campos requeridos estén presentes
- Verificar formato de email
- Verificar que las imágenes se estén enviando correctamente

### Error: Cannot upload images
- Verificar permisos de cámara/galería
- En iOS: agregar permisos en `app.json`
- En Android: los permisos se solicitan automáticamente

## Mejoras Futuras

1. Implementar refresh token
2. Agregar interceptor para reintentos automáticos
3. Implementar caché de respuestas
4. Agregar modo offline
5. Implementar SecureStore para persistencia del token
