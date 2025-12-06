# 🚀 GitHub Actions - CI/CD para VigilApp Frontend

## 📋 Workflows Configurados

### 1. `test.yml` - Pruebas Unitarias

Este workflow ejecuta automáticamente las pruebas unitarias en cada push o pull request.

#### Jobs Configurados:

1. **test**: Ejecución estándar de Jest
   - ✅ Instala dependencias
   - ✅ Ejecuta todas las pruebas
   - ✅ Genera reporte de cobertura
   - ✅ Sube cobertura a Codecov (opcional)
   - ✅ Archiva reporte HTML

2. **test-with-expo**: Ejecución con entorno Expo
   - ✅ Configura Expo SDK
   - ✅ Usa token de Expo
   - ✅ Ejecuta pruebas en entorno completo

## 🔧 Configuración Necesaria

### Secrets de GitHub (Opcional)

Para funcionalidades adicionales, configurar en: `Settings → Secrets and variables → Actions`

1. **EXPO_TOKEN** (Opcional)
   - Obtener en: https://expo.dev/settings/access-tokens
   - Permite usar `expo/expo-github-action`

2. **CODECOV_TOKEN** (Opcional)
   - Obtener en: https://codecov.io
   - Para reportes de cobertura públicos

## 📊 Ver Resultados

### En GitHub Actions
1. Ve a la pestaña **Actions** del repositorio
2. Selecciona el workflow "Tests Frontend VigilApp"
3. Haz clic en cualquier ejecución
4. Ver:
   - ✅ Status de cada job
   - 📊 Summary con tabla de cobertura
   - 📦 Artifacts descargables (coverage report)

### Descargar Reporte de Cobertura
1. En la página del workflow
2. Scroll down a **Artifacts**
3. Descargar `coverage-report.zip`
4. Extraer y abrir `index.html`

## 🎯 Triggers

Los tests se ejecutan automáticamente en:
- ✅ Push a `main` o `develop`
- ✅ Pull requests a `main` o `develop`
- 🔧 Manualmente desde la UI de GitHub Actions

## 🔍 Ejecución Manual

Para ejecutar el workflow manualmente:

1. Ve a **Actions** → **Tests Frontend VigilApp**
2. Clic en **Run workflow**
3. Selecciona la rama
4. Clic en **Run workflow**

## 📈 Métricas de Cobertura

El workflow genera automáticamente:
- **Terminal**: Tabla de cobertura en logs
- **HTML**: Reporte visual completo
- **LCOV**: Para integración con herramientas
- **JSON**: Para procesamiento programático

### Umbrales Configurados
```json
{
  "statements": 70,
  "branches": 70,
  "functions": 70,
  "lines": 70
}
```

## 🐳 Alternativa: Docker

Si prefieres ejecutar localmente con Docker:

```dockerfile
# Dockerfile.test
FROM node:20-alpine

WORKDIR /app

# Instalar Expo CLI
RUN npm install -g expo-cli

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "test", "--", "--coverage", "--watchAll=false"]
```

Ejecutar:
```bash
docker build -f Dockerfile.test -t vigilapp-frontend-test .
docker run vigilapp-frontend-test
```

## ✅ Ventajas de CI/CD

1. **Automatización**: Tests se ejecutan automáticamente
2. **Consistencia**: Mismo entorno para todos
3. **Visibilidad**: Reportes públicos del estado
4. **Historial**: Seguimiento de cobertura en el tiempo
5. **Protección**: Previene merges con tests fallidos

## 🔄 Próximos Pasos

1. **Hacer push** del código
2. **Verificar** que el workflow se ejecute
3. **Revisar** los resultados en Actions
4. **Descargar** el reporte de cobertura
5. **Opcional**: Configurar Codecov para badges

## 🎓 Para Evaluación Académica

Este workflow demuestra:
- ✅ CI/CD profesional
- ✅ Automatización de testing
- ✅ Integración continua
- ✅ Reportes de calidad
- ✅ Mejores prácticas DevOps

---

**Nota**: Los workflows de GitHub Actions son gratuitos para repositorios públicos y tienen 2000 minutos/mes gratis para privados.
