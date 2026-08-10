import { PhosphorIcon } from "@/components/PhosphorIcon";
import { CustomerHeader } from "@/components/features/CustomerHeader";
import { CartItem } from "@/components/features/CartItem";
import { CardSurface } from "@/components/ui/CardSurface";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useCart } from "@/hooks/useCart";
import { useTheme } from "@/providers/theme-provider";
import { formatLeones } from "@/utils/format";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DELIVERY_LABEL = "Delivery partner fee for 8km";

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { mode } = useTheme();
  const cardWidth = Math.min(327, width - 40);

  const { items, totals, remove, updateQuantity } = useCart();

  return (
    <View style={styles.root}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <CustomerHeader title="Cart" showBack rightIcons="bell" />

      {/* ── Scrollable body ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Order Summary card ── */}
        <CardSurface style={[styles.card, { width: cardWidth }]}>
          <Text style={styles.cardTitle}>Order summary</Text>

          {items.length === 0 ? (
            <View style={styles.emptyCart}>
              <PhosphorIcon name="bag-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Your cart is empty</Text>
            </View>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onDelete={remove}
                onIncrement={(id) => {
                  const item = items.find((cartItem) => cartItem.id === id);
                  if (item) void updateQuantity(id, item.quantity + 1);
                }}
                onDecrement={(id) => {
                  const item = items.find((cartItem) => cartItem.id === id);
                  if (item) void updateQuantity(id, item.quantity - 1);
                }}
              />
            ))
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Total row */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatLeones(totals.subtotal)}</Text>
          </View>
        </CardSurface>

        {/* ── Pricing breakdown card ── */}
        <CardSurface style={[styles.priceCard, { width: cardWidth }]}>
          {/* Subtotal */}
          <View style={styles.priceRow}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text style={styles.subtotalValue}>{formatLeones(totals.subtotal)}</Text>
          </View>

          {/* Divider line (matches Figma background asset) */}
          <View style={styles.priceDivider} />

          {/* GST */}
          <View style={styles.priceRow}>
            <Text style={styles.feeLabelBold}>GST</Text>
            <Text style={styles.feeValue}>{formatLeones(totals.tax)}</Text>
          </View>

          {/* Delivery */}
          <View style={styles.priceRow}>
            <Text style={styles.feeLabel}>{DELIVERY_LABEL}</Text>
            <Text style={styles.feeValue}>{formatLeones(totals.deliveryFee)}</Text>
          </View>

          {/* Divider */}
          <View style={styles.priceDivider} />

          {/* Grand total */}
          <View style={styles.priceRow}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <Text style={styles.grandValue}>{formatLeones(totals.total)}</Text>
          </View>
        </CardSurface>

        {/* ── Proceed to checkout ── */}
        <CardSurface style={[styles.checkoutCard, { width: cardWidth }]}>
          <Pressable
            style={({ pressed }) => [
              styles.checkoutBtn,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => router.push("/checkout")}
            disabled={items.length === 0}
            accessibilityRole="button"
            accessibilityLabel="Proceed To Checkout"
          >
            <Text style={styles.checkoutText}>Proceed To Checkout</Text>
          </Pressable>
        </CardSurface>
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
    alignItems: "center",
    paddingTop: 0,
    gap: Spacing.xxxl,
  },

  // ── Card ──
  card: {
    paddingHorizontal: 18,
    paddingVertical: Spacing.xl,
    gap: 19,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    width: "100%",
  },

  // ── Total row ──
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
  },
  totalValue: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
  },

  // ── Pricing breakdown ──
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceCard: {
    height: 276,
    paddingHorizontal: 18,
    paddingTop: 41,
    paddingBottom: 42,
    justifyContent: "space-between",
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  subtotalLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  subtotalValue: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "800",
  },
  feeLabelBold: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  feeLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "400",
    flex: 1,
  },
  feeValue: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "right",
  },
  grandLabel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  grandValue: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "400",
  },

  // ── Checkout button ──
  checkoutCard: {
    paddingHorizontal: 35,
    paddingVertical: 24,
  },
  checkoutBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.navbar,
    height: 52,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  // ── Empty cart ──
  emptyCart: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: "400",
  },
});
