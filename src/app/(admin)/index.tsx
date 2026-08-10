import { PhosphorIcon } from "@/components/PhosphorIcon";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { useAdminTheme } from "@/providers/theme-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DashboardMetric = {
  id: string;
  icon: string;
  value: string;
  label: string;
  delta: string;
  trend: "up" | "down";
  iconBackground: string;
  accentColor: string;
};

type DonutStat = {
  id: string;
  label: string;
  value: string;
  color: string;
};

type LinePoint = {
  label: string;
  value: number;
};

const DARK_PANEL = "#1f1f20";
const DARK_HEADER = "#1e1e1e";
const RED = "#ef2d2d";
const BLUE = "#3486ff";
const AMBER = "#ffb20f";

const METRIC_META: Record<string, { icon: string; accentColor: string }> = {
  orders: { icon: "receipt-outline", accentColor: Colors.accent },
  customers: { icon: "people-outline", accentColor: "#9aa8ff" },
  foods: { icon: "restaurant-outline", accentColor: AMBER },
  "pending-payments": { icon: "warning-outline", accentColor: Colors.orange },
  revenue: { icon: "cash-outline", accentColor: "#72e5a6" },
  delivered: { icon: "checkmark-circle-outline", accentColor: "#72e5a6" },
};

export default function AdminDashboardScreen() {
  const { dashboard, error, loading, refresh } = useAdminDashboard();
  const { colors, mode } = useAdminTheme();
  const metrics: DashboardMetric[] = dashboard.metrics.map((metric) => ({
    id: metric.id,
    icon: METRIC_META[metric.id]?.icon ?? "grid-outline",
    value: metric.value,
    label: metric.label,
    delta: metric.delta,
    trend: metric.id === "pending-payments" ? "down" : "up",
    accentColor: METRIC_META[metric.id]?.accentColor ?? Colors.accent,
    iconBackground: `${METRIC_META[metric.id]?.accentColor ?? Colors.accent}22`,
  }));
  const donuts: DonutStat[] = dashboard.metrics.slice(0, 3).map((metric, index) => ({
    id: metric.id,
    label: metric.label,
    value: metric.value,
    color: ["#ff7a1a", BLUE, RED][index] ?? RED,
  }));
  const salesMax = Math.max(1, ...dashboard.sales.map((point) => point.value));
  const currentYear = new Date().getFullYear();

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ title: "Admin Dashboard" }} />
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Welcome back to YUMMY Admin!</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.periodButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Refresh dashboard"
            onPress={refresh}
          >
            <Text style={styles.periodText}>{loading ? "Loading" : "Refresh"}</Text>
            <PhosphorIcon name={error ? "alert-circle-outline" : "refresh-outline"} size={13} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.metricGrid}>
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </View>
        {loading ? <Text style={styles.stateText}>Loading dashboard data…</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!loading && !error && !metrics.length ? <Text style={styles.stateText}>No dashboard data available.</Text> : null}

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Operational Summary</Text>
            <View style={styles.segmentedControl}>
              <Text style={styles.segmentActive}>Chart</Text>
              <Text style={styles.segmentInactive}>Show Value</Text>
            </View>
          </View>
          <View style={styles.donutRow}>
            {donuts.map((donut) => (
              <DonutChart key={donut.id} stat={donut} />
            ))}
          </View>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleCopy}>
              <Text style={styles.sectionTitle}>Chart Order</Text>
              <Text style={styles.panelSubtitle}>Sales from recorded customer transactions.</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Share dashboard report" onPress={() => void Share.share({ message: `YUMMY dashboard report\nOrders: ${dashboard.metrics.find((metric) => metric.id === "orders")?.value ?? "0"}\nRevenue: ${dashboard.metrics.find((metric) => metric.id === "revenue")?.value ?? "Le 0"}` })}>
              <PhosphorIcon name="download-outline" size={13} color={Colors.textPrimary} />
              <Text style={styles.saveButtonText}>Save Report</Text>
            </Pressable>
          </View>
          <LineChart data={dashboard.sales} color={RED} maxValue={salesMax} labels={dashboard.sales.map((point) => point.label)} />
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Total Revenue</Text>
            <View style={styles.legendRow}>
              <LegendItem color={BLUE} label={`${currentYear}`} />
              <LegendItem color={RED} label={`${currentYear - 1}`} />
            </View>
          </View>
          <MultiLineChart data={dashboard.revenueHistory} />
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>Customer Activity</Text>
            <View style={styles.chartActions}>
              <Text style={styles.weeklyPill}>Weekly</Text>
              <PhosphorIcon name="ellipsis-vertical" size={14} color={Colors.textMuted} />
            </View>
          </View>
          <CustomerMapChart data={dashboard.customerActivity} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ metric }: { metric: DashboardMetric }) {
  const { colors } = useAdminTheme();
  const trendColor = metric.trend === "up" ? metric.accentColor : Colors.danger;

  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: `${metric.accentColor}45` }]}>
      <View style={styles.metricTopRow}>
        <View style={[styles.metricIcon, { backgroundColor: metric.iconBackground }]}>
          <PhosphorIcon name={metric.icon as any} size={22} color={metric.accentColor} />
        </View>
        <View style={[styles.trendRow, { backgroundColor: `${trendColor}1f` }]}>
          <PhosphorIcon name={metric.trend === "up" ? "trending-up" : "trending-down"} size={11} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]} numberOfLines={1}>{metric.delta}</Text>
        </View>
      </View>
      <View style={styles.metricCopy}>
        <Text style={[styles.metricValue, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{metric.value}</Text>
        <Text style={[styles.metricLabel, { color: colors.textMuted }]} numberOfLines={2}>{metric.label}</Text>
      </View>
    </View>
  );
}

