import { PhosphorIcon } from "@/components/PhosphorIcon";
import { ThemeToggle } from "@/components/features/ThemeToggle";
import { Colors, Radius } from "@/constants/theme";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { profileImage } from "@/data/restaurant";
import { getProfile } from "@/services/supabase/userService";
import { useAuthStore } from "@/store/authStore";
import { useAdminTheme } from "@/providers/theme-provider";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function AdminShellHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { colors } = useAdminTheme();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      return;
    }

    getProfile(user.id)
      .then((profile) => {
        if (!cancelled) setAvatarUrl(profile?.avatarUrl ?? null);
      })
      .catch(() => {
        if (!cancelled) setAvatarUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, user?.id, user?.user_metadata?.avatar_url]);

  const currentAvatar = avatarUrl ?? (user?.user_metadata?.avatar_url as string | undefined) ?? profileImage;

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.header, borderBottomColor: colors.divider }]}>
        <Pressable
          style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surfaceAlt }, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Open admin menu"
          onPress={() => {
            setSidebarCollapsed(false);
            setSidebarVisible(true);
          }}
        >
          <PhosphorIcon name="menu" size={16} color={colors.textMuted} />
        </Pressable>

          <Text style={[styles.brand, { color: colors.textPrimary }]}> 
          YUMMY<Text style={[styles.brandDot, { color: colors.danger }]}>.</Text>
        </Text>

        <View style={styles.actions}>
          <ThemeToggle variant="header" headerSize="sm" colors={colors} />
          <Pressable
            style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.surfaceAlt }, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open admin notifications"
            onPress={() => router.push("/admin-notifications" as never)}
          >
            <PhosphorIcon name="notifications-outline" size={15} color={colors.textPrimary} />
            <View style={[styles.notificationDot, { backgroundColor: colors.danger }]} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.profile, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open admin profile"
            onPress={() => router.push("/admin-profile" as never)}
          >
            <Image
              source={{ uri: currentAvatar }}
              style={styles.avatar}
              contentFit="cover"
              accessibilityLabel="Admin profile photo"
            />
            <PhosphorIcon name="chevron-down" size={11} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <AdminSidebar
        collapsed={sidebarCollapsed}
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: "#1e1e1e",
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  iconButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: "#2a2a2a",
  },
  brand: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
  },
  brandDot: {
    color: Colors.danger,
  },
  actions: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.danger,
  },
  profile: {
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
  },
  pressed: {
    opacity: 0.76,
  },
});
