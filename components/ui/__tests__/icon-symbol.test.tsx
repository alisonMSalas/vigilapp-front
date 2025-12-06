import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '../icon-symbol';

// Mock del MaterialIcons
jest.mock('@expo/vector-icons/MaterialIcons', () => {
  const React = require('react');
  return function MaterialIcons(props: any) {
    return React.createElement('MaterialIcons', props);
  };
});

describe('IconSymbol', () => {
  it('should render MaterialIcons with correct mapping for house.fill', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" color="#000" size={24} />
    );
    const icon = UNSAFE_root.findByType('MaterialIcons' as any);
    expect(icon.props.name).toBe('home');
    expect(icon.props.color).toBe('#000');
    expect(icon.props.size).toBe(24);
  });

  it('should use default size of 24 when not specified', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" color="#FF0000" />
    );
    const icon = UNSAFE_root.findByType('MaterialIcons' as any);
    expect(icon.props.size).toBe(24);
    expect(icon.props.color).toBe('#FF0000');
  });

  it('should render with custom size', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="paperplane.fill" color="#000" size={32} />
    );
    const icon = UNSAFE_root.findByType('MaterialIcons' as any);
    expect(icon.props.name).toBe('send');
    expect(icon.props.size).toBe(32);
  });

  it('should map paperplane.fill to send', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="paperplane.fill" color="#0000FF" size={24} />
    );
    const icon = UNSAFE_root.findByType('MaterialIcons' as any);
    expect(icon.props.name).toBe('send');
  });

  it('should map chevron.right to chevron-right', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="chevron.right" color="#000" size={18} />
    );
    const icon = UNSAFE_root.findByType('MaterialIcons' as any);
    expect(icon.props.name).toBe('chevron-right');
    expect(icon.props.size).toBe(18);
  });

  it('should map chevron.left.forwardslash.chevron.right to code', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="chevron.left.forwardslash.chevron.right" color="#00FF00" size={20} />
    );
    const icon = UNSAFE_root.findByType('MaterialIcons' as any);
    expect(icon.props.name).toBe('code');
    expect(icon.props.color).toBe('#00FF00');
  });

  it('should pass style prop to MaterialIcons', () => {
    const customStyle = { marginTop: 10, marginLeft: 5 };
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" color="#000" style={customStyle} />
    );
    const icon = UNSAFE_root.findByType('MaterialIcons' as any);
    expect(icon.props.style).toEqual(customStyle);
  });

  it('should ignore weight prop (not used in Android/Web version)', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" color="#000" weight="bold" />
    );
    const icon = UNSAFE_root.findByType('MaterialIcons' as any);
    // weight no se pasa a MaterialIcons, solo verificamos que renderiza
    expect(icon.props.name).toBe('home');
  });
});
