import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { InventoryItem } from "@/features/admin/types";
import { StyleSheet, Text, View } from "react-native";

const LEVEL_META = {
  low: { label: "Restock", color: "#fb7185", fill: 0.22 },
  medium: { label: "Watch", color: "#fbbf24", fill: 0.54 },
  healthy: { label: "Healthy", color: "#34d399", fill: 0.82 },
} as const;

type InventoryStatusCardProps = {
  item: InventoryItem;
};

export function InventoryStatusCard({ item }: InventoryStatusCardProps) {
  const meta = LEVEL_META[item.level];

  return (
    <View style={styles.item}>
      <View style={styles.itemHeader}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.level, { color: meta.color }]}>{meta.label}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${meta.fill * 100}%`, backgroundColor: meta.color },
          ]}
        />
      </View>

      <Text style={styles.remaining} selectable>
        {item.remaining} {item.unit} left
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  name: {
    flex: 1,
    ...Typography.label,
    color: Colors.textPrimary,
  },
  level: {
    ...Typography.caption,
    fontWeight: "700",
  },
  progressTrack: {
    height: 7,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Radius.full,
  },
  remaining: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
