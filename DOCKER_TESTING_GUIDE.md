# 🐳 Guía de Testing con Docker - VigilApp Frontend

## 🎯 Opción 2: CI/CD con Docker + Expo

Esta guía explica cómo ejecutar las pruebas unitarias del frontend usando Docker, evitando problemas de incompatibilidad con Expo SDK 54+.

## 📋 Requisitos Previos

1. **Docker Desktop** instalado:
   - Windows: https://docs.docker.com/desktop/install/windows-install/
   - Verificar: `docker --version`

2. **Docker Compose** (incluido en Docker Desktop)
   - Verificar: `docker-compose --version`

## 🚀 Opción A: Docker Compose (Recomendado)

### 1. Ejecutar Tests

```bash
# Ejecutar todos los tests con cobertura
docker-compose -f docker-compose.test.yml up

# Ver logs en tiempo real
docker-compose -f docker-compose.test.yml up --attach frontend-tests

# Ejecutar en modo detached (background)
docker-compose -f docker-compose.test.yml up -d
docker-compose -f docker-compose.test.yml logs -f frontend-tests
```

### 2. Ver Reporte de Cobertura

```bash
# Levantar servidor web para ver reporte HTML
docker-compose -f docker-compose.test.yml --profile viewer up coverage-viewer

# Abrir en navegador
# http://localhost:8081
```

### 3. Limpiar

```bash
# Detener servicios
docker-compose -f docker-compose.test.yml down

# Limpiar volúmenes
docker-compose -f docker-compose.test.yml down -v

# Limpiar todo (incluyendo imágenes)
docker-compose -f docker-compose.test.yml down --rmi all -v
```

## 🔧 Opción B: Docker Manual

### 1. Construir Imagen

```bash
# Construir imagen de tests
docker build -f Dockerfile.test -t vigilapp-frontend-test .

# Verificar que se creó
docker images | grep vigilapp
```

### 2. Ejecutar Tests

```bash
# Ejecutar tests con cobertura
docker run --rm vigilapp-frontend-test

# Ejecutar con volumen para acceder a coverage
docker run --rm -v ${PWD}/coverage:/app/coverage vigilapp-frontend-test

# Ejecutar en modo interactivo (debugging)
docker run -it --rm vigilapp-frontend-test sh
```

### 3. Comandos Personalizados

```bash
# Solo ejecutar tests (sin cobertura)
docker run --rm vigilapp-frontend-test npm test -- --watchAll=false

# Ejecutar tests específicos
docker run --rm vigilapp-frontend-test npm test -- auth.service.test.ts

# Ejecutar en modo watch (desarrollo)
docker run -it --rm -v ${PWD}:/app vigilapp-frontend-test npm test -- --watch
```

## 🌐 Opción C: GitHub Actions (Automático)

Ya está configurado en `.github/workflows/test.yml`

### Ver Resultados

1. Hacer push al repositorio:
   ```bash
   git add .
   git commit -m "feat: Add Docker testing configuration"
   git push origin main
   ```

2. Ver en GitHub:
   - Ve a **Actions** tab
   - Selecciona workflow "Tests Frontend VigilApp"
   - Ver resultados y descargar coverage report

### Configurar Secrets (Opcional)

Para usar Expo en CI:
1. Ve a: `Settings → Secrets → Actions`
2. Añade `EXPO_TOKEN`:
   - Obtener en: https://expo.dev/settings/access-tokens
   - Crear nuevo token
   - Copiar y pegar en GitHub Secrets

## 📊 Ver Reportes de Cobertura

### Método 1: Reporte HTML Local

```bash
# Después de ejecutar tests
docker-compose -f docker-compose.test.yml --profile viewer up -d coverage-viewer

# Abrir navegador
start http://localhost:8081  # Windows
# open http://localhost:8081  # macOS
# xdg-open http://localhost:8081  # Linux
```

### Método 2: Directamente desde archivos

```bash
# Los reportes se generan en ./coverage/
coverage/
├── lcov-report/
│   └── index.html          ← Abrir en navegador
├── coverage-summary.json   ← JSON con métricas
└── lcov.info              ← Para herramientas

# Abrir reporte HTML
start coverage/lcov-report/index.html
```

### Método 3: En Terminal

```bash
# Ver summary en consola
docker run --rm vigilapp-frontend-test npm test -- --coverage --verbose
```

## 🔍 Debugging

### Ver logs del contenedor

```bash
# Con docker-compose
docker-compose -f docker-compose.test.yml logs frontend-tests

# Con docker run
docker run --rm vigilapp-frontend-test npm test -- --verbose
```

### Entrar al contenedor

