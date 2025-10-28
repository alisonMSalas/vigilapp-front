import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export type TopHeaderProps = {
  style?: ViewStyle;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  notificationsCount?: number;
  logo?: any; // require('path') or { uri }
};

export default function TopHeader({
  style,
  onPressNotifications,
  onPressProfile,
  notificationsCount = 0,
  logo,
}: TopHeaderProps) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? Colors.dark : Colors.light;

  const showBadge = typeof notificationsCount === 'number' && notificationsCount > 0;

  return (
    <View style={[styles.wrapper, { backgroundColor: palette.background }, style]}>
      <View style={styles.left}>
        {logo ? (
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        ) : (
          <Text style={[styles.brand, { color: '#005677' }]}>VigilApp</Text>
        )}
      </View>

      <View style={styles.right}>
        <TouchableOpacity accessibilityRole="button" onPress={onPressNotifications} style={styles.iconButton}>
          <Feather name="bell" size={22} color={palette.icon} />
          {showBadge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.min(notificationsCount, 99)}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity accessibilityRole="button" onPress={onPressProfile} style={styles.iconButton}>
          <Feather name="user" size={22} color={palette.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  iconButton: {
    padding: 8,
  },
  badge: {
    position: 'absolute',
    right: 4,
    top: 2,
    backgroundColor: '#e53935',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});


