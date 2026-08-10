import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { AdminOrder } from "@/features/admin/types";
import { StyleSheet, Text, View } from "react-native";

const STATUS_COLORS = {
  Preparing: "#fbbf24",
  Ready: "#34d399",
  Delivering: "#7dd3fc",
} as const;

type OrderQueueItemProps = {
  order: AdminOrder;
};

export function OrderQueueItem({ order }: OrderQueueItemProps) {
  const statusColor = STATUS_COLORS[order.status];

  return (
    <View style={styles.row}>
      <View style={styles.orderMain}>
        <Text style={styles.orderId} selectable>
          {order.id}
        </Text>
        <Text style={styles.customer} numberOfLines={1}>
          {order.customer}
        </Text>
        <Text style={styles.meta}>
          {order.itemCount} items • {order.time}
        </Text>
      </View>

      <View style={styles.orderSide}>
        <Text style={styles.total} selectable>
          {order.total}
        </Text>
        <View style={[styles.statusPill, { borderColor: statusColor }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  orderMain: {
    flex: 1,
    gap: 3,
  },
  orderId: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: "700",
  },
  customer: {
    ...Typography.label,
    color: Colors.textPrimary,
  },
  meta: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  orderSide: {
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  total: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  statusPill: {
    minWidth: 88,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
