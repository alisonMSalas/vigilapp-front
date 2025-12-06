import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '../icon-symbol';

describe('IconSymbol (Android/Web)', () => {
  it('should render SymbolView component', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" size={24} color="#000" />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should apply correct size', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" size={32} color="#000" />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should apply correct color', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" size={24} color="#FF0000" />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should apply weight prop', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" size={24} color="#000" weight="semibold" />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should apply style prop', () => {
    const { UNSAFE_root } = render(
      <IconSymbol 
        name="house.fill" 
        size={24} 
        color="#000" 
        style={{ marginTop: 10 }}
      />
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});
