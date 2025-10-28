# 🚀 Quick Start - VigilApp Frontend

Guía rápida para poner en marcha la aplicación con el backend.

## 📋 Pre-requisitos

- Node.js 18+ instalado
- Backend Spring Boot corriendo en `http://localhost:8080`
- Expo CLI instalado globalmente (opcional): `npm install -g @expo/cli`

## ⚡ Inicio Rápido (3 pasos)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar URL del backend

**Si usas emulador/simulador:** No necesitas cambiar nada.

**Si usas dispositivo físico:** Edita `services/config/api.config.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'http://TU_IP_LOCAL:8080/api', // Ej: http://192.168.1.10:8080/api
  TIMEOUT: 30000,
} as const;
```

Para obtener tu IP local:
- **Windows:** Ejecuta `ipconfig` en CMD
- **Mac/Linux:** Ejecuta `ifconfig` en Terminal
- Busca la IPv4 de tu red WiFi/Ethernet

### 3. Iniciar la aplicación
```bash
npm start
```

Luego presiona:
- `a` para abrir en Android
- `i` para abrir en iOS
- `w` para abrir en web

## 🔍 Verificar que el Backend está corriendo

```bash
curl http://localhost:8080/api/health
```

O abre en tu navegador: `http://localhost:8080/api/health`

## 📱 Primera Prueba

### Registro de Usuario
1. Abre la app y ve a "Regístrate"
2. Completa el formulario:
   - Nombres: Juan
   - Apellidos: Pérez
   - Email: juan@ejemplo.com
   - Contraseña: password123
   - Confirmar contraseña: password123
3. Toca "Tomar o subir foto de cédula" → Selecciona una imagen
4. Toca "Tomar o subir selfie" → Selecciona una imagen
5. Acepta los términos y condiciones
6. Toca "CREAR CUENTA"

### Login
1. Email: juan@ejemplo.com
2. Contraseña: password123
3. Toca "INGRESAR"

## 🐛 Problemas Comunes

### Error: "Network request failed"
**Solución:**
1. Verifica que el backend esté corriendo
2. Si usas dispositivo físico, verifica la IP en `api.config.ts`
3. Verifica que estés en la misma red WiFi

### Error: "Cannot upload images"
**Solución:**
1. Acepta los permisos de cámara/galería cuando se soliciten
2. En emulador, asegúrate de tener imágenes en la galería

### El login no funciona
**Solución:**
1. Verifica que el usuario esté registrado en el backend
2. Verifica que la contraseña sea correcta
3. Revisa los logs del backend para más detalles

## 📂 Estructura del Proyecto

```
vigilapp-front/
├── app/                    # Pantallas (routing)
│   ├── login.tsx
│   └── register.tsx
├── components/             # Componentes reutilizables
│   └── auth/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
├── services/              # Lógica de negocio
│   ├── auth.service.ts
│   ├── image-picker.service.ts
│   ├── config/
│   │   └── api.config.ts
│   └── types/
│       └── auth.types.ts
├── constants/             # Constantes y temas
└── hooks/                 # React hooks personalizados
```

## 🔧 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm start

# Limpiar caché y reiniciar
npm start --clear

# Linter
npm run lint

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📖 Documentación Adicional

- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Guía completa de integración
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Resumen de implementación
- [CLAUDE.md](./CLAUDE.md) - Arquitectura del proyecto
- [README.md](./README.md) - Documentación general de Expo

## 🆘 Necesitas Ayuda?

1. Revisa los logs en la terminal
2. Revisa los logs del backend
3. Consulta [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) sección Troubleshooting
4. Verifica que todas las dependencias estén instaladas

## ✅ Checklist de Configuración

Antes de empezar, verifica:
- [ ] Node.js instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Backend Spring Boot corriendo
- [ ] URL del backend configurada correctamente
- [ ] Dispositivo/emulador conectado
- [ ] Permisos de cámara/galería aceptados

---

**¡Listo!** Ahora deberías poder usar la aplicación conectada al backend. 🎉
