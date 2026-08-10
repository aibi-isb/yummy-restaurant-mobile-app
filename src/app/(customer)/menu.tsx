import { PhosphorIcon } from "@/components/PhosphorIcon";
import { CustomerHeader } from "@/components/features/CustomerHeader";
import { SearchBar } from "@/components/features/SearchBar";
import { CategorySection } from "@/components/sections/CategorySection";
import { MealSection } from "@/components/sections/MealSection";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useMenuCategories } from "@/features/menu/hooks/useMenuCategories";
import { useCart } from "@/hooks/useCart";
import { usePaginatedFoods } from "@/hooks/use-paginated-foods";
import type { FoodSort } from "@/services/foodService";
import { Toast } from "@/components/ui/Toast";
import { useTheme } from "@/providers/theme-provider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useDeferredValue, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MENU_SORT_OPTIONS: { label: string; value: FoodSort }[] = [
  { label: "Name", value: "name-asc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Popular", value: "popular" },
];

export default function MenuScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const params = useLocalSearchParams<{ category?: string }>();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category ?? null);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<FoodSort>("name-asc");
  const { categories } = useMenuCategories();
  const { error, foods, loading, pageCount, total } = usePaginatedFoods({
    category: selectedCategory,
    page,
    query: deferredQuery,
    sort,
  });
  const { add } = useCart();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <Toast
        message={toastMsg ?? ""}
        visible={toastMsg !== null}
        onClose={() => setToastMsg(null)}
        autoDismissMs={2000}
      />

      <CustomerHeader title="Menu" showBack rightIcons="cart" />

      {/* ── Scrollable body ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <SearchBar
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            setPage(0);
          }}
        />

        {/* Category chips row */}
        <CategorySection
          title={selectedCategory ? selectedCategory.toUpperCase() : "CATEGORIES"}
          actionLabel={null}
          categories={categories}
          variant="rectangular"
          onSelectCategory={(category) => {
            setSelectedCategory(category.name);
            setPage(0);
          }}
        />

        {/* 2-col category food grid */}
        <MealSection
          title="MENU"
          emptyText={error ?? "No products found"}
          foods={foods}
          layout="category"
          loading={loading}
          onOpenFood={(food) => router.push(`/product?id=${food.id}` as never)}
          onAddToCart={(food) => { add(food); setToastMsg("Added to cart"); }}
          onSelectSort={(value) => {
            setSort(value as FoodSort);
            setPage(0);
          }}
          selectedSort={sort}
          sortOptions={MENU_SORT_OPTIONS}
        />

        {!loading && !error && total > 0 ? (
          <View style={styles.pagination}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous menu page"
              disabled={page === 0}
              onPress={() => setPage((current) => Math.max(0, current - 1))}
              style={[styles.pageButton, { borderColor: colors.border }, page === 0 && styles.pageButtonDisabled]}
            >
              <PhosphorIcon name="chevron-back" size={16} color={colors.textPrimary} />
              <Text style={[styles.pageButtonText, { color: colors.textPrimary }]}>Previous</Text>
            </Pressable>

            <Text style={[styles.pageStatus, { color: colors.textMuted }]} accessibilityLiveRegion="polite">
              {page + 1} of {pageCount} · {total} products
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next menu page"
              disabled={page + 1 >= pageCount}
              onPress={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              style={[
                styles.pageButton,
                { borderColor: colors.border },
                page + 1 >= pageCount && styles.pageButtonDisabled,
              ]}
            >
              <Text style={[styles.pageButtonText, { color: colors.textPrimary }]}>Next</Text>
              <PhosphorIcon name="chevron-forward" size={16} color={Colors.textPrimary} />
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Scroll body ──
  scrollContent: {
    paddingHorizontal: 8,
    paddingTop: 0,
    gap: Spacing.xxxl,
  },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  pageButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
  },
  pageButtonDisabled: {
    opacity: 0.35,
  },
  pageButtonText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  pageStatus: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },

});
