// Mock completo para Expo SDK
module.exports = {
  // Asset
  Asset: {
    fromModule: jest.fn(() => ({ uri: 'mock-asset' })),
    fromURI: jest.fn(() => ({ uri: 'mock-asset' })),
    loadAsync: jest.fn(),
  },
  
  // Constants
  Constants: {
    expoConfig: {},
    executionEnvironment: 'storeClient',
    installationId: 'test-installation-id',
    isDevice: false,
    manifest: {},
    platform: {},
    sessionId: 'test-session-id',
    statusBarHeight: 20,
    systemFonts: [],
  },

  // Font
  Font: {
    loadAsync: jest.fn(() => Promise.resolve()),
    isLoaded: jest.fn(() => true),
    isLoading: jest.fn(() => false),
  },

  // SplashScreen
  SplashScreen: {
    hideAsync: jest.fn(() => Promise.resolve()),
    preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  },

  // Router (expo-router)
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => false),
  },

  // Symbols
  SymbolView: 'SymbolView',
  SF: 'SF',
};
