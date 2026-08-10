import { PhosphorIcon } from "@/components/PhosphorIcon";
import { useAdminTheme } from "@/providers/theme-provider";
import { ADMIN_HOME_ROUTE } from "@/lib/routes";
import { getAdminActiveSection } from "@/features/admin/admin-navigation";
import { usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: "grid-outline", href: ADMIN_HOME_ROUTE },
  { key: "order", label: "Order", icon: "cart-outline", href: "/admin-orders" },
  { key: "foods", label: "Foods", icon: "restaurant-outline", href: "/admin-foods" },
  { key: "notifications", label: "Notifications", icon: "chatbox-outline", href: "/admin-notifications" },
  { key: "customer", label: "Customer", icon: "people-outline", href: "/admin-customers" },
] as const;

export function AdminBottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { colors } = useAdminTheme();
  const active = getAdminActiveSection(pathname);

  return (
    <View style={[styles.bar, { backgroundColor: colors.navbar, borderTopColor: colors.divider }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? colors.danger : colors.textMuted;

        return (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Open ${tab.label}`}
            onPress={() => router.replace(tab.href as never)}
          >
            <PhosphorIcon name={tab.icon} size={18} color={color} weight={isActive ? "fill" : "regular"} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: "#1e1e1e",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  label: {
    maxWidth: "100%",
    fontSize: 9,
    lineHeight: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.76,
  },
});
