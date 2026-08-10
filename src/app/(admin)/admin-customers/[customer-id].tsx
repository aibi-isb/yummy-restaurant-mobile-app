import {
  AdminCustomerBalanceCard,
  AdminCustomerLikedFoodCard,
  AdminCustomerOrderedFoodCard,
  AdminCustomerProfileCard,
} from "@/features/admin/components/admin-customer-detail-sections";
import { AdminCustomerDetail } from "@/features/admin/types";
import { Colors } from "@/constants/theme";
import { profileImage } from "@/data/restaurant";
import { useCustomers } from "@/hooks/useCustomers";
import { useFoods } from "@/hooks/useFoods";
import { useOrders } from "@/hooks/useOrders";
import { usePayments } from "@/hooks/usePayments";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminCustomerDetailScreen() {
  const { "customer-id": customerId } = useLocalSearchParams<{ "customer-id"?: string }>();
  const decodedCustomerId = typeof customerId === "string" ? decodeURIComponent(customerId) : "";
  const { customers } = useCustomers();
  const { foods } = useFoods();
  const { orders } = useOrders(decodedCustomerId);
  const { payments } = usePayments(decodedCustomerId);
  const customer = customers.find((item) => item.id === decodedCustomerId) ?? customers[0];
  const detail = useMemo<AdminCustomerDetail>(() => {
    const paidTotal = payments
      .filter((payment) => payment.status === "Approved")
      .reduce((sum, payment) => sum + payment.amount, 0);
    const orderedFoodIds = new Set(orders.flatMap((order) => order.items.map((item) => item.foodId)));
    const orderedFoods = foods.filter((food) => orderedFoodIds.has(food.id)).slice(0, 5);

    return {
      customer: customer ?? {
        id: decodedCustomerId,
        name: "Customer",
        location: "",
        phone: "",
        username: "",
        registrationDate: "",
      },
      role: "Customer",
      email: customer?.email ?? "",
      avatar: profileImage,
      balance: `Le ${paidTotal}`,
      approvedPaymentCount: payments.filter((payment) => payment.status === "Approved").length,
      mostOrderedFoods: orderedFoods.map((food) => ({
        id: food.id,
        name: food.name,
        category: food.categories.join(" • "),
        price: `Le ${food.price}`,
        image: food.image,
      })),
      likedFoods: foods.slice(0, 4).map((food, index) => ({
        id: food.id,
        label: food.name,
        count: food.orders,
        value: food.orders,
        color: ["#3b82f6", "#ce1212", "#f97316", "#f6b100"][index] ?? "#3b82f6",
      })),
      weeklyLikes: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
        day,
        values: Object.fromEntries(foods.slice(0, 4).map((food) => [food.id, food.orders])),
      })),
    };
  }, [customer, decodedCustomerId, foods, orders, payments]);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ title: "Customer Detail" }} />
      <StatusBar style="light" />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Customer Detail</Text>
          <Text style={styles.subtitle}>Here your Customer Detail Profile</Text>
        </View>

        <AdminCustomerProfileCard detail={detail} />
        <AdminCustomerOrderedFoodCard foods={detail.mostOrderedFoods} />
        <AdminCustomerBalanceCard detail={detail} />
        <AdminCustomerLikedFoodCard detail={detail} />
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
    gap: 14,
    paddingBottom: 24,
  },
  pageHeader: {
    gap: 2,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
  },
});