```bash
# Con docker-compose (si está corriendo)
docker-compose -f docker-compose.test.yml exec frontend-tests sh

# Con docker run
docker run -it --rm vigilapp-frontend-test sh

# Dentro del contenedor:
ls -la
npm test
cat package.json
```

### Verificar instalación de dependencias

```bash
docker run --rm vigilapp-frontend-test npm list jest
docker run --rm vigilapp-frontend-test npm list @testing-library/react-native
```

## 🎯 Comandos Útiles

### Para Windows PowerShell

```powershell
# Ejecutar tests
docker-compose -f docker-compose.test.yml up

# Ver coverage en navegador
docker-compose -f docker-compose.test.yml --profile viewer up -d coverage-viewer
Start-Process "http://localhost:8081"

# Limpiar
docker-compose -f docker-compose.test.yml down -v

# Rebuild completo
docker-compose -f docker-compose.test.yml build --no-cache
docker-compose -f docker-compose.test.yml up
```

### Scripts de Conveniencia

Puedes añadir a `package.json`:

```json
{
  "scripts": {
    "docker:test": "docker-compose -f docker-compose.test.yml up",
    "docker:coverage": "docker-compose -f docker-compose.test.yml --profile viewer up -d coverage-viewer",
    "docker:clean": "docker-compose -f docker-compose.test.yml down -v",
    "docker:build": "docker build -f Dockerfile.test -t vigilapp-frontend-test ."
  }
}
```

Luego ejecutar:
```bash
npm run docker:test
npm run docker:coverage
```

## 💡 Ventajas de Usar Docker

1. **✅ Entorno Consistente**
   - Mismas versiones en todos lados
   - No depende del sistema operativo
   - Evita "funciona en mi máquina"

2. **✅ Aislamiento**
   - No afecta tu instalación local
   - Dependencias aisladas
   - Fácil de limpiar

3. **✅ CI/CD**
   - Mismo entorno en local y en servidor
   - Fácil de integrar con GitHub Actions
   - Reproducible

4. **✅ Debugging**
   - Puedes entrar al contenedor
   - Ver logs detallados
   - Experimentar sin miedo

## 🔄 Flujo de Trabajo Completo

### Para Desarrollo Diario

```bash
# 1. Escribir código y tests
code services/__tests__/new.service.test.ts

# 2. Ejecutar tests en Docker
npm run docker:test

# 3. Ver cobertura
npm run docker:coverage
start http://localhost:8081

# 4. Limpiar
npm run docker:clean
```

### Para CI/CD

```bash
# 1. Hacer cambios
git add .
git commit -m "feat: Add new feature with tests"

# 2. Push al repositorio
git push origin develop

# 3. Ver resultados en GitHub Actions
# (automático)

# 4. Descargar coverage report de Artifacts
# (en la UI de GitHub Actions)
```

## ⚠️ Solución de Problemas

### Error: "Cannot find module 'jest'"
```bash
# Rebuild sin cache
docker-compose -f docker-compose.test.yml build --no-cache
```

### Error: "EACCES: permission denied"
```bash
# En Linux/Mac, ajustar permisos del volumen
sudo chown -R $USER:$USER coverage/
```

### Tests muy lentos
```bash
# Reducir workers
docker run --rm vigilapp-frontend-test npm test -- --maxWorkers=1
```

### Puerto 8081 ocupado
```bash
# Cambiar puerto en docker-compose.test.yml
ports:
  - "8082:80"  # Usar 8082 en lugar de 8081
```

## 📈 Métricas Esperadas

Con Docker, las pruebas deberían ejecutarse correctamente:

| Métrica | Esperado |
|---------|----------|
| **Tests ejecutados** | 78+ |
| **Tests pasando** | 100% |
| **Cobertura Statements** | 80-90% |
| **Cobertura Branches** | 75-85% |
| **Cobertura Functions** | 80-90% |
| **Cobertura Lines** | 80-90% |
| **Tiempo ejecución** | ~30-60 segundos |

## 🎓 Para Evaluación Académica

Este setup demuestra:
- ✅ **Docker**: Containerización de aplicaciones
- ✅ **Docker Compose**: Orquestación de servicios
- ✅ **CI/CD**: Integración continua con GitHub Actions
- ✅ **Testing**: Pruebas unitarias automatizadas
- ✅ **DevOps**: Mejores prácticas de desarrollo

## 📚 Referencias

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- GitHub Actions: https://docs.github.com/en/actions
- Jest in Docker: https://jestjs.io/docs/docker

---

**Resumen**: Con esta configuración puedes ejecutar las pruebas en un entorno controlado, ya sea localmente con Docker o automáticamente con GitHub Actions, evitando problemas de compatibilidad con Expo SDK.
