import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LoginCredentials } from '@/services/auth.service';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => void;
  onRegister: () => void;
  loading: boolean;
}

export function LoginForm({ onLogin, onRegister, loading }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Paleta de colores azul marino
  const colors = {
    primary: '#005677',      // Color base más oscuro
    primaryLight: '#00688a', // Variación más clara
    primaryLighter: '#3388a8', // Aún más clara
    primaryLightest: '#66aac6', // Más clara
    text: '#333333',
    textLight: '#666666',
    border: '#e0e0e0',
    background: '#ffffff',
    white: '#ffffff',
  };

  const validateForm = (): boolean => {
    // Limpiar errores previos
    setEmailError('');
    setPasswordError('');
    
    let isValid = true;

    // Validar email
    if (!email.trim()) {
      setEmailError('Por favor ingresa tu email');
      isValid = false;
    } else if (!email.includes('@')) {
      setEmailError('Por favor ingresa un email válido');
      isValid = false;
    }

    // Validar contraseña
    if (!password.trim()) {
      setPasswordError('Por favor ingresa tu contraseña');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    return isValid;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError(''); // Limpiar error al escribir
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError(''); // Limpiar error al escribir
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onLogin({ email: email.trim(), password });
    }
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>Correo Electrónico</ThemedText>
        <View style={[
          styles.inputWrapper, 
          emailFocused && styles.inputWrapperFocused
        ]}>
          <IconSymbol 
            name="envelope" 
            size={20} 
            color={colors.textLight} 
            style={styles.inputIcon}
          />
        <TextInput
          placeholder="Usuario"
          placeholderTextColor={colors.textLight}
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          outlineStyle="none"
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          style={[
            styles.input, 
            { color: colors.text },
            Platform.OS === 'web' && { outline: 'none', border: 'none' }
          ]}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
        </View>
        {emailError ? (
          <ThemedText style={[styles.errorText, { color: '#e74c3c' }]}>
            {emailError}
          </ThemedText>
        ) : null}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>Contraseña</ThemedText>
        <View style={[
          styles.inputWrapper, 
          passwordFocused && styles.inputWrapperFocused
        ]}>
          <IconSymbol 
            name="lock" 
            size={20} 
            color={colors.textLight} 
            style={styles.inputIcon}
          />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor={colors.textLight}
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          outlineStyle="none"
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
          style={[
            styles.input, 
            { color: colors.text },
            Platform.OS === 'web' && { outline: 'none', border: 'none' }
          ]}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            disabled={loading}
          >
            <FontAwesome 
              name={showPassword ? "eye-slash" : "eye"} 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <ThemedText style={[styles.errorText, { color: '#e74c3c' }]}>
            {passwordError}
          </ThemedText>
        ) : null}
      </View>

      {/* Remember Me */}
      <View style={styles.rememberContainer}>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={rememberMe ? colors.primary : colors.white}
          disabled={loading}
        />
        <ThemedText style={[styles.rememberText, { color: colors.text }]}>
          Recordarme
        </ThemedText>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ThemedText style={styles.buttonText}>INGRESANDO...</ThemedText>
        ) : (
          <View style={styles.buttonContent}>
            <ThemedText style={styles.buttonText}>INGRESAR</ThemedText>
            <IconSymbol 
              name="arrow.right" 
              size={16} 
              color={colors.white} 
              style={styles.buttonIcon}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <ThemedText style={[styles.registerText, { color: colors.text }]}>
          ¿No tienes una cuenta?{' '}
        </ThemedText>
        <TouchableOpacity onPress={onRegister} disabled={loading}>
          <ThemedText style={[styles.registerLink, { color: colors.primary }]}>
            Regístrate
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: '#005677',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  rememberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginLeft: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});
