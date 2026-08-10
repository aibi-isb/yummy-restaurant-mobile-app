import { PhosphorIcon } from "@/components/PhosphorIcon";
import { CardSurface } from "@/components/ui/CardSurface";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { CUSTOMER_HOME_ROUTE } from "@/lib/routes";
import { usePaymentConfig } from "@/hooks/usePaymentConfig";
import { getOrders, Order } from "@/services/orderService";
import { createPayment } from "@/services/paymentService";
import { getProfile } from "@/services/supabase/userService";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/providers/theme-provider";
import { formatLeones } from "@/utils/format";
import { formatAdditionalItemLabel, getOrderFoodSummary } from "@/utils/order-presentation";
import {
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidCVV,
  isValidExpiry,
  isValidPhone,
  normalizePhone,
  sanitizePhoneInput,
} from "@/utils/validation";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function NetworkPicker({
  selected,
  networks,
  onSelect,
  onClose,
  visible,
}: {
  selected: string;
  networks: string[];
  onSelect: (n: string) => void;
  onClose: () => void;
  visible: boolean;
}) {
  const { colors } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.modalBackdrop, { backgroundColor: colors.scrim }]} onPress={onClose} />
      <View style={styles.modalContent} pointerEvents="box-none">
        <CardSurface style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Network</Text>
          {networks.map((network) => (
            <Pressable
              key={network}
              style={[styles.modalOption, network === selected && styles.modalOptionSelected]}
              onPress={() => {
                onSelect(network);
                onClose();
              }}
            >
              <Text style={[styles.modalOptionText, network === selected && styles.modalOptionTextSelected]}>
                {network}
              </Text>
            </Pressable>
          ))}
        </CardSurface>
      </View>
    </Modal>
  );
}

