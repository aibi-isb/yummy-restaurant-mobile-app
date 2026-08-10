import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { AdminFoodDetail } from "@/features/admin/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AdminFoodDetailSummaryProps = {
  detail: AdminFoodDetail;
};

export function AdminFoodDetailSummary({ detail }: AdminFoodDetailSummaryProps) {
  const router = useRouter();
  const { food } = detail;

  return (
    <View style={styles.summaryCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Detail Menus</Text>
        <Text style={styles.categoryText}>
          Category: <Text style={styles.categoryPrimary}>{detail.categoryTrail[0]}</Text>
          <Text style={styles.categoryDivider}>/</Text>
          <Text style={styles.categoryDanger}>{detail.categoryTrail[1]}</Text>
        </Text>
      </View>

      <View style={styles.foodHero}>
        <Image source={{ uri: food.image }} style={styles.foodImage} contentFit="cover" accessibilityLabel={food.name} />
        <View style={styles.foodCopy}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{detail.badge}</Text>
          </View>
          <Text style={styles.foodName}>{food.name}</Text>
          <Text style={styles.foodDescription}>{food.description}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Add menu"
          onPress={() => router.push("/admin-foods/new" as never)}
        >
          <PhosphorIcon name="add" size={15} color={Colors.textPrimary} />
          <Text style={styles.primaryButtonText}>Add Menu</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${food.name}`}
          onPress={() => router.push(`/admin-foods/${food.id}/edit` as never)}
        >
          <PhosphorIcon name="create-outline" size={14} color="#b0b0b0" />
          <Text style={styles.secondaryButtonText}>Edit Menu</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${food.name}`}
          onPress={() => router.push(`/admin-foods/${food.id}/delete` as never)}
        >
          <PhosphorIcon name="trash-outline" size={14} color="#ff6467" />
          <Text style={styles.secondaryButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function AdminFoodInfoCard({ body, title }: { body: string; title: string }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoBody}>{body}</Text>
    </View>
  );
}

export function AdminFoodRevenueCard({ data }: { data: AdminFoodDetail["revenue"] }) {
  const maxValue = 80;
  const points = data.map((point, index) => ({
    ...point,
    left: index * 36,
    top: 126 - (point.value / maxValue) * 100,
  }));

  return (
    <View style={styles.revenueCard}>
      <View style={styles.revenueHeader}>
        <View style={styles.revenueTitleGroup}>
          <Text style={styles.sectionTitle}>Revenue</Text>
          <Text style={styles.revenueSubtitle}>Revenue from completed customer orders.</Text>
        </View>
        <View style={styles.segmentedControl}>
          <Segment label="Monthly" active />
          <Segment label="Weekly" />
          <Segment label="Daily" />
        </View>
      </View>

      <View style={styles.chartFrame}>
        <View style={styles.yAxis}>
          {["80k", "60k", "40k", "20k", "0k"].map((label) => (
            <Text key={label} style={styles.axisLabel}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.chartCanvas}>
          {[0, 1, 2, 3, 4].map((line) => (
            <View key={line} style={[styles.gridLine, { top: line * 31 }]} />
          ))}
          {points.slice(0, -1).map((point, index) => {
            const next = points[index + 1];
            const dx = next.left - point.left;
            const dy = next.top - point.top;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);

            return (
              <View
                key={`${point.label}-${next.label}`}
                style={[
                  styles.chartSegment,
                  {
                    left: point.left + 9,
                    top: point.top + 9,
                    width: length,
                    transform: [{ rotateZ: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}
          {points.map((point) => (
            <View key={point.label} style={[styles.chartDot, { left: point.left + 5, top: point.top + 5 }]} />
          ))}
          <View style={styles.xAxis}>
            {data.map((point) => (
              <Text key={point.label} style={styles.axisLabel}>
                {point.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function Segment({ active, label }: { active?: boolean; label: string }) {
  return (
    <View style={[styles.segment, active && styles.segmentActive]}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: 18,
    padding: 16,
    borderRadius: 14,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  sectionHeader: {
    gap: 5,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
  },
  categoryText: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
  },
  categoryPrimary: {
    color: "#ff8904",
  },
  categoryDivider: {
    color: "#b0b0b0",
  },
  categoryDanger: {
    color: Colors.danger,
  },
  foodHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  foodImage: {
    width: 98,
    height: 98,
    borderRadius: Radius.full,
    backgroundColor: "#2a2a2a",
  },
  foodCopy: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: "rgba(229,57,53,0.16)",
  },
  badgeText: {
    color: Colors.danger,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
  },
  foodName: {
    color: Colors.textPrimary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
  },
  foodDescription: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  primaryButton: {
    minWidth: 103,
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderCurve: "continuous",
    backgroundColor: Colors.danger,
  },
  primaryButtonText: {
    color: Colors.textPrimary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    minWidth: 103,
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderCurve: "continuous",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  secondaryButtonText: {
    color: "#b0b0b0",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },
  infoCard: {
    gap: Spacing.sm,
    padding: 16,
    borderRadius: 14,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  infoTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  infoBody: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 17,
  },
  revenueCard: {
    gap: 20,
    padding: 16,
    borderRadius: 14,
    borderCurve: "continuous",
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  revenueHeader: {
    gap: 14,
  },
  revenueTitleGroup: {
    gap: 2,
  },
  revenueSubtitle: {
    color: "#b0b0b0",
    fontSize: 10.5,
    lineHeight: 14,
  },
  segmentedControl: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 7,
  },
  segment: {
    height: 27,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  segmentActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  segmentText: {
    color: "#b0b0b0",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },
  segmentTextActive: {
    color: Colors.textPrimary,
  },
  chartFrame: {
    height: 178,
    flexDirection: "row",
    gap: 9,
  },
  yAxis: {
    width: 28,
    height: 146,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  axisLabel: {
    color: "#767676",
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  chartCanvas: {
    flex: 1,
    height: 160,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#2a2a2a",
  },
  chartSegment: {
    position: "absolute",
    height: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.danger,
    transformOrigin: "0px 1px",
  },
  chartDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: "#1e1e1e",
  },
  xAxis: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pressed: {
    opacity: 0.76,
  },
});
