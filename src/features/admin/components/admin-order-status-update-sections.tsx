import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Spacing } from "@/constants/theme";
import { AdminOperationalOrderStatus, AdminOrderCardStatus, AdminOrderStatusUpdate } from "@/features/admin/types";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

const STATUS_META: Record<AdminOrderCardStatus, { backgroundColor: string; borderColor: string; color: string }> = {
  Pending: {
    backgroundColor: "#403423",
    borderColor: "#312b21",
    color: "#a18057",
  },
  Preparing: {
    backgroundColor: "#27303c",
    borderColor: "#26282d",
    color: "#59708d",
  },
  Delivered: {
    backgroundColor: "#283227",
    borderColor: "#252822",
    color: "#597c5d",
  },
  "Payment Received": {
    backgroundColor: "#443622",
    borderColor: "#3c3325",
    color: "#a5895b",
  },
};

const ORDER_STATUSES: AdminOperationalOrderStatus[] = ["Preparing", "Delivering", "Delivered"];

export function AdminOrderStatusHero({ foodName, itemLabel, onClose, orderId }: { foodName: string; itemLabel: string; onClose: () => void; orderId: string }) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroCopy}>
        <Text style={styles.heroFoodName} numberOfLines={2}>{foodName}</Text>
        <Text style={styles.heroItemLabel}>{itemLabel}</Text>
        <Text style={styles.heroId} selectable>Order ID · {orderId}</Text>
      </View>
      <Pressable style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Close status update" onPress={onClose}>
        <PhosphorIcon name="close" size={24} color={Colors.danger} />
      </Pressable>
    </View>
  );
}

export function AdminOrderCustomerInfoCard({ detail }: { detail: AdminOrderStatusUpdate }) {
  return (
    <View style={styles.card}>
      <SectionTitle icon="person-outline" title="Customer Information" />
      <View style={styles.infoStack}>
        <InfoLine icon="person-outline" text={detail.customer} />
        <InfoLine icon="call-outline" text={detail.phone} selectable />
        <InfoLine icon="location-outline" text={detail.addressLines.join("\n")} />
      </View>
    </View>
  );
}

export function AdminOrderItemsStatusCard({ detail }: { detail: AdminOrderStatusUpdate }) {
  return (
    <View style={styles.itemsCard}>
      <View style={styles.itemsTitleRow}>
        <SectionTitle icon="card-outline" title="Order Items" />
      </View>
      <View style={styles.itemsHeader}>
        <Text style={[styles.itemsHeaderText, styles.itemsColumn]}>Items</Text>
        <Text style={styles.itemsHeaderText}>Qty</Text>
        <Text style={styles.itemsHeaderText}>Price</Text>
        <Text style={styles.itemsHeaderText}>Price</Text>
      </View>

      {detail.items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" accessibilityLabel={item.name} />
            <View style={styles.itemCopy}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPriceMuted}>{item.unitPrice}</Text>
            </View>
          </View>
          <Text style={styles.itemCell} selectable>
            x{item.quantity}
          </Text>
          <Text style={styles.itemCell} selectable>
            {item.unitPrice}
          </Text>
          <Text style={styles.itemCell} selectable>
            {item.totalPrice}
          </Text>
        </View>
      ))}

      <View style={styles.totals}>
        <TotalLine label="Subtotal" value={detail.subtotal} />
        <TotalLine label="Delivery Fee" value={detail.deliveryFee} />
        <View style={styles.totalDivider} />
        <TotalLine label="Total Amount" value={detail.totalAmount} strong />
      </View>
    </View>
  );
}

