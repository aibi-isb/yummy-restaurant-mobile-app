import {
  AdminFoodDetailSummary,
  AdminFoodInfoCard,
  AdminFoodRevenueCard,
} from "@/features/admin/components/admin-food-detail-sections";
import { Colors } from "@/constants/theme";
import { AdminFoodDetail } from "@/features/admin/types";
import { useFoods } from "@/hooks/useFoods";
import { useOrders } from "@/hooks/useOrders";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminFoodDetailScreen() {
  const { "food-id": foodId } = useLocalSearchParams<{ "food-id"?: string }>();
  const decodedFoodId = typeof foodId === "string" ? decodeURIComponent(foodId) : "";
  const { foods } = useFoods();
  const { orders } = useOrders();
  const food = foods.find((item) => item.id === decodedFoodId) ?? foods[0];
  const detail = useMemo<AdminFoodDetail>(() => {
    const matchingItems = orders.flatMap((order) =>
      order.items
        .filter((item) => item.foodId === food?.id)
        .map((item) => ({ item, order })),
    );
    const revenue = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((label, index) => ({
      label,
      value: matchingItems
        .filter(({ order }) => new Date(order.createdAt).getMonth() === index)
        .reduce((sum, { item }) => sum + item.price * item.quantity, 0),
    }));

    return {
      food: {
        id: food?.id ?? decodedFoodId,
        name: food?.name ?? "Food item",
        image: food?.image ?? "",
        categories: food?.categories ?? [],
        price: String(food?.price ?? 0),
        description: food?.description ?? "",
        available: food?.available ?? false,
        orders: String(food?.orders ?? matchingItems.length),
        favorites: "0",
        views: String(food?.orders ?? matchingItems.length),
      },
      badge: food?.available ? "Available" : "Unavailable",
      categoryTrail: food?.categories ?? [],
      ingredients: food?.description ?? "No ingredients recorded.",
      nutrition: "Nutrition details are not recorded for this food item.",
      revenue,
    };
  }, [decodedFoodId, food, orders]);

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ title: detail.food.name }} />
      <StatusBar style="light" />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <AdminFoodDetailSummary detail={detail} />
        <AdminFoodInfoCard title="Ingredients" body={detail.ingredients} />
        <AdminFoodInfoCard title="Nutrition Info" body={detail.nutrition} />
        <AdminFoodRevenueCard data={detail.revenue} />
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
    gap: 16,
    paddingBottom: 24,
  },
});
