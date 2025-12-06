/**
 * Pruebas unitarias para ShieldIcon
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { ShieldIcon } from '../ShieldIcon';

describe('ShieldIcon', () => {
  it('debería renderizar correctamente', () => {
    const { UNSAFE_root } = render(<ShieldIcon />);
    
    expect(UNSAFE_root).toBeTruthy();
  });
});
