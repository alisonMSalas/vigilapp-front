import { Platform, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

// Solo importar MapView dinámicamente en móvil
let MapViewComponent: any = null;
let MarkerComponent: any = null;
let CircleComponent: any = null;

const loadMaps = () => {
  if (MapViewComponent) return; // Ya está cargado

  if (Platform.OS !== 'web') {
    try {
      // Dynamic require para evitar que web lo intente cargar
      const Maps = require('react-native-maps');
      MapViewComponent = Maps.default;
      MarkerComponent = Maps.Marker;
      CircleComponent = Maps.Circle;
    } catch (e) {
      console.log('react-native-maps no disponible:', e);
    }
  }
};

interface MapWrapperProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onPress?: (event: any) => void;
  onRegionChangeComplete?: (region: any) => void;
  children?: React.ReactNode;
}

export default function MapWrapper({ region, onPress, onRegionChangeComplete, children }: MapWrapperProps) {
  // Si estamos en web, retornar fallback inmediatamente
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <ThemedText style={styles.webMessage}>
          Mapa interactivo no disponible en web
        </ThemedText>
        <ThemedText style={styles.webSubtext}>
          Usa la búsqueda de direcciones arriba o prueba la app en un dispositivo móvil
        </ThemedText>
        <View style={styles.webInfo}>
          <ThemedText style={styles.webInfoText}>
            Región: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
          </ThemedText>
        </View>
      </View>
    );
  }

  // Cargar maps solo cuando se necesite (en móvil)
  loadMaps();

  if (!MapViewComponent) {
    return (
      <View style={styles.webFallback}>
        <ThemedText style={styles.webMessage}>
          Cargando mapa...
        </ThemedText>
      </View>
    );
  }

  return (
    <MapViewComponent
      style={styles.map}
      region={region}
      onPress={onPress}
      onRegionChangeComplete={onRegionChangeComplete}
    >
      {children}
    </MapViewComponent>
  );
}

export function MapMarker({ coordinate, title }: { coordinate: { latitude: number; longitude: number }; title?: string }) {
  if (!MarkerComponent || Platform.OS === 'web') {
    return null;
  }

  return <MarkerComponent coordinate={coordinate} title={title} />;
}

export function MapCircle({
  center,
  radius,
  fillColor,
  strokeColor,
  strokeWidth,
}: {
  center: { latitude: number; longitude: number };
  radius: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}) {
  if (!CircleComponent || Platform.OS === 'web') {
    return null;
  }

  return (
    <CircleComponent
      center={center}
      radius={radius}
      fillColor={fillColor}
      strokeColor={strokeColor}
      strokeWidth={strokeWidth}
    />
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  webSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  webInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  webInfoText: {
    fontSize: 12,
    color: '#666',
  },
});

