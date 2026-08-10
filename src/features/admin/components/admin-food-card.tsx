import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { AdminFoodMenuItem } from "@/features/admin/types";
import { formatLeones } from "@/utils/format";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AdminFoodCardProps = {
  item: AdminFoodMenuItem;
  viewMode?: "list" | "grid";
};

export function AdminFoodCard({ item, viewMode = "list" }: AdminFoodCardProps) {
  const router = useRouter();
  const isGrid = viewMode === "grid";
  const categories = item.categories.length ? item.categories : ["Uncategorized"];
  const visibleCategories = categories.slice(0, 2);
  const remainingCategoryCount = Math.max(0, categories.length - visibleCategories.length);

  const openDetails = () => router.push(`/admin-foods/${item.id}` as never);

  return (
    <View style={[styles.card, isGrid ? styles.gridCard : styles.listCard]}>
      <Pressable
        style={[styles.cardMain, isGrid ? styles.gridMain : styles.listMain]}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name} details`}
        onPress={openDetails}
      >
        <View style={[styles.imageFrame, isGrid ? styles.gridImageFrame : styles.listImageFrame]}>
          <Image source={{ uri: item.image }} style={styles.image} contentFit="cover" accessibilityLabel={item.name} />
          <View style={styles.availabilityBadge}>
            <View style={[styles.availabilityDot, item.available ? styles.availableDot : styles.unavailableDot]} />
            <Text style={[styles.availabilityText, item.available ? styles.availableText : styles.unavailableText]}>
              {item.available ? "Available" : "Unavailable"}
            </Text>
          </View>
        </View>

        <View style={[styles.details, isGrid ? styles.gridDetails : styles.listDetails]}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={isGrid ? 2 : 1}>
              {item.name}
            </Text>
            <Text style={styles.price} numberOfLines={1} selectable>
              {formatLeones(Number(item.price))}
            </Text>
          </View>

          <Text style={styles.description} numberOfLines={isGrid ? 2 : 1}>
            {item.description || "No description added yet."}
          </Text>

          <View style={styles.categoryRow}>
            {visibleCategories.map((category, index) => (
              <View key={`${item.id}-${category}`} style={[styles.categoryChip, index === 0 && styles.categoryChipPrimary]}>
                <Text style={[styles.categoryText, index === 0 && styles.categoryTextPrimary]} numberOfLines={1}>
                  {category}
                </Text>
              </View>
            ))}
            {remainingCategoryCount > 0 ? (
              <Text style={styles.moreCategories}>+{remainingCategoryCount}</Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      <View style={[styles.footer, isGrid && styles.gridFooter]}>
        <View style={styles.stats}>
          <CardStat icon="receipt-outline" label="Orders" value={item.orders} />
          <CardStat icon="heart-outline" label="Likes" value={item.favorites} />
          <CardStat icon="eye-outline" label="Views" value={item.views} />
        </View>

        <View style={styles.actions}>
          <CardAction
            compact={isGrid}
            icon="create-outline"
            label="Edit"
            accessibilityLabel={`Edit ${item.name}`}
            onPress={() => router.push(`/admin-foods/${item.id}/edit` as never)}
          />
          <CardAction
            compact={isGrid}
            destructive
            icon="trash-outline"
            label="Delete"
            accessibilityLabel={`Delete ${item.name}`}
            onPress={() => router.push(`/admin-foods/${item.id}/delete` as never)}
          />
        </View>
      </View>
    </View>
  );
}

function CardStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.stat} accessibilityLabel={`${value} ${label.toLowerCase()}`}>
      <PhosphorIcon name={icon} size={13} color={Colors.textMuted} />
      <View style={styles.statCopy}>
        <Text style={styles.statValue} numberOfLines={1} selectable>
          {value}
        </Text>
        <Text style={styles.statLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function CardAction({
  accessibilityLabel,
  compact,
  destructive,
  icon,
  label,
  onPress,
}: {
  accessibilityLabel: string;
  compact: boolean;
  destructive?: boolean;
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.action,
        compact && styles.compactAction,
        destructive ? styles.deleteAction : styles.editAction,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      <PhosphorIcon name={icon} size={compact ? 14 : 13} color={destructive ? Colors.danger : Colors.accent} />
      {!compact ? <Text style={[styles.actionText, destructive && styles.deleteActionText]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: Radius.md,
    borderCurve: "continuous",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  listCard: {
    minHeight: 156,
  },
  gridCard: {
    flex: 1,
    minWidth: 145,
    minHeight: 306,
  },
  cardMain: {
    flex: 1,
  },
  listMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
  },
  gridMain: {
    gap: Spacing.md,
    padding: Spacing.sm,
  },
  imageFrame: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: Colors.surfaceAlt,
  },
  listImageFrame: {
    width: 104,
    height: 104,
    borderRadius: Radius.md,
  },
  gridImageFrame: {
    width: "100%",
    height: 132,
    borderRadius: Radius.sm,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  availabilityBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderCurve: "continuous",
    backgroundColor: Colors.surface,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: Radius.full,
  },
  availableDot: {
    backgroundColor: Colors.green,
  },
  unavailableDot: {
    backgroundColor: Colors.textDisabled,
  },
  availabilityText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "700",
  },
  availableText: {
    color: Colors.green,
  },
  unavailableText: {
    color: Colors.textMuted,
  },
  details: {
    minWidth: 0,
    flex: 1,
  },
  listDetails: {
    justifyContent: "center",
    gap: Spacing.sm,
  },
  gridDetails: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  name: {
    ...Typography.label,
    flex: 1,
    color: Colors.textPrimary,
    fontWeight: "700",
    lineHeight: 18,
  },
  price: {
    color: Colors.accent,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  description: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    minHeight: 20,
  },
  categoryChip: {
    maxWidth: 100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderCurve: "continuous",
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  categoryChipPrimary: {
    backgroundColor: "rgba(247,194,192,0.14)",
    borderColor: "rgba(247,194,192,0.22)",
  },
  categoryText: {
    color: Colors.textMuted,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "700",
  },
  categoryTextPrimary: {
    color: Colors.accent,
  },
  moreCategories: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
  },
  footer: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  gridFooter: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  stats: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  stat: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statCopy: {
    minWidth: 0,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    lineHeight: 10,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  action: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
    borderWidth: 1,
  },
  compactAction: {
    width: 30,
    paddingHorizontal: 0,
  },
  editAction: {
    backgroundColor: "rgba(247,194,192,0.1)",
    borderColor: "rgba(247,194,192,0.18)",
  },
  deleteAction: {
    backgroundColor: "rgba(229,57,53,0.1)",
    borderColor: "rgba(229,57,53,0.18)",
  },
  actionText: {
    color: Colors.accent,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800",
  },
  deleteActionText: {
    color: Colors.danger,
  },
  pressed: {
    opacity: 0.72,
  },
});
