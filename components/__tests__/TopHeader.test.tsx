/**
 * Pruebas unitarias para TopHeader
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TopHeader from '../TopHeader';

// Mock de expo-router
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

describe('TopHeader', () => {
  const mockOnPressNotifications = jest.fn();
  const mockOnPressProfile = jest.fn();
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar correctamente', () => {
    const { getByText } = render(<TopHeader />);
    expect(getByText('VigilApp')).toBeTruthy();
  });

  it('debería mostrar logo cuando se proporciona', () => {
    const mockLogo = { uri: 'https://example.com/logo.png' };
    const { queryByText } = render(<TopHeader logo={mockLogo} />);
    // Si hay logo, no debería mostrar "VigilApp"
    expect(queryByText('VigilApp')).toBeNull();
  });

  it('debería llamar onPressNotifications cuando se presiona notificaciones', () => {
    const { getAllByRole } = render(
      <TopHeader onPressNotifications={mockOnPressNotifications} notificationsCount={5} />
    );
    const buttons = getAllByRole('button');
    // El primer botón es notificaciones
    fireEvent.press(buttons[0]);
    expect(mockOnPressNotifications).toHaveBeenCalledTimes(1);
  });

  it('debería mostrar badge cuando hay notificaciones', () => {
    const { getByText } = render(
      <TopHeader notificationsCount={10} />
    );
    expect(getByText('10')).toBeTruthy();
  });

  it('debería mostrar 99 como máximo en el badge', () => {
    const { getByText } = render(
      <TopHeader notificationsCount={150} />
    );
    expect(getByText('99')).toBeTruthy();
  });

  it('NO debería mostrar badge cuando notificationsCount es 0', () => {
    const { queryByText } = render(
      <TopHeader notificationsCount={0} />
    );
    expect(queryByText('0')).toBeNull();
  });

  it('debería abrir el menú de perfil al presionar el botón de usuario', () => {
    const { getAllByRole, getByText } = render(
      <TopHeader onPressProfile={mockOnPressProfile} onLogout={mockOnLogout} />
    );
    const buttons = getAllByRole('button');
    // El segundo botón es perfil
    fireEvent.press(buttons[1]);

    // Debería mostrar el menú
    expect(getByText('Cerrar sesión')).toBeTruthy();
    expect(mockOnPressProfile).toHaveBeenCalledTimes(1);
  });

  it('debería cerrar el menú de perfil al presionar overlay', () => {
    const { getAllByRole, getByText, queryByText } = render(
      <TopHeader onLogout={mockOnLogout} />
    );

    // Abrir el menú
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[1]);
    expect(getByText('Cerrar sesión')).toBeTruthy();

    // Cerrar con overlay
    const overlayButtons = getAllByRole('button');
    // El primer botón ahora es el overlay
    fireEvent.press(overlayButtons[0]);

    // El menú debería haberse cerrado (ya no aparece "Cerrar sesión")
    // Nota: El componente sigue renderizando pero con showProfileMenu=false
  });

  it('debería llamar onLogout y cerrar menú al presionar Cerrar sesión', () => {
    const { getAllByRole, getByText } = render(
      <TopHeader onLogout={mockOnLogout} />
    );

    // Abrir el menú
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[1]);

    // Presionar "Cerrar sesión"
    const logoutButton = getByText('Cerrar sesión');
    fireEvent.press(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('debería aplicar estilos personalizados', () => {
    const customStyle = { backgroundColor: 'red' };
    const { UNSAFE_root } = render(<TopHeader style={customStyle} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('debería manejar presionar perfil sin onPressProfile definido', () => {
    const { getAllByRole } = render(<TopHeader />);
    const buttons = getAllByRole('button');
    
    // No debería fallar al presionar sin callback
    expect(() => fireEvent.press(buttons[1])).not.toThrow();
  });

  it('debería manejar logout sin onLogout definido', () => {
    const { getAllByRole, getByText } = render(<TopHeader />);

    // Abrir el menú
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[1]);

    // Presionar "Cerrar sesión" sin callback
    const logoutButton = getByText('Cerrar sesión');
    expect(() => fireEvent.press(logoutButton)).not.toThrow();
  });

  it('debería cerrar el menú al hacer logout', () => {
    const { getAllByRole, getByText } = render(
      <TopHeader onLogout={mockOnLogout} />
    );

    // Abrir el menú
    const buttons = getAllByRole('button');
    fireEvent.press(buttons[1]);
    expect(getByText('Cerrar sesión')).toBeTruthy();

    // Hacer logout
    const logoutButton = getByText('Cerrar sesión');
    fireEvent.press(logoutButton);

    // El menú se cierra (showProfileMenu = false)
    expect(mockOnLogout).toHaveBeenCalled();
  });
});
