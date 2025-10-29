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
  type: 'emergency' | 'warning' | 'community' | 'info';
  title: string;
  description: string;
  distance: string;
  time: string;
  city: string;
  status: string;
  reports: string;
  isNew?: boolean;
  icon: keyof typeof Feather.glyphMap;
}

const getAlertTypeColor = (type: AlertData['type']) => {
  switch (type) {
    case 'emergency':
      return '#f44336'; // Rojo
    case 'warning':
      return '#ffc107'; // Amarillo
    case 'info':
      return '#2196f3'; // Azul
    case 'community':
      return '#4caf50'; // Verde
    default:
      return '#666';
  }
};

const mockAlerts: AlertData[] = [
  {
    id: '1',
    type: 'emergency',
    title: 'Accidente de Tránsito Mayor',
    description: 'Colisión múltiple en la Av. 10 de Agosto y 6 de Diciembre. Tráfico completamente bloqueado en ambos sentidos.',
    distance: '0.3 km',
    time: 'hace 5 min',
    city: 'Quito',
    status: 'Activa',
    reports: '47 reportes',
    isNew: true,
    icon: 'alert-triangle',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Inundación en Vía Principal',
    description: 'Agua acumulada en la Av. Francisco de Orellana por ruptura de tubería principal.',
    distance: '1.2 km',
    time: 'hace 20 min',
    city: 'Quito',
    status: 'Activa',
    reports: '23 reportes',
    isNew: true,
    icon: 'alert-triangle',
  },
  {
    id: '3',
    type: 'community',
    title: 'Evento Comunitario - Feria',
    description: 'Feria artesanal este fin de semana en el Parque El Ejido.',
    distance: '2.1 km',
    time: 'hace 2 horas',
    city: 'Quito',
    status: 'Activa',
    reports: '5 reportes',
    icon: 'users',
  },
  {
    id: '4',
    type: 'info',
    title: 'Corte de Energía Programado',
    description: 'Mantenimiento eléctrico en sector norte de la ciudad.',
    distance: '3.5 km',
    time: 'hace 4 horas',
    city: 'Quito',
    status: 'Activa',
    reports: '12 reportes',
    icon: 'info',
  },
  {
    id: '5',
    type: 'warning',
    title: 'Manifestación Estudiantil',
    description: 'Marcha pacífica desde el Parque Cevallos hacia la Gobernación.',
    distance: '0.8 km',
    time: 'hace 1 día',
    city: 'Ambato',
    status: 'Resuelta',
    reports: '8 reportes',
    icon: 'alert-triangle',
  },
  {
    id: '6',
    type: 'emergency',
    title: 'Incendio Estructural',
    description: 'Edificio comercial en llamas en el sector centro de la ciudad.',
    distance: '2.8 km',
    time: 'hace 3 horas',
    city: 'Quito',
    status: 'Activa',
    reports: '56 reportes',
    icon: 'alert-triangle',
  },
];

