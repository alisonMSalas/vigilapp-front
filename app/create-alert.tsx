import { ThemedText } from '@/components/themed-text';
import { alertService, AlertCategory } from '@/services/alert.service';
import { locationCacheService } from '@/services/location-cache.service';
import { imagePickerService } from '@/services/image-picker.service';
import { ImageAsset } from '@/services/types/auth.types';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type AlertType = 'emergency' | 'warning' | 'info' | 'community';

interface AlertTypeOption {
  type: AlertType;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
  color: string;
}

const alertTypes: AlertTypeOption[] = [
  {
    type: 'emergency',
    label: 'Emergencia',
    icon: 'alert-triangle',
    description: 'Situación crítica',
    color: '#f44336',
  },
  {
    type: 'warning',
    label: 'Precaución',
    icon: 'alert-triangle',
    description: 'Atención requerida',
    color: '#ff9800',
  },
  {
    type: 'info',
    label: 'Informativa',
    icon: 'info',
    description: 'Información útil',
    color: '#2196f3',
  },
  {
    type: 'community',
    label: 'Comunitaria',
    icon: 'users',
    description: 'Evento vecinal',
    color: '#4caf50',
  },
];

export default function CreateAlertScreen() {
  const [selectedType, setSelectedType] = useState<AlertType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [radiusM, setRadiusM] = useState(1000);
  const [publishing, setPublishing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<ImageAsset[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Función helper para navegar hacia atrás de forma segura
  const safeGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  // Recibir la dirección y coordenadas desde la pantalla de location
  useEffect(() => {
    if (params.address) {
      setLocationAddress(params.address as string);
    }
    if (params.lat && params.lon) {
      setLatitude(parseFloat(params.lat as string));
      setLongitude(parseFloat(params.lon as string));
    }
  }, [params.address, params.lat, params.lon]);

  // Leer ubicación del cache cuando vuelve el foco (después de seleccionar en location)
  useFocusEffect(
    useCallback(() => {
      if (locationCacheService.hasLocation()) {
        const location = locationCacheService.getAndClearLocation();
        if (location) {
          setLocationAddress(location.address);
          setLatitude(location.lat);
          setLongitude(location.lon);
          console.log('[CreateAlert] 📍 Ubicación recuperada del cache:', location);
        }
      }
    }, [])
  );

  const handleOpenLocationPicker = () => {
    router.push({
      pathname: '/location',
      params: { returnTo: 'create-alert' },
    });
  };

  // Mapear tipo de alerta del frontend al backend
  const mapAlertType = (type: AlertType): AlertCategory => {
    const mapping: Record<AlertType, AlertCategory> = {
      emergency: 'EMERGENCY',
      warning: 'PRECAUTION',
      info: 'INFO',
      community: 'COMMUNITY',
    };
    return mapping[type];
  };

  /**
   * Handle media selection
   */
  const handleSelectMedia = async () => {
    try {
      const result = await imagePickerService.pickMultipleMedia(5);
      if (result.success && result.files) {
        setSelectedFiles(result.files);
        console.log(`[CreateAlert] 📸 ${result.files.length} archivos seleccionados`);
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('[CreateAlert] Error selecting media:', error);
      Alert.alert('Error', 'No se pudieron seleccionar los archivos');
    }
  };

  /**
   * Remove a file from selection
   */
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!selectedType || !title || !description) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Error', 'La descripción debe tener al menos 10 caracteres');
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert('Error', 'Por favor selecciona una ubicación');
      return;
    }

    setPublishing(true);
    try {
      const alertData = {
        category: mapAlertType(selectedType),
        title: title.trim(),
        description: description.trim(),
        latitude,
        longitude,
        radiusM,
        address: locationAddress,
        isAnonymous,
      };

      // Use endpoint with media if files are selected
      if (selectedFiles.length > 0) {
        await alertService.createAlertWithMedia(alertData, selectedFiles);
        console.log(`[CreateAlert] ✅ Alerta creada con ${selectedFiles.length} archivos adjuntos`);
      } else {
        await alertService.createAlert(alertData);
        console.log('[CreateAlert] ✅ Alerta creada sin archivos');
      }

      Alert.alert(
        'Éxito',
        'Tu alerta ha sido publicada correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.push('/home'),
          },
        ]
      );
    } catch (error) {
      console.error('Error publishing alert:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo publicar la alerta. Intenta de nuevo.';
      Alert.alert('Error', errorMessage);
    } finally {
      setPublishing(false);
    }
  };

  const canPublish = selectedType && title.length > 0 && description.length > 0 && latitude && longitude;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={safeGoBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Nueva Alerta</ThemedText>
          <TouchableOpacity
            style={[styles.publishButton, (!canPublish || publishing) && styles.publishButtonDisabled]}
            disabled={!canPublish || publishing}
            onPress={handlePublish}
          >
            {publishing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <ThemedText style={[styles.publishText, !canPublish && styles.publishTextDisabled]}>
                Publicar
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userSection}>
            <View style={styles.userIcon}>
              <Feather name="user" size={20} color="#005677" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.userName}>
                {isAnonymous ? 'Usuario Anónimo' : 'Tu Nombre'}
              </ThemedText>
              <ThemedText style={styles.userSubtext}>
                {isAnonymous ? 'Publicación anónima' : 'Publicación con tu identidad'}
              </ThemedText>
            </View>
            <View style={styles.anonymousSwitch}>
              <ThemedText style={styles.anonymousSwitchLabel}>Anónimo</ThemedText>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#ccc', true: '#005677' }}
                thumbColor={isAnonymous ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Alert Types */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Tipo de Alerta</ThemedText>
            <View style={styles.alertTypesGrid}>
              {alertTypes.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.alertTypeCard,
                    selectedType === type.type && { borderWidth: 2, borderColor: type.color },
                  ]}
                  onPress={() => setSelectedType(type.type)}
                >
                  <View style={[styles.alertTypeIcon, { backgroundColor: type.color + '15' }]}>
                    <Feather name={type.icon} size={28} color={type.color} />
                  </View>
                  <ThemedText style={[styles.alertTypeLabel, { color: type.color }]}>
                    {type.label}
                  </ThemedText>
                  <ThemedText style={styles.alertTypeDescription}>{type.description}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Título de la Alerta</ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ej: Árbol caído en Av. Principal"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                maxLength={80}
                multiline
              />
              <ThemedText style={styles.counter}>{title.length}/80</ThemedText>
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Descripción</ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Describe la situación con más detalles (mínimo 10 caracteres)..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                maxLength={500}
                multiline
                textAlignVertical="top"
              />
              <ThemedText style={[styles.counter, description.length < 10 && styles.counterError]}>
                {description.length}/500 {description.length < 10 && '(mínimo 10)'}
              </ThemedText>
            </View>
          </View>

          {/* Add Photos/Videos */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <ThemedText style={styles.sectionTitle}>
                Evidencia (Fotos/Videos){' '}
                {selectedFiles.length > 0 && `(${selectedFiles.length}/5)`}
              </ThemedText>
              {selectedFiles.length > 0 && (
                <ThemedText style={styles.totalSize}>
                  {(selectedFiles.reduce((sum, f) => sum + (f.fileSize || 0), 0) / (1024 * 1024)).toFixed(1)}MB
                </ThemedText>
              )}
            </View>

            {selectedFiles.length > 0 ? (
              <View>
                <ScrollView
                  horizontal
                  style={styles.mediaPreviewContainer}
                  showsHorizontalScrollIndicator={false}
                >
                  {selectedFiles.map((file, index) => (
                    <View key={index} style={styles.mediaPreviewItem}>
                      <Image source={{ uri: file.uri }} style={styles.mediaPreviewImage} />
                      <TouchableOpacity
                        style={styles.removeMediaButton}
                        onPress={() => handleRemoveFile(index)}
                      >
                        <Feather name="x" size={16} color="#fff" />
                      </TouchableOpacity>
                      {file.type.startsWith('video') && (
                        <View style={styles.videoIndicator}>
                          <Feather name="video" size={16} color="#fff" />
                        </View>
                      )}
                      {file.fileSize && (
                        <View style={styles.fileSizeIndicator}>
                          <ThemedText style={styles.fileSizeText}>
                            {(file.fileSize / (1024 * 1024)).toFixed(1)}MB
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
                {selectedFiles.length < 5 && (
                  <TouchableOpacity style={styles.addMoreButton} onPress={handleSelectMedia}>
                    <Feather name="plus" size={20} color="#005677" />
                    <ThemedText style={styles.addMoreText}>Agregar más</ThemedText>
                  </TouchableOpacity>
                )}
                <ThemedText style={styles.blurNotice}>
                  ℹ️ Las caras en las fotos serán difuminadas automáticamente
                </ThemedText>
              </View>
            ) : (
              <TouchableOpacity style={styles.photoArea} onPress={handleSelectMedia}>
                <Feather name="image" size={48} color="#ccc" />
                <ThemedText style={styles.photoText}>Toca para agregar fotos/videos</ThemedText>
                <ThemedText style={styles.photoSubtext}>Máximo 5 archivos</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Location */}
          <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Ubicación *</ThemedText>
            
              {locationAddress && latitude && longitude ? (
                <View style={styles.locationCard}>
                  <View style={styles.locationInfo}>
                    <View style={styles.locationIconCircle}>
                      <Feather name="map-pin" size={20} color="#005677" />
                    </View>
                    <View style={styles.locationTextContainer}>
                      <ThemedText style={styles.locationLabel}>Ubicación seleccionada</ThemedText>
                      <ThemedText style={styles.locationAddress} numberOfLines={2}>
                        {locationAddress}
                      </ThemedText>
                      <ThemedText style={styles.locationCoords}>
                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </ThemedText>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.changeLocationButton}
                    onPress={handleOpenLocationPicker}
                  >
                    <Feather name="edit-2" size={16} color="#005677" />
                    <ThemedText style={styles.changeLocationText}>Cambiar</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.selectLocationButton} 
                  onPress={handleOpenLocationPicker}
                >
                  <View style={styles.selectLocationContent}>
                    <Feather name="map-pin" size={24} color="#005677" />
                    <View style={styles.selectLocationTextContainer}>
                      <ThemedText style={styles.selectLocationTitle}>
                        Seleccionar ubicación
                      </ThemedText>
                      <ThemedText style={styles.selectLocationSubtitle}>
                        Toca para elegir dónde ocurrió el incidente
                      </ThemedText>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>
              )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  publishButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#005677',
  },
  publishButtonDisabled: {
    backgroundColor: 'transparent',
  },
  publishText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  publishTextDisabled: {
    color: '#999',
  },
  scroll: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userSubtext: {
    fontSize: 14,
    color: '#666',
  },
  anonymousSwitch: {
    alignItems: 'center',
    gap: 4,
  },
  anonymousSwitchLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalSize: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005677',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alertTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  alertTypeCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  alertTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  alertTypeLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  alertTypeDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    position: 'relative',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 50,
  },
  descriptionInput: {
    minHeight: 150,
    paddingTop: 16,
  },
  counter: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: '#999',
  },
  counterError: {
    color: '#f44336',
    fontWeight: '600',
  },
  photoArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  photoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  photoSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  locationPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#999',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#005677',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
    locationCard: {
      backgroundColor: '#f0f8ff',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#005677',
      padding: 16,
    },
    locationInfo: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    locationIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    locationTextContainer: {
      flex: 1,
    },
    locationLabel: {
      fontSize: 12,
      color: '#005677',
      fontWeight: '600',
      marginBottom: 4,
    },
    locationAddress: {
      fontSize: 15,
      color: '#333',
      fontWeight: '500',
      marginBottom: 4,
    },
    locationCoords: {
      fontSize: 12,
      color: '#666',
    },
    changeLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#fff',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#005677',
    },
    changeLocationText: {
      color: '#005677',
      fontSize: 14,
      fontWeight: '600',
    },
    selectLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#f8f9fa',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#005677',
      borderStyle: 'dashed',
      padding: 20,
    },
    selectLocationContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      flex: 1,
    },
    selectLocationTextContainer: {
      flex: 1,
    },
    selectLocationTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#005677',
      marginBottom: 4,
    },
    selectLocationSubtitle: {
      fontSize: 14,
      color: '#666',
    },
    mediaPreviewContainer: {
      marginBottom: 12,
    },
    mediaPreviewItem: {
      width: 120,
      height: 120,
      marginRight: 12,
      borderRadius: 8,
      overflow: 'hidden',
      position: 'relative',
    },
    mediaPreviewImage: {
      width: '100%',
      height: '100%',
      backgroundColor: '#e0e0e0',
    },
    removeMediaButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoIndicator: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 12,
      padding: 4,
    },
    fileSizeIndicator: {
      position: 'absolute',
      bottom: 4,
      left: 4,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    fileSizeText: {
      fontSize: 10,
      color: '#fff',
      fontWeight: '600',
    },
    addMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#005677',
      borderStyle: 'dashed',
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    addMoreText: {
      color: '#005677',
      fontSize: 14,
      fontWeight: '600',
    },
    blurNotice: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center',
      fontStyle: 'italic',
    },
});

