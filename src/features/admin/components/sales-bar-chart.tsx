import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { SalesPoint } from "@/features/admin/types";
import type { DimensionValue } from "react-native";
import { StyleSheet, Text, View } from "react-native";

type SalesBarChartProps = {
  data: SalesPoint[];
};

export function SalesBarChart({ data }: SalesBarChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value));

  return (
    <View style={styles.chart}>
      {data.map((point) => {
        const height = `${Math.max(20, (point.value / maxValue) * 100)}%` as DimensionValue;

        return (
          <View key={point.label + point.value} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height }]} />
            </View>
            <Text style={styles.barLabel}>{point.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    height: 170,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    paddingTop: Spacing.md,
  },
  barColumn: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  barTrack: {
    width: "100%",
    maxWidth: 28,
    flex: 1,
    justifyContent: "flex-end",
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: Radius.full,
    backgroundColor: Colors.danger,
  },
  barLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
