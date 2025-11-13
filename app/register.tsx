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

import { RegisterForm } from '@/components/auth/RegisterForm';
import { ShieldIcon } from '@/components/ShieldIcon';
import { ThemedText } from '@/components/themed-text';
import { authService, RegisterCredentials } from '@/services/auth.service';

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (credentials: RegisterCredentials) => {
    setLoading(true);

    try {
      const result = await authService.register(credentials);

      if (result.success) {
        Alert.alert(
          'Éxito',
          result.message || 'Registro exitoso. Ya puedes iniciar sesión.',
          [
            {
              text: 'Ir al Login',
              onPress: handleBackToLogin,
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Error al registrarse');
      }
    } catch (error) {
      Alert.alert('Error', 'Error inesperado. Intenta nuevamente.');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Navegar al login
    const { router } = require('expo-router');
    router.replace('/login');
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
            Únete al Sistema de Alertas Comunitarias
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <RegisterForm 
            onRegister={handleRegister}
            onBackToLogin={handleBackToLogin}
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
    marginBottom: 20,
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
