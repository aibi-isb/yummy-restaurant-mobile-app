/**
 * Notifications screen — matches Figma node 2122:19659
 *
 * Layout:
 *   Fixed header (back ‹ | "Notifications" | bell-badge + avatar)
 *   ScrollView
 *     NotifSection "Today"     → 3 NotifCards
 *     NotifSection "Yesterday" → 2 NotifCards
 *     PromoBanner              (standalone, below Yesterday section)
 *   BottomNavbar
 */

import { PhosphorIcon } from "@/components/PhosphorIcon";
import { CustomerHeader } from "@/components/features/CustomerHeader";
import { Colors, Radius, Spacing } from "@/constants/theme";
import {
    iconOrderPlaced,
    iconPaymentVerified,
    type NotificationItem,
} from "@/data/notifications";
import { useNotifications } from "@/hooks/useNotifications";
import { useOrders } from "@/hooks/useOrders";
import { useTheme } from "@/providers/theme-provider";
import { useAuthStore } from "@/store/authStore";
import { formatDateTime } from "@/utils/format";
import { formatAdditionalItemLabel, getOrderFoodSummary } from "@/utils/order-presentation";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── NotifCard ────────────────────────────────────────────────────────────────

function NotifCard({
  item,
  onTrack,
  onConfirm,
}: {
  item: NotificationItem;
  onTrack: () => void;
  onConfirm: () => void;
}) {
  return (
    <View style={cardStyles.card}>
      {/* Left: notification icon — transparent wrap so SVG shows its own bg */}
      <View style={cardStyles.iconWrap}>
        <Image
          source={{ uri: item.icon }}
          style={cardStyles.icon}
          contentFit="contain"
          accessibilityLabel={item.title}
        />
      </View>

      {/* Centre: title row + order id + body */}
      <View style={cardStyles.content}>
        <View style={cardStyles.titleRow}>
          <Text style={cardStyles.title}>{item.title}</Text>
          {item.badge && (
            <Image
              source={{ uri: item.badge }}
              style={cardStyles.badge}
              contentFit="contain"
              accessibilityLabel="status badge"
            />
          )}
        </View>
        {item.foodName ? <Text style={cardStyles.foodName} numberOfLines={2}>{item.foodName}</Text> : null}
        {item.foodMeta ? <Text style={cardStyles.subText}>{item.foodMeta}</Text> : null}
        {item.orderId && <Text style={cardStyles.orderId}>Order ID · {item.orderId}</Text>}
        {item.body ? (
          <Text style={cardStyles.subText}>{item.body}</Text>
        ) : null}
      </View>

      {/* Right: timestamp + action */}
      <View style={cardStyles.rightCol}>
        <Text style={cardStyles.time}>{item.time}</Text>

        {item.action === "track_order" && (
          <Pressable
            style={cardStyles.trackBtn}
            onPress={onTrack}
            accessibilityRole="button"
            accessibilityLabel="Track order"
          >
            <PhosphorIcon name="location-outline" size={13} color={Colors.textMuted} />
            <Text style={cardStyles.trackLabel}>Track order</Text>
          </Pressable>
        )}

        {item.action === "confirm" && (
          <Pressable
            onPress={onConfirm}
            accessibilityRole="button"
            accessibilityLabel="Confirm delivery"
          >
            <Text style={cardStyles.confirmLabel}>Confirm</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
    minHeight: 100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  // No background fill — the SVG icon carries its own coloured circle
  iconWrap: {
    width: 64,
    height: 64,
    flexShrink: 0,
  },
  icon: {
    width: 64,
    height: 64,
  },
  content: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  badge: {
    width: 18,
    height: 18,
  },
  subText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "400",
    lineHeight: 15,
  },
  foodName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  orderId: {
    color: Colors.textDisabled,
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 15,
  },
  rightCol: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    alignSelf: "stretch",
    paddingVertical: 2,
    flexShrink: 0,
    gap: 8,
  },
  time: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: "400",
    textAlign: "right",
    minWidth: 80,
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trackLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "400",
  },
  confirmLabel: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "right",
  },
});

