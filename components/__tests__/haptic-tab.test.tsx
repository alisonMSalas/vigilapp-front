/**
 * Pruebas unitarias para haptic-tab
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { HapticTab } from '../haptic-tab';
import { NavigationContainer } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

// Mock de expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

describe('HapticTab', () => {
  it('debería renderizar correctamente', () => {
    const { UNSAFE_root } = render(
      <NavigationContainer>
        <HapticTab>
          <Text>Test</Text>
        </HapticTab>
      </NavigationContainer>
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it('debería manejar onPressIn event en iOS', () => {
    const originalEnv = process.env.EXPO_OS;
    process.env.EXPO_OS = 'ios';
    
    const mockOnPressIn = jest.fn();
    const { getByText } = render(
      <NavigationContainer>
        <HapticTab onPressIn={mockOnPressIn}>
          <Text>Press Me</Text>
        </HapticTab>
      </NavigationContainer>
    );

    const button = getByText('Press Me');
    fireEvent(button, 'pressIn');
    
    expect(Haptics.impactAsync).toHaveBeenCalled();
    expect(mockOnPressIn).toHaveBeenCalled();
    
    process.env.EXPO_OS = originalEnv;
  });

  it('no debería llamar hápticos en Android', () => {
    const originalEnv = process.env.EXPO_OS;
    process.env.EXPO_OS = 'android';
    
    (Haptics.impactAsync as jest.Mock).mockClear();
    const mockOnPressIn = jest.fn();
    
    const { getByText } = render(
      <NavigationContainer>
        <HapticTab onPressIn={mockOnPressIn}>
          <Text>Press Me Android</Text>
        </HapticTab>
      </NavigationContainer>
    );

    const button = getByText('Press Me Android');
    fireEvent(button, 'pressIn');
    
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(mockOnPressIn).toHaveBeenCalled();
    
    process.env.EXPO_OS = originalEnv;
  });

  it('debería renderizar con children personalizados', () => {
    const { getByText } = render(
      <NavigationContainer>
        <HapticTab>
          <Text>Custom Content</Text>
        </HapticTab>
      </NavigationContainer>
    );

    expect(getByText('Custom Content')).toBeTruthy();
  });

  it('debería aplicar estilos correctamente', () => {
    const { UNSAFE_root } = render(
      <NavigationContainer>
        <HapticTab style={{ padding: 10 }}>
          <Text>Styled Tab</Text>
        </HapticTab>
      </NavigationContainer>
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});
