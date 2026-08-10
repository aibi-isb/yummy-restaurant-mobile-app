import { CustomerHeader } from "@/components/features/CustomerHeader";
import { HeroBanner } from "@/components/features/HeroBanner";
import { SearchBar } from "@/components/features/SearchBar";
import { CategorySection } from "@/components/sections/CategorySection";
import { MealSection } from "@/components/sections/MealSection";
import { Colors, Spacing } from "@/constants/theme";
import { useMenuCategories } from "@/features/menu/hooks/useMenuCategories";
import { useCart } from "@/hooks/useCart";
import { useFoods } from "@/hooks/useFoods";
import { Toast } from "@/components/ui/Toast";
import { useTheme } from "@/providers/theme-provider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const { foods, loading } = useFoods();
  const { categories } = useMenuCategories();
  const { add } = useCart();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const featuredFoods = foods.filter((food) => food.featured).slice(0, 4);
  const popularFoods = foods.filter((food) => food.popular).slice(0, 5);
  const openFood = (foodId: string) => router.push(`/product?id=${foodId}` as never);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <Toast
        message={toastMsg ?? ""}
        visible={toastMsg !== null}
        onClose={() => setToastMsg(null)}
        autoDismissMs={2000}
      />

      {/* ── Scrollable content ── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <CustomerHeader variant="home" />

        {/* ── Search bar ── */}
        <SearchBar
          onSubmit={(value) => router.push(`/search?query=${encodeURIComponent(value)}` as never)}
        />

        {/* ── Hero banner ── */}
        <HeroBanner onOrderNow={() => router.push("/menu")} />

        {/* ── Categories section ── */}
        <CategorySection
          categories={categories}
          onAction={() => router.push("/menu")}
          onSelectCategory={(category) => router.push(`/menu?category=${encodeURIComponent(category.name)}` as never)}
        />

        {/* ── Featured (2-col grid) ── */}
        <MealSection
          title="FEATURED"
          foods={featuredFoods}
          layout="grid"
          loading={loading}
          onOpenFood={(food) => openFood(food.id)}
          onAddToCart={(food) => { add(food); setToastMsg("Added to cart"); }}
        />

        {/* ── Featured (horizontal list) ── */}
        <MealSection
          title="POPULAR"
          foods={popularFoods}
          layout="list"
          onOpenFood={(food) => openFood(food.id)}
          onAddToCart={(food) => { add(food); setToastMsg("Added to cart"); }}
        />
      </ScrollView>

    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: 0,
    gap: Spacing.xxxl,
  },
});
