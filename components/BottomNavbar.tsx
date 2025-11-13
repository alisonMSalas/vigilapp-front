import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export type BottomTabKey = "home" | "map" | "create" | "alerts";

export type BottomNavbarProps = {
  active: BottomTabKey;
  onTabPress: (tab: BottomTabKey) => void;
  style?: ViewStyle;
};

const TAB_ITEMS: {
  key: BottomTabKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}[] = [
  { key: "home", label: "Inicio", icon: "home" },
  { key: "map", label: "Mapa", icon: "map" },
  { key: "create", label: "Crear", icon: "plus" },
  { key: "alerts", label: "Alertas", icon: "alert-triangle" },
];

export default function BottomNavbar({
  active,
  onTabPress,
  style,
}: BottomNavbarProps) {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? Colors.dark : Colors.light;

  return (
    <View
      style={[styles.container, { backgroundColor: palette.background }, style]}
    >
      <View
        style={[
          styles.bar,
          {
            borderColor: palette.icon + "22",
            backgroundColor: palette.background,
          },
        ]}
      >
        {TAB_ITEMS.map((item) => {
          const isActive = active === item.key;
          const pillBackground = isActive
            ? palette.tabIconSelected + "20"
            : "#00000000";
          const pillBorder = isActive
            ? palette.tabIconSelected + "55"
            : "#00000000";

          return (
            <TouchableOpacity
              key={item.key}
              style={styles.tab}
              activeOpacity={0.8}
              onPress={() => onTabPress(item.key)}
            >
              <View
                style={[
                  styles.iconPill,
                  { backgroundColor: pillBackground, borderColor: pillBorder },
                ]}
              >
                <Feather
                  name={item.icon}
                  size={22}
                  color={isActive ? palette.tabIconSelected : palette.icon}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  { color: isActive ? palette.tabIconSelected : palette.icon },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 4,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 2,
  },
  iconPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 11,
  },
});
