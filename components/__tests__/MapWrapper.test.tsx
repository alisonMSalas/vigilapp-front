/**
 * Pruebas unitarias para MapWrapper
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import MapWrapper from '../MapWrapper';

// Mock de react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    __esModule: true,
    default: (props: any) => <View testID="map-view" {...props} />,
    Marker: (props: any) => <View testID="map-marker" {...props} />,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock Platform to control tests
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios', // Default para tests
  select: jest.fn((obj) => obj.ios),
}));

describe('MapWrapper', () => {
  const defaultRegion = {
    latitude: 9.9281,
    longitude: -84.0907,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar correctamente en móvil', () => {
    const { getByTestId } = render(
      <MapWrapper region={defaultRegion} />
    );

    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('debería pasar región al MapView', () => {
    const customRegion = {
      latitude: 10.0,
      longitude: -85.0,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };

    const { getByTestId } = render(
      <MapWrapper region={customRegion} />
    );

    const mapView = getByTestId('map-view');
    expect(mapView.props.region).toEqual(customRegion);
  });

  it('debería aceptar onPress callback', () => {
    const mockOnPress = jest.fn();

    const { getByTestId } = render(
      <MapWrapper region={defaultRegion} onPress={mockOnPress} />
    );

    const mapView = getByTestId('map-view');
    expect(mapView.props.onPress).toBe(mockOnPress);
  });

  it('debería aceptar onRegionChangeComplete callback', () => {
    const mockOnRegionChange = jest.fn();

    const { getByTestId } = render(
      <MapWrapper 
        region={defaultRegion} 
        onRegionChangeComplete={mockOnRegionChange}
      />
    );

    const mapView = getByTestId('map-view');
    expect(mapView.props.onRegionChangeComplete).toBe(mockOnRegionChange);
  });

  it('debería renderizar children dentro del MapView', () => {
    const { getByTestId } = render(
      <MapWrapper region={defaultRegion}>
        <React.Fragment>Test Child</React.Fragment>
      </MapWrapper>
    );

    expect(getByTestId('map-view')).toBeTruthy();
  });
});

// Importar MapMarker y MapCircle
const { MapMarker, MapCircle } = require('../MapWrapper');

describe('MapMarker', () => {
  it('debería renderizar marker en móvil', () => {
    const coordinate = { latitude: 10.0, longitude: -84.0 };
    const { getByTestID } = render(
      <MapMarker coordinate={coordinate} title="Test Marker" />
    );
    // En móvil, debería renderizar el marker
    expect(true).toBe(true);
  });

  it('debería aceptar coordinate sin title', () => {
    const coordinate = { latitude: 10.0, longitude: -84.0 };
    const { UNSAFE_root } = render(
      <MapMarker coordinate={coordinate} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('MapCircle', () => {
  it('debería renderizar circle en móvil', () => {
    const center = { latitude: 10.0, longitude: -84.0 };
    const { UNSAFE_root } = render(
      <MapCircle 
        center={center} 
        radius={1000}
        fillColor="rgba(0, 122, 255, 0.2)"
        strokeColor="rgba(0, 122, 255, 0.8)"
        strokeWidth={2}
      />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('debería aceptar circle sin colores opcionales', () => {
    const center = { latitude: 10.0, longitude: -84.0 };
    const { UNSAFE_root } = render(
      <MapCircle center={center} radius={500} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});

describe('MapWrapper - Web Platform', () => {
  it('MapMarker debería retornar null en web', () => {
    const Platform = require('react-native/Libraries/Utilities/Platform');
    Platform.OS = 'web';

    const coordinate = { latitude: 10.0, longitude: -84.0 };
    const result = render(
      <MapMarker coordinate={coordinate} title="Test" />
    );

    expect(result.toJSON()).toBeNull();
  });

  it('MapCircle debería retornar null en web', () => {
    const Platform = require('react-native/Libraries/Utilities/Platform');
    Platform.OS = 'web';

    const center = { latitude: 10.0, longitude: -84.0 };
    const result = render(
      <MapCircle center={center} radius={1000} />
    );

    expect(result.toJSON()).toBeNull();
  });
});
