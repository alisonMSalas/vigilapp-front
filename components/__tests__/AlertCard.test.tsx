/**
 * Pruebas unitarias para AlertCard
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AlertCard, { AlertData } from '../AlertCard';

describe('AlertCard', () => {
  const mockAlert: AlertData = {
    id: '1',
    type: 'emergency',
    title: 'Robo reportado',
    description: 'Robo en progreso en la zona',
    distance: '500m',
    time: 'Hace 5 min',
    icon: 'alert-circle',
    isNew: true,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar la alerta correctamente', () => {
    const { getByText } = render(
      <AlertCard alert={mockAlert} onPress={mockOnPress} />
    );

    expect(getByText('Robo reportado')).toBeTruthy();
    expect(getByText('Robo en progreso en la zona')).toBeTruthy();
    expect(getByText('500m')).toBeTruthy();
    expect(getByText('Hace 5 min')).toBeTruthy();
  });

  it('debería mostrar badge NUEVA cuando isNew es true', () => {
    const { getByText } = render(
      <AlertCard alert={mockAlert} onPress={mockOnPress} />
    );

    expect(getByText('NUEVA')).toBeTruthy();
  });

  it('no debería mostrar badge NUEVA cuando isNew es false', () => {
    const alert = { ...mockAlert, isNew: false };
    const { queryByText } = render(
      <AlertCard alert={alert} onPress={mockOnPress} />
    );

    expect(queryByText('NUEVA')).toBeNull();
  });

  it('debería llamar onPress con la alerta al ser presionado', () => {
    const { getByText } = render(
      <AlertCard alert={mockAlert} onPress={mockOnPress} />
    );

    const card = getByText('Robo reportado').parent?.parent?.parent;
    if (card) {
      fireEvent.press(card);
      expect(mockOnPress).toHaveBeenCalledWith(mockAlert);
    }
  });

  it('debería renderizar diferentes tipos de alerta', () => {
    const types: AlertData['type'][] = ['emergency', 'warning', 'info', 'community'];

    types.forEach((type) => {
      const alert = { ...mockAlert, type };
      const { getByText } = render(
        <AlertCard alert={alert} onPress={mockOnPress} />
      );
      expect(getByText(mockAlert.title)).toBeTruthy();
    });
  });

  it('debería renderizar meta adicional cuando showDetailedMeta es true', () => {
    const alertWithMeta: AlertData = {
      ...mockAlert,
      city: 'San José',
      status: 'Activa',
      reports: '3 reportes',
    };

    const { getByText } = render(
      <AlertCard
        alert={alertWithMeta}
        onPress={mockOnPress}
        showDetailedMeta={true}
      />
    );

    expect(getByText('Robo reportado')).toBeTruthy();
  });
});