export function AdminOrderInformationCard({
  detail,
  selectedStatus,
  onSelectStatus,
}: {
  detail: AdminOrderStatusUpdate;
  selectedStatus: AdminOperationalOrderStatus;
  onSelectStatus: (status: AdminOperationalOrderStatus) => void;
}) {
  return (
    <View style={styles.infoCard}>
      <SectionTitle icon="calendar-outline" title="Order Information" />
      <View style={styles.orderInfoRows}>
        <InfoPair label="Payment Method" value={detail.paymentMethod} />
        <View style={styles.infoPair}>
          <Text style={styles.infoPairLabel}>Payment Status</Text>
          <StatusBadge status={detail.paymentStatus} />
        </View>
        <InfoPair label="Order Date" value={detail.orderDate} />
        <InfoPair label="Order ID" value={detail.orderIdLabel} />
      </View>

      <View style={styles.statusSelector}>
        <Text style={styles.selectorLabel}>Set Order Status</Text>
        <View style={styles.statusOptions}>
          {ORDER_STATUSES.map((status) => (
            <Pressable
              key={status}
              style={({ pressed }) => [styles.statusOption, selectedStatus === status && styles.statusOptionActive, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedStatus === status }}
              accessibilityLabel={`Set order status to ${status}`}
              onPress={() => onSelectStatus(status)}
            >
              <Text style={[styles.statusOptionText, selectedStatus === status && styles.statusOptionTextActive]}>{status}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export function AdminOrderStatusActions({
  onCancel,
  onUpdate,
  selectedStatus,
}: {
  onCancel?: () => void;
  onUpdate?: () => void;
  selectedStatus: AdminOperationalOrderStatus;
}) {
  return (
    <View style={styles.actions}>
      <Pressable style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Go back without updating" onPress={onCancel}>
        <Text style={styles.cancelText}>Back</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [styles.updateButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`Update status to ${selectedStatus}`} onPress={onUpdate}>
        <Text style={styles.updateText}>Update Status</Text>
      </Pressable>
    </View>
  );
}

function SectionTitle({ icon, title }: { icon: "calendar-outline" | "card-outline" | "person-outline"; title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <PhosphorIcon name={icon} size={17} color="#ff4d4f" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function InfoLine({ icon, selectable, text }: { icon: "call-outline" | "location-outline" | "person-outline"; selectable?: boolean; text: string }) {
  return (
    <View style={styles.infoLine}>
      <PhosphorIcon name={icon} size={16} color="#a3a3a0" />
      <Text style={styles.infoLineText} selectable={selectable}>
        {text}
      </Text>
    </View>
  );
}

function InfoPair({ emphasis, label, value }: { emphasis?: boolean; label: string; value: string }) {
  return (
    <View style={styles.infoPair}>
      <Text style={styles.infoPairLabel}>{label}</Text>
      <Text style={[styles.infoPairValue, emphasis && styles.infoPairValueEmphasis]} selectable>
        {value}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: AdminOrderCardStatus }) {
  const meta = STATUS_META[status];

  return (
    <View style={[styles.paymentBadge, { backgroundColor: meta.backgroundColor, borderColor: meta.borderColor }]}>
      <Text style={[styles.paymentBadgeText, { color: meta.color }]}>{status}</Text>
    </View>
  );
}

function TotalLine({ label, strong, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <View style={styles.totalLine}>
      <Text style={[styles.totalLabel, strong && styles.totalStrong]}>{label}</Text>
      <Text style={[styles.totalValue, strong && styles.totalValueStrong]} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderRadius: 6,
    borderCurve: "continuous",
    backgroundColor: "#22201e",
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
    paddingVertical: Spacing.sm,
  },
  heroFoodName: {
    color: Colors.textPrimary,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
  },
  heroItemLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  heroId: {
    color: Colors.textDisabled,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    gap: 18,
    padding: 20,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#20201e",
    borderWidth: 1,
    borderColor: "#2f2f2e",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    color: "#a3a39f",
    fontSize: 14,
    lineHeight: 20,
  },
  infoStack: {
    gap: 16,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
  },
  infoLineText: {
    flex: 1,
    minWidth: 0,
    color: "#a3a3a0",
    fontSize: 12.5,
    lineHeight: 21,
  },
  itemsCard: {
    borderRadius: 0,
    backgroundColor: "#20201e",
    borderWidth: 1,
    borderColor: "#292927",
  },
  itemsTitleRow: {
    minHeight: 49,
    justifyContent: "center",
    paddingHorizontal: 17,
  },
  itemsHeader: {
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    backgroundColor: "#2f2f2f",
    borderTopWidth: 1,
    borderTopColor: "#2b2c2b",
  },
  itemsHeaderText: {
    width: 60,
    color: "#777877",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "right",
  },
  itemsColumn: {
    flex: 1,
    textAlign: "left",
  },
  itemRow: {
    minHeight: 79,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#30302e",
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemImage: {
    width: 58,
    height: 55,
    borderRadius: 8,
    backgroundColor: "#2a2a2a",
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  itemName: {
    color: "#a8a8a6",
    fontSize: 14,
    lineHeight: 19,
  },
  itemPriceMuted: {
    color: "#747472",
    fontSize: 13,
    lineHeight: 18,
  },
  itemCell: {
    width: 60,
    color: "#ababa9",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  totals: {
    paddingHorizontal: 17,
    paddingVertical: 17,
    gap: 18,
  },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  totalLabel: {
    color: "#a6a6a4",
    fontSize: 14,
    lineHeight: 20,
  },
  totalValue: {
    color: "#a3a3a1",
    fontSize: 14,
    lineHeight: 20,
    fontVariant: ["tabular-nums"],
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#30302e",
  },
  totalStrong: {
    color: "#b9b9b8",
    fontWeight: "800",
  },
  totalValueStrong: {
    color: "#cf2a28",
    fontWeight: "900",
  },
  infoCard: {
    gap: 18,
    padding: 17,
    borderRadius: 4,
    borderCurve: "continuous",
    backgroundColor: "#20201e",
    borderWidth: 1,
    borderColor: "#2a2a29",
  },
  orderInfoRows: {
    gap: 18,
  },
  infoPair: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  infoPairLabel: {
    color: "#70706d",
    fontSize: 12,
    lineHeight: 18,
  },
  infoPairValue: {
    flexShrink: 1,
    color: "#a7a7a5",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "right",
  },
  infoPairValueEmphasis: {
    fontSize: 16,
    fontWeight: "800",
  },
  paymentBadge: {
    minHeight: 25,
    justifyContent: "center",
    paddingHorizontal: 9,
    borderRadius: 4,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  paymentBadgeText: {
    fontSize: 12,
    lineHeight: 18,
  },
  statusSelector: {
    gap: 10,
    paddingTop: 3,
  },
  selectorLabel: {
    color: "#a3a39f",
    fontSize: 13,
    lineHeight: 18,
  },
  statusOptions: {
    flexDirection: "row",
    gap: 7,
  },
  statusOption: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
    borderRadius: 6,
    borderCurve: "continuous",
    backgroundColor: "#20201e",
    borderWidth: 1,
    borderColor: "#4d4d4c",
  },
  statusOptionActive: {
    backgroundColor: "#cf2a28",
    borderColor: "#9c2f2d",
  },
  statusOptionText: {
    color: "#a3a39f",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  statusOptionTextActive: {
    color: "#e3b8b8",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 3,
  },
  cancelButton: {
    flex: 1,
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#20201e",
    borderWidth: 1,
    borderColor: "#4d4d4c",
  },
  updateButton: {
    flex: 1,
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#cf2a28",
    borderWidth: 1,
    borderColor: "#9c2f2d",
  },
  cancelText: {
    color: "#7e3938",
    fontSize: 14,
    lineHeight: 21,
  },
  updateText: {
    color: "#e3b8b8",
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.76,
  },
});
