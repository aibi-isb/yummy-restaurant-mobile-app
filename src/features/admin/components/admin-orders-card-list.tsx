import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { AdminOrderCardStatus, AdminOrderListItem } from "@/features/admin/types";
import { formatAdditionalItemLabel } from "@/utils/order-presentation";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const STATUS_META: Record<AdminOrderCardStatus, { color: string; backgroundColor: string; borderColor: string }> = {
  Pending: {
    color: Colors.orange,
    backgroundColor: "rgba(255,152,0,0.12)",
    borderColor: "rgba(255,152,0,0.24)",
  },
  Preparing: {
    color: "#7dd3fc",
    backgroundColor: "rgba(125,211,252,0.12)",
    borderColor: "rgba(125,211,252,0.24)",
  },
  Delivered: {
    color: "#86efac",
    backgroundColor: "rgba(134,239,172,0.12)",
    borderColor: "rgba(134,239,172,0.24)",
  },
  "Payment Received": {
    color: Colors.accent,
    backgroundColor: "rgba(247,194,192,0.12)",
    borderColor: "rgba(247,194,192,0.24)",
  },
};

type AdminOrdersCardListProps = {
  orders: AdminOrderListItem[];
  onOpenOrder?: (orderId: string) => void;
  onUpdateOrder?: (orderId: string) => void;
};

