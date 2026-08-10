import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { type DemoCoord } from "@/services/paymentConfigService";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  origin: DemoCoord;
  destination: DemoCoord;
  height?: number;
};

export default function TrackingMap({ height = 300 }: Props) {
  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.gridHorizontalTop} />
      <View style={styles.gridHorizontalBottom} />
      <View style={styles.gridVerticalLeft} />
      <View style={styles.gridVerticalRight} />

      <View style={styles.routeLine} />

      <View style={[styles.marker, styles.restaurantMarker]}>
        <PhosphorIcon name="restaurant" size={16} color={Colors.textPrimary} />
      </View>
      <View style={[styles.marker, styles.driverMarker]}>
        <PhosphorIcon name="bicycle" size={16} color={Colors.textPrimary} />
      </View>
      <View style={[styles.marker, styles.destinationMarker]}>
        <PhosphorIcon name="home" size={16} color={Colors.textPrimary} />
      </View>

      <View style={styles.messageCard}>
        <PhosphorIcon name="map-outline" size={18} color={Colors.accent} />
        <Text style={styles.messageText}>Live map preview is available in the iOS and Android app.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#1a1a1e",
  },
  gridHorizontalTop: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#29292f",
  },
  gridHorizontalBottom: {
    position: "absolute",
    top: "65%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#29292f",
  },
  gridVerticalLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "30%",
    width: 1,
    backgroundColor: "#29292f",
  },
  gridVerticalRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "70%",
    width: 1,
    backgroundColor: "#29292f",
  },
  routeLine: {
    position: "absolute",
    top: "43%",
    left: "20%",
    width: "60%",
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: "#1E88E5",
    transform: [{ rotate: "-16deg" }],
  },
  marker: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.textPrimary,
  },
  restaurantMarker: {
    left: "15%",
    top: "49%",
    backgroundColor: "#E53935",
  },
  driverMarker: {
    left: "48%",
    top: "37%",
    backgroundColor: "#1E88E5",
  },
  destinationMarker: {
    right: "15%",
    top: "25%",
    backgroundColor: "#2E7D32",
  },
  messageCard: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.xl,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: "rgba(32, 32, 38, 0.94)",
  },
  messageText: {
    flexShrink: 1,
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
});
