import BottomNavbar, { BottomTabKey } from '@/components/BottomNavbar';
import TopHeader from '@/components/TopHeader';
import { ThemedText } from '@/components/themed-text';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [active, setActive] = useState<BottomTabKey>('home');

  const handleTabPress = (tab: BottomTabKey) => {
    setActive(tab);
    // TODO: Navegar a otras pantallas principales cuando existan
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TopHeader notificationsCount={3} />
        <View style={styles.content}>
          <ThemedText type="title">Inicio</ThemedText>
          <ThemedText>Bienvenido a VigilApp</ThemedText>
        </View>

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
  content: {
    flex: 1,
    padding: 16,
  },
});


