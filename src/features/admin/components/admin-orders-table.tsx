import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { AdminOrderListItem, AdminOrderStatus } from "@/features/admin/types";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const STATUS_META: Record<AdminOrderStatus, { color: string; backgroundColor: string; borderColor: string }> = {
  "New Order": {
    color: "#05df72",
    backgroundColor: "rgba(0,201,80,0.15)",
    borderColor: "rgba(0,201,80,0.2)",
  },
  Delivered: {
    color: "#b0b0b0",
    backgroundColor: "#2a2a2a",
    borderColor: "#2a2a2a",
  },
  "On Delivery": {
    color: "#51a2ff",
    backgroundColor: "rgba(43,127,255,0.15)",
    borderColor: "rgba(43,127,255,0.2)",
  },
};

const COLUMNS = [
  { key: "id", label: "Order ID", width: 86 },
  { key: "date", label: "Date", width: 158 },
  { key: "customer", label: "Customer Name", width: 126 },
  { key: "location", label: "Location", width: 160 },
  { key: "amount", label: "Amount", width: 84 },
  { key: "status", label: "Status Order", width: 108 },
] as const;

type AdminOrdersTableProps = {
  orders: AdminOrderListItem[];
  visibleCount: number;
  totalCount: number;
  onOpenOrder?: (orderId: string) => void;
};

export function AdminOrdersTable({ orders, visibleCount, totalCount, onOpenOrder }: AdminOrdersTableProps) {
  return (
    <View style={styles.card}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces>
        <View style={styles.table}>
          <View style={styles.headerRow}>
            {COLUMNS.map((column) => (
              <View key={column.key} style={[styles.headerCell, { width: column.width }]}>
                <Text style={styles.headerText}>{column.label}</Text>
                <PhosphorIcon name="swap-vertical" size={10} color={Colors.textMuted} />
              </View>
            ))}
            <View style={styles.actionColumn} />
          </View>

          {orders.map((order, index) => (
            <View key={order.id} style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
              <Text style={[styles.cellText, styles.orderId, { width: COLUMNS[0].width }]} selectable>
                {order.id}
              </Text>
              <Text style={[styles.cellText, styles.muted, { width: COLUMNS[1].width }]} selectable>
                {order.date}
              </Text>
              <Text style={[styles.cellText, styles.customer, { width: COLUMNS[2].width }]} numberOfLines={1}>
                {order.customer}
              </Text>
              <Text style={[styles.cellText, styles.muted, { width: COLUMNS[3].width }]} numberOfLines={1}>
                {order.location}
              </Text>
              <Text style={[styles.cellText, styles.amount, { width: COLUMNS[4].width }]} selectable>
                {order.amount}
              </Text>
              <View style={[styles.statusCell, { width: COLUMNS[5].width }]}>
                <StatusBadge status={order.status} />
              </View>
              <Pressable
                style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`Open detail for order ${order.id}`}
                onPress={() => onOpenOrder?.(order.id)}
              >
                <PhosphorIcon name="ellipsis-horizontal" size={15} color={Colors.textMuted} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText} selectable>
          Showing {visibleCount} from {totalCount} data
        </Text>
        <View style={styles.pagination}>
          <PaginationButton icon="chevron-back" disabled />
          <PaginationButton label="1" active />
          <PaginationButton label="2" />
          <PaginationButton icon="chevron-forward" />
        </View>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: AdminOrderStatus }) {
  const meta = STATUS_META[status];

  return (
    <View style={[styles.badge, { backgroundColor: meta.backgroundColor, borderColor: meta.borderColor }]}>
      <Text style={[styles.badgeText, { color: meta.color }]} numberOfLines={1}>
        {status}
      </Text>
    </View>
  );
}

function PaginationButton({
  active,
  disabled,
  icon,
  label,
}: {
  active?: boolean;
  disabled?: boolean;
  icon?: "chevron-back" | "chevron-forward";
  label?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pageButton,
        active && styles.pageButtonActive,
        disabled && styles.pageButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label ? `Go to page ${label}` : icon === "chevron-back" ? "Previous page" : "Next page"}
    >
      {icon ? (
        <PhosphorIcon name={icon} size={14} color={disabled ? Colors.textDisabled : Colors.textMuted} />
      ) : (
        <Text style={[styles.pageLabel, active && styles.pageLabelActive]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
  },
  table: {
    width: 771,
  },
  headerRow: {
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(42,42,42,0.4)",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    paddingLeft: 14,
  },
  headerCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  headerText: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
  },
  actionColumn: {
    width: 35,
  },
  row: {
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
    paddingLeft: 14,
  },
  rowAlt: {
    backgroundColor: "rgba(42,42,42,0.1)",
  },
  cellText: {
    fontSize: 10.5,
    lineHeight: 14,
  },
  orderId: {
    color: Colors.danger,
    fontWeight: "700",
  },
  muted: {
    color: "#b0b0b0",
    fontWeight: "400",
  },
  customer: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  amount: {
    color: Colors.textPrimary,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  statusCell: {
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    minWidth: 74,
    maxWidth: 96,
    height: 21,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },
  moreButton: {
    width: 35,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  footerText: {
    flex: 1,
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pageButton: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  pageButtonActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageLabel: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  pageLabelActive: {
    color: Colors.textPrimary,
  },
  pressed: {
    opacity: 0.76,
  },
});
