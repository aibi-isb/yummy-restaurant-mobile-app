import { PhosphorIcon } from "@/components/PhosphorIcon";
import {
  AdminCustomerSummary,
  AdminDeliveryCourierCard,
  AdminDeliveryStatusCard,
  AdminOrderHistoryCard,
  AdminOrderItemsCard,
  AdminOrderNoteCard,
  StatusBadge,
} from "@/features/admin/components/admin-order-detail-sections";
import { AdminOrderDetail } from "@/features/admin/types";
import { Colors, Spacing } from "@/constants/theme";
import { useOrders } from "@/hooks/useOrders";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAdditionalItemLabel, getOrderFoodSummary } from "@/utils/order-presentation";

export default function AdminOrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ "order-id"?: string }>();
  const orderId = Array.isArray(params["order-id"]) ? params["order-id"][0] : params["order-id"];
  const decodedOrderId = orderId ? decodeURIComponent(orderId) : "";
  const { orders } = useOrders();
  const order = orders.find((item) => item.id === decodedOrderId) ?? orders[0];
  const detail = useMemo<AdminOrderDetail>(() => {
    const source = order;
    return {
      id: source?.id ?? decodedOrderId,
      customer: source?.customerName ?? "Customer",
      status: source?.status === "Delivered" ? "Delivered" : source?.status === "Ready" ? "On Delivery" : "New Order",
      note: source ? `Payment status: ${source.paymentStatus}` : "Order details unavailable.",
      address: source?.address ?? "",
      postCode: "",
      history: [
        {
          id: "created",
          label: "Order Created",
          timestamp: source ? new Date(source.createdAt).toLocaleString() : "",
          icon: "cube-outline",
          tone: "danger",
        },
        {
          id: "payment",
          label: source?.paymentStatus ?? "Payment Status",
          timestamp: "",
          icon: "card-outline",
          tone: "danger",
        },
        {
          id: "status",
          label: source?.status ?? "Pending",
          timestamp: "",
          icon: source?.status === "Delivered" ? "checkmark-circle-outline" : "bicycle-outline",
          tone: source?.status === "Delivered" ? "muted" : "danger",
        },
      ],
      items: (source?.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        description: `${item.quantity} ordered`,
        image: item.image,
        quantity: item.quantity,
        unitPrice: `Le ${item.price}`,
        totalPrice: `Le ${item.price * item.quantity}`,
      })),
      delivery: {
        courierName: source?.deliveryPartnerName ?? "Unassigned",
        status: source?.status === "Delivered" ? "Delivered" : source?.status === "Ready" ? "On Delivery" : "New Order",
        phone: source?.deliveryPartnerPhone ?? source?.phone ?? "",
        deliveryTime: source ? new Date(source.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
        distance: "",
        headline: source?.status ?? "Pending",
        description: source ? `Deliver to ${source.address}` : "No order selected.",
      },
    };
  }, [decodedOrderId, order]);
  const foodSummary = getOrderFoodSummary(detail.items);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ title: foodSummary.primaryItemName }} />
      <StatusBar style="light" />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.titleGroup}>
            <Text style={styles.title} numberOfLines={2}>{foodSummary.primaryItemName}</Text>
            <Text style={styles.orderIdMeta} selectable>Order ID · {detail.id}</Text>
            <Text style={styles.itemMeta}>{formatAdditionalItemLabel(foodSummary)}</Text>
            <View style={styles.breadcrumb}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to orders"
                onPress={() => router.push("/admin-orders" as never)}
              >
                <Text style={styles.breadcrumbMuted}>Orders</Text>
              </Pressable>
              <Text style={styles.breadcrumbMuted}>›</Text>
              <Text style={styles.breadcrumbCurrent}>Order Detail</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={`Update order ${detail.id}`}
              onPress={() => router.push(`/admin-orders/status-update/${encodeURIComponent(detail.id)}` as never)}
            >
              <PhosphorIcon name="pencil" size={13} color="#ff6467" />
              <Text style={styles.cancelText}>Update Order</Text>
            </Pressable>
            <StatusBadge status={detail.status} />
          </View>
        </View>

        <AdminCustomerSummary detail={detail} />
        <AdminOrderNoteCard detail={detail} />
        <AdminOrderHistoryCard history={detail.history} />
        <AdminOrderItemsCard items={detail.items} />
        <AdminDeliveryStatusCard detail={detail} />
        <AdminDeliveryCourierCard detail={detail} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 14,
    gap: 15,
    paddingBottom: 24,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  titleGroup: {
    flex: 1,
    minWidth: 150,
    gap: 2,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  orderIdMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },
  itemMeta: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  breadcrumbMuted: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
  },
  breadcrumbCurrent: {
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 14,
  },
  actions: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 7,
  },
  cancelButton: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 13,
    borderRadius: 7,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(251,44,54,0.4)",
  },
  cancelText: {
    color: "#ff6467",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.76,
  },
});
