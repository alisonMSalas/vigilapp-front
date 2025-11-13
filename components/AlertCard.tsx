import { ThemedText } from "@/components/themed-text";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export interface AlertData {
  id: string;
  type: "emergency" | "warning" | "community" | "info";
  title: string;
  description: string;
  distance: string;
  time: string;
  icon: keyof typeof Feather.glyphMap;
  isNew?: boolean;
  // For detailed meta display (alerts view)
  city?: string;
  status?: string;
  reports?: string;
}

interface AlertCardProps {
  alert: AlertData;
  onPress: (alert: AlertData) => void;
  showDetailedMeta?: boolean;
}

const getAlertTypeColor = (type: AlertData["type"]): string => {
  switch (type) {
    case "emergency":
      return "#f44336"; // Rojo
    case "warning":
      return "#ffc107"; // Amarillo
    case "info":
      return "#2196f3"; // Azul
    case "community":
      return "#4caf50"; // Verde
    default:
      return "#666";
  }
};

export default function AlertCard({
  alert,
  onPress,
  showDetailedMeta = false,
}: AlertCardProps) {
  const alertColor = getAlertTypeColor(alert.type);

  return (
    <TouchableOpacity style={styles.alertCard} onPress={() => onPress(alert)}>
      <View style={styles.alertContent}>
        <View style={styles.alertIconContainer}>
          <Feather name={alert.icon} size={24} color={alertColor} />
        </View>
        <View style={styles.alertTextContent}>
          <View style={styles.alertHeader}>
            <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
            {alert.isNew && (
              <View style={styles.newBadge}>
                <ThemedText style={styles.newBadgeText}>NUEVA</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.alertDescription}>
            {alert.description}
          </ThemedText>
          <View style={styles.alertMeta}>
            <View style={styles.alertMetaItem}>
              <Feather name="map-pin" size={12} color="#666" />
              <ThemedText style={styles.alertMetaText}>
                {alert.distance}
              </ThemedText>
            </View>
            <View style={styles.alertMetaItem}>
              <Feather name="clock" size={12} color="#666" />
              <ThemedText style={styles.alertMetaText}>{alert.time}</ThemedText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  alertCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 1, height:4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertContent: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  alertIconContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  alertIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  alertTextContent: {
    flex: 1,
    gap: 4,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  alertTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  newBadge: {
    backgroundColor: "#005677",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  alertDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  alertMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 4,
  },
  alertMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alertMetaText: {
    fontSize: 12,
    color: "#666",
  },
  activeStatus: {
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4caf50",
  },
  activeText: {
    color: "#4caf50",
    fontWeight: "600",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ccc",
  },
});
