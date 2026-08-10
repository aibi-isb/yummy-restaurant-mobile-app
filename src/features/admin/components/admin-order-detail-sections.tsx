import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { AdminOrderDetail, AdminOrderDetailItem, AdminOrderHistoryItem, AdminOrderStatus } from "@/features/admin/types";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

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
    color: Colors.danger,
    backgroundColor: "rgba(229,57,53,0.15)",
    borderColor: "rgba(229,57,53,0.25)",
  },
};

export function AdminCustomerSummary({ detail }: { detail: AdminOrderDetail }) {
  return (
    <View style={styles.customerCard}>
      <View style={styles.customerAvatar} />
      <Text style={styles.customerName}>{detail.customer}</Text>
    </View>
  );
}

export function AdminOrderNoteCard({ detail }: { detail: AdminOrderDetail }) {
  return (
    <View style={styles.noteCard}>
      <Text style={styles.noteTitle}>Note Order</Text>
      <Text style={styles.noteBody}>{detail.note}</Text>
      <View style={styles.addressRow}>
        <View style={styles.addressIcon}>
          <PhosphorIcon name="location-outline" size={11} color="#ff6467" />
        </View>
        <View>
          <Text style={styles.addressText}>{detail.address}</Text>
          <Text style={styles.postCode}>{detail.postCode}</Text>
        </View>
      </View>
    </View>
  );
}

export function AdminOrderHistoryCard({ history }: { history: AdminOrderHistoryItem[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>History</Text>
      <View style={styles.timeline}>
        {history.map((item, index) => {
          const color = item.tone === "danger" ? Colors.danger : Colors.textMuted;

          return (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={[styles.timelineDot, { backgroundColor: item.tone === "danger" ? "rgba(229,57,53,0.25)" : "#2a2a2a" }]}>
                  <PhosphorIcon name={item.icon} size={12} color={color} />
                </View>
                {index < history.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineText}>
                <Text style={styles.historyLabel}>{item.label}</Text>
                {!!item.timestamp && <Text style={styles.historyTime}>{item.timestamp}</Text>}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function AdminOrderItemsCard({ items }: { items: AdminOrderDetailItem[] }) {
  return (
    <View style={styles.itemsCard}>
      <View style={styles.itemsHeader}>
        <Text style={[styles.itemsHeaderText, styles.itemsProductColumn]}>Items</Text>
        <Text style={styles.itemsHeaderText}>Qty</Text>
        <Text style={styles.itemsHeaderText}>Price</Text>
        <Text style={styles.itemsHeaderText}>Total{"\n"}Price</Text>
      </View>

      {items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" accessibilityLabel={item.name} />
            <View style={styles.itemCopy}>
              {!!item.badge && (
                <View style={styles.recipeBadge}>
                  <Text style={styles.recipeBadgeText}>{item.badge}</Text>
                </View>
              )}
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>
          <Text style={styles.itemQuantity} selectable>
            {item.quantity}x
          </Text>
          <Text style={styles.itemPrice} selectable>
            {item.unitPrice}
          </Text>
          <Text style={styles.itemTotal} selectable>
            {item.totalPrice}
          </Text>
          <PhosphorIcon name="trash-outline" size={13} color={Colors.danger} />
        </View>
      ))}
    </View>
  );
}

export function AdminDeliveryStatusCard({ detail }: { detail: AdminOrderDetail }) {
  const status = STATUS_META[detail.delivery.status];

  return (
    <View style={styles.card}>
      <View style={styles.deliveryHeading}>
        <View>
          <Text style={styles.cardTitle}>Delivery Status</Text>
          <Text style={styles.deliveryDescription}>{detail.delivery.description}</Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: status.backgroundColor, borderColor: status.borderColor }]}>
          <Text style={[styles.liveBadgeText, { color: status.color }]}>{detail.delivery.headline}</Text>
        </View>
      </View>
      <View style={styles.mapBox}>
        <View style={styles.mapRoute} />
        <View style={[styles.mapPin, styles.mapPinStart]} />
        <View style={[styles.mapPin, styles.mapPinEnd]} />
        <Text style={styles.distanceLabel}>{detail.delivery.distance}</Text>
      </View>
    </View>
  );
}

export function AdminDeliveryCourierCard({ detail }: { detail: AdminOrderDetail }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Delivery by</Text>
      <View style={styles.courierRow}>
        <View style={styles.courierAvatar} />
        <View style={styles.courierCopy}>
          <Text style={styles.customerName}>{detail.delivery.courierName}</Text>
          <StatusBadge status={detail.delivery.status} />
        </View>
      </View>
      <View style={styles.deliveryFacts}>
        <DeliveryFact icon="call-outline" label="Telpon" value={detail.delivery.phone} />
        <DeliveryFact icon="time-outline" label="Delivery Time" value={detail.delivery.deliveryTime} />
      </View>
    </View>
  );
}

export function StatusBadge({ status }: { status: AdminOrderStatus }) {
  const meta = STATUS_META[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: meta.backgroundColor, borderColor: meta.borderColor }]}>
      <Text style={[styles.statusBadgeText, { color: meta.color }]}>{status}</Text>
    </View>
  );
}

