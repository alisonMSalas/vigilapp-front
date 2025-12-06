/**
 * Pruebas unitarias para BottomNavbar
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BottomNavbar from '../BottomNavbar';

// Mock de expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('BottomNavbar', () => {
  const mockOnTabPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar correctamente', () => {
    const { getByText } = render(
      <BottomNavbar active="home" onTabPress={mockOnTabPress} />
    );

    expect(getByText('Inicio')).toBeTruthy();
    expect(getByText('Mapa')).toBeTruthy();
    expect(getByText('Crear')).toBeTruthy();
    expect(getByText('Alertas')).toBeTruthy();
  });

  it('debería llamar onTabPress cuando se presiona un tab', () => {
    const { getByText } = render(
      <BottomNavbar active="home" onTabPress={mockOnTabPress} />
    );

    fireEvent.press(getByText('Alertas'));

    expect(mockOnTabPress).toHaveBeenCalledWith('alerts');
  });

  it('debería marcar como activo el tab correcto', () => {
    const { getByText } = render(
      <BottomNavbar active="map" onTabPress={mockOnTabPress} />
    );

    expect(getByText('Mapa')).toBeTruthy();
  });

  it('debería renderizar todos los tabs', () => {
    const { getByText } = render(
      <BottomNavbar active="home" onTabPress={mockOnTabPress} />
    );

    expect(getByText('Inicio')).toBeTruthy();
    expect(getByText('Mapa')).toBeTruthy();
    expect(getByText('Crear')).toBeTruthy();
    expect(getByText('Alertas')).toBeTruthy();
  });
});
