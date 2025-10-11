import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';

import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldIcon } from '@/components/ShieldIcon';
import { ThemedText } from '@/components/themed-text';
import { authService, LoginCredentials } from '@/services/auth.service';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true);
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success) {
        Alert.alert('Éxito', 'Inicio de sesión exitoso');
      } else {
        Alert.alert('Error', response.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Navegar a la página de registro
    // TODO: Crear página de registro
    console.log('Navigate to register');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <ShieldIcon size={48} color="#005677" />
            <ThemedText type="title" style={styles.title}>
              VigilApp
            </ThemedText>
          </View>
          <ThemedText style={styles.subtitle}>
            Sistema de Alertas Comunitarias
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <LoginForm 
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: -100,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#005677',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
