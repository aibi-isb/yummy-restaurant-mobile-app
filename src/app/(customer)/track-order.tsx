import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Toast } from "@/components/ui/Toast";
import { CardSurface } from "@/components/ui/CardSurface";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTracking } from "@/hooks/useTracking";
import { useTheme } from "@/providers/theme-provider";
import { useAuthStore } from "@/store/authStore";
import { formatLeones } from "@/utils/format";
import TrackingMap from "@/components/features/TrackingMap";
import { CUSTOMER_HOME_ROUTE } from "@/lib/routes";
import { formatAdditionalItemLabel, getOrderFoodSummary } from "@/utils/order-presentation";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StepStatus = "done" | "active" | "pending";

function StepDot({ status }: { status: StepStatus }) {
  const bg =
    status === "done"    ? Colors.green :
    status === "active"  ? Colors.green :
                           Colors.border;
  return (
    <View style={[stepStyles.dot, { backgroundColor: bg }]}>
      {status !== "pending" ? (
        <PhosphorIcon name="checkmark" size={12} color="#fff" />
      ) : (
        <PhosphorIcon name="ellipse-outline" size={10} color={Colors.textMuted} />
      )}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

function DetailRow({
  label,
  primary,
  secondary,
  children,
}: {
  label: string;
  primary?: string;
  secondary?: string;
  children?: React.ReactNode;
}) {
  return (
    <View>
      <View style={detailStyles.row}>
        <Text style={detailStyles.label}>{label}</Text>
        {children ? (
          children
        ) : (
          <View style={detailStyles.valueCol}>
            {primary   && <Text style={detailStyles.primary}>{primary}</Text>}
            {secondary && <Text style={detailStyles.secondary}>{secondary}</Text>}
          </View>
        )}
      </View>
      <View style={detailStyles.divider} />
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.xl,
  },
  label: {
    width: 92,
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    marginTop: 1,
  },
  valueCol: {
    flex: 1,
    gap: 4,
  },
  primary: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  secondary: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
});

export default function TrackOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { mode, colors } = useTheme();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const { config, order, loading } = useTracking(user?.id, params.orderId);
  const foodSummary = getOrderFoodSummary(order?.items);

  const activeIndex = useMemo(() => {
    if (!order || !config) return 0;
    const idx = config.trackingStepLabels.findIndex((s) =>
      s.statuses.includes(order.status)
    );
    return Math.max(0, idx);
  }, [order, config]);

  const steps = useMemo(() => {
    if (!config || !order) return [];
    return config.trackingStepLabels.map((s, i) => ({
      label: s.label,
      status: (i < activeIndex ? "done" : i === activeIndex ? "active" : "pending") as StepStatus,
    }));
  }, [config, order, activeIndex]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = useMemo(() => {
    if (!order?.estimatedDeliveryAt) return null;
    return Math.max(0, new Date(order.estimatedDeliveryAt).getTime() - now);
  }, [order, now]);

  const countdownDisplay = useMemo(() => {
    if (remaining === null) return null;
    if (remaining <= 0) return "Arriving";
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [remaining]);

  const [showTrackingToast, setShowTrackingToast] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowTrackingToast(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!loading && !order) {
    return (
      <View style={[styles.root, styles.centered]}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <PhosphorIcon name="location-outline" size={48} color={Colors.textMuted} />
        <Text style={styles.noOrderTitle}>No Active Order</Text>
        <Text style={styles.noOrderSubtitle}>Place an order first to track its delivery status.</Text>
        <Pressable style={styles.backToHomeBtn} onPress={() => router.replace(CUSTOMER_HOME_ROUTE)}>
          <Text style={styles.backToHomeText}>Browse Menu</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <Toast
        message={config?.trackingToastMessage ?? "Your Order is being tracked"}
        visible={showTrackingToast}
        onClose={() => setShowTrackingToast(false)}
        autoDismissMs={3000}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.lg }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {config && (
          <TrackingMap
            origin={config.demoOrigin}
            destination={config.demoDestination}
            height={504}
          />
        )}

        {!config && (
          <View style={[styles.mapPlaceholder, { paddingTop: insets.top + 60, backgroundColor: colors.card, borderColor: colors.cardBorder, boxShadow: colors.cardShadow }]}> 
            <Text style={styles.mapPlaceholderText}>Loading tracking data…</Text>
          </View>
        )}

        {/* Back button floating over map */}
        <Pressable
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <PhosphorIcon name="chevron-back" size={22} color={Colors.textPrimary} />
        </Pressable>

        <View style={styles.body}>
          <CardSurface style={styles.orderSummaryCard}>
            <Text style={styles.orderFoodName} numberOfLines={2}>{foodSummary.primaryItemName}</Text>
            <Text style={styles.orderFoodMeta}>{formatAdditionalItemLabel(foodSummary)}</Text>
            <Text style={styles.orderIdMeta} selectable>Order ID · {order?.id}</Text>
          </CardSurface>

          <CardSurface style={styles.card}>
            <Text style={styles.estLabel}>Estimated delivery</Text>
            <View style={styles.countdownRow}>
              <Text style={styles.countdownTime}>
                {countdownDisplay ?? "—:—"}
              </Text>
              <Text style={styles.countdownSuffix}>
                {remaining !== null && remaining > 0 ? "  mins  remaining" : ""}
              </Text>
            </View>

            {steps.length > 0 && (
              <View style={styles.stepsRow}>
                {steps.map((step, i) => (
                  <View key={step.label} style={styles.stepWrap}>
                    {i > 0 && <View style={styles.connector} />}
                    <View style={styles.stepItem}>
                      <StepDot status={step.status} />
                      <Text
                        style={[
                          styles.stepLabel,
                          step.status === "pending" && styles.stepLabelPending,
                        ]}
                      >
                        {step.label}
                      </Text>
                    </View>
                    {i < steps.length - 1 && <View style={styles.connectorRight} />}
                  </View>
                ))}
              </View>
            )}
          </CardSurface>

          <CardSurface style={styles.card}>
            <DetailRow label="Delivery partner">
              <View style={styles.partnerRow}>
                <View style={styles.partnerAvatar}>
                  <PhosphorIcon name="person" size={20} color={Colors.textMuted} />
                </View>
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>
                    {order?.deliveryPartnerName ?? "Delivery Partner"}
                  </Text>
                  <Text style={styles.partnerPhone}>
                    {order?.deliveryPartnerPhone ?? "—"}
                  </Text>
                </View>
                <Pressable
                  style={styles.callBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Call delivery partner"
                >
                  <PhosphorIcon name="call-outline" size={20} color={Colors.green} />
                </Pressable>
              </View>
            </DetailRow>

            <DetailRow
              label="Payment"
              primary={order?.paymentStatus ?? "Unpaid"}
              secondary={order?.status ?? "Pending"}
            />

            <DetailRow
              label="Delivery time"
              primary={order?.status === "Delivered" ? "Delivered" : "Delivery to Home"}
              secondary={order?.address ?? "Add delivery address at checkout"}
            />

            <View>
              <View style={styles.myOrderHeader}>
                <Text style={styles.myOrderLabel}>My Order</Text>
                <Text style={styles.myOrderCount}>{order?.items.length ?? 0} items</Text>
              </View>

              <CardSurface style={styles.orderCard}>
                {(order?.items ?? []).map((line) => (
                  <View key={line.id} style={styles.lineRow}>
                    <View style={styles.lineLeft}>
                      <Text style={styles.lineQty}>{line.quantity}</Text>
                      <Text style={styles.lineX}>x</Text>
                      <Text style={styles.lineName}>{line.name}</Text>
                    </View>
                    <Text style={styles.linePrice}>{formatLeones(line.price)}</Text>
                  </View>
                ))}

                <View style={styles.orderDivider} />

                {[
                  { label: "Sub Total",    value: formatLeones(order?.subtotal ?? 0) },
                  { label: "Delivery Fee", value: formatLeones(order?.deliveryFee ?? 0) },
                  { label: "GST",          value: formatLeones(order?.tax ?? 0) },
                ].map((row) => (
                  <View key={row.label} style={styles.feeRow}>
                    <Text style={styles.feeLabel}>{row.label}</Text>
                    <Text style={styles.feeValue}>{row.value}</Text>
                  </View>
                ))}

                <View style={styles.orderDivider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatLeones(order?.total ?? 0)}</Text>
                </View>
              </CardSurface>
            </View>
          </CardSurface>

        </View>
      </ScrollView>
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
  noOrderTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginTop: Spacing.md,
  },
  noOrderSubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  backToHomeBtn: {
    marginTop: Spacing.lg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  backToHomeText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  mapPlaceholder: {
    width: "100%",
    height: 504,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  mapPlaceholderText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  backBtn: {
    position: "absolute",
    left: Spacing.xl,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xxxl,
    gap: Spacing.xxxl,
  },
  orderSummaryCard: {
    gap: Spacing.xs,
    padding: Spacing.lg,
  },
  orderFoodName: {
    color: Colors.textPrimary,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
  },
  orderFoodMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  orderIdMeta: {
    color: Colors.textDisabled,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },
  card: {
    paddingHorizontal: 35,
    paddingVertical: Spacing.xxl,
    gap: Spacing.xxl,
  },
  estLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  countdownRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  countdownTime: {
    color: Colors.textPrimary,
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 40,
  },
  countdownSuffix: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 15,
    marginLeft: 8,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 8,
  },
  stepWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepItem: {
    alignItems: "center",
    gap: 6,
  },
  connector: {
    flex: 1,
    height: 2,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    marginTop: 13,
    marginHorizontal: 4,
  },
  connectorRight: {
    flex: 1,
    height: 2,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.border,
    marginTop: 13,
    marginHorizontal: 4,
  },
  stepLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
  },
  stepLabelPending: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  partnerRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  partnerInfo: {
    flex: 1,
    gap: 2,
  },
  partnerName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  partnerPhone: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 19,
  },
  callBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  myOrderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  myOrderLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "400",
  },
  myOrderCount: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },
  orderCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    gap: Spacing.lg,
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
    width: 16,
    textAlign: "right",
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
  },
  linePrice: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    textAlign: "right",
  },
  orderDivider: {
    height: 1,
    backgroundColor: Colors.divider,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  feeLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 19,
  },
  feeValue: {
    color: Colors.textSecondary,
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
});
