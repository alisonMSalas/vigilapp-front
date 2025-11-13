import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TopHeaderProps = {
  style?: ViewStyle;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  onLogout?: () => void;
  notificationsCount?: number;
  logo?: any; // require('path') or { uri }
};

export default function TopHeader({
  style,
  onPressNotifications,
  onPressProfile,
  onLogout,
  notificationsCount = 0,
  logo,
}: TopHeaderProps) {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? Colors.dark : Colors.light;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const insets = useSafeAreaInsets();

  const showBadge = typeof notificationsCount === 'number' && notificationsCount > 0;

  const handleProfilePress = () => {
    setShowProfileMenu(!showProfileMenu);
    if (onPressProfile) {
      onPressProfile();
    }
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {showProfileMenu && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowProfileMenu(false)}
          activeOpacity={1}
        />
      )}
      <View style={[styles.wrapper, { backgroundColor: palette.background, paddingTop: insets.top }, style]}>
        <View style={styles.left}>
          {logo ? (
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          ) : (
            <Text style={[styles.brand, { color: '#047eaeff' }]}>VigilApp</Text>
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

          <View style={styles.profileContainer}>
            <TouchableOpacity accessibilityRole="button" onPress={handleProfilePress} style={styles.iconButton}>
              <Feather name="user" size={22} color={palette.icon} />
            </TouchableOpacity>

            {showProfileMenu && (
              <View style={styles.menu}>
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <Feather name="log-out" size={18} color="#f44336" />
                  <Text style={styles.menuText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  profileContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  menu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 160,
    zIndex: 1001,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
});


