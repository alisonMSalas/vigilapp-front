import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from '../use-color-scheme';

describe('useColorScheme', () => {
  it('should export useColorScheme from react-native', () => {
    expect(useColorScheme).toBeDefined();
  });

  it('should return color scheme', () => {
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBeDefined();
  });
});
