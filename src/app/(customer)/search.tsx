import { PhosphorIcon } from "@/components/PhosphorIcon";
import { CustomerHeader } from "@/components/features/CustomerHeader";
import { SearchBar } from "@/components/features/SearchBar";
import { CategorySection } from "@/components/sections/CategorySection";
import { MealSection } from "@/components/sections/MealSection";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useMenuCategories } from "@/features/menu/hooks/useMenuCategories";
import { useCart } from "@/hooks/useCart";
import { usePaginatedFoods } from "@/hooks/use-paginated-foods";
import { useTheme } from "@/providers/theme-provider";
import { Toast } from "@/components/ui/Toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useDeferredValue, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const insets = useSafeAreaInsets();
  const { mode, colors } = useTheme();
  const [query, setQuery] = useState(params.query ?? "");
  const deferredQuery = useDeferredValue(query);
  const [page, setPage] = useState(0);
  const { error, foods: results, loading, pageCount, total } = usePaginatedFoods({
    page,
    query: deferredQuery,
    sort: "name-asc",
  });
  const { categories } = useMenuCategories();
  const { add } = useCart();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <Toast
        message={toastMsg ?? ""}
        visible={toastMsg !== null}
        onClose={() => setToastMsg(null)}
        autoDismissMs={2000}
      />

      <CustomerHeader title="Search" showBack rightIcons="cart" />

      {/* ── Scrollable body ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces
      >
        <SearchBar
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            setPage(0);
          }}
        />

        {/* ── Categories section ── */}
        <CategorySection
          categories={categories}
          actionLabel="Sort By"
          onAction={() => router.push("/menu")}
          onSelectCategory={(category) => router.push(`/menu?category=${encodeURIComponent(category.name)}` as never)}
        />

        {/* ── Results section ── */}
        {loading || results.length > 0 ? (
          <MealSection
            title="RESULTS"
            emptyText={error ?? "No results found"}
            foods={results}
            layout="list"
            loading={loading}
            onOpenFood={(food) => router.push(`/product?id=${food.id}` as never)}
            onAddToCart={(food) => { add(food); setToastMsg("Added to cart"); }}
          />
        ) : (
          <View style={styles.emptySection}>
            <View style={styles.emptyState}>
              <PhosphorIcon name="search-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{error ?? `No results for "${query}"`}</Text>
            </View>
          </View>
        )}

        {!loading && !error && total > 0 ? (
          <View style={styles.pagination}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous search results page"
              disabled={page === 0}
              onPress={() => setPage((current) => Math.max(0, current - 1))}
              style={[styles.pageButton, { borderColor: colors.border }, page === 0 && styles.pageButtonDisabled]}
            >
              <PhosphorIcon name="chevron-back" size={16} color={Colors.textPrimary} />
              <Text style={styles.pageButtonText}>Previous</Text>
            </Pressable>

            <Text style={styles.pageStatus} accessibilityLiveRegion="polite">
              {page + 1} of {pageCount} · {total} products
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next search results page"
              disabled={page + 1 >= pageCount}
              onPress={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              style={[
                styles.pageButton,
                { borderColor: colors.border },
                page + 1 >= pageCount && styles.pageButtonDisabled,
              ]}
            >
              <Text style={styles.pageButtonText}>Next</Text>
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

  // ── Scroll content ──
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.xxxl,
  },

  emptySection: {
    width: "100%",
  },
  // ── Empty state ──
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl * 2,
    gap: Spacing.lg,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
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
