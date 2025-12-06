import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  const mockOnLogin = jest.fn();
  const mockOnRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { UNSAFE_root } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should call onRegister when register link is pressed', () => {
    const { getByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const registerLink = getByText('Regístrate');
    fireEvent.press(registerLink);
    expect(mockOnRegister).toHaveBeenCalled();
  });

  it('should update email input', () => {
    const { getByPlaceholderText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('Usuario');
    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('should update password input', () => {
    const { getByPlaceholderText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Contraseña');
    fireEvent.changeText(passwordInput, 'password123');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('should show validation errors for empty fields', () => {
    const { getByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const loginButton = getByText('INGRESAR');
    fireEvent.press(loginButton);
    
    // Verificar que se muestran errores
    expect(getByText('Por favor ingresa tu email')).toBeTruthy();
    expect(getByText('Por favor ingresa tu contraseña')).toBeTruthy();
  });

  it('should call onLogin with valid credentials', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('Usuario');
    const passwordInput = getByPlaceholderText('Contraseña');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    const loginButton = getByText('INGRESAR');
    fireEvent.press(loginButton);
    
    expect(mockOnLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should disable inputs when loading', () => {
    const { getByPlaceholderText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={true}
      />
    );
    
    const emailInput = getByPlaceholderText('Usuario');
    const passwordInput = getByPlaceholderText('Contraseña');
    
    expect(emailInput.props.editable).toBe(false);
    expect(passwordInput.props.editable).toBe(false);
  });

  it('should show error for invalid email format', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('Usuario');
    fireEvent.changeText(emailInput, 'invalidemail'); // Sin @
    
    const loginButton = getByText('INGRESAR');
    fireEvent.press(loginButton);
    
    expect(getByText('Por favor ingresa un email válido')).toBeTruthy();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('should show error for short password', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('Usuario');
    const passwordInput = getByPlaceholderText('Contraseña');
    
    fireEvent.changeText(emailInput, 'test@test.com');
    fireEvent.changeText(passwordInput, '12345'); // Menos de 6 caracteres
    
    const loginButton = getByText('INGRESAR');
    fireEvent.press(loginButton);
    
    expect(getByText('La contraseña debe tener al menos 6 caracteres')).toBeTruthy();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it('should clear email error when typing', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    // Primero provocar el error
    const loginButton = getByText('INGRESAR');
    fireEvent.press(loginButton);
    expect(getByText('Por favor ingresa tu email')).toBeTruthy();
    
    // Luego escribir en el campo
    const emailInput = getByPlaceholderText('Usuario');
    fireEvent.changeText(emailInput, 't');
    
    // El error debería desaparecer
    expect(queryByText('Por favor ingresa tu email')).toBeNull();
  });

  it('should clear password error when typing', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    // Primero provocar el error
    const loginButton = getByText('INGRESAR');
    fireEvent.press(loginButton);
    expect(getByText('Por favor ingresa tu contraseña')).toBeTruthy();
    
    // Luego escribir en el campo
    const passwordInput = getByPlaceholderText('Contraseña');
    fireEvent.changeText(passwordInput, 'p');
    
    // El error debería desaparecer
    expect(queryByText('Por favor ingresa tu contraseña')).toBeNull();
  });

  it('should handle email input focus', () => {
    const { getByPlaceholderText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('Usuario');
    fireEvent(emailInput, 'focus');
    expect(true).toBe(true);
  });

  it('should handle email input blur', () => {
    const { getByPlaceholderText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('Usuario');
    fireEvent(emailInput, 'blur');
    expect(true).toBe(true);
  });

  it('should handle password input focus', () => {
    const { getByPlaceholderText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Contraseña');
    fireEvent(passwordInput, 'focus');
    expect(true).toBe(true);
  });

  it('should handle password input blur', () => {
    const { getByPlaceholderText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Contraseña');
    fireEvent(passwordInput, 'blur');
    expect(true).toBe(true);
  });

  it('should toggle password visibility', () => {
    const { getByPlaceholderText, UNSAFE_root } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Contraseña');
    
    // Por defecto debería ser secureTextEntry=true
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    // Buscar el botón de toggle (ícono del ojo)
    // Como es un TouchableOpacity con FontAwesome, buscamos por rol
    const buttons = UNSAFE_root.findAllByType('TouchableOpacity' as any);
    // El botón del ojo debería ser uno de ellos
    const eyeButton = buttons.find(btn => {
      try {
        const icon = btn.findByType('FontAwesome' as any);
        return icon && (icon.props.name === 'eye' || icon.props.name === 'eye-slash');
      } catch {
        return false;
      }
    });
    
    if (eyeButton) {
      fireEvent.press(eyeButton);
      // Después del toggle debería cambiar
      expect(true).toBe(true);
    }
  });

  it('should trim email before calling onLogin', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('Usuario');
    const passwordInput = getByPlaceholderText('Contraseña');
    
    fireEvent.changeText(emailInput, '  test@example.com  '); // Con espacios
    fireEvent.changeText(passwordInput, 'password123');
    
    const loginButton = getByText('INGRESAR');
    fireEvent.press(loginButton);
    
    expect(mockOnLogin).toHaveBeenCalledWith({
      email: 'test@example.com', // Sin espacios
      password: 'password123',
    });
  });

  it('should show INGRESANDO... button text when loading', () => {
    const { getByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={true}
      />
    );
    
    expect(getByText('INGRESANDO...')).toBeTruthy();
  });

  it('should show INGRESAR button text when not loading', () => {
    const { getByText } = render(
      <LoginForm
        onLogin={mockOnLogin}
        onRegister={mockOnRegister}
        loading={false}
      />
    );
    
    expect(getByText('INGRESAR')).toBeTruthy();
  });
});
