import { PhosphorIcon } from "@/components/PhosphorIcon";
import { ThemeToggle } from "@/components/features/ThemeToggle";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useCart } from "@/hooks/useCart";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/providers/theme-provider";
import {
  formatBadgeCount,
  getCartAccessibilityLabel,
  getNotificationsAccessibilityLabel,
} from "@/utils/badge-count";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CustomerHeaderProps = {
  title?: string;
  showBack?: boolean;
  rightIcons?: "cart" | "bell" | "both" | "none";
  variant?: "home" | "page";
};

const defaultAvatar = require("../../../assets/images/home/profile-avatar.png");

export function CustomerHeader({
  title,
  showBack = false,
  rightIcons = "none",
  variant = "page",
}: CustomerHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const { count: cartCount } = useCart();
  const { notifications } = useNotifications(user?.id);

  const userMetadata = user?.user_metadata ?? {};
  const fullName = userMetadata.full_name ?? user?.email?.split("@")[0] ?? "Customer";
  const avatarUrl = userMetadata.avatar_url as string | undefined;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const cartAccessibilityLabel = getCartAccessibilityLabel(cartCount);
  const notificationsAccessibilityLabel = getNotificationsAccessibilityLabel(unreadCount);

  if (variant === "home") {
    return (
      <View style={[styles.homeHeader, { backgroundColor: colors.background }]}> 
        <Pressable
          style={styles.homeLeft}
          onPress={() => router.push("/profile")}
          accessibilityRole="button"
          accessibilityLabel="Profile"
        >
          <Image
            source={avatarUrl ? { uri: avatarUrl } : defaultAvatar}
            style={styles.avatar}
            contentFit="cover"
          />
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{fullName}</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <ThemeToggle variant="header" />
          <Pressable
            style={styles.iconPill}
            onPress={() => router.push("/notifications")}
            accessibilityRole="button"
            accessibilityLabel={notificationsAccessibilityLabel}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.controlSurface }]}> 
              <PhosphorIcon name="notifications-outline" size={24} color={colors.textPrimary} />
            </View>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={[styles.badgeText, { color: colors.onDanger }]}>{formatBadgeCount(unreadCount)}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={styles.iconPill}
            onPress={() => router.push("/cart")}
            accessibilityRole="button"
            accessibilityLabel={cartAccessibilityLabel}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.controlSurface }]}> 
              <PhosphorIcon name="bag-outline" size={20} color={colors.textPrimary} />
            </View>
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={[styles.badgeText, { color: colors.onDanger }]}>{formatBadgeCount(cartCount)}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.pageHeader, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}> 
      <View style={styles.pageLeft}>
        {showBack && (
          <Pressable
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <PhosphorIcon name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        )}
        {title && <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>{title}</Text>}
      </View>
      <View style={styles.headerRight}>
        <ThemeToggle variant="header" />
        {rightIcons !== "none" ? (
          <>
          {(rightIcons === "bell" || rightIcons === "both") && (
            <Pressable
              style={styles.iconPill}
              onPress={() => router.push("/notifications")}
              accessibilityRole="button"
              accessibilityLabel={notificationsAccessibilityLabel}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.controlSurface }]}> 
                <PhosphorIcon name="notifications-outline" size={24} color={colors.textPrimary} />
              </View>
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={[styles.badgeText, { color: colors.onDanger }]}>{formatBadgeCount(unreadCount)}</Text>
                </View>
              )}
            </Pressable>
          )}
          {(rightIcons === "cart" || rightIcons === "both") && (
            <Pressable
              style={styles.iconPill}
              onPress={() => router.push("/cart")}
              accessibilityRole="button"
              accessibilityLabel={cartAccessibilityLabel}
            >
              <View style={[styles.iconCircle, { backgroundColor: colors.controlSurface }]}> 
                <PhosphorIcon name="bag-outline" size={20} color={colors.textPrimary} />
              </View>
              {cartCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={[styles.badgeText, { color: colors.onDanger }]}>{formatBadgeCount(cartCount)}</Text>
                </View>
              )}
            </Pressable>
          )}
          <Pressable
            onPress={() => router.push("/profile")}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <Image
              source={avatarUrl ? { uri: avatarUrl } : defaultAvatar}
              style={styles.avatar}
              contentFit="cover"
            />
          </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 40,
  },
  homeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xxl,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.36,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  pageLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.36,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconPill: {
    width: 40,
    height: 40,
  },
  iconCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.textPrimary,
    fontSize: 10,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
