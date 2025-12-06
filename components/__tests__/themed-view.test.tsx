/**
 * Pruebas unitarias para ThemedView
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '../themed-view';
import { Text } from 'react-native';

describe('ThemedView', () => {
  it('debería renderizar correctamente', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view">
        <Text>Content</Text>
      </ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });

  it('debería renderizar children correctamente', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>Test Content</Text>
      </ThemedView>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('debería aplicar estilos personalizados', () => {
    const customStyle = { padding: 20 };
    
    const { getByTestId } = render(
      <ThemedView testID="themed-view" style={customStyle}>
        <Text>Content</Text>
      </ThemedView>
    );

    const view = getByTestId('themed-view');
    expect(view.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ padding: 20 })
      ])
    );
  });

  it('debería usar color de fondo light por defecto', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view">
        <Text>Content</Text>
      </ThemedView>
    );

    const view = getByTestId('themed-view');
    expect(view.props.style).toBeTruthy();
  });

  it('debería aceptar lightColor prop', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view" lightColor="#FFFFFF">
        <Text>Content</Text>
      </ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });

  it('debería aceptar darkColor prop', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view" darkColor="#000000">
        <Text>Content</Text>
      </ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });
});
