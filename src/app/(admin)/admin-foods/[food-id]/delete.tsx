import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Radius } from "@/constants/theme";
import { deleteFood, Food, getFoodById } from "@/services/foodService";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAdminTheme } from "@/providers/theme-provider";

export default function DeleteAdminFoodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ "food-id"?: string }>();
  const foodId = Array.isArray(params["food-id"]) ? params["food-id"][0] : params["food-id"];
  const decodedFoodId = foodId ? decodeURIComponent(foodId) : "";
  const { colors, mode } = useAdminTheme();
  const [food, setFood] = useState<Food | null>(null);

  useEffect(() => {
    if (!decodedFoodId) return;
    void getFoodById(decodedFoodId).then(setFood);
  }, [decodedFoodId]);

  const handleDelete = async () => {
    await deleteFood(decodedFoodId);
    router.replace("/admin-foods" as never);
  };

  if (!food) return null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
      <Stack.Screen options={{ title: "Delete Food" }} />
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Back to foods" onPress={() => router.back()}>
            <PhosphorIcon name="chevron-back" size={34} color={colors.textPrimary} />
          </Pressable>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Delete Food</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.warningCard, { backgroundColor: colors.surfaceAlt }]}>
          <View style={[styles.deleteIconWrap, { backgroundColor: colors.surface, borderColor: `${colors.danger}55` }]}>
            <PhosphorIcon name="trash-outline" size={66} color={colors.danger} />
          </View>
          <Text style={[styles.warningTitle, { color: colors.textPrimary }]}>Delete this food item?</Text>
          <Text style={[styles.warningCopy, { color: colors.textMuted }]}>
            Are you sure you want to delete{"\n"}&quot;{food.name}&quot;? This action{"\n"}cannot be undone.
          </Text>

          <View style={[styles.foodSummary, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
            <Image source={{ uri: food.image }} style={[styles.foodImage, { backgroundColor: colors.surfaceAlt }]} contentFit="cover" accessibilityLabel={food.name} />
            <View style={styles.foodCopy}>
              <Text style={[styles.foodName, { color: colors.textPrimary }]}>{food.name}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>Category: {food.categories[0] === "Food" ? "Burgers" : food.categories[0]}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>Price: Le {food.price}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`Delete ${food.name} permanently`} onPress={handleDelete}>
            <Text style={[styles.deleteText, { color: colors.textPrimary }]}>Delete Permanently</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Cancel delete" onPress={() => router.back()}>
            <Text style={[styles.cancelText, { color: colors.textPrimary }]}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fcfcfc",
  },
  content: {
    minHeight: "100%",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 37,
    gap: 30,
  },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
  },
  title: {
    color: "#4a4d56",
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "800",
  },
  headerSpacer: {
    width: 48,
  },
  warningCard: {
    alignItems: "center",
    gap: 26,
    paddingHorizontal: 18,
    paddingVertical: 34,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#fcf0ed",
  },
  deleteIconWrap: {
    width: 147,
    height: 147,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: "#ffc4c4",
  },
  warningTitle: {
    color: "#4b4a52",
    fontSize: 24,
    lineHeight: 31,
    fontWeight: "800",
    textAlign: "center",
  },
  warningCopy: {
    color: "#97969f",
    fontSize: 19,
    lineHeight: 31,
    textAlign: "center",
  },
  foodSummary: {
    width: "100%",
    minHeight: 171,
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    padding: 18,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#fdfdfd",
    borderWidth: 1,
    borderColor: "#f8f6f5",
  },
  foodImage: {
    width: 124,
    height: 134,
    borderRadius: 12,
    backgroundColor: "#f2f3f5",
  },
  foodCopy: {
    flex: 1,
    minWidth: 0,
    gap: 14,
  },
  foodName: {
    color: "#44464c",
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
  },
  meta: {
    color: "#8f929c",
    fontSize: 18,
    lineHeight: 24,
  },
  actions: {
    gap: 22,
  },
  deleteButton: {
    height: 74,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderCurve: "continuous",
    backgroundColor: "#df181c",
    borderWidth: 1,
    borderColor: "#e3373c",
  },
  deleteText: {
    color: "#f5aaa9",
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
  },
  cancelButton: {
    height: 75,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#fcfcfc",
    borderWidth: 1,
    borderColor: "#bec0c8",
  },
  cancelText: {
    color: "#5d5e66",
    fontSize: 23,
    lineHeight: 30,
  },
  pressed: {
    opacity: 0.76,
  },
});
