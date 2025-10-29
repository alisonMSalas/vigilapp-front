import { ThemedText } from '@/components/themed-text';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Recibir la dirección seleccionada desde la pantalla de location
  useEffect(() => {
    if (params.address) {
      setLocationAddress(params.address as string);
    }
  }, [params.address]);

  const handleOpenLocationPicker = () => {
    router.push({
      pathname: '/location',
      params: { returnTo: 'create-alert' },
    });
  };

  const canPublish = selectedType && title.length > 0 && description.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Nueva Publicación</ThemedText>
          <TouchableOpacity
            style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]}
            disabled={!canPublish}
          >
            <ThemedText style={[styles.publishText, !canPublish && styles.publishTextDisabled]}>
              Publicar
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userSection}>
            <View style={styles.userIcon}>
              <Feather name="user" size={20} color="#005677" />
            </View>
            <View>
              <ThemedText style={styles.userName}>Usuario Anónimo</ThemedText>
              <ThemedText style={styles.userSubtext}>Publicación anónima para la comunidad</ThemedText>
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
                placeholder="Describe la situación con más detalles..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                maxLength={500}
                multiline
                textAlignVertical="top"
              />
              <ThemedText style={styles.counter}>{description.length}/500</ThemedText>
            </View>
          </View>

          {/* Add Photos/Videos */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Agregar Fotos/Videos</ThemedText>
            <TouchableOpacity style={styles.photoArea}>
              <Feather name="image" size={48} color="#ccc" />
              <ThemedText style={styles.photoText}>Toca para agregar fotos</ThemedText>
              <ThemedText style={styles.photoSubtext}>O arrastra y suelta aquí</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Ubicación</ThemedText>
            <TouchableOpacity 
              style={styles.locationInputContainer}
              onPress={handleOpenLocationPicker}
            >
              {locationAddress ? (
                <ThemedText style={styles.locationText}>{locationAddress}</ThemedText>
              ) : (
                <ThemedText style={styles.locationPlaceholder}>
                  Ej: Av. Principal esquina con 12 de Noviembre
                </ThemedText>
              )}
              <Feather name="map-pin" size={20} color="#005677" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.locationButton} 
              onPress={handleOpenLocationPicker}
            >
              <Feather name="crosshair" size={20} color="#fff" />
              <ThemedText style={styles.locationButtonText}>Seleccionar ubicación</ThemedText>
            </TouchableOpacity>
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
    paddingVertical: 16,
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
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
});