export default function AlertsScreen() {
  const [active, setActive] = useState<BottomTabKey>('alerts');
  const [selectedType, setSelectedType] = useState('Todos los tipos');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const router = useRouter();

  const alertTypes = [
    { label: 'Todos los tipos', value: 'all', color: null },
    { label: 'Emergencia', value: 'emergency', color: '#f44336' },
    { label: 'Precaución', value: 'warning', color: '#ffc107' },
    { label: 'Informativa', value: 'info', color: '#2196f3' },
    { label: 'Comunitaria', value: 'community', color: '#4caf50' },
  ];

  const handleTabPress = (tab: BottomTabKey) => {
    if (tab === 'home') {
      router.push('/home');
    } else if (tab === 'map') {
      // TODO: Navegar a mapa
    } else if (tab === 'create') {
      router.push('/create-alert');
    }
    // Si es 'alerts', no hacer nada porque ya estamos aquí
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

  const handleLogout = () => {
    router.replace('/login');
  };

  const stats = {
    total: 10,
    active: 6,
    verified: 2,
    resolved: 1,
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TopHeader notificationsCount={3} onLogout={handleLogout} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Filters Section */}
          <View style={styles.filtersSection}>
            <View style={styles.filterHeader}>
              <Feather name="filter" size={20} color="#005677" />
              <ThemedText style={styles.filtersTitle}>Filtros</ThemedText>
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowTypeFilter(!showTypeFilter)}
            >
              <ThemedText style={styles.filterLabel}>Tipo de Alerta</ThemedText>
              <View style={styles.filterValue}>
                <ThemedText style={styles.filterValueText}>{selectedType}</ThemedText>
                <Feather
                  name={showTypeFilter ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#666"
                />
              </View>
            </TouchableOpacity>

            {/* Type Filter Dropdown */}
            {showTypeFilter && (
              <View style={styles.filterDropdown}>
                {alertTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={styles.filterOption}
                    onPress={() => {
                      setSelectedType(type.label);
                      setShowTypeFilter(false);
                    }}
                  >
                    {type.color && <View style={[styles.typeIndicator, { backgroundColor: type.color }]} />}
                    <ThemedText style={styles.filterOptionText}>{type.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Stats Summary Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{stats.total}</ThemedText>
              <ThemedText style={styles.statLabel}>Total Alertas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{stats.active}</ThemedText>
              <ThemedText style={styles.statLabel}>Activas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{stats.verified}</ThemedText>
              <ThemedText style={styles.statLabel}>Verificadas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>{stats.resolved}</ThemedText>
              <ThemedText style={styles.statLabel}>Resueltas</ThemedText>
            </View>
          </View>

          {/* Alerts List Header */}
          <View style={styles.listHeader}>
            <ThemedText style={styles.listTitle}>Alertas Recientes</ThemedText>
            <ThemedText style={styles.listSubtitle}>
              Mostrando {mockAlerts.length} de {stats.total} resultados
            </ThemedText>
          </View>

          {/* Alerts List */}
          <View style={styles.alertsList}>
            {mockAlerts.map((alert) => {
              const alertColor = getAlertTypeColor(alert.type);
              return (
              <TouchableOpacity
                key={alert.id}
                style={[styles.alertCard, { borderLeftColor: alertColor }]}
                onPress={() => handleAlertPress(alert)}
              >
                <View style={[styles.alertLeftBorder, { backgroundColor: alertColor }]} />
                <View style={styles.alertContent}>
                  <Feather name={alert.icon} size={20} color={alertColor} style={styles.alertIcon} />
                  <View style={styles.alertTextContent}>
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
                      <View style={styles.alertMetaItem}>
                        <Feather name="file-text" size={12} color="#666" />
                        <ThemedText style={styles.alertMetaText}>{alert.reports}</ThemedText>
                      </View>
                      <View style={styles.alertMetaItem}>
                        <Feather name="map-pin" size={12} color="#666" />
                        <ThemedText style={styles.alertMetaText}>{alert.city}</ThemedText>
                      </View>
                      <View style={[styles.alertMetaItem, alert.status === 'Activa' && styles.activeStatus]}>
                        <View style={[styles.statusDot, alert.status === 'Activa' && styles.activeDot]} />
                        <ThemedText style={[styles.alertMetaText, alert.status === 'Activa' && styles.activeText]}>
                          {alert.status}
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
            })}
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
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scroll: {
    flex: 1,
  },
  filtersSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#005677',
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  filterValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterValueText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  filterDropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    flexWrap: 'wrap',
  },
  statItem: {
    width: '45%',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2196f3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  listSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  alertsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  alertLeftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  alertContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  alertIcon: {
    marginTop: 4,
  },
  alertTextContent: {
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
    backgroundColor: '#f44336',
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
    marginBottom: 8,
  },
  alertMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
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
  activeStatus: {
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4caf50',
  },
  activeText: {
    color: '#4caf50',
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
});

