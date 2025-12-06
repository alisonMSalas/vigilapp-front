/**
 * Script simplificado para ejecutar pruebas
 * Evita problemas de Expo en entornos limitados
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Ejecutando pruebas unitarias...\n');

// Verificar que jest esté instalado
try {
  require.resolve('jest');
} catch (error) {
  console.error('❌ Jest no está instalado. Ejecuta: npm install');
  process.exit(1);
}

// Opciones de configuración
const options = {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test',
  },
};

try {
  // Ejecutar Jest con configuración específica
  execSync(
    'npx jest --config jest.config.js --no-cache --silent=false',
    options
  );

  console.log('\n✅ Todas las pruebas completadas');

  // Verificar si se solicitó cobertura
  if (process.argv.includes('--coverage')) {
    console.log('\n📊 Reporte de cobertura generado en: coverage/lcov-report/index.html');
  }
} catch (error) {
  console.error('\n❌ Algunas pruebas fallaron');
  process.exit(1);
}
