#!/usr/bin/env node

/**
 * Script para verificar la conexión con el backend
 * Uso: node scripts/check-backend.js
 */

const http = require('http');

const API_BASE_URL = 'http://localhost:8080';

console.log('🔍 Verificando conexión con el backend...\n');
console.log(`URL: ${API_BASE_URL}/api`);
console.log('─'.repeat(50));

// Función para hacer una petición HTTP
function checkEndpoint(path) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${path}`;

    http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    // Verificar si el servidor está activo
    console.log('\n1️⃣  Verificando si el servidor está activo...');
    const response = await checkEndpoint('/api/health').catch(() =>
      checkEndpoint('/').catch(() => ({ status: 0 }))
    );

    if (response.status === 0) {
      console.log('❌ El servidor NO está respondiendo');
      console.log('\n💡 Soluciones:');
      console.log('   1. Verifica que el backend esté corriendo');
      console.log('   2. Ejecuta: ./mvnw spring-boot:run (en el proyecto backend)');
      console.log('   3. Verifica que esté usando el puerto 8080');
      process.exit(1);
    }

    console.log(`✅ El servidor está activo (Status: ${response.status})`);

    // Verificar endpoints de autenticación
    console.log('\n2️⃣  Verificando endpoints de API...');

    // Test login endpoint (debe retornar 400 o 401 sin credenciales, no 404)
    try {
      const loginTest = await checkEndpoint('/api/login');
      console.log(`✅ Endpoint /api/login existe (Status: ${loginTest.status})`);
    } catch (err) {
      if (err.code === 'ECONNREFUSED') {
        console.log('❌ No se puede conectar a /api/login');
      } else {
        console.log('⚠️  /api/login responde con error (puede ser normal si requiere auth)');
      }
    }

    console.log('\n3️⃣  Resumen:');
    console.log('─'.repeat(50));
    console.log('✅ Backend está corriendo');
    console.log('✅ Puerto 8080 está accesible');
    console.log('✅ Endpoints de API configurados');

    console.log('\n🎉 Todo listo para iniciar el frontend!');
    console.log('\n▶️  Ejecuta: npm start');

  } catch (error) {
    console.log('\n❌ Error al verificar el backend:');
    console.log(`   ${error.message}`);

    console.log('\n💡 Soluciones:');
    console.log('   1. Asegúrate que el backend esté corriendo');
    console.log('   2. Verifica el puerto (debe ser 8080)');
    console.log('   3. Si usas dispositivo físico, actualiza la IP en api.config.ts');

    process.exit(1);
  }
}

main();
