import { Colors, Radius, Spacing } from "@/constants/theme";
import { AdminMenuComparison } from "@/features/admin/types";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

type AdminMenuComparisonCardProps = {
  data: AdminMenuComparison[];
};

export function AdminMenuComparisonCard({ data }: AdminMenuComparisonCardProps) {
  const [showValues, setShowValues] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Comparison</Text>
        <View style={styles.controls}>
          <View style={styles.segmented}>
            <Pressable style={[styles.segmentActive, showValues && styles.segmentInactiveSelected]} onPress={() => setShowValues(false)} accessibilityRole="button" accessibilityState={{ selected: !showValues }}>
              <Text style={styles.segmentActiveText}>Chart</Text>
            </Pressable>
            <Pressable style={[styles.segment, showValues && styles.segmentSelected]} onPress={() => setShowValues(true)} accessibilityRole="button" accessibilityState={{ selected: showValues }}>
              <View style={styles.valueDot} />
              <Text style={styles.segmentText}>Show Value</Text>
            </Pressable>
          </View>
          <Pressable style={({ pressed }) => [styles.infoButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Menu comparison information" onPress={() => setShowInfo((value) => !value)}>
            <Text style={styles.infoText}>i</Text>
          </Pressable>
        </View>
      </View>
      {showInfo ? <Text style={styles.infoCopy}>Values are calculated from the current food availability and menu flags.</Text> : null}

      {showValues ? <View style={styles.valueList}>{data.map((item) => <Text key={item.id} style={styles.valueText}>{item.label}: {item.percent}%</Text>)}</View> : <View style={styles.charts}>
        {data.map((item) => (
          <View key={item.id} style={styles.chartItem}>
            <View style={styles.donut}>
              <View style={[styles.donutRing, { borderColor: item.color, transform: [{ rotate: `${Math.max(18, item.percent * 3.6)}deg` }] }]} />
              <View style={styles.donutHole}>
                <Text style={styles.percent}>{item.percent}%</Text>
              </View>
            </View>
            <Text style={styles.chartLabel}>{item.label}</Text>
          </View>
        ))}
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 22,
    gap: 21,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    boxShadow: "0 1px 1px rgba(0, 0, 0, 0.04)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 12.25,
    lineHeight: 18,
    fontWeight: "800",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  segmented: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 2,
    borderRadius: 7,
    backgroundColor: "#2a2a2a",
  },
  segmentActive: {
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 9,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  segment: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
  },
  segmentSelected: {
    backgroundColor: "#1e1e1e",
    borderRadius: 7,
  },
  segmentInactiveSelected: {
    backgroundColor: "#2a2a2a",
  },
  valueList: {
    gap: 12,
  },
  valueText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  segmentActiveText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  segmentText: {
    color: "#b0b0b0",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  valueDot: {
    width: 7,
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.danger,
  },
  infoButton: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  infoText: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
  },
  infoCopy: {
    color: "#b0b0b0",
    fontSize: 11,
    lineHeight: 16,
  },
  charts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartItem: {
    width: 100,
    alignItems: "center",
    gap: 10,
  },
  donut: {
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: "#262626",
  },
  donutRing: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: Radius.full,
    borderWidth: 13,
    borderLeftColor: "#262626",
    borderBottomColor: "#262626",
  },
  donutHole: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: "#1e1e1e",
  },
  percent: {
    color: Colors.textPrimary,
    fontSize: 17.5,
    lineHeight: 25,
    fontWeight: "800",
  },
  chartLabel: {
    color: Colors.textPrimary,
    fontSize: 12.25,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.76,
  },
});
