import {
  AdminOrderCustomerInfoCard,
  AdminOrderInformationCard,
  AdminOrderItemsStatusCard,
  AdminOrderStatusActions,
  AdminOrderStatusHero,
} from "@/features/admin/components/admin-order-status-update-sections";
import { Colors } from "@/constants/theme";
import { AdminOperationalOrderStatus, AdminOrderStatusUpdate } from "@/features/admin/types";
import { useOrders } from "@/hooks/useOrders";
import { updateOrderStatus } from "@/services/orderService";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatAdditionalItemLabel, getOrderFoodSummary } from "@/utils/order-presentation";

export default function AdminOrderStatusUpdateScreen() {
  const router = useRouter();
  const { "order-id": orderId } = useLocalSearchParams<{ "order-id"?: string }>();
  const decodedOrderId = typeof orderId === "string" ? decodeURIComponent(orderId) : "";
  const { orders } = useOrders();
  const order = orders.find((item) => item.id === decodedOrderId) ?? orders[0];
  const detail: AdminOrderStatusUpdate = {
    id: order?.id ?? decodedOrderId,
    customer: order?.customerName ?? "Customer",
    phone: order?.phone ?? "",
    addressLines: [order?.address ?? ""],
    paymentMethod: order?.paymentStatus ?? "Not recorded",
    paymentStatus: order?.paymentStatus === "Approved" ? "Payment Received" : order?.paymentStatus === "Rejected" ? "Pending" : "Pending",
    orderDate: order ? new Date(order.createdAt).toLocaleString() : "",
    orderIdLabel: order?.id ?? decodedOrderId,
    subtotal: `Le ${order?.subtotal ?? 0}`,
    deliveryFee: `Le ${order?.deliveryFee ?? 0}`,
    totalAmount: `Le ${order?.total ?? 0}`,
    currentStatus: order?.status === "Delivered" ? "Delivered" : order?.status === "Ready" ? "Delivering" : "Preparing",
    items: (order?.items ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      unitPrice: `Le ${item.price}`,
      totalPrice: `Le ${item.price * item.quantity}`,
    })),
  };
  const foodSummary = getOrderFoodSummary(detail.items);
  const [selectedStatusOverride, setSelectedStatusOverride] = useState<AdminOperationalOrderStatus>();
  const selectedStatus = selectedStatusOverride ?? detail.currentStatus;
  const submitStatus = async () => {
    await updateOrderStatus(detail.id, selectedStatus === "Delivering" ? "Ready" : selectedStatus);
    router.replace("/admin-orders" as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ title: "Update Order Status" }} />
      <StatusBar style="light" />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <AdminOrderStatusHero
          foodName={foodSummary.primaryItemName}
          itemLabel={formatAdditionalItemLabel(foodSummary)}
          orderId={detail.id}
          onClose={() => router.back()}
        />
        <AdminOrderCustomerInfoCard detail={detail} />
        <AdminOrderItemsStatusCard detail={detail} />
        <AdminOrderInformationCard detail={detail} selectedStatus={selectedStatus} onSelectStatus={setSelectedStatusOverride} />
        <AdminOrderStatusActions selectedStatus={selectedStatus} onCancel={() => router.back()} onUpdate={submitStatus} />
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
    gap: 12,
    paddingBottom: 10,
  },
});