function DeliveryFact({ icon, label, value }: { icon: "call-outline" | "time-outline"; label: string; value: string }) {
  return (
    <View style={styles.deliveryFact}>
      <View style={styles.factLabelRow}>
        <PhosphorIcon name={icon} size={11} color="#b0b0b0" />
        <Text style={styles.factLabel}>{label}</Text>
      </View>
      <Text style={styles.factValue} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    gap: 14,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    boxShadow: "0 1px 1px rgba(0, 0, 0, 0.04)",
  },
  customerCard: {
    minHeight: 121,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: "rgba(229,57,53,0.4)",
  },
  customerName: {
    color: Colors.textPrimary,
    fontSize: 12.25,
    lineHeight: 18,
    fontWeight: "700",
  },
  noteCard: {
    padding: 15,
    gap: 7,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#ffc9c9",
  },
  noteTitle: {
    color: Colors.danger,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
  },
  noteBody: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 17,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingTop: 3,
  },
  addressIcon: {
    width: 21,
    height: 21,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: "rgba(229,57,53,0.2)",
  },
  addressText: {
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
  },
  postCode: {
    color: "#b0b0b0",
    fontSize: 10,
    lineHeight: 15,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 12.25,
    lineHeight: 18,
    fontWeight: "800",
  },
  timeline: {
    gap: 0,
  },
  timelineRow: {
    minHeight: 51,
    flexDirection: "row",
    gap: 12,
  },
  timelineRail: {
    alignItems: "center",
  },
  timelineDot: {
    width: 23,
    height: 23,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: "#2a2a2a",
  },
  timelineText: {
    flex: 1,
    paddingTop: 2,
  },
  historyLabel: {
    color: Colors.textPrimary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
  },
  historyTime: {
    color: "#b0b0b0",
    fontSize: 10,
    lineHeight: 15,
  },
  itemsCard: {
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    overflow: "hidden",
  },
  itemsHeader: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: 14,
    backgroundColor: "#ef3434",
  },
  itemsHeaderText: {
    width: 50,
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: "800",
  },
  itemsProductColumn: {
    flex: 1,
  },
  itemRow: {
    minHeight: 98,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemImage: {
    width: 43,
    height: 38,
    borderRadius: 7,
    backgroundColor: "#2a2a2a",
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  recipeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: "rgba(229,57,53,0.25)",
  },
  recipeBadgeText: {
    color: Colors.danger,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
  },
  itemName: {
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
  },
  itemDescription: {
    color: "#b0b0b0",
    fontSize: 10,
    lineHeight: 13,
  },
  itemQuantity: {
    width: 32,
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  itemPrice: {
    width: 54,
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  itemTotal: {
    width: 56,
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  deliveryHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  deliveryDescription: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
    paddingTop: 2,
  },
  liveBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  liveBadgeText: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
  mapBox: {
    height: 126,
    overflow: "hidden",
    borderRadius: 7,
    backgroundColor: "#262626",
  },
  mapRoute: {
    position: "absolute",
    left: 72,
    right: 72,
    top: 54,
    height: 22,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.danger,
    transform: [{ rotate: "-12deg" }],
  },
  mapPin: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    borderWidth: 4,
    borderColor: "#ffc9c9",
    backgroundColor: Colors.danger,
  },
  mapPinStart: {
    left: 58,
    bottom: 24,
  },
  mapPinEnd: {
    right: 66,
    top: 44,
  },
  distanceLabel: {
    position: "absolute",
    left: "48%",
    top: 41,
    color: Colors.textPrimary,
    fontSize: 8,
  },
  courierRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  courierAvatar: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: "#2a2a2a",
  },
  courierCopy: {
    gap: 3,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },
  deliveryFacts: {
    flexDirection: "row",
    gap: 10,
  },
  deliveryFact: {
    flex: 1,
    minHeight: 54,
    justifyContent: "center",
    gap: 4,
    padding: 10,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "rgba(42,42,42,0.4)",
  },
  factLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  factLabel: {
    color: "#b0b0b0",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },
  factValue: {
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
  },
});
