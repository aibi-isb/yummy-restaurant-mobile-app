import { PhosphorIcon } from "@/components/PhosphorIcon";
import { CustomerHeader } from "@/components/features/CustomerHeader";
import { CartItem } from "@/components/features/CartItem";
import { CardSurface } from "@/components/ui/CardSurface";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useCart } from "@/hooks/useCart";
import { useTheme } from "@/providers/theme-provider";
import { createOrder } from "@/services/orderService";
import { useAuthStore } from "@/store/authStore";
import { formatLeones } from "@/utils/format";
import { isValidPhone, normalizePhone, requireFields, sanitizePhoneInput } from "@/utils/validation";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FIGMA_CONTENT_WIDTH = 344;

// ─── Small reusable input row ─────────────────────────────────────────────────
function InputRow({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View style={inputRowStyles.row}>
      <Text style={inputRowStyles.label}>{label}</Text>
      <TextInput
        style={inputRowStyles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? "default"}
        accessibilityLabel={label}
      />
    </View>
  );
}

const inputRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
    width: 60,
  },
  input: {
    flex: 1,
    height: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.figmaMd,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 0,
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.06,
    lineHeight: 12,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { mode } = useTheme();
  const { user } = useAuthStore();
  const contentWidth = Math.min(FIGMA_CONTENT_WIDTH, Math.max(320, width - 46));

  // Address form state
  const [street, setStreet]   = useState("");
  const [city, setCity]       = useState("");
  const [region, setRegion]   = useState("");
  const [phone, setPhone]     = useState("");
  const [error, setError] = useState<string | null>(null);

  // Pre-fill phone from user profile
  useEffect(() => {
    const saved = user?.user_metadata?.phone as string | undefined;
    // The profile metadata can arrive after the checkout screen mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setPhone(saved);
  }, [user?.user_metadata?.phone]);

  const { items, totals, updateQuantity, remove, refresh: refreshCart } = useCart();

  const handleProceedToPayment = async () => {
    const missing = requireFields({ Street: street, City: city, Region: region, Phone: phone });
    if (missing) return setError(missing);
    if (!isValidPhone(phone)) return setError("Use +232 77 123 456 or 077 123 456.");
    if (items.length === 0) return setError("Your cart is empty.");

    const order = await createOrder({
      userId: user?.id ?? "guest",
      customerName: user?.email ?? "Customer",
      phone: normalizePhone(phone),
      address: `${street}, ${city}, ${region}`,
      items,
    });

    await refreshCart();
    router.push(`/payment?orderId=${order.id}` as never);
  };

  return (
    <View style={styles.root}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <CustomerHeader title="Checkout" showBack rightIcons="bell" />

      {/* ── Scrollable body ── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces
      >
        {/* ── Card 1: Delivery address ── */}
        <CardSurface style={[styles.card, styles.addressCard, { width: contentWidth }]}>
          {/* Location type row */}
          <View style={styles.locationRow}>
            <View style={styles.locationLeft}>
              <PhosphorIcon name="caret-down" size={12} color={Colors.textPrimary} />
              <Text style={styles.locationLabel}>Home</Text>
            </View>
            <View style={styles.locationActions}>
              {/* Edit */}
              <View style={styles.actionBtn}>
                <PhosphorIcon name="pencil" size={12} color={Colors.textPrimary} />
              </View>
              {/* Add */}
              <View style={styles.actionBtn}>
                <PhosphorIcon name="add" size={12} color={Colors.textPrimary} />
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Address fields */}
          <View style={styles.addressBlock}>
            {/* Section title */}
            <View style={styles.sectionTitle}>
              <PhosphorIcon name="location-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.sectionTitleText}>Address</Text>
            </View>

            <View style={styles.fieldGroup}>
              <InputRow
                label="Street:"
                placeholder="Street"
                value={street}
                onChangeText={setStreet}
              />
              <InputRow
                label="City:"
                placeholder="City"
                value={city}
                onChangeText={setCity}
              />
              <InputRow
                label="Region:"
                placeholder="Province or Region"
                value={region}
                onChangeText={setRegion}
              />
            </View>
          </View>

          {/* Phone field */}
          <View style={styles.phoneRow}>
            <View style={styles.phoneLabel}>
              <PhosphorIcon name="call-outline" size={12} color={Colors.textPrimary} />
              <Text style={styles.phoneLabelText}>Phone:</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="+232 00 000 000"
              placeholderTextColor={Colors.textMuted}
              value={phone}
              onChangeText={(value) => setPhone(sanitizePhoneInput(value))}
              keyboardType="phone-pad"
              maxLength={24}
              textContentType="telephoneNumber"
              accessibilityLabel="Phone number"
            />
          </View>
        </CardSurface>

        {/* ── Card 2: Order Items ── */}
        <CardSurface style={[styles.card, styles.orderItemsCard, { width: contentWidth }]}>
          <Text style={styles.cardTitle}>Order Items</Text>
          <View style={styles.cartItems}>
            {items.map((item) => (
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
            ))}
          </View>
        </CardSurface>

        {/* ── Card 3: Order Summary ── */}
        <CardSurface style={[styles.card, styles.summaryCard, { width: contentWidth }]}>
          <Text style={styles.summaryTitle}>Order summary</Text>

          {/* Line items */}
          <View style={styles.lineItems}>
            {items.map((line) => (
              <View key={line.id} style={styles.lineRow}>
                <View style={styles.lineLeft}>
                  <Text style={styles.lineQty}>{line.quantity}</Text>
                  <Text style={styles.lineX}>x</Text>
                  <Text style={styles.lineName}>{line.name}</Text>
                </View>
                <Text style={styles.linePrice}>{formatLeones(line.price)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Fees */}
          <View style={styles.feesBlock}>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Sub Total</Text>
              <Text style={styles.feeValue}>{formatLeones(totals.subtotal)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Delivery Fee</Text>
              <Text style={styles.feeValue}>{formatLeones(totals.deliveryFee)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>GST</Text>
              <Text style={styles.feeValue}>{formatLeones(totals.tax)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatLeones(totals.total)}</Text>
          </View>
        </CardSurface>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* ── Card 4: Proceed To Payment ── */}
        <CardSurface style={[styles.card, styles.paymentCard, { width: contentWidth }]}>
          <Pressable
            style={({ pressed }) => [styles.payBtn, pressed && { opacity: 0.8 }]}
            onPress={handleProceedToPayment}
            accessibilityRole="button"
            accessibilityLabel="Proceed To Payment"
          >
            <Text style={styles.payBtnText}>Proceed To Payment</Text>
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
  errorText: {
    width: "100%",
    maxWidth: FIGMA_CONTENT_WIDTH,
    alignSelf: "center",
    color: Colors.danger,
    fontSize: 13,
    fontWeight: "600",
  },

  // ── Scroll content ──
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 23,
    paddingTop: 0,
    gap: 32,
  },

  // ── Card ──
  card: {
    paddingHorizontal: 35,
    paddingVertical: 24,
  },
  addressCard: {
    gap: 28,
  },
  orderItemsCard: {
    gap: 10,
    paddingHorizontal: 33.5,
  },
  summaryCard: {
    paddingHorizontal: 43,
    gap: 32,
  },
  paymentCard: {
    paddingHorizontal: 35,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    alignSelf: "stretch",
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },

  // ── Delivery address card internals ──
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  locationLabel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 26,
    width: 110,
  },
  locationActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  addressBlock: {
    gap: 14,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  sectionTitleText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 30,
  },
  fieldGroup: {
    gap: 14,
    paddingLeft: 28,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  phoneLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: 76,
  },
  phoneLabelText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 26,
  },
  phoneInput: {
    flex: 1,
    height: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.figmaMd,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.06,
    lineHeight: 12,
  },
  cartItems: {
    alignSelf: "stretch",
    gap: 12,
  },

  // ── Order summary card internals ──
  summaryTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 28,
    alignSelf: "stretch",
  },
  lineItems: {
    gap: 12,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  lineQty: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  lineX: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  lineName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    flexShrink: 1,
  },
  linePrice: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "right",
  },
  feesBlock: {
    gap: 9,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  feeLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 19,
  },
  feeValue: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 19,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 27,
  },
  totalValue: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 27,
    textAlign: "right",
  },

  // ── Payment button ──
  payBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.navbar,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  payBtnText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
