import { CategoryChip } from "@/components/features/CategoryChip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Spacing } from "@/constants/theme";
import { MenuCategory } from "@/features/menu/services/menuService";
import { ScrollView, StyleSheet, View } from "react-native";

export function CategorySection({
  actionLabel = "See All",
  categories,
  onAction,
  onSelectCategory,
  title = "CATEGORIES",
  variant = "round",
}: {
  actionLabel?: string | null;
  categories: MenuCategory[];
  onAction?: () => void;
  onSelectCategory?: (category: MenuCategory) => void;
  title?: string;
  variant?: "round" | "rectangular";
}) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} actionLabel={actionLabel} onAction={onAction} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={variant === "rectangular" ? styles.rectRow : styles.row}
      >
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            name={category.name}
            image={category.image}
            variant={variant}
            onPress={() => onSelectCategory?.(category)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.md,
  },
  row: {
    gap: Spacing.md,
  },
  rectRow: {
    gap: 24,
    paddingRight: 12,
  },
});
