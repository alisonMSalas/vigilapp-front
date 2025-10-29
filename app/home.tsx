import BottomNavbar, { BottomTabKey } from '@/components/BottomNavbar';
import TopHeader from '@/components/TopHeader';
import { ThemedText } from '@/components/themed-text';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AlertData {
  id: string;
  type: 'warning' | 'community' | 'info';
  title: string;
  description: string;
  distance: string;
  time: string;
  isNew?: boolean;
  icon: keyof typeof Feather.glyphMap;
}

const mockAlerts: AlertData[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Precaución - Vía Obstruida',
    description: 'Árbol caído bloqueando la Av. Principal altura del semáforo',
    distance: '0.8 km',
    time: 'hace 15 min',
    isNew: true,
    icon: 'alert-triangle',
  },
  {
    id: '2',
    type: 'community',
    title: 'Comunitaria - Evento Vecinal',
    description: 'Reunión de vecinos para planificar mejoras en el parque',
    distance: '1.2 km',
    time: 'hace 2 horas',
    icon: 'users',
  },
  {
    id: '3',
    type: 'info',
    title: 'Informativa - Corte de Agua',
    description: 'Mantenimiento programado en la red de agua potable',
    distance: '1.5 km',
    time: 'hace 4 horas',
    icon: 'info',
  },
];

const securityTips = [
  {
    icon: 'phone',
    title: 'Números de Emergencia',
    description: 'Mantén siempre a mano los números 911, 101 (Policía) y 102 (Bomberos)',
  },
  {
    icon: 'map-pin',
    title: 'Comparte tu Ubicación',
    description: 'Activa la ubicación en tiempo real para recibir alertas más precisas',
  },
];

export default function HomeScreen() {
  const [active, setActive] = useState<BottomTabKey>('home');
  const userName = 'María'; // TODO: Obtener del usuario autenticado
  const router = useRouter();

  const handleTabPress = (tab: BottomTabKey) => {
    setActive(tab);
    if (tab === 'alerts') {
      router.push('/alerts');
    } else if (tab === 'create') {
      router.push('/create-alert');
    }
  };

  const handleReportIncident = () => {
    router.push('/create-alert');
  };

  const handleViewMap = () => {
    // TODO: Implementar navegación a mapa
    console.log('Ver mapa');
  };

  const handleConfigure = () => {
    router.push('/location');
  };

  const handleAlertPress = (alert: AlertData) => {
    router.push({
      pathname: '/alert-detail',
      params: {
        id: alert.id,
        type: alert.type,
      },
    });
  };

  const handleProfilePress = () => {
    // El menú se maneja dentro del componente TopHeader
  };

  const handleLogout = () => {
    router.replace('/login');
  };

  const getAlertIconColor = (type: AlertData['type']) => {
    switch (type) {
      case 'warning':
        return '#ffc107';
      case 'community':
        return '#4caf50';
      case 'info':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TopHeader notificationsCount={3} onLogout={handleLogout} />
        
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Blue Header Section */}
          <View style={styles.blueSection}>
            <ThemedText style={styles.greeting}>¡Hola, {userName}!</ThemedText>
            <ThemedText style={styles.subtitle}>
              Mantente informada sobre la seguridad en tu zona
            </ThemedText>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={styles.reportButton} 
                onPress={handleReportIncident}
                activeOpacity={0.9}
              >
                <ThemedText style={styles.reportButtonText}>Reportar Incidencia</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mapButton} 
                onPress={handleViewMap}
                activeOpacity={0.9}
              >
                <ThemedText style={styles.mapButtonText}>Ver Mapa</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* White Content Section */}
          <View style={styles.whiteSection}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <Feather name="map-pin" size={18} color="#333" />
                <ThemedText style={styles.sectionTitleText}>Estado de Mi Zona</ThemedText>
              </View>
              <TouchableOpacity style={styles.configButton} onPress={handleConfigure}>
                <ThemedText style={styles.configButtonText}>Configurar</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>2 km</ThemedText>
                <ThemedText style={styles.statLabel}>Radio</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>3</ThemedText>
                <ThemedText style={styles.statLabel}>Alertas Activas</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>47</ThemedText>
                <ThemedText style={styles.statLabel}>Vecinos Activos</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>98%</ThemedText>
                <ThemedText style={styles.statLabel}>Confiabilidad</ThemedText>
              </View>
            </View>

            {/* Security Status Bar */}
            <View style={styles.securityBar}>
              <Feather name="check-circle" size={20} color="#4caf50" />
              <ThemedText style={styles.securityText}>Tu zona está segura</ThemedText>
            </View>
          </View>

          {/* Recent Alerts Section */}
          <View style={styles.alertsSection}>
            <View style={styles.alertsHeader}>
              <View style={styles.alertsTitle}>
                <Feather name="alert-triangle" size={20} color="#fff" />
                <ThemedText style={styles.alertsTitleText}>Alertas Recientes</ThemedText>
              </View>
              <TouchableOpacity>
                <ThemedText style={styles.seeAllText}>Ver todas</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.alertsList}>
              {mockAlerts.map((alert) => (
                <TouchableOpacity key={alert.id} style={styles.alertCard} onPress={() => handleAlertPress(alert)}>
                  <View style={styles.alertIconContainer}>
                    <View style={[styles.alertIcon, { backgroundColor: getAlertIconColor(alert.type) }]}>
                      <Feather name={alert.icon} size={20} color="#000" />
                    </View>
                  </View>
                  <View style={styles.alertContent}>
                    <View style={styles.alertHeader}>
                      <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
                      {alert.isNew && (
                        <View style={styles.newBadge}>
                          <ThemedText style={styles.newBadgeText}>NUEVA</ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText style={styles.alertDescription}>{alert.description}</ThemedText>
                    <View style={styles.alertMeta}>
                      <View style={styles.alertMetaItem}>
                        <Feather name="map-pin" size={12} color="#666" />
                        <ThemedText style={styles.alertMetaText}>{alert.distance}</ThemedText>
                      </View>
                      <View style={styles.alertMetaItem}>
                        <Feather name="clock" size={12} color="#666" />
                        <ThemedText style={styles.alertMetaText}>{alert.time}</ThemedText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Security Tips Section */}
          <View style={styles.tipsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitle}>
                <Feather name="shield" size={18} color="#005677" />
                <ThemedText style={styles.sectionTitleText}>Consejos de Seguridad</ThemedText>
              </View>
            </View>

            {securityTips.map((tip, index) => (
              <TouchableOpacity key={index} style={styles.tipCard}>
                <View style={styles.tipIcon}>
                  <Feather name={tip.icon as keyof typeof Feather.glyphMap} size={20} color="#fff" />
                </View>
                <View style={styles.tipContent}>
                  <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
                  <ThemedText style={styles.tipDescription}>{tip.description}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <BottomNavbar active={active} onTabPress={handleTabPress} />
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
  scroll: {
    flex: 1,
  },
  blueSection: {
    backgroundColor: '#005677',
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 24,
  },
  buttonGroup: {
    gap: 12,
  },
  reportButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#005677',
  },
  mapButton: {
    backgroundColor: '#006fa3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  whiteSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  configButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  configButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  securityBar: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4caf50',
  },
  alertsSection: {
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingBottom: 24,
  },
  alertsHeader: {
    backgroundColor: '#005677',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  alertsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertsTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  alertsList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIconContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  alertTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  newBadge: {
    backgroundColor: '#005677',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  alertMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  alertMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertMetaText: {
    fontSize: 12,
    color: '#666',
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#005677',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});