function DonutChart({ stat }: { stat: DonutStat }) {
  return (
    <View style={styles.donutItem}>
      <View style={[styles.donutOuter, { borderTopColor: stat.color, borderRightColor: stat.color }]}>
        <View style={styles.donutMiddle}>
          <Text style={styles.donutValue}>{stat.value}</Text>
        </View>
      </View>
      <Text style={styles.donutLabel}>{stat.label}</Text>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendLine, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function LineChart({ data, color, maxValue, labels }: { data: LinePoint[]; color: string; maxValue: number; labels: string[] }) {
  const width = 303;
  const height = 96;
  const step = width / (data.length - 1);
  const points = data.map((point, index) => ({
    x: index * step,
    y: height - (point.value / maxValue) * height,
  }));

  return (
    <View style={styles.lineChart}>
      <View style={styles.gridLayer}>
        {[0, 1, 2, 3].map((line) => (
          <View key={`h-${line}`} style={[styles.gridLineHorizontal, { top: line * 31 }]} />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((line) => (
          <View key={`v-${line}`} style={[styles.gridLineVertical, { left: line * 50.5 }]} />
        ))}
      </View>
      <View style={styles.yAxis}>
        {["80", "60", "40", "20", "0"].map((label) => (
          <Text key={label} style={styles.axisText}>{label}</Text>
        ))}
      </View>
      <View style={styles.linePlot}>
        {points.slice(0, -1).map((point, index) => {
          const next = points[index + 1];
          return <LineSegment key={`${point.x}-${next.x}`} from={point} to={next} color={color} />;
        })}
      </View>
      <View style={styles.xAxis}>
        {labels.map((label, index) => (
          <Text key={`axis-${index}-${label}`} style={styles.axisText}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

function MultiLineChart({ data }: { data: { label: string; current: number; previous: number }[] }) {
  const labels = data.map((point) => point.label);
  const current = data.map((point) => ({ label: point.label, value: point.current }));
  const previous = data.map((point) => point.previous);
  const maxValue = Math.max(1, ...data.flatMap((point) => [point.current, point.previous]));

  return (
    <View style={styles.multiChartWrap}>
      <LineChart data={current} color={BLUE} maxValue={maxValue} labels={labels} />
      <View pointerEvents="none" style={styles.multiOverlay}>
        <OverlayLine values={previous} color={RED} maxValue={maxValue} />
      </View>
    </View>
  );
}

function OverlayLine({ values, color, maxValue }: { values: number[]; color: string; maxValue: number }) {
  const width = 303;
  const height = 96;
  const step = width / (values.length - 1);
  const points = values.map((value, index) => ({
    x: index * step,
    y: height - (value / maxValue) * height,
  }));

  return (
    <View style={styles.overlayLinePlot}>
      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1];
        return <LineSegment key={`${point.x}-${next.x}`} from={point} to={next} color={color} />;
      })}
    </View>
  );
}

function LineSegment({ from, to, color }: { from: { x: number; y: number }; to: { x: number; y: number }; color: string }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = `${Math.atan2(dy, dx)}rad`;

  return (
    <View
      style={[
        styles.lineSegment,
        {
          width: length,
          left: from.x,
          top: from.y,
          backgroundColor: color,
          transform: [{ rotate: angle }],
        },
      ]}
    />
  );
}

function CustomerMapChart({ data }: { data: LinePoint[] }) {
  const maxValue = Math.max(1, ...data.map((point) => point.value));
  return (
    <View style={styles.customerChart}>
      <View style={styles.customerYAxis}>
        {["60", "45", "30", "15", "0"].map((label) => (
          <Text key={label} style={styles.axisText}>{label}</Text>
        ))}
      </View>
      <View style={styles.customerPlot}>
        {[0, 1, 2, 3].map((line) => (
          <View key={line} style={[styles.gridLineHorizontal, { top: line * 30 }]} />
        ))}
        {data.map((point, index) => (
          <View key={`customer-${index}-${point.label}`} style={styles.customerBarGroup}>
            <View style={styles.customerBars}>
              <View style={[styles.customerBar, styles.redBar, { height: (point.value / maxValue) * 100 }]} />
            </View>
            <Text style={styles.axisText}>{point.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: "#101011",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: Spacing.lg,
    gap: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
    letterSpacing: 0,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  periodButton: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderCurve: "continuous",
    backgroundColor: DARK_HEADER,
  },
  periodText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.sm,
  },
  metricCard: {
    width: "48.5%",
    aspectRatio: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  metricTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  metricIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  metricCopy: {
    flex: 1,
    minWidth: 0,
    justifyContent: "flex-end",
    gap: Spacing.xs,
  },
  metricValue: {
    color: Colors.textPrimary,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: 3,
    maxWidth: "68%",
    minHeight: 24,
    paddingHorizontal: 7,
    borderRadius: Radius.full,
  },
  trendText: {
    flexShrink: 1,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
  },
  panel: {
    padding: 18,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: DARK_PANEL,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  chartTitleCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: "800",
  },
  panelSubtitle: {
    marginTop: 3,
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  segmentedControl: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    borderRadius: 8,
    borderCurve: "continuous",
    backgroundColor: "#2a2a2b",
  },
  segmentActive: {
    height: 28,
    paddingHorizontal: Spacing.md,
    borderRadius: 7,
    overflow: "hidden",
    color: Colors.textPrimary,
    backgroundColor: RED,
    fontSize: 14,
    lineHeight: 28,
    fontWeight: "700",
  },
  segmentInactive: {
    height: 28,
    paddingHorizontal: Spacing.md,
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 28,
    fontWeight: "600",
  },
  donutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.lg,
    paddingTop: 27,
  },
  donutItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: Spacing.sm,
  },
  donutOuter: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 36,
    borderWidth: 10,
    borderColor: "#2c2c2d",
  },
  donutMiddle: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: DARK_PANEL,
  },
  donutValue: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  donutLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 14,
    textAlign: "center",
  },
  saveButton: {
    height: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: RED,
  },
  saveButtonText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  lineChart: {
    height: 154,
    marginTop: 13,
    paddingLeft: 32,
    paddingTop: 5,
  },
  gridLayer: {
    position: "absolute",
    left: 58,
    top: 15,
    width: 303,
    height: 96,
  },
  gridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  gridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    borderLeftWidth: 1,
    borderStyle: "dashed",
    borderLeftColor: "rgba(255,255,255,0.08)",
  },
  yAxis: {
    position: "absolute",
    left: 0,
    top: 8,
    height: 116,
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: 23,
  },
  linePlot: {
    position: "absolute",
    left: 58,
    top: 15,
    width: 303,
    height: 96,
  },
  lineSegment: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
    transformOrigin: "left center",
  },
  xAxis: {
    position: "absolute",
    left: 46,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  axisText: {
    color: Colors.textMuted,
    fontSize: 10,
    lineHeight: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendLine: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  legendText: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  multiChartWrap: {
    position: "relative",
  },
  multiOverlay: {
    position: "absolute",
    left: 0,
    top: 13,
    right: 0,
    height: 154,
  },
  overlayLinePlot: {
    position: "absolute",
    left: 58,
    top: 15,
    width: 303,
    height: 96,
  },
  chartActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  weeklyPill: {
    height: 24,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    overflow: "hidden",
    color: Colors.textMuted,
    backgroundColor: "#2a2a2b",
    fontSize: 11,
    lineHeight: 24,
    fontWeight: "700",
  },
  customerChart: {
    height: 154,
    marginTop: 17,
    flexDirection: "row",
    gap: Spacing.md,
  },
  customerYAxis: {
    width: 24,
    height: 122,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  customerPlot: {
    flex: 1,
    height: 136,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  customerBarGroup: {
    height: 136,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: Spacing.sm,
  },
  customerBars: {
    height: 118,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  customerBar: {
    width: 8,
    borderRadius: 5,
  },
  redBar: {
    backgroundColor: RED,
  },
  yellowBar: {
    backgroundColor: AMBER,
  },
  stateText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.76,
  },
});
