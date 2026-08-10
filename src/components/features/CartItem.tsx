/**
 * CartItem
 * Matches Figma node "Cart Product" (2274:2274).
 * Horizontal row: product image | name / price / qty text |
 * delete button (red) + qty stepper (–  n  +).
 */
import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CartItemType = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type CartItemProps = {
  item: CartItemType;
  onDelete: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
};

export function CartItem({ item, onDelete, onIncrement, onDecrement }: CartItemProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
      boxShadow: colors.cardShadow,
    }]}>
      {/* Product image */}
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        accessibilityLabel={`Photo of ${item.name}`}
      />

      {/* Name / price / qty */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.price}>Price: Le {item.price}</Text>
        <Text style={styles.qty}>Qty: {item.quantity}</Text>
      </View>

      <View style={styles.actionsColumn}>
        <Pressable
          style={styles.deleteBtn}
          onPress={() => onDelete(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.name} from cart`}
        >
          <PhosphorIcon name="trash-outline" size={12} color="#fff" />
        </Pressable>

        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => onDecrement(item.id)}
            accessibilityRole="button"
            accessibilityLabel="Decrease quantity"
          >
            <PhosphorIcon name="remove-outline" size={12} color={Colors.textPrimary} />
          </Pressable>

          <View style={styles.stepValueWrap}>
            <Text style={styles.stepValue}>{item.quantity}</Text>
          </View>

          <Pressable
            style={styles.stepBtn}
            onPress={() => onIncrement(item.id)}
            accessibilityRole="button"
            accessibilityLabel="Increase quantity"
          >
            <PhosphorIcon name="add-outline" size={12} color={Colors.textPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    height: 72,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.figmaMd,
    borderCurve: "continuous",
    overflow: "hidden",
  },

  // Image
  image: {
    width: 100,
    height: 72,
  },

  // Text block
  details: {
    flex: 1,
    paddingLeft: 6,
    gap: 4,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 16,
    letterSpacing: 0.06,
  },
  price: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.06,
  },
  qty: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.06,
  },

  // Actions column (delete + stepper)
  actionsColumn: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    paddingRight: 4,
  },

  // Delete
  deleteBtn: {
    width: 42,
    height: 18,
    borderRadius: Radius.figmaMd,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  // Stepper
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.figmaMd,
    overflow: "hidden",
  },
  stepBtn: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValueWrap: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stepValue: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.06,
    lineHeight: 13,
  },
});
