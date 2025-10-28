import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ImageAsset, RegisterCredentials } from '@/services/auth.service';
import imagePickerService from '@/services/image-picker.service';
import React, { useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface RegisterFormProps {
  onRegister: (credentials: RegisterCredentials) => void;
  onBackToLogin: () => void;
  loading: boolean;
}

export function RegisterForm({ onRegister, onBackToLogin, loading }: RegisterFormProps) {
  // Estados para todos los campos
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados para imágenes
  const [fotoCedula, setFotoCedula] = useState<ImageAsset | null>(null);
  const [selfie, setSelfie] = useState<ImageAsset | null>(null);

  // Estados para visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados para switches
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNotifications, setAcceptNotifications] = useState(false);

  // Estados para focus
  const [focusedFields, setFocusedFields] = useState<{[key: string]: boolean}>({});

  // Estados para errores
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
    error: '#e74c3c',
  };

  const handleFieldChange = (field: string, value: string) => {
    // Actualizar el valor del campo
    switch (field) {
      case 'firstName': setFirstName(value); break;
      case 'lastName': setLastName(value); break;
      case 'idNumber': setIdNumber(value); break;
      case 'phone': setPhone(value); break;
      case 'email': setEmail(value); break;
      case 'province': setProvince(value); break;
      case 'city': setCity(value); break;
      case 'address': setAddress(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
    }
    
    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldFocus = (field: string) => {
    setFocusedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleFieldBlur = (field: string) => {
    setFocusedFields(prev => ({ ...prev, [field]: false }));
  };

  /**
   * Mostrar selector de fuente de imagen (Cámara o Galería)
   */
  const showImageSourcePicker = (type: 'cedula' | 'selfie') => {
    const title = type === 'cedula' ? 'Foto de Cédula' : 'Selfie para Verificación';
    const message = type === 'cedula'
      ? 'Selecciona cómo deseas capturar la foto de tu cédula'
      : 'Selecciona cómo deseas tomar tu selfie';

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title,
          options: ['Cancelar', 'Tomar Foto', 'Elegir de Galería'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await handleTakePhoto(type);
          } else if (buttonIndex === 2) {
            await handlePickFromGallery(type);
          }
        }
      );
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tomar Foto', onPress: () => handleTakePhoto(type) },
          { text: 'Elegir de Galería', onPress: () => handlePickFromGallery(type) },
        ]
      );
    }
  };

  /**
   * Tomar foto con la cámara
   */
  const handleTakePhoto = async (type: 'cedula' | 'selfie') => {
    const result = await imagePickerService.takePhoto();

    if (result.success && result.image) {
      if (type === 'cedula') {
        setFotoCedula(result.image);
        if (errors.fotoCedula) {
          setErrors(prev => ({ ...prev, fotoCedula: '' }));
        }
      } else {
        setSelfie(result.image);
        if (errors.selfie) {
          setErrors(prev => ({ ...prev, selfie: '' }));
        }
      }
    } else if (result.error) {
      Alert.alert('Error', result.error);
    }
  };

  /**
   * Seleccionar imagen de la galería
   */
  const handlePickFromGallery = async (type: 'cedula' | 'selfie') => {
    const result = await imagePickerService.pickFromGallery();

    if (result.success && result.image) {
      if (type === 'cedula') {
        setFotoCedula(result.image);
        if (errors.fotoCedula) {
          setErrors(prev => ({ ...prev, fotoCedula: '' }));
        }
      } else {
        setSelfie(result.image);
        if (errors.selfie) {
          setErrors(prev => ({ ...prev, selfie: '' }));
        }
      }
    } else if (result.error) {
      Alert.alert('Error', result.error);
    }
  };

  /**
   * Eliminar imagen seleccionada
   */
  const handleRemoveImage = (type: 'cedula' | 'selfie') => {
    if (type === 'cedula') {
      setFotoCedula(null);
    } else {
      setSelfie(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validar campos obligatorios
    if (!firstName.trim()) newErrors.firstName = 'Los nombres son obligatorios';
    if (!lastName.trim()) newErrors.lastName = 'Los apellidos son obligatorios';
    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!email.includes('@')) {
      newErrors.email = 'Ingresa un correo electrónico válido';
    }
    if (!password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener mínimo 8 caracteres';
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar imágenes obligatorias
    if (!fotoCedula) {
      newErrors.fotoCedula = 'La foto de cédula es obligatoria';
    }
    if (!selfie) {
      newErrors.selfie = 'La selfie es obligatoria';
    }

    // Validar términos y condiciones
    if (!acceptTerms) {
      Alert.alert('Atención', 'Debes aceptar los términos y condiciones');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onRegister({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        fotoCedula,
        selfie,
      });
    }
  };

  const renderInputField = (
    field: string,
    label: string,
    placeholder: string,
    iconName: string,
    keyboardType: any = 'default',
    secureText: boolean = false,
    showEye: boolean = false,
    required: boolean = true
  ) => {
    const isFocused = focusedFields[field];
    const hasError = errors[field];
    
    // Obtener el valor del campo correspondiente
    const getFieldValue = (fieldName: string) => {
      switch (fieldName) {
        case 'firstName': return firstName;
        case 'lastName': return lastName;
        case 'idNumber': return idNumber;
        case 'phone': return phone;
        case 'email': return email;
        case 'province': return province;
        case 'city': return city;
        case 'address': return address;
        case 'password': return password;
        case 'confirmPassword': return confirmPassword;
        default: return '';
      }
    };
    
    const value = getFieldValue(field);

    return (
      <View style={styles.inputContainer}>
        <ThemedText style={[styles.label, { color: colors.text }]}>
          {label}{required && ' *'}
        </ThemedText>
        <View style={[
          styles.inputWrapper, 
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError
        ]}>
          <FontAwesome 
            name={iconName} 
            size={20} 
            color={colors.textLight} 
            style={styles.inputIcon}
          />
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={colors.textLight}
            value={value}
            onChangeText={(text) => handleFieldChange(field, text)}
            keyboardType={keyboardType}
            autoCapitalize={field === 'email' ? 'none' : 'words'}
            autoCorrect={false}
            secureTextEntry={secureText}
            editable={!loading}
            underlineColorAndroid="transparent"
            selectionColor={colors.primary}
            style={[
              styles.input, 
              { color: colors.text }
            ]}
            onFocus={() => handleFieldFocus(field)}
            onBlur={() => handleFieldBlur(field)}
          />
          {showEye && (
            <TouchableOpacity
              onPress={() => {
                if (field === 'password') setShowPassword(!showPassword);
                if (field === 'confirmPassword') setShowConfirmPassword(!showConfirmPassword);
              }}
              style={styles.eyeIcon}
              disabled={loading}
            >
              <FontAwesome 
                name={(field === 'password' ? showPassword : showConfirmPassword) ? "eye-slash" : "eye"} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          )}
        </View>
        {hasError && (
          <ThemedText style={[styles.errorText, { color: colors.error }]}>
            {hasError}
          </ThemedText>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Información Personal */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Información Personal
        </ThemedText>
        <View style={styles.twoColumnRow}>
          <View style={styles.halfColumn}>
            {renderInputField('firstName', 'Nombres', 'Ingresa tus nombres', 'user')}
          </View>
          <View style={styles.halfColumn}>
            {renderInputField('lastName', 'Apellidos', 'Ingresa tus apellidos', 'user')}
          </View>
        </View>
      </View>

      {/* Correo Electrónico */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Correo Electrónico
        </ThemedText>
        {renderInputField('email', 'Correo Electrónico', 'usuario@ejemplo.com', 'envelope')}
      </View>

      {/* Seguridad */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Seguridad
        </ThemedText>
        {renderInputField('password', 'Contraseña', 'Mínimo 8 caracteres', 'lock', 'default', true, true)}
        {renderInputField('confirmPassword', 'Confirmar Contraseña', 'Repite tu contraseña', 'lock', 'default', true, true)}
      </View>

      {/* Foto de Cédula */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Foto de Cédula *
        </ThemedText>
        {fotoCedula ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: fotoCedula.uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={[styles.removeImageButton, { backgroundColor: colors.error }]}
              onPress={() => handleRemoveImage('cedula')}
              disabled={loading}
            >
              <FontAwesome name="trash" size={16} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.changeImageButton, { backgroundColor: colors.primary }]}
              onPress={() => showImageSourcePicker('cedula')}
              disabled={loading}
            >
              <FontAwesome name="camera" size={16} color={colors.white} />
              <ThemedText style={styles.changeImageText}>Cambiar</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.uploadButton,
              { borderColor: errors.fotoCedula ? colors.error : colors.border }
            ]}
            onPress={() => showImageSourcePicker('cedula')}
            disabled={loading}
          >
            <FontAwesome name="id-card" size={32} color={colors.primary} />
            <ThemedText style={[styles.uploadButtonText, { color: colors.primary }]}>
              Tomar o subir foto de cédula
            </ThemedText>
            <ThemedText style={[styles.uploadHint, { color: colors.textLight }]}>
              Asegúrate que la foto sea clara y legible
            </ThemedText>
          </TouchableOpacity>
        )}
        {errors.fotoCedula && (
          <ThemedText style={[styles.errorText, { color: colors.error }]}>
            {errors.fotoCedula}
          </ThemedText>
        )}
      </View>

      {/* Selfie para Verificación */}
      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          Selfie para Verificación *
        </ThemedText>
        {selfie ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selfie.uri }} style={styles.imagePreview} />
            <TouchableOpacity
              style={[styles.removeImageButton, { backgroundColor: colors.error }]}
              onPress={() => handleRemoveImage('selfie')}
              disabled={loading}
            >
              <FontAwesome name="trash" size={16} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.changeImageButton, { backgroundColor: colors.primary }]}
              onPress={() => showImageSourcePicker('selfie')}
              disabled={loading}
            >
              <FontAwesome name="camera" size={16} color={colors.white} />
              <ThemedText style={styles.changeImageText}>Cambiar</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.uploadButton,
              { borderColor: errors.selfie ? colors.error : colors.border }
            ]}
            onPress={() => showImageSourcePicker('selfie')}
            disabled={loading}
          >
            <FontAwesome name="camera" size={32} color={colors.primary} />
            <ThemedText style={[styles.uploadButtonText, { color: colors.primary }]}>
              Tomar o subir selfie
            </ThemedText>
            <ThemedText style={[styles.uploadHint, { color: colors.textLight }]}>
              Tu rostro debe verse claramente
            </ThemedText>
          </TouchableOpacity>
        )}
        {errors.selfie && (
          <ThemedText style={[styles.errorText, { color: colors.error }]}>
            {errors.selfie}
          </ThemedText>
        )}
      </View>

      {/* Términos y Condiciones */}
      <View style={styles.checkboxContainer}>
        <Switch
          value={acceptTerms}
          onValueChange={setAcceptTerms}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={acceptTerms ? colors.primary : colors.white}
          disabled={loading}
        />
        <ThemedText style={[styles.checkboxText, { color: colors.text }]}>
          Acepto los{' '}
          <ThemedText style={[styles.linkText, { color: colors.primary }]}>
            Términos y Condiciones
          </ThemedText>
          {' '}y la{' '}
          <ThemedText style={[styles.linkText, { color: colors.primary }]}>
            Política de Privacidad
          </ThemedText>
          {' '}de VigilApp, entiendo que mis datos serán utilizados para verificar mi identidad y mejorar la seguridad del sistema.
        </ThemedText>
      </View>

      {/* Notificaciones */}
      <View style={styles.checkboxContainer}>
        <Switch
          value={acceptNotifications}
          onValueChange={setAcceptNotifications}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={acceptNotifications ? colors.primary : colors.white}
          disabled={loading}
        />
        <ThemedText style={[styles.checkboxText, { color: colors.text }]}>
          Deseo recibir notificaciones sobre alertas en mi zona y actualizaciones del sistema.
        </ThemedText>
      </View>

      {/* Botón de Registro */}
      <TouchableOpacity
        style={[styles.registerButton, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ThemedText style={styles.buttonText}>CREANDO CUENTA...</ThemedText>
        ) : (
          <View style={styles.buttonContent}>
            <ThemedText style={styles.buttonText}>CREAR CUENTA</ThemedText>
            <IconSymbol 
              name="arrow.right" 
              size={16} 
              color={colors.white} 
              style={styles.buttonIcon}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Enlace de Login */}
      <View style={styles.loginContainer}>
        <ThemedText style={[styles.loginText, { color: colors.text }]}>
          ¿Ya tienes una cuenta?{' '}
        </ThemedText>
        <TouchableOpacity onPress={onBackToLogin} disabled={loading}>
          <ThemedText style={[styles.loginLink, { color: colors.primary }]}>
            Inicia sesión aquí!
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfColumn: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: '#005677',
    borderWidth: 2,
  },
  inputWrapperError: {
    borderColor: '#e74c3c',
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
    outlineWidth: 0,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  uploadButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: '#f8f9fa',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  changeImageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  checkboxText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  linkText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
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