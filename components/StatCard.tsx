import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={styles.title}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    minWidth: 160,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    paddingTop: 4,
  },
  title: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});
