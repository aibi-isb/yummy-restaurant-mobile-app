import {
  AdminOrderStatusFilters,
  AdminOrdersOverview,
  AdminOrdersCardList,
  AdminOrdersHeader,
  AdminOrdersTopBar,
} from "@/features/admin/components/admin-orders-card-list";
import { useOrders } from "@/hooks/useOrders";
import type { AdminOrderCardStatus } from "@/features/admin/types";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing } from "@/constants/theme";
import { getOrderFoodSummary } from "@/utils/order-presentation";

export default function AdminOrdersScreen() {
  const router = useRouter();
  const { error, loading, orders } = useOrders();
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [activeStatus, setActiveStatus] = useState<"All Orders" | AdminOrderCardStatus>("All Orders");
  const adminOrders = orders.map((order) => {
    const foodSummary = getOrderFoodSummary(order.items);

    return {
    id: order.id,
    date: new Date(order.createdAt).toLocaleString(),
    customer: order.customerName,
    location: order.address,
    phone: order.phone,
    amount: `Le ${order.total}`,
    itemCount: foodSummary.itemCount,
    primaryItemName: foodSummary.primaryItemName,
    additionalItemCount: foodSummary.additionalItemCount,
    itemSummary: order.items.map((item) => item.name).join(", "),
    image: order.items[0]?.image ?? "",
    status: order.status === "Delivered" ? "Delivered" as const : order.status === "Ready" ? "On Delivery" as const : "New Order" as const,
    cardStatus: order.paymentStatus === "Approved" ? "Payment Received" as const : order.status === "Delivered" ? "Delivered" as const : order.status === "Preparing" ? "Preparing" as const : "Pending" as const,
    };
  });

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return adminOrders.filter((order) => {
      const matchesStatus = activeStatus === "All Orders" || order.cardStatus === activeStatus;
      const haystack = [order.id, order.customer, order.phone, order.itemSummary].join(" ").toLowerCase();
      return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [activeStatus, adminOrders, query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ title: "Orders" }} />
      <StatusBar style="light" />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <AdminOrdersTopBar filtersOpen={filtersOpen} onQueryChange={setQuery} onToggleFilters={() => setFiltersOpen((value) => !value)} query={query} />
        <AdminOrdersHeader />
        {!loading && !error ? <AdminOrdersOverview orders={adminOrders} /> : null}
        {filtersOpen ? <AdminOrderStatusFilters activeStatus={activeStatus} onChange={setActiveStatus} orders={adminOrders} /> : null}
        {loading ? <Text style={styles.stateText}>Loading orders…</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!loading && !error && !filteredOrders.length ? <Text style={styles.stateText}>No orders match the current filters.</Text> : null}
        <AdminOrdersCardList
          orders={filteredOrders}
          onOpenOrder={(orderId) => router.push(`/admin-orders/${encodeURIComponent(orderId)}` as never)}
          onUpdateOrder={(orderId) => router.push(`/admin-orders/status-update/${encodeURIComponent(orderId)}` as never)}
        />
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  stateText: { color: Colors.textMuted, fontSize: 13, paddingHorizontal: Spacing.xs },
  errorText: { color: Colors.danger, fontSize: 13, paddingHorizontal: Spacing.xs, fontWeight: "700" },
});
