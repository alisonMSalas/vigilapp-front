import { ThemedText } from '@/components/themed-text';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AlertDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Simular datos de la alerta (en producción vendría de params o API)
  const alert = {
    id: params.id || '1',
    type: params.type || 'warning',
    title: 'Manifestación Estudiantil',
    description: 'Marcha pacífica de estudiantes universitarios desde el Parque Cevallos hacia la Gobernación.',
    detailedDescription: 'Una manifestación estudiantil se está llevando a cabo de forma pacífica. Los estudiantes han comenzado su marcha desde el Parque Cevallos con dirección hacia la Gobernación. Se recomienda buscar rutas alternas para evitar retrasos en el tráfico.',
    location: 'Av. Principal',
    distance: '0.8 km',
    reportedBy: 'Carlos M.',
    reportedTime: 'hace 15 min',
    status: 'Activa',
  };

  const getAlertConfig = () => {
    switch (alert.type) {
      case 'warning':
        return {
          color: '#ff9800',
          bgColor: '#fff3e0',
          icon: 'alert-triangle',
          label: 'Precaución',
        };
      case 'community':
        return {
          color: '#4caf50',
          bgColor: '#e8f5e9',
          icon: 'users',
          label: 'Comunitaria',
        };
      case 'info':
        return {
          color: '#2196f3',
          bgColor: '#e3f2fd',
          icon: 'info',
          label: 'Informativa',
        };
      default:
        return {
          color: '#757575',
          bgColor: '#f5f5f5',
          icon: 'alert-circle',
          label: 'Alerta',
        };
    }
  };

  const config = getAlertConfig();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Detalle de Alerta</ThemedText>
          <View style={styles.placeholderView} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Alert Card */}
          <View style={[styles.alertCard, { backgroundColor: '#005677' }]}>
            <View style={styles.alertHeader}>
              <View style={[styles.alertType, { backgroundColor: config.bgColor }]}>
                <Feather name={config.icon as keyof typeof Feather.glyphMap} size={14} color={config.color} />
                <ThemedText style={[styles.alertTypeText, { color: config.color }]}>
                  {config.label}
                </ThemedText>
              </View>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: '#ff9800' }]} />
                <ThemedText style={styles.statusText}>{alert.status}</ThemedText>
              </View>
            </View>

            <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
            <ThemedText style={styles.alertDescription}>{alert.description}</ThemedText>
          </View>

          {/* Details Cards */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailCard}>
              <Feather name="map-pin" size={20} color="#005677" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Ubicación</ThemedText>
                <ThemedText style={styles.detailValue}>{alert.location}</ThemedText>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Feather name="clock" size={20} color="#005677" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Reportado</ThemedText>
                <ThemedText style={styles.detailValue}>{alert.reportedTime}</ThemedText>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Feather name="user" size={20} color="#005677" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Reportado por</ThemedText>
                <ThemedText style={styles.detailValue}>{alert.reportedBy}</ThemedText>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Feather name="map" size={20} color="#005677" />
              <View style={styles.detailContent}>
                <ThemedText style={styles.detailLabel}>Distancia</ThemedText>
                <ThemedText style={styles.detailValue}>{alert.distance}</ThemedText>
              </View>
            </View>
          </View>

          {/* Detailed Description */}
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.descriptionTitle}>Descripción Detallada</ThemedText>
            <ThemedText style={styles.descriptionText}>{alert.detailedDescription}</ThemedText>
          </View>

          {/* Photo Evidence */}
          <View style={styles.photoSection}>
            <ThemedText style={styles.photoTitle}>Evidencia Fotográfica</ThemedText>
            <View style={styles.photoGrid}>
              <View style={styles.photoPlaceholder}>
                <Feather name="camera" size={32} color="#ccc" />
              </View>
              <View style={styles.photoPlaceholder}>
                <Feather name="camera" size={32} color="#ccc" />
              </View>
            </View>
          </View>

          {/* Validation Card */}
          <View style={styles.validationCard}>
            <ThemedText style={styles.validationQuestion}>
              ¿Esta alerta sigue siendo válida?
            </ThemedText>
            <ThemedText style={styles.validationSubtext}>
              Tu validación ayuda a mantener la información actualizada para toda la comunidad
            </ThemedText>

            <View style={styles.validationButtons}>
              <TouchableOpacity style={styles.confirmButton}>
                <Feather name="check-circle" size={20} color="#fff" />
                <ThemedText style={styles.confirmButtonText}>Sí, es cierto</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reportButton}>
                <Feather name="alert-triangle" size={20} color="#fff" />
                <ThemedText style={styles.reportButtonText}>Reportar como falsa</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Community Stats */}
            <View style={styles.communityStats}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>23</ThemedText>
                <ThemedText style={styles.statLabel}>Confirmaciones</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, styles.statValueDark]}>2</ThemedText>
                <ThemedText style={styles.statLabel}>Reportes falsos</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>92%</ThemedText>
                <ThemedText style={styles.statLabel}>Confiabilidad</ThemedText>
              </View>
            </View>
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
  placeholderView: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  alertCard: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  alertTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  alertDescription: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    opacity: 0.9,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  detailCard: {
    width: '48%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailContent: {
    flex: 1,
    width: '100%',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  photoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  photoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  photoPlaceholder: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  validationCard: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  validationQuestion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  validationSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  validationButtons: {
    gap: 12,
    marginBottom: 24,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 12,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2196f3',
    marginBottom: 4,
  },
  statValueDark: {
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});

