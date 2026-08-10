import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { AdminMetric } from "@/features/admin/types";
import { StyleSheet, Text, View } from "react-native";

const TONE_META = {
  revenue: { icon: "cash-outline", color: "#7dd3fc" },
  orders: { icon: "receipt-outline", color: "#f7c2c0" },
  customers: { icon: "people-outline", color: "#ffcf5a" },
  alert: { icon: "warning-outline", color: "#fb7185" },
} as const;

type AdminMetricCardProps = {
  metric: AdminMetric;
};

export function AdminMetricCard({ metric }: AdminMetricCardProps) {
  const meta = TONE_META[metric.tone];

  return (
    <View style={styles.card}>
      <View style={[styles.iconBubble, { backgroundColor: `${meta.color}22` }]}>
        <PhosphorIcon name={meta.icon} size={18} color={meta.color} />
      </View>
      <Text style={styles.label}>{metric.label}</Text>
      <Text style={styles.value} selectable>
        {metric.value}
      </Text>
      <Text style={[styles.delta, { color: meta.color }]} selectable>
        {metric.delta}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 148,
    minHeight: 142,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  value: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  delta: {
    ...Typography.caption,
    fontWeight: "700",
  },
});