// ─── NotifSection ─────────────────────────────────────────────────────────────

function NotifSection({
  title,
  items,
  onClearAll,
  onTrack,
  onConfirm,
}: {
  title: string;
  items: NotificationItem[];
  onClearAll: () => void;
  onTrack: (id: string) => void;
  onConfirm: (id: string) => void;
}) {
  return (
    <View style={sectionStyles.section}>
      {/* Header row: label + Clear All */}
      <View style={sectionStyles.header}>
        <Text style={sectionStyles.headerTitle}>{title}</Text>
        <Pressable
          style={sectionStyles.clearRow}
          onPress={onClearAll}
          accessibilityRole="button"
          accessibilityLabel={`Clear all ${title} notifications`}
        >
          <Text style={sectionStyles.clearLabel}>Clear All</Text>
          <PhosphorIcon name="trash-outline" size={16} color={Colors.accent} />
        </Pressable>
      </View>

      {/* Notification cards */}
      <View style={sectionStyles.cards}>
        {items.map((item) => (
          <NotifCard
            key={item.id}
            item={item}
            onTrack={() => onTrack(item.id)}
            onConfirm={() => onConfirm(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  section: {
    gap: 29, // Figma: 29px between section header and cards list
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.23,
    lineHeight: 20,
  },
  clearRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clearLabel: {
    color: Colors.accent,        // #f7c2c0 — matches Figma System Default/Red/Light:active
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.23,
    lineHeight: 20,
  },
  cards: {
    gap: 17, // Figma: 17px gap between cards
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { mode } = useTheme();
  const { notifications, markRead } = useNotifications(user?.id);
  const { orders } = useOrders(user?.id);
  const dynamicItems: NotificationItem[] = notifications.map((item) => {
    const order = item.orderId ? orders.find((candidate) => candidate.id === item.orderId) : undefined;
    const foodSummary = getOrderFoodSummary(order?.items);

    return {
      id: item.id,
      icon: item.type === "payment" ? iconPaymentVerified : iconOrderPlaced,
      title: item.title,
      orderId: item.orderId,
      foodName: order ? foodSummary.primaryItemName : undefined,
      foodMeta: order ? formatAdditionalItemLabel(foodSummary) : undefined,
      body: item.message,
      time: formatDateTime(item.createdAt),
      action: item.orderId ? "track_order" : "none",
    };
  });
  const todayItems = dynamicItems;
  const yesterdayItems: NotificationItem[] = [];

  const clearToday = () => {
    void Promise.all(todayItems.map((item) => markRead(item.id)));
  };
  const clearYesterday = () => {};

  const handleTrack = (_id: string) => router.push(`/track-order?orderId=${_id}`);

  const handleConfirm = (id: string) => {
    void markRead(id);
  };

  return (
    <View style={styles.root}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <CustomerHeader title="Notifications" showBack rightIcons="none" />

      {/* ── Scrollable body ────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Today */}
        {todayItems.length > 0 && (
          <NotifSection
            title="Today"
            items={todayItems}
            onClearAll={clearToday}
            onTrack={handleTrack}
            onConfirm={handleConfirm}
          />
        )}
        {todayItems.length === 0 && (
          <View style={styles.emptyState}>
            <PhosphorIcon name="notifications-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}

        {/* Yesterday */}
        {yesterdayItems.length > 0 && (
          <NotifSection
            title="Yesterday"
            items={yesterdayItems}
            onClearAll={clearYesterday}
            onTrack={handleTrack}
            onConfirm={handleConfirm}
          />
        )}

      </ScrollView>

    </View>
  );
}

// ─── Root styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyState: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },

  // Scroll container — 32px gap between sections (Figma xxxl)
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.xxxl,
  },
});
