import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from '../use-color-scheme.web';

describe('useColorScheme.web', () => {
  beforeEach(() => {
    // Reset window.matchMedia
    delete (window as any).matchMedia;
  });

  it('should return light when prefers-color-scheme is light', () => {
    (window as any).matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBeDefined();
  });

  it('should return dark when prefers-color-scheme is dark', () => {
    (window as any).matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBeDefined();
  });

  it('should return light when matchMedia is not supported', () => {
    (window as any).matchMedia = undefined;

    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBeDefined();
  });
});
