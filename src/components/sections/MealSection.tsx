import { FoodCard } from "@/components/features/FoodCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Colors, Spacing } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { Food } from "@/services/foodService";
import { formatLeones } from "@/utils/format";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SortOption = {
  label: string;
  value: string;
};

export function MealSection({
  emptyText = "No meals available",
  foods,
  layout = "list",
  loading,
  onAddToCart,
  onOpenFood,
  onSelectSort,
  selectedSort,
  sortOptions,
  title,
}: {
  emptyText?: string;
  foods: Food[];
  layout?: "grid" | "list" | "category";
  loading?: boolean;
  onAddToCart?: (food: Food) => void;
  onOpenFood?: (food: Food) => void;
  onSelectSort?: (value: string) => void;
  selectedSort?: string;
  sortOptions?: SortOption[];
  title: string;
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const { colors } = useTheme();
  const containerStyle =
    layout === "grid" ? styles.grid : layout === "category" ? styles.categoryGrid : styles.list;

  return (
    <View style={styles.section}>
      <SectionHeader
        title={title}
        actionLabel={sortOptions?.length ? "Sort By" : null}
        onAction={() => setSortOpen((open) => !open)}
      />
      {sortOpen && sortOptions?.length ? (
        <View style={styles.sortOptions} accessibilityRole="radiogroup">
          {sortOptions.map((option) => {
            const selected = option.value === selectedSort;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  onSelectSort?.(option.value);
                  setSortOpen(false);
                }}
                style={[styles.sortOption, { borderColor: colors.border }, selected && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              >
                <Text style={[styles.sortOptionText, { color: selected ? colors.background : colors.textMuted }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {loading ? <Text style={[styles.stateText, { color: colors.textMuted }]}>Loading meals...</Text> : null}
      {!loading && foods.length === 0 ? <Text style={[styles.stateText, { color: colors.textMuted }]}>{emptyText}</Text> : null}
      <View style={containerStyle}>
        {foods.map((food) => (
          <View
            key={food.id}
            style={layout === "grid" ? styles.gridCell : layout === "category" ? styles.categoryCell : undefined}
          >
            <FoodCard
              variant={layout === "category" ? "category" : layout === "grid" ? "grid" : "list"}
              name={food.name}
              description={food.description}
              price={formatLeones(food.price)}
              image={{ uri: food.image }}
              onPress={() => onOpenFood?.(food)}
              onAddToCart={() => onAddToCart?.(food)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.xxl,
  },
  gridCell: {
    width: "39.5%",
  },
  list: {
    gap: Spacing.xxl,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "center",
    columnGap: 24,
    rowGap: 32,
  },
  categoryCell: {
    width: "46%",
  },
  stateText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  sortOption: {
    minHeight: 36,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
  },
  sortOptionSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  sortOptionText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  sortOptionTextSelected: {
    color: Colors.background,
  },
});
