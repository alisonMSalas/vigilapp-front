# Mensajes de Error Amigables - VigilApp

Este documento describe cómo el frontend maneja los mensajes de error del backend para mostrarlos de forma amigable al usuario.

## 🎯 Objetivo

Convertir mensajes técnicos del backend en mensajes claros y útiles para el usuario final.

---

## 📋 Mapeo de Errores

### Errores de Verificación Facial

| Error del Backend | Mensaje al Usuario |
|-------------------|-------------------|
| "No se detectó ningún rostro en la imagen de la cédula" | "No se detectó un rostro en la foto de la cédula. Por favor, asegúrate de que la foto sea clara y el rostro sea visible." |
| "No se detectó ningún rostro en la selfie" | "No se detectó tu rostro en la selfie. Por favor, toma una foto clara donde tu rostro sea visible." |
| "Los rostros no coinciden. Similitud: X%, Distancia: Y" | "Los rostros no coinciden. Por favor, verifica que la foto de tu cédula y tu selfie sean de la misma persona." |

### Errores de Validación de Documento

| Error del Backend | Mensaje al Usuario |
|-------------------|-------------------|
| "La imagen no parece ser una cédula válida. Confianza: X%" | "La imagen no parece ser una cédula válida. Por favor, toma una foto clara de tu documento de identidad." |
| "La foto de la cédula es obligatoria" | "Debes proporcionar una foto de tu cédula." |
| "El selfie es obligatorio" | "Debes proporcionar una selfie." |

### Errores de Calidad de Imagen

| Error del Backend | Mensaje al Usuario |
|-------------------|-------------------|
| "Imagen borrosa" | "La imagen está muy borrosa. Por favor, toma una foto más nítida." |
| "Imagen muy oscura" | "La imagen está muy oscura. Por favor, toma la foto con mejor iluminación." |

### Errores de Usuario

| Error del Backend | Mensaje al Usuario |
|-------------------|-------------------|
| "Ya existe un usuario registrado con el correo X" | "Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo." |
| "Bad credentials" | "Email o contraseña incorrectos. Por favor, verifica tus datos." |

### Errores Generales

| Error del Backend | Mensaje al Usuario |
|-------------------|-------------------|
| "Error al verificar rostros: [mensaje técnico largo]" | "Hubo un problema al verificar tu identidad. Por favor, intenta nuevamente con fotos más claras." |
| Stack traces o errores > 150 caracteres | "No se pudo completar la verificación. Por favor, asegúrate de usar fotos claras y bien iluminadas." |

---

## 🛠️ Implementación

Los mensajes se procesan en el archivo [services/config/api.config.ts](services/config/api.config.ts) mediante la función `getFriendlyErrorMessage()`.

### Flujo de Manejo de Errores

```
Backend Error Response
         ↓
handleApiError()
         ↓
getFriendlyErrorMessage()
         ↓
Mensaje Amigable
         ↓
Alert al Usuario
```

### Ejemplo de Código

```typescript
// Error del backend
{
  "status": 400,
  "message": "Error verificando rostros: No se detectó ningún rostro en la imagen de la cédula. Face recognition failed..."
}

// Procesamiento en frontend
const friendlyMessage = getFriendlyErrorMessage(error.message);
// Resultado: "No se detectó un rostro en la foto de la cédula. Por favor, asegúrate de que la foto sea clara y el rostro sea visible."

// Mostrado al usuario
Alert.alert('Error', friendlyMessage);
```

---

## 🎨 Mejores Prácticas

1. **Evitar Términos Técnicos**
   - ❌ "RuntimeException: Face recognition failed"
   - ✅ "No se pudo detectar un rostro en la imagen"

2. **Proporcionar Soluciones**
   - ❌ "Error en la imagen"
   - ✅ "La imagen está muy oscura. Por favor, toma la foto con mejor iluminación"

3. **Ser Específico pero Amigable**
   - ❌ "Los rostros no coinciden. Similitud: 67.3%, Distancia: 0.445 (umbral: 0.6)"
   - ✅ "Los rostros no coinciden. Por favor, verifica que las fotos sean de la misma persona"

4. **Mantener la Calma del Usuario**
   - ❌ "ERROR CRÍTICO: Verificación fallida"
   - ✅ "No se pudo completar la verificación. Por favor, intenta nuevamente"

---

## 🔄 Agregar Nuevos Mensajes

Para agregar soporte para nuevos mensajes de error:

1. Identifica el mensaje que envía el backend
2. Agrega un nuevo `if` en `getFriendlyErrorMessage()`
3. Define el mensaje amigable
4. Actualiza esta documentación

### Ejemplo

```typescript
// En api.config.ts, dentro de getFriendlyErrorMessage()

if (message.includes('timeout') || message.includes('tiempo agotado')) {
  return 'La verificación está tomando mucho tiempo. Por favor, verifica tu conexión e intenta nuevamente.';
}
```

---

## 📱 Experiencia del Usuario

### Antes
```
Error: RuntimeException: Error verificando rostros: java.lang.RuntimeException:
Face detection failed: No faces detected in id_image. Please ensure the image
contains a clear, well-lit face. Stack trace: at
com.fram.vigilapp.service.impl.FaceVerificationServiceImpl.verifyFace...
```

### Después
```
No se detectó un rostro en la foto de la cédula. Por favor, asegúrate
de que la foto sea clara y el rostro sea visible.
```

---

## 🧪 Testing

Para probar los mensajes de error:

1. **Sin rostro en cédula:** Sube una foto de cédula sin rostro visible
2. **Sin rostro en selfie:** Sube una selfie borrosa o sin rostro
3. **Rostros no coinciden:** Usa fotos de personas diferentes
4. **Documento inválido:** Sube una imagen que no sea una cédula
5. **Usuario duplicado:** Intenta registrarte con un email ya existente

---

## 📊 Métricas de Éxito

- ✅ Mensajes < 100 caracteres
- ✅ Sin términos técnicos
- ✅ Incluyen acción sugerida
- ✅ Tono amigable y respetuoso
- ✅ 100% de errores cubiertos

---

**Última actualización:** Enero 2025
