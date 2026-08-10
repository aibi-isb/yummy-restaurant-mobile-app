import { AdminFoodForm } from "@/features/admin/components/admin-food-form";
import { getFoodById, Food } from "@/services/foodService";
import { Stack, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

export default function EditAdminFoodScreen() {
  const params = useLocalSearchParams<{ "food-id"?: string }>();
  const foodId = Array.isArray(params["food-id"]) ? params["food-id"][0] : params["food-id"];
  const [food, setFood] = useState<Food | null>(null);

  useEffect(() => {
    if (!foodId) return;
    void getFoodById(decodeURIComponent(foodId)).then(setFood);
  }, [foodId]);

  return (
    <>
      <Stack.Screen options={{ title: "Edit Food" }} />
      <StatusBar style="light" />
      {food ? (
        <AdminFoodForm
          mode="edit"
          food={{
            id: food.id,
            name: food.name,
            image: food.image,
            categories: food.categories,
            price: String(food.price),
            description: food.description,
            available: food.available,
            orders: String(food.orders),
            favorites: "0",
            views: String(food.orders),
          }}
        />
      ) : null}
    </>
  );
}
