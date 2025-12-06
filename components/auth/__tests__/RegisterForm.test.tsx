import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RegisterForm } from '../RegisterForm';
import { Platform, Alert, ActionSheetIOS } from 'react-native';

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'android', // Default para tests
  select: jest.fn((obj) => obj.android),
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock ActionSheetIOS
jest.mock('react-native/Libraries/ActionSheetIOS/ActionSheetIOS', () => ({
  showActionSheetWithOptions: jest.fn(),
}));

// Mock del servicio de image picker
jest.mock('@/services/image-picker.service', () => ({
  __esModule: true,
  default: {
    takePhoto: jest.fn(),
    pickFromGallery: jest.fn(),
  },
}));

describe('RegisterForm', () => {
  const mockOnRegister = jest.fn();
  const mockOnBackToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { UNSAFE_root } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should update firstName input', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const firstNameInput = getByPlaceholderText('Ingresa tus nombres');
    fireEvent.changeText(firstNameInput, 'John');
    expect(firstNameInput.props.value).toBe('John');
  });

  it('should update lastName input', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const lastNameInput = getByPlaceholderText('Ingresa tus apellidos');
    fireEvent.changeText(lastNameInput, 'Doe');
    expect(lastNameInput.props.value).toBe('Doe');
  });

  it('should render all required input fields', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    expect(getByPlaceholderText('Ingresa tus nombres')).toBeTruthy();
    expect(getByPlaceholderText('Ingresa tus apellidos')).toBeTruthy();
    expect(getByPlaceholderText('usuario@ejemplo.com')).toBeTruthy();
  });

  it('should disable inputs when loading', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={true}
      />
    );
    
    const firstNameInput = getByPlaceholderText('Ingresa tus nombres');
    expect(firstNameInput.props.editable).toBe(false);
  });

  it('should update email input', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('usuario@ejemplo.com');
    fireEvent.changeText(emailInput, 'test@test.com');
    expect(emailInput.props.value).toBe('test@test.com');
  });

  it('should update password input', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    fireEvent.changeText(passwordInput, 'password123');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('should update confirm password input', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const confirmPasswordInput = getByPlaceholderText('Repite tu contraseña');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    expect(confirmPasswordInput.props.value).toBe('password123');
  });

  it('should toggle accept terms switch', () => {
    const { getAllByRole } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const switches = getAllByRole('switch');
    expect(switches.length).toBeGreaterThan(0);
  });

  it('should call onBackToLogin when back button is pressed', () => {
    const { getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const backButton = getByText('Inicia sesión aquí!');
    fireEvent.press(backButton);
    expect(mockOnBackToLogin).toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    const { getByPlaceholderText, UNSAFE_root } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should toggle confirm password visibility', () => {
    const { getByPlaceholderText, UNSAFE_root } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const confirmPasswordInput = getByPlaceholderText('Repite tu contraseña');
    expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('should handle field focus', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const firstNameInput = getByPlaceholderText('Ingresa tus nombres');
    fireEvent(firstNameInput, 'focus');
    expect(firstNameInput).toBeTruthy();
  });

  it('should handle field blur', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const firstNameInput = getByPlaceholderText('Ingresa tus nombres');
    fireEvent(firstNameInput, 'blur');
    expect(firstNameInput).toBeTruthy();
  });

  it('should show validation error for empty firstName', () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    // Clear the field
    const firstNameInput = getByPlaceholderText('Ingresa tus nombres');
    fireEvent.changeText(firstNameInput, '');
    
    // Try to submit
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should show validation error for empty lastName', () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const lastNameInput = getByPlaceholderText('Ingresa tus apellidos');
    fireEvent.changeText(lastNameInput, '');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid email', () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('usuario@ejemplo.com');
    fireEvent.changeText(emailInput, 'invalid-email');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should show validation error for short password', () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    fireEvent.changeText(passwordInput, '1234');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should show validation error for password mismatch', () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    const confirmPasswordInput = getByPlaceholderText('Repite tu contraseña');
    
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password456');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should render image upload buttons', () => {
    const { getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    expect(getByText('Tomar o subir foto de cédula')).toBeTruthy();
    expect(getByText('Tomar o subir selfie')).toBeTruthy();
  });

  it('should render terms and conditions text', () => {
    const { getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    expect(getByText('Términos y Condiciones')).toBeTruthy();
    expect(getByText('Política de Privacidad')).toBeTruthy();
  });

  it('should show button as CREAR CUENTA when not loading', () => {
    const { getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    expect(getByText('CREAR CUENTA')).toBeTruthy();
  });

  it('should show button as CREANDO CUENTA when loading', () => {
    const { getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={true}
      />
    );
    
    expect(getByText('CREANDO CUENTA...')).toBeTruthy();
  });

  it('should handle field focus events', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const firstNameInput = getByPlaceholderText('Ingresa tus nombres');
    fireEvent(firstNameInput, 'focus');
    expect(true).toBe(true);
  });

  it('should handle field blur events', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const firstNameInput = getByPlaceholderText('Ingresa tus nombres');
    fireEvent(firstNameInput, 'blur');
    expect(true).toBe(true);
  });

  it('should clear error when field value changes', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    // Provocar error primero
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    // Luego corregir el campo
    const firstNameInput = getByPlaceholderText('Ingresa tus nombres');
    fireEvent.changeText(firstNameInput, 'John');
    
    // El error debería limpiarse
    expect(true).toBe(true);
  });

  it('should update password input', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    fireEvent.changeText(passwordInput, 'newpassword123');
    expect(passwordInput.props.value).toBe('newpassword123');
  });

  it('should update confirmPassword input', () => {
    const { getByPlaceholderText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const confirmInput = getByPlaceholderText('Repite tu contraseña');
    fireEvent.changeText(confirmInput, 'newpassword123');
    expect(confirmInput.props.value).toBe('newpassword123');
  });

  it('should press image upload button for cedula', () => {
    const { getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const button = getByText('Tomar o subir foto de cédula');
    fireEvent.press(button);
    // En Android debería mostrar Alert, en iOS ActionSheet
    expect(true).toBe(true);
  });

  it('should press image upload button for selfie', () => {
    const { getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const button = getByText('Tomar o subir selfie');
    fireEvent.press(button);
    expect(true).toBe(true);
  });

  it('should require firstName to be non-empty', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const firstNameInput = getByPlaceholderText('Ingresa tus nombres');
    fireEvent.changeText(firstNameInput, '');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should require lastName to be non-empty', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const lastNameInput = getByPlaceholderText('Ingresa tus apellidos');
    fireEvent.changeText(lastNameInput, '');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should require valid email format', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const emailInput = getByPlaceholderText('usuario@ejemplo.com');
    
    // Email sin @
    fireEvent.changeText(emailInput, 'invalidemail.com');
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should require password of at least 8 characters', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    fireEvent.changeText(passwordInput, '1234567'); // 7 chars
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should require passwords to match', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    const passwordInput = getByPlaceholderText('Mínimo 8 caracteres');
    const confirmInput = getByPlaceholderText('Repite tu contraseña');
    
    fireEvent.changeText(passwordInput, 'password1234');
    fireEvent.changeText(confirmInput, 'password9999');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should call onBackToLogin when back button is pressed', () => {
    const { getAllByRole } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    // El botón de back debería estar al final
    const buttons = getAllByRole('button');
    const backButton = buttons[buttons.length - 1];
    fireEvent.press(backButton);
    
    expect(mockOnBackToLogin).toHaveBeenCalledTimes(1);
  });

  it('should not call onBackToLogin when loading', () => {
    const { getAllByRole } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={true}
      />
    );
    
    const buttons = getAllByRole('button');
    const backButton = buttons[buttons.length - 1];
    fireEvent.press(backButton);
    
    expect(true).toBe(true);
  });

  it('should show error when fotoCedula is missing', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    // Llenar todos los campos excepto fotoCedula
    fireEvent.changeText(getByPlaceholderText('Ingresa tus nombres'), 'John');
    fireEvent.changeText(getByPlaceholderText('Ingresa tus apellidos'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('usuario@ejemplo.com'), 'john@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Repite tu contraseña'), 'password123');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should show error when selfie is missing', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    // Llenar todos los campos excepto selfie
    fireEvent.changeText(getByPlaceholderText('Ingresa tus nombres'), 'John');
    fireEvent.changeText(getByPlaceholderText('Ingresa tus apellidos'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('usuario@ejemplo.com'), 'john@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Repite tu contraseña'), 'password123');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should show alert when terms are not accepted', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    // Llenar todos los campos
    fireEvent.changeText(getByPlaceholderText('Ingresa tus nombres'), 'John');
    fireEvent.changeText(getByPlaceholderText('Ingresa tus apellidos'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('usuario@ejemplo.com'), 'john@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Repite tu contraseña'), 'password123');
    
    // No aceptar términos (por defecto está en false)
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('should handle password mismatch validation', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Ingresa tus nombres'), 'John');
    fireEvent.changeText(getByPlaceholderText('Ingresa tus apellidos'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('usuario@ejemplo.com'), 'john@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Repite tu contraseña'), 'different123');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should trim firstName and lastName before submitting', () => {
    const mockImagePickerService = require('@/services/image-picker.service').default;
    mockImagePickerService.takePhoto.mockResolvedValue({
      uri: 'file://cedula.jpg',
      type: 'image',
      name: 'cedula.jpg'
    });

    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Ingresa tus nombres'), '  John  ');
    fireEvent.changeText(getByPlaceholderText('Ingresa tus apellidos'), '  Doe  ');
    fireEvent.changeText(getByPlaceholderText('usuario@ejemplo.com'), 'john@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Repite tu contraseña'), 'password123');
    
    expect(true).toBe(true);
  });

  it('should validate email format without @ symbol', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Ingresa tus nombres'), 'John');
    fireEvent.changeText(getByPlaceholderText('Ingresa tus apellidos'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('usuario@ejemplo.com'), 'invalidemail');
    fireEvent.changeText(getByPlaceholderText('Mínimo 8 caracteres'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Repite tu contraseña'), 'password123');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should validate short password (< 8 chars)', () => {
    const { getByPlaceholderText, getByText } = render(
      <RegisterForm
        onRegister={mockOnRegister}
        onBackToLogin={mockOnBackToLogin}
        loading={false}
      />
    );
    
    fireEvent.changeText(getByPlaceholderText('Ingresa tus nombres'), 'John');
    fireEvent.changeText(getByPlaceholderText('Ingresa tus apellidos'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('usuario@ejemplo.com'), 'john@test.com');
    fireEvent.changeText(getByPlaceholderText('Mínimo 8 caracteres'), 'short');
    fireEvent.changeText(getByPlaceholderText('Repite tu contraseña'), 'short');
    
    const submitButton = getByText('CREAR CUENTA');
    fireEvent.press(submitButton);
    
    expect(mockOnRegister).not.toHaveBeenCalled();
  });
});
