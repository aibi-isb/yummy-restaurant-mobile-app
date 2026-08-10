import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { Image, type ImageProps } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type FoodCardVariant = "grid" | "list" | "category";

type FoodCardProps = {
  name: string;
  description: string;
  price: string;
  image: ImageProps["source"];
  variant?: FoodCardVariant;
  onPress?: () => void;
  onAddToCart?: () => void;
};

// ─── Grid card (home screen, 2-col) ──────────────────────────────────────────
// Full-bleed image top, dark gradient bottom info area, small cart icon btn

function GridCard({ name, description, price, image, onAddToCart, onPress }: Omit<FoodCardProps, "variant">) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={[styles.gridCard, {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        boxShadow: colors.cardShadow,
      }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${price}`}
    >
      <Image
        source={image}
        style={styles.gridImage}
        contentFit="cover"
        accessibilityLabel={`Photo of ${name}`}
      />
      <View style={[styles.gridInfo, { backgroundColor: colors.surface }]}> 
        <View style={styles.gridTextCol}>
          <Text style={[styles.gridName, { color: colors.textPrimary }]} numberOfLines={1}>{name}</Text>
          <Text style={[styles.gridDescription, { color: colors.textMuted }]} numberOfLines={1}>{description}</Text>
          <Text style={[styles.gridPrice, { color: colors.textPrimary }]}>{price}</Text>
        </View>
        <Pressable
          style={[styles.gridCartBtn, { backgroundColor: colors.border }]}
          onPress={onAddToCart}
          accessibilityRole="button"
          accessibilityLabel="Add to cart"
        >
          <PhosphorIcon name="bag-outline" size={12} color={colors.textPrimary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

// ─── Category card (categories screen, 2-col) ─────────────────────────────────
// Matches Figma node 2250:3770: dark radial-gradient bg, circular 148px image
// centered near top, text + "Order" button centered below.

function CategoryCard({ name, description, price, image, onAddToCart, onPress }: Omit<FoodCardProps, "variant">) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={[styles.catCard, {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        boxShadow: colors.cardShadow,
      }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${price}`}
    >
      {/* Circular food image */}
      <View style={[styles.catImageWrap, { backgroundColor: colors.surfaceAlt }]}> 
        <Image
          source={image}
          style={styles.catImage}
          contentFit="cover"
          accessibilityLabel={`Photo of ${name}`}
        />
      </View>

      {/* Centered info block */}
      <View style={styles.catInfo}>
        <Text style={[styles.catName, { color: colors.textPrimary }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.catDescription, { color: colors.textMuted }]} numberOfLines={1}>{description}</Text>
        <Text style={[styles.catPrice, { color: colors.textPrimary }]}>{price}</Text>

        {/* Inline "Order" button with cart icon */}
        <Pressable
          style={[styles.catOrderBtn, { backgroundColor: colors.border }]}
          onPress={onAddToCart}
          accessibilityRole="button"
          accessibilityLabel={`Order ${name}`}
        >
          <PhosphorIcon name="bag-outline" size={12} color={colors.textPrimary} />
          <Text style={[styles.catOrderText, { color: colors.textPrimary }]}>Order</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

// ─── List card (home screen horizontal section) ───────────────────────────────
// 108px tall, square image left, text middle, small cart btn right

function ListCard({ name, description, price, image, onAddToCart, onPress }: Omit<FoodCardProps, "variant">) {
  const { colors } = useTheme();
  return (
    <Pressable
      style={[styles.listCard, {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        boxShadow: colors.cardShadow,
      }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${price}`}
    >
      <Image
        source={image}
        style={styles.listImage}
        contentFit="cover"
        accessibilityLabel={`Photo of ${name}`}
      />
      <View style={styles.listTextCol}>
        <Text style={[styles.listName, { color: colors.textPrimary }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.listDescription, { color: colors.textMuted }]} numberOfLines={1}>{description}</Text>
        <Text style={[styles.listPrice, { color: colors.textPrimary }]}>{price}</Text>
      </View>
      <Pressable
        style={[styles.listCartBtn, { backgroundColor: colors.border }]}
        onPress={onAddToCart}
        accessibilityRole="button"
        accessibilityLabel="Add to cart"
      >
        <PhosphorIcon name="bag-outline" size={12} color={colors.textPrimary} />
      </Pressable>
    </Pressable>
  );
}

// ─── Public export ─────────────────────────────────────────────────────────────

export function FoodCard({ variant = "grid", ...props }: FoodCardProps) {
  if (variant === "list") return <ListCard {...props} />;
  if (variant === "category") return <CategoryCard {...props} />;
  return <GridCard {...props} />;
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Grid card ──
  gridCard: {
    flex: 1,
    height: 228,
    borderRadius: Radius.navbar,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  gridImage: {
    width: "100%",
    height: 153,
  },
  gridInfo: {
    height: 80,
    backgroundColor: Colors.surface,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 14,
    paddingBottom: 9,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  gridTextCol: {
    flex: 1,
    gap: Spacing.sm,
  },
  gridName: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
  },
  gridDescription: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: "400",
    lineHeight: 12,
    opacity: 0.6,
    letterSpacing: 0.06,
  },
  gridPrice: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 12,
    letterSpacing: 0.06,
  },
  gridCartBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },

  // ── Category card ──
  catCard: {
    width: "100%",
    height: 285,
    borderRadius: Radius.figmaMd,
    overflow: "hidden",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    paddingTop: 11,
    paddingBottom: Spacing.md,
  },
  catImageWrap: {
    width: 148,
    height: 148,
    borderRadius: 74,                  // perfect circle
    overflow: "hidden",
    backgroundColor: Colors.surfaceAlt,
  },
  catImage: {
    width: 148,
    height: 148,
  },
  catInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.md,
  },
  catName: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    textAlign: "center",
  },
  catDescription: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 13,
    opacity: 0.6,
    letterSpacing: 0.06,
    textAlign: "center",
  },
  catPrice: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 13,
    letterSpacing: 0.06,
    textAlign: "center",
  },
  catOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  catOrderText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    letterSpacing: 0.06,
  },

  // ── List card ──
  listCard: {
    height: 108,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.figmaMd,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  listImage: {
    width: 108,
    height: 108,
    borderRadius: Radius.md,
  },
  listTextCol: {
    flex: 1,
    paddingLeft: Spacing.xxl,
    paddingRight: Spacing.md,
    gap: Spacing.md,
  },
  listName: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  listDescription: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 13,
    opacity: 0.6,
    letterSpacing: 0.06,
  },
  listPrice: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 13,
    letterSpacing: 0.06,
  },
  listCartBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
});