export function AdminOrdersTopBar({ filtersOpen, onQueryChange, onToggleFilters, query }: {
  filtersOpen: boolean;
  onQueryChange: (query: string) => void;
  onToggleFilters: () => void;
  query: string;
}) {
  return (
    <View style={styles.topBar}>
      <View style={styles.searchBox}>
        <PhosphorIcon name="search" size={17} color={Colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          style={styles.searchInput}
          placeholder="Search orders"
          placeholderTextColor={Colors.textDisabled}
          accessibilityLabel="Search orders"
          returnKeyType="search"
        />
        {query ? (
          <Pressable
            hitSlop={8}
            onPress={() => onQueryChange("")}
            accessibilityRole="button"
            accessibilityLabel="Clear order search"
          >
            <PhosphorIcon name="close-circle" size={16} color={Colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        style={({ pressed }) => [styles.circleAction, filtersOpen && styles.circleActionActive, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ selected: filtersOpen }}
        accessibilityLabel={filtersOpen ? "Hide order filters" : "Show order filters"}
        onPress={onToggleFilters}
      >
        <PhosphorIcon name="filter-outline" size={20} color={filtersOpen ? Colors.textPrimary : Colors.textMuted} />
      </Pressable>
    </View>
  );
}

export function AdminOrdersHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Orders</Text>
      <Text style={styles.subtitle}>Track fulfillment and keep every customer order moving.</Text>
    </View>
  );
}

export function AdminOrdersOverview({ orders }: { orders: AdminOrderListItem[] }) {
  const awaiting = orders.filter((order) => order.cardStatus === "Pending" || order.cardStatus === "Preparing").length;
  const completed = orders.filter((order) => order.cardStatus === "Delivered" || order.cardStatus === "Payment Received").length;
  const metrics = [
    { icon: "receipt-outline", label: "Total orders", value: orders.length },
    { icon: "time-outline", label: "Awaiting", value: awaiting },
    { icon: "checkmark-circle-outline", label: "Completed", value: completed },
  ];

  return (
    <View style={styles.overviewRow}>
      {metrics.map((metric) => (
        <View key={metric.label} style={styles.overviewCard}>
          <View style={styles.overviewIcon}>
            <PhosphorIcon name={metric.icon} size={16} color={Colors.accent} />
          </View>
          <Text style={styles.overviewValue} selectable>{metric.value}</Text>
          <Text style={styles.overviewLabel}>{metric.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function AdminOrderStatusFilters({ activeStatus, onChange, orders }: { activeStatus: "All Orders" | AdminOrderCardStatus; onChange: (status: "All Orders" | AdminOrderCardStatus) => void; orders: AdminOrderListItem[] }) {
  const counts = {
    Pending: orders.filter((order) => order.cardStatus === "Pending").length,
    Preparing: orders.filter((order) => order.cardStatus === "Preparing").length,
    Delivered: orders.filter((order) => order.cardStatus === "Delivered").length,
    "Payment Received": orders.filter((order) => order.cardStatus === "Payment Received").length,
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} nestedScrollEnabled>
      <StatusFilter label="All Orders" countLabel={`${orders.length}`} active={activeStatus === "All Orders"} onPress={() => onChange("All Orders")} />
      <StatusFilter label="Pending" countLabel={`${counts.Pending}`} tone="Pending" active={activeStatus === "Pending"} onPress={() => onChange("Pending")} />
      <StatusFilter label="Preparing" countLabel={`${counts.Preparing}`} tone="Preparing" active={activeStatus === "Preparing"} onPress={() => onChange("Preparing")} />
      <StatusFilter label="Delivered" countLabel={`${counts.Delivered}`} tone="Delivered" active={activeStatus === "Delivered"} onPress={() => onChange("Delivered")} />
      <StatusFilter label="Payment received" countLabel={`${counts["Payment Received"]}`} tone="Payment Received" active={activeStatus === "Payment Received"} onPress={() => onChange("Payment Received")} />
    </ScrollView>
  );
}

function StatusFilter({ active, countLabel, label, onPress, tone }: {
  active?: boolean;
  countLabel: string;
  label: string;
  onPress: () => void;
  tone?: AdminOrderCardStatus;
}) {
  const meta = tone ? STATUS_META[tone] : undefined;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.filterChip,
        active && styles.filterChipActive,
        meta && !active && { backgroundColor: meta.backgroundColor, borderColor: meta.borderColor },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`Filter ${label}`}
      onPress={onPress}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive, meta && !active && { color: meta.color }]}>{label}</Text>
      <View style={[styles.filterCount, active ? styles.filterCountActive : meta && { backgroundColor: "rgba(255,255,255,0.1)" }]}>
        <Text style={[styles.filterCountText, active && styles.filterCountTextActive, meta && !active && { color: meta.color }]}>{countLabel}</Text>
      </View>
    </Pressable>
  );
}

export function AdminOrdersCardList({ onOpenOrder, onUpdateOrder, orders }: AdminOrdersCardListProps) {
  return (
    <View style={styles.ordersList}>
      {orders.map((order, index) => (
        <AdminOrderCard key={order.id} highlighted={index === 0} order={order} onOpenOrder={onOpenOrder} onUpdateOrder={onUpdateOrder} />
      ))}
    </View>
  );
}

function AdminOrderCard({ highlighted, onOpenOrder, onUpdateOrder, order }: {
  highlighted?: boolean;
  onOpenOrder?: (orderId: string) => void;
  onUpdateOrder?: (orderId: string) => void;
  order: AdminOrderListItem;
}) {
  return (
    <View style={[styles.orderCard, highlighted && styles.orderCardHighlighted]}>
      <View style={styles.foodRow}>
        <Image source={{ uri: order.image }} style={styles.foodImage} contentFit="cover" accessibilityLabel={order.itemSummary || "Order item"} />
        <View style={styles.foodCopy}>
          <Text style={styles.itemName} numberOfLines={2}>{order.primaryItemName}</Text>
          <Text style={styles.itemCount}>
            {formatAdditionalItemLabel({ primaryItemName: order.primaryItemName, additionalItemCount: order.additionalItemCount, itemCount: order.itemCount })}
          </Text>
        </View>
        <Text style={styles.amount} selectable>{order.amount}</Text>
      </View>

      <View style={styles.orderMetaRow}>
        <View style={styles.orderIdGroup}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderId} selectable numberOfLines={1}>{order.id}</Text>
        </View>
        <Text style={styles.orderDate} selectable numberOfLines={1}>{order.date}</Text>
      </View>

      <View style={styles.statusRow}>
        <StatusBadge status={order.cardStatus} />
        <View style={styles.customerRows}>
          <IconText icon="person-outline" text={order.customer} />
          <IconText icon="call-outline" text={order.phone} selectable />
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${order.id}`}
          onPress={() => onOpenOrder?.(order.id)}
        >
          <Text style={styles.secondaryText}>View details</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Update status for ${order.id}`}
          onPress={() => onUpdateOrder?.(order.id)}
        >
          <Text style={styles.primaryText}>Update status</Text>
          <PhosphorIcon name="chevron-down" size={16} color={Colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

function IconText({ icon, selectable, text }: { icon: "call-outline" | "person-outline"; selectable?: boolean; text: string }) {
  return (
    <View style={styles.iconTextRow}>
      <PhosphorIcon name={icon} size={14} color={Colors.textMuted} />
      <Text style={styles.iconText} numberOfLines={1} selectable={selectable}>{text}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: AdminOrderCardStatus }) {
  const meta = STATUS_META[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: meta.backgroundColor, borderColor: meta.borderColor }]}>
      <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
      <Text style={[styles.statusText, { color: meta.color }]} numberOfLines={1}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Colors.textPrimary,
    fontSize: 13,
    paddingVertical: 0,
  },
  circleAction: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  circleActionActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  header: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.heading1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  overviewRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  overviewCard: {
    flex: 1,
    minWidth: 0,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  overviewIcon: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.sm,
    backgroundColor: "rgba(247,194,192,0.1)",
  },
  overviewValue: {
    color: Colors.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  overviewLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterChip: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  filterText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  filterTextActive: {
    color: Colors.textPrimary,
  },
  filterCount: {
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
  },
  filterCountActive: {
    backgroundColor: Colors.textPrimary,
  },
  filterCountText: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  filterCountTextActive: {
    color: Colors.danger,
  },
  ordersList: {
    gap: Spacing.md,
  },
  orderCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  orderCardHighlighted: {
    borderColor: "rgba(229,57,53,0.65)",
  },
  orderMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  orderIdGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  orderIdLabel: {
    color: Colors.textDisabled,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },
  orderId: {
    flexShrink: 1,
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },
  orderDate: {
    maxWidth: "46%",
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 18,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statusBadge: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
  customerRows: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    gap: Spacing.md,
  },
  iconTextRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  iconText: {
    flex: 1,
    minWidth: 0,
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  foodRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: Radius.sm,
    backgroundColor: Colors.border,
  },
  foodCopy: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  itemName: {
    color: Colors.textPrimary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  itemCount: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  amount: {
    color: Colors.accent,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceAlt,
  },
  primaryButton: {
    flex: 1,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    borderRadius: Radius.sm,
    backgroundColor: Colors.danger,
  },
  secondaryText: {
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  primaryText: {
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.76,
  },
});
