# Fix: Persistencia del Token JWT

## Problema Identificado
El token JWT no se persistía entre recargas de la app, causando errores 401 en las peticiones a:
- `GET /api/user-zones/me`
- `GET /api/alerts/my-zone`

## Solución Implementada

### 1. Instalación de `expo-secure-store`
```bash
npm install expo-secure-store
```

### 2. Modificaciones en `services/auth.service.ts`
- Implementado almacenamiento persistente del token usando `SecureStore.setItemAsync()`
- Recuperación automática del token al iniciar usando `SecureStore.getItemAsync()`
- Caché en memoria para acceso rápido
- Limpieza completa al hacer logout

### 3. Mejoras en logs de error
- `services/user-zone.service.ts`: logs detallados con status HTTP y mensaje del backend
- `services/alert.service.ts`: logs mejorados para identificar errores
- `app/home.tsx`: captura y muestra mensajes de error específicos

### 4. Logs añadidos en backend
- `UserZoneController.java`: registra el email del usuario autenticado en cada llamada

## Cómo Probar

### 1. Reiniciar Metro (opcional pero recomendado)
```powershell
# En la terminal del frontend
# Detener con Ctrl+C y luego:
npm start -- --reset-cache
```

### 2. Flujo de prueba
1. **Login**: inicia sesión con tu usuario
2. **Verifica logs**: deberías ver `[AuthService] Usuario guardado: {id, email, ...}`
3. **Recarga la app**: presiona `r` en Metro o fuerza hot-reload
4. **Verifica persistencia**: la app debería mantener la sesión sin pedir login nuevamente
5. **Configura zona**: ve a Settings y configura tu ubicación + radio
6. **Verifica en Home**: deberías ver el radio y las alertas (si las hay)

### 3. Verificar logs esperados

#### Frontend (consola Metro/Expo)
```
✅ Logs correctos:
[AuthService] ✅ Login exitoso
[AuthService] Usuario guardado: { id: '...', email: 'user@example.com', ... }
[Home] ✅ Zona cargada: { radiusM: 5000, ... }
[Home] ✅ Alertas cargadas: 0

❌ Si ves errores:
[UserZoneService] ❌ Error getting user zone: Error al obtener zona (status 401)
→ Revisa que el token esté guardado correctamente
→ Verifica los logs del backend
```

#### Backend (logs de Spring Boot)
```
✅ Logs correctos:
[UserZoneController] getMyUserZone called by: user@example.com

❌ Si no aparece el log o el email está vacío:
→ El token no se está enviando o es inválido
→ Verificar configuración JWT en application.yml
```

## Pruebas con curl (opcional)

### Obtener zona del usuario
```powershell
# Sustituye <TOKEN> por el token real (lo ves en logs del frontend)
curl -v -H "Authorization: Bearer <TOKEN>" http://192.168.100.6:8080/api/user-zones/me
```

Respuestas esperadas:
- `200 OK` + JSON con zona → Todo correcto
- `404 Not Found` → Usuario no tiene zona configurada (normal si es primera vez)
- `401 Unauthorized` → Token inválido o no enviado

### Crear zona
```powershell
curl -v -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"centerLatitude\":-1.24238,\"centerLongitude\":-78.63836,\"radiusM\":5000}" http://192.168.100.6:8080/api/user-zones
```

Respuesta esperada:
- `200 OK` + JSON con zona creada

## Archivos Modificados
- ✅ `services/auth.service.ts` - Persistencia con SecureStore
- ✅ `services/user-zone.service.ts` - Logs mejorados
- ✅ `services/alert.service.ts` - Logs mejorados
- ✅ `app/home.tsx` - Captura de errores detallados
- ✅ `backend/.../UserZoneController.java` - Logs debug

## Siguiente Paso
Si tras estas correcciones sigues viendo 401 Unauthorized:
1. Pega aquí el log completo de frontend y backend
2. Copia el token (primeros/últimos 20 chars) para inspeccionarlo
3. Verifica que el backend esté escuchando en `http://192.168.100.6:8080`
