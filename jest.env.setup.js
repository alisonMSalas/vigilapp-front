// Fix para React Native 0.76.5 - Polyfill NativeModules antes de jest-expo
// jest-expo intenta hacer Object.defineProperty en mockNativeModules pero falla
// porque RN 0.76.5 cambió la estructura de exports
try {
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  
  Module.prototype.require = function(id) {
    if (id === 'react-native/Libraries/BatchedBridge/NativeModules') {
      // Devolver un objeto válido con estructura esperada
      return {
        __esModule: true,
        default: {},
      };
    }
    return originalRequire.apply(this, arguments);
  };
} catch (e) {
  // Fallback silencioso
  console.warn('[JEST-SETUP] No se pudo interceptar require para NativeModules');
}

// Mock para expo modules registry
if (typeof global !== 'undefined') {
  global.__EXPO_IMPORT_META_REGISTRY = new Map();
}

// Mock de require.context usado por Expo
if (typeof require !== 'undefined' && !require.context) {
  require.context = (base, scanSubDirectories, regularExpression) => {
    const files = {};
    function readDirectory(directory) {
      return [];
    }
    const keys = readDirectory(base);
    function requireContext(key) {
      return files[key];
    }
    requireContext.keys = () => keys;
    requireContext.resolve = (key) => key;
    return requireContext;
  };
}

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.EXPO_PUBLIC_ENV = 'test';
