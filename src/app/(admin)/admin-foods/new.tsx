import { AdminFoodForm } from "@/features/admin/components/admin-food-form";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AddAdminFoodScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Add New Food" }} />
      <StatusBar style="light" />
      <AdminFoodForm mode="add" />
    </>
  );
}
