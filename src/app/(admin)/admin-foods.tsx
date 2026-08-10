import { PhosphorIcon } from "@/components/PhosphorIcon";
import { AdminFoodCard } from "@/features/admin/components/admin-food-card";
import { AdminFoodsToolbar } from "@/features/admin/components/admin-foods-toolbar";
import { AdminMenuComparisonCard } from "@/features/admin/components/admin-menu-comparison-card";
import { useFoods } from "@/hooks/useFoods";
import { Colors, Spacing } from "@/constants/theme";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAdminTheme } from "@/providers/theme-provider";

export default function AdminFoodsScreen() {
  const { colors } = useAdminTheme();
  const { error, foods, loading } = useFoods();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const filteredFoods = useMemo(() => {
    const term = query.trim().toLowerCase();
    return foods.filter((food) => !term || [food.name, food.category, ...food.categories].join(" ").toLowerCase().includes(term));
  }, [foods, query]);
  const pageCount = Math.max(1, Math.ceil(filteredFoods.length / pageSize));
  const pageFoods = filteredFoods.slice((page - 1) * pageSize, page * pageSize);
  const menu = pageFoods.map((food) => ({
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
  }));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
      <Stack.Screen options={{ title: "Foods" }} />
      <StatusBar style="light" />

      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <AdminFoodsToolbar query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }} viewMode={viewMode} onViewModeChange={setViewMode} />

        {loading ? <Text style={[styles.stateText, { color: colors.textMuted }]}>Loading foods…</Text> : null}
        {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
        {!loading && !error && !filteredFoods.length ? <Text style={[styles.stateText, { color: colors.textMuted }]}>No foods match the search.</Text> : null}

        <View style={[styles.menuList, viewMode === "grid" && styles.gridList]}>
          {menu.map((item) => (
            <AdminFoodCard key={item.id} item={item} viewMode={viewMode} />
          ))}
        </View>

        <View style={styles.paginationRow}>
          <Text style={styles.paginationText} selectable>
            Showing {pageFoods.length} from {filteredFoods.length} Menu
          </Text>
          <View style={styles.pagination}>
            <PaginationButton icon="chevron-back" disabled={page <= 1} onPress={() => setPage((value) => Math.max(1, value - 1))} />
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => <PaginationButton key={value} label={`${value}`} active={value === page} onPress={() => setPage(value)} />)}
            <PaginationButton icon="chevron-forward" disabled={page >= pageCount} onPress={() => setPage((value) => Math.min(pageCount, value + 1))} />
          </View>
        </View>

        <AdminMenuComparisonCard data={["featured", "popular", "available"].map((key, index) => ({
          id: key,
          label: key[0].toUpperCase() + key.slice(1),
          percent: foods.length ? Math.round((foods.filter((food) => key === "available" ? food.available : Boolean(food[key as "featured" | "popular"])).length / foods.length) * 100) : 0,
          color: [colors.accent, colors.danger, colors.orange][index],
        }))} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PaginationButton({
  active,
  disabled,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  disabled?: boolean;
  icon?: "chevron-back" | "chevron-forward";
  label?: string;
  onPress?: () => void;
}) {
  const { colors } = useAdminTheme();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.pageButton,
        { borderColor: colors.inputBorder },
        active && { backgroundColor: colors.accent, borderColor: colors.accent },
        disabled && styles.pageButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label ? `Go to page ${label}` : icon === "chevron-back" ? "Previous page" : "Next page"}
      onPress={onPress}
    >
      {icon ? (
        <PhosphorIcon name={icon} size={14} color={disabled ? colors.textDisabled : colors.textMuted} />
      ) : (
        <Text style={[styles.pageLabel, { color: active ? colors.onDanger : colors.textMuted }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: 14,
    gap: 18,
    paddingBottom: 24,
  },
  menuList: {
    gap: 14,
  },
  gridList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paginationRow: {
    minHeight: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  paginationText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 14,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  pageButton: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  pageButtonDisabled: {
    opacity: 0.3,
  },
  pageLabel: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  pressed: {
    opacity: 0.76,
  },
  stateText: { fontSize: 13 },
  errorText: { fontSize: 13, fontWeight: "700" },
});