function SuccessAnimation({ visible }: { visible: boolean }) {
  const scale = useMemo(() => new Animated.Value(0), []);
  const opacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [opacity, scale, visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.successCircle, { transform: [{ scale }], opacity }]}>
      <PhosphorIcon name="checkmark" size={40} color="#fff" />
    </Animated.View>
  );
}

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const { user } = useAuthStore();
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { config } = usePaymentConfig();
  const progressSteps = config?.progressSteps ?? ["Cart", "Checkout", "Payment", "Confirmation"];

  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [method, setMethod] = useState<"mobile_money" | "bank_card" | null>(null);
  const [mobileNumber, setMobileNumber] = useState("");
  const [network, setNetwork] = useState("");
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [savedCardLast4, setSavedCardLast4] = useState("");
  const [error, setError] = useState<string | null>(null);
  const activeProgressIndex = success ? Math.min(3, progressSteps.length - 1) : 2;

  useEffect(() => {
    getOrders()
      .then((orders) => {
        const found = orders.find((o) => o.id === params.orderId) ?? orders[0];
        setOrder(found ?? null);
      })
      .catch(() => setError("Failed to load order."))
      .finally(() => setOrderLoading(false));
  }, [params.orderId]);

  // Pre-fill Mobile Money number from order phone
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (order?.phone) setMobileNumber(order.phone);
  }, [order?.phone]);

  // Pre-fill network & card info from saved profile
  useEffect(() => {
    if (!user?.id) return;
    getProfile(user.id)
      .then((profile) => {
        if (!profile) return;
        if (profile.primaryNetwork) setNetwork(profile.primaryNetwork);
        if (profile.cardHolder) setCardHolder(profile.cardHolder);
        if (profile.cardLast4) setSavedCardLast4(profile.cardLast4);
        if (profile.cardExpiry) setExpiry(profile.cardExpiry);
      })
      .catch(() => {});
  }, [user?.id]);

  const itemCount = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [order]);
  const foodSummary = useMemo(() => getOrderFoodSummary(order?.items), [order]);

  const isFormValid = useMemo(() => {
    if (!method) return false;
    if (method === "mobile_money") {
      return isValidPhone(mobileNumber) && network.length > 0;
    }
    if (method === "bank_card") {
      return (
        cardHolder.trim().length > 0 &&
        isValidCardNumber(cardNumber) &&
        isValidExpiry(expiry) &&
        isValidCVV(cvv)
      );
    }
    return false;
  }, [method, mobileNumber, network, cardHolder, cardNumber, expiry, cvv]);

  const fieldErrors = useMemo(() => {
    const cardDigits = cardNumber.replace(/\D/g, "");
    const expiryDigits = expiry.replace(/\D/g, "");
    const cvvDigits = cvv.replace(/\D/g, "");

    return {
      mobileNumber:
        method === "mobile_money" && mobileNumber.length > 0 && !isValidPhone(mobileNumber)
          ? "Use +232 77 123 456 or 077 123 456."
          : null,
      cardNumber:
        method === "bank_card" && cardDigits.length >= 13 && !isValidCardNumber(cardNumber)
          ? "Enter 13–16 digits."
          : null,
      expiry:
        method === "bank_card" && expiryDigits.length === 4 && !isValidExpiry(expiry)
          ? "Enter a current or future expiry in MM/YY format."
          : null,
      cvv:
        method === "bank_card" && cvvDigits.length > 0 && !isValidCVV(cvv)
          ? "Enter 3 or 4 digits."
          : null,
    };
  }, [cardNumber, cvv, expiry, method, mobileNumber]);

  const handleSubmit = useCallback(async () => {
    if (!order || !method) return;
    setSubmitting(true);
    setError(null);

    try {
      await createPayment({
        orderId: order.id,
        userId: user?.id ?? order.userId,
        amount: order.total,
        method: method === "bank_card" ? "credit_card" : "mobile_money",
        provider: method === "mobile_money" ? network : "bank_card",
        phone: method === "mobile_money" ? normalizePhone(mobileNumber) : undefined,
        cardLast4: method === "bank_card" ? cardNumber.replace(/\D/g, "").slice(-4) : undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [order, method, user, mobileNumber, network, cardNumber]);

  const handleCardNumberChange = useCallback((text: string) => {
    setCardNumber(formatCardNumber(text));
  }, []);

  const handleExpiryChange = useCallback((text: string) => {
    setExpiry(formatExpiry(text));
  }, []);

  const handleMobileNumberChange = useCallback((text: string) => {
    setMobileNumber(sanitizePhoneInput(text));
  }, []);

  const handleCvvChange = useCallback((text: string) => {
    setCvv(text.replace(/\D/g, "").slice(0, 4));
  }, []);

  if (orderLoading) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <PhosphorIcon name="alert-circle-outline" size={48} color={Colors.danger} />
        <Text style={styles.errorTitle}>No Order Found</Text>
        <Text style={styles.errorSubtitle}>Please go back to checkout and create an order first.</Text>
        <Pressable style={styles.backToCheckoutBtn} onPress={() => router.back()}>
          <Text style={styles.backToCheckoutText}>Back to Checkout</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

        <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background, borderBottomColor: colors.divider }]}> 
        <View style={styles.headerTop}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back">
            <PhosphorIcon name="chevron-back" size={22} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Payment</Text>
            <PhosphorIcon name="lock-closed" size={16} color={Colors.green} />
          </View>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.progressRow}>
          {progressSteps.map((step, index) => {
            const current = index === activeProgressIndex;
            const done = index < activeProgressIndex;
            return (
              <View key={step} style={styles.progressStep}>
                <View style={[styles.progressDot, (current || done) && styles.progressDotActive]}>
                  {done && <PhosphorIcon name="checkmark" size={10} color="#fff" />}
                  {current && <View style={styles.progressDotInner} />}
                </View>
                <Text style={[styles.progressLabel, (current || done) && styles.progressLabelActive]}>
                  {step}
                </Text>
                {index < progressSteps.length - 1 && (
                  <View style={[styles.progressLine, done && styles.progressLineActive]} />
                )}
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {success ? (
          <View style={styles.successContainer}>
            <SuccessAnimation visible={success} />
            <View style={styles.successTextBlock}>
              <Text style={styles.successHeading}>Payment Submitted Successfully</Text>
              <Text style={styles.successBody}>
                Thank you for your purchase.{"\n"}Your order has been successfully received and is awaiting processing.
              </Text>
            </View>
            <View style={styles.successButtons}>
              <Pressable
                style={({ pressed }) => [styles.successBtnPrimary, pressed && { opacity: 0.8 }]}
                onPress={() => router.push(`/track-order?orderId=${order?.id}`)}
              >
                <PhosphorIcon name="location-outline" size={18} color="#fff" />
                <Text style={styles.successBtnPrimaryText}>Track Order</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.successBtnSecondary, pressed && { opacity: 0.8 }]}
                onPress={() => router.replace(CUSTOMER_HOME_ROUTE)}
              >
                <PhosphorIcon name="home-outline" size={18} color={Colors.textPrimary} />
                <Text style={styles.successBtnSecondaryText}>Continue Shopping</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={isDesktop ? styles.desktopLayout : undefined}>
              <View style={isDesktop ? styles.desktopMain : undefined}>
                <CardSurface style={styles.card}>
                  <Text style={styles.cardTitle}>Order Summary</Text>
                  <View style={styles.foodSummaryBlock}>
                    <Text style={styles.foodSummaryName} numberOfLines={2}>{foodSummary.primaryItemName}</Text>
                    <Text style={styles.foodSummaryMeta}>{formatAdditionalItemLabel(foodSummary)}</Text>
                  </View>
                  <View style={styles.summaryRows}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Order ID</Text>
                      <Text style={styles.summaryValue} selectable numberOfLines={1}>{order.id}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Items</Text>
                      <Text style={styles.summaryValue}>{itemCount}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Delivery Address</Text>
                      <Text style={styles.summaryValue} numberOfLines={2}>{order.address}</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.feesBlock}>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>Subtotal</Text>
                      <Text style={styles.feeValue}>{formatLeones(order.subtotal)}</Text>
                    </View>
                    <View style={styles.feeRow}>
                      <Text style={styles.feeLabel}>Delivery Fee</Text>
                      <Text style={styles.feeValue}>{formatLeones(order.deliveryFee)}</Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatLeones(order.total)}</Text>
                  </View>
                </CardSurface>

                <Text style={styles.sectionHeading}>Payment Method</Text>
                <View style={styles.methodCards}>
                  {(config?.paymentMethods ?? []).map((pm) => {
                    const methodKey = pm.id === "credit_card" ? "bank_card" : (pm.id as "mobile_money" | "bank_card");
                    const isActive = method === methodKey;
                    return (
                      <Pressable
                        key={pm.id}
                        style={({ pressed }) => [
                          styles.methodCard,
                          { backgroundColor: colors.card, borderColor: isActive ? colors.green : colors.cardBorder, boxShadow: colors.cardShadow },
                          isActive && styles.methodCardSelected,
                          pressed && { opacity: 0.9 },
                        ]}
                        onPress={() => setMethod(methodKey)}
                        accessibilityRole="radio"
                        accessibilityLabel={pm.label}
                        accessibilityState={{ checked: isActive }}
                      >
                        <View style={styles.methodCardTop}>
                          <View style={styles.methodIconWrap}>
                            <PhosphorIcon name={pm.icon as any} size={24} color={pm.iconColor} />
                          </View>
                          <View style={styles.methodRadio}>
                            {isActive && <View style={styles.methodRadioInner} />}
                          </View>
                        </View>
                        <Text style={styles.methodLabel}>{pm.label}</Text>
                        {pm.isRecommended && pm.id !== "mobile_money" && (
                            <View style={[styles.recommendedBadge, { backgroundColor: colors.successSurface }]}>
                            <Text style={styles.recommendedText}>{pm.recommendedLabel ?? "Recommended"}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                {method === "mobile_money" && (
                  <CardSurface style={styles.card}>
                    <Text style={styles.cardTitle}>Mobile Money Details</Text>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.floatingLabel}>Mobile Number</Text>
                      <TextInput
                        style={[styles.input, fieldErrors.mobileNumber && styles.inputInvalid]}
                        placeholder="+232 00 000 000"
                        placeholderTextColor={Colors.textMuted}
                        value={mobileNumber}
                        onChangeText={handleMobileNumberChange}
                        keyboardType="phone-pad"
                        maxLength={24}
                        textContentType="telephoneNumber"
                        accessibilityLabel="Mobile Number"
                      />
                      <Text style={fieldErrors.mobileNumber ? styles.fieldError : styles.fieldHint}>
                        {fieldErrors.mobileNumber ?? "International: +232 77 123 456 · Local: 077 123 456"}
                      </Text>
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.floatingLabel}>Network</Text>
                      <Pressable
                        style={styles.pickerBtn}
                        onPress={() => setShowNetworkPicker(true)}
                      >
                        <Text style={[styles.pickerText, !network && styles.pickerPlaceholder]}>
                          {network || "Select network"}
                        </Text>
                        <PhosphorIcon name="chevron-down" size={16} color={Colors.textMuted} />
                      </Pressable>
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.floatingLabel}>Amount</Text>
                      <TextInput
                        style={[styles.input, styles.inputReadOnly]}
                        value={formatLeones(order.total)}
                        editable={false}
                        accessibilityLabel="Amount"
                      />
                    </View>

                  </CardSurface>
                )}

                {method === "bank_card" && (
                  <CardSurface style={styles.card}>
                    <Text style={styles.cardTitle}>Card Details</Text>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.floatingLabel}>Card Holder Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={Colors.textMuted}
                        value={cardHolder}
                        onChangeText={setCardHolder}
                        autoCapitalize="words"
                        accessibilityLabel="Card Holder Name"
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.floatingLabel}>Card Number</Text>
                      <View style={styles.cardInputRow}>
                        <TextInput
                          style={[styles.input, styles.cardInput, fieldErrors.cardNumber && styles.inputInvalid]}
                          placeholder="1234 5678 9012 3456"
                          placeholderTextColor={Colors.textMuted}
                          value={cardNumber}
                          onChangeText={handleCardNumberChange}
                          keyboardType="number-pad"
                          maxLength={19}
                          textContentType="creditCardNumber"
                          accessibilityLabel="Card Number"
                        />
                        <View style={styles.cardIcons}>
                          <PhosphorIcon name="card" size={20} color={Colors.textMuted} />
                        </View>
                      </View>
                      <Text style={fieldErrors.cardNumber ? styles.fieldError : styles.fieldHint}>
                        {fieldErrors.cardNumber ?? (savedCardLast4 && !cardNumber
                          ? `Saved card ending in ${savedCardLast4}; enter the full number.`
                          : "Numbers only · 13–16 digits")}
                      </Text>
                    </View>

                    <View style={styles.cardRow}>
                      <View style={[styles.fieldGroup, styles.halfField]}>
                        <Text style={styles.floatingLabel}>Expiry Date</Text>
                        <TextInput
                          style={[styles.input, fieldErrors.expiry && styles.inputInvalid]}
                          placeholder="MM/YY"
                          placeholderTextColor={Colors.textMuted}
                          value={expiry}
                          onChangeText={handleExpiryChange}
                          keyboardType="number-pad"
                          maxLength={5}
                          accessibilityLabel="Expiry Date"
                        />
                        {fieldErrors.expiry ? <Text style={styles.fieldError}>{fieldErrors.expiry}</Text> : null}
                      </View>
                      <View style={[styles.fieldGroup, styles.halfField]}>
                        <Text style={styles.floatingLabel}>CVV</Text>
                        <TextInput
                          style={[styles.input, fieldErrors.cvv && styles.inputInvalid]}
                          placeholder="123"
                          placeholderTextColor={Colors.textMuted}
                          value={cvv}
                          onChangeText={handleCvvChange}
                          keyboardType="number-pad"
                          maxLength={4}
                          secureTextEntry
                          accessibilityLabel="CVV"
                        />
                        {fieldErrors.cvv ? <Text style={styles.fieldError}>{fieldErrors.cvv}</Text> : null}
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.floatingLabel}>Amount</Text>
                      <TextInput
                        style={[styles.input, styles.inputReadOnly]}
                        value={formatLeones(order.total)}
                        editable={false}
                        accessibilityLabel="Amount"
                      />
                    </View>

                    <View style={[styles.securityBadge, { backgroundColor: colors.successSurface }]}>
                      <PhosphorIcon name="shield-checkmark" size={18} color={Colors.green} />
                      <Text style={styles.securityBadgeText}>{config?.securityBadgeText ?? "Secure Payment"}</Text>
                    </View>
                  </CardSurface>
                )}

                {method && (
                  <CardSurface style={styles.card}>
                    <Text style={styles.cardTitle}>Billing Information</Text>
                    <View style={styles.billingRows}>
                      <View style={styles.billingRow}>
                        <Text style={styles.billingLabel}>Name</Text>
                        <Text style={styles.billingValue}>{order.customerName}</Text>
                      </View>
                      <View style={styles.billingRow}>
                        <Text style={styles.billingLabel}>Email</Text>
                        <Text style={styles.billingValue}>{user?.email ?? "—"}</Text>
                      </View>
                      <View style={styles.billingRow}>
                        <Text style={styles.billingLabel}>Phone</Text>
                        <Text style={styles.billingValue}>{order.phone}</Text>
                      </View>
                      <View style={styles.billingRow}>
                        <Text style={styles.billingLabel}>Address</Text>
                        <Text style={styles.billingValue}>{order.address}</Text>
                      </View>
                    </View>
                  </CardSurface>
                )}

                {error && (
                  <View style={[styles.errorBox, { backgroundColor: colors.dangerSurface }]}>
                    <PhosphorIcon name="alert-circle" size={16} color={Colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.submitBtn,
                    (!isFormValid || submitting) && styles.submitBtnDisabled,
                    pressed && !submitting && { opacity: 0.8 },
                  ]}
                  onPress={handleSubmit}
                  disabled={!isFormValid || submitting}
                  accessibilityRole="button"
                  accessibilityLabel="Complete Payment"
                >
                  {submitting ? (
                    <View style={styles.submitBtnInner}>
                      <View style={styles.spinner} />
                      <Text style={styles.submitBtnText}>Processing...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitBtnText}>Complete Payment</Text>
                  )}
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => router.back()}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Checkout"
                >
                  <PhosphorIcon name="arrow-back" size={16} color={Colors.textMuted} />
                  <Text style={styles.secondaryBtnText}>Back to Checkout</Text>
                </Pressable>
              </View>

              {isDesktop && (
                <View style={styles.sidebar}>
                  <CardSurface style={styles.sidebarCard}>
                    <Text style={styles.sidebarTitle}>Order Items</Text>
                    {order.items.map((item) => (
                      <View key={item.id} style={styles.sidebarItem}>
                        <Image
                          source={{ uri: item.image }}
                          style={styles.sidebarItemImage}
                          contentFit="cover"
                        />
                        <View style={styles.sidebarItemInfo}>
                          <Text style={styles.sidebarItemName} numberOfLines={1}>{item.name}</Text>
                          <Text style={styles.sidebarItemMeta}>Qty: {item.quantity}</Text>
                        </View>
                        <Text style={styles.sidebarItemPrice}>{formatLeones(item.price)}</Text>
                      </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.sidebarTotalRow}>
                      <Text style={styles.sidebarTotalLabel}>Delivery Fee</Text>
                      <Text style={styles.sidebarTotalValue}>{formatLeones(order.deliveryFee)}</Text>
                    </View>
                    <View style={styles.sidebarTotalRow}>
                      <Text style={styles.sidebarTotalLabel}>Total</Text>
                      <Text style={[styles.sidebarTotalValue, styles.sidebarTotalHighlight]}>
                        {formatLeones(order.total)}
                      </Text>
                    </View>
                  </CardSurface>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      <NetworkPicker
        selected={network}
        networks={config?.mobileNetworks ?? ["Orange Money", "Afrimoney", "QMoney", "Other"]}
        visible={showNetworkPicker}
        onSelect={setNetwork}
        onClose={() => setShowNetworkPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  errorTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginTop: Spacing.md,
  },
  errorSubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  backToCheckoutBtn: {
    marginTop: Spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  backToCheckoutText: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 32,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.48,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  progressDotActive: {
    borderColor: Colors.green,
    backgroundColor: Colors.green,
  },
  progressDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textPrimary,
  },
  progressLabel: {
    color: Colors.textDisabled,
    fontSize: 10,
    fontWeight: "500",
    marginLeft: 4,
  },
  progressLabelActive: {
    color: Colors.textPrimary,
  },
  progressLine: {
    width: 24,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: Colors.green,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: 40,
  },
  card: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  sectionHeading: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  summaryRows: {
    gap: Spacing.sm,
  },
  foodSummaryBlock: {
    gap: 3,
    paddingVertical: Spacing.sm,
  },
  foodSummaryName: {
    color: Colors.textPrimary,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "800",
  },
  foodSummaryMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    flex: 1,
  },
  summaryValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  feesBlock: {
    gap: Spacing.sm,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  feeLabel: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  feeValue: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  totalValue: {
    color: Colors.green,
    fontSize: 20,
    fontWeight: "700",
  },
  methodCards: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  methodCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 2,
    borderCurve: "continuous",
  },
  methodCardSelected: {
    borderColor: Colors.green,
  },
  methodCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  methodIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  methodRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  methodRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  methodLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  recommendedBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    color: Colors.green,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldGroup: {
    gap: 6,
  },
  floatingLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderCurve: "continuous",
  },
  inputInvalid: {
    borderColor: Colors.danger,
  },
  fieldHint: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  fieldError: {
    color: Colors.danger,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },
  inputReadOnly: {
    color: Colors.textMuted,
    opacity: 0.8,
  },
  cardInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardInput: {
    flex: 1,
  },
  cardIcons: {
    position: "absolute",
    right: 12,
  },
  cardRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfField: {
    flex: 1,
  },
  pickerBtn: {
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: {
    color: Colors.textPrimary,
    fontSize: 14,
    flex: 1,
  },
  pickerPlaceholder: {
    color: Colors.textMuted,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  infoBoxText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  securityBadgeText: {
    color: Colors.green,
    fontSize: 12,
    fontWeight: "600",
  },
  billingRows: {
    gap: Spacing.sm,
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  billingLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    flex: 1,
  },
  billingValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  submitBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.green,
    borderRadius: Radius.sm,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: 12,
  },
  secondaryBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  desktopLayout: {
    flexDirection: "row",
    gap: Spacing.xxl,
  },
  desktopMain: {
    flex: 2,
    gap: 40,
  },
  sidebar: {
    flex: 1,
    minWidth: 280,
  },
  sidebarCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sidebarTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  sidebarItemImage: {
    width: 56,
    height: 56,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  sidebarItemInfo: {
    flex: 1,
  },
  sidebarItemName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  sidebarItemMeta: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  sidebarItemPrice: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  sidebarTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sidebarTotalLabel: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  sidebarTotalValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  sidebarTotalHighlight: {
    color: Colors.green,
    fontSize: 16,
    fontWeight: "700",
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: Spacing.xxl,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  successTextBlock: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  successHeading: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  successBody: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  successButtons: {
    width: "100%",
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  successBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.green,
    borderRadius: Radius.sm,
    paddingVertical: 14,
  },
  successBtnPrimaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  successBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 14,
  },
  successBtnSecondaryText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContent: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalSheet: {
    width: "100%",
    maxWidth: 340,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.xxl,
    gap: Spacing.sm,
  },
  modalTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
  },
  modalOptionSelected: {
    backgroundColor: Colors.surface,
  },
  modalOptionText: {
    color: Colors.textPrimary,
    fontSize: 15,
  },
  modalOptionTextSelected: {
    color: Colors.green,
    fontWeight: "600",
  },
  recommendedPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedPillText: {
    color: Colors.green,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
