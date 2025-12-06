/**
 * Pruebas unitarias para StatCard
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { StatCard } from '../StatCard';

describe('StatCard', () => {
  it('debería renderizar con valores numéricos', () => {
    const { getByText } = render(
      <StatCard title="Alertas Activas" value={42} icon="alert-circle" color="#f44336" />
    );

    expect(getByText('42')).toBeTruthy();
    expect(getByText('Alertas Activas')).toBeTruthy();
  });

  it('debería renderizar con valores string', () => {
    const { getByText } = render(
      <StatCard title="Tasa de Seguridad" value="85%" icon="shield" color="#4caf50" />
    );

    expect(getByText('85%')).toBeTruthy();
    expect(getByText('Tasa de Seguridad')).toBeTruthy();
  });

  it('debería renderizar con diferentes íconos', () => {
    const icons = [
      'alert-circle' as const,
      'shield' as const,
      'users' as const,
      'check-circle' as const,
    ];

    icons.forEach((icon) => {
      const { getByText } = render(
        <StatCard title="Test" value={100} icon={icon} color="#000" />
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  it('debería renderizar con diferentes colores', () => {
    const colors = ['#f44336', '#4caf50', '#2196f3', '#ffc107'];

    colors.forEach((color) => {
      const { getByText } = render(
        <StatCard title="Test" value={100} icon="activity" color={color} />
      );
      expect(getByText('Test')).toBeTruthy();
    });
  });

  it('debería manejar títulos largos', () => {
    const longTitle = 'Este es un título muy largo para probar el componente';
    const { getByText } = render(
      <StatCard title={longTitle} value={999} icon="trending-up" color="#2196f3" />
    );

    expect(getByText(longTitle)).toBeTruthy();
  });

  it('debería manejar valores grandes', () => {
    const { getByText } = render(
      <StatCard title="Total" value={1234567} icon="database" color="#9c27b0" />
    );

    expect(getByText('1234567')).toBeTruthy();
  });
});
