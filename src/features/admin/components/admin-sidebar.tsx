import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAdminTheme } from "@/providers/theme-provider";
import { getAdminActiveSection } from "@/features/admin/admin-navigation";
import { ADMIN_HOME_ROUTE, WELCOME_ROUTE } from "@/lib/routes";
import { signOut } from "@/lib/auth";
import { usePathname, useRouter } from "expo-router";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

type AdminSidebarProps = {
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapsed: () => void;
  visible: boolean;
};

type AdminSidebarSection = "order" | "customer" | "foods";

type AdminSidebarChild = {
  label: string;
  icon: string;
  href: string;
  isActive: (pathname: string) => boolean;
};

type AdminSidebarGroup = {
  label: string;
  icon: string;
  href: string;
  section: AdminSidebarSection;
  children: readonly AdminSidebarChild[];
};

const normalizePath = (pathname: string) => pathname.replace(/^\/\(admin\)/, "") || "/";
const exactPath = (path: string) => (pathname: string) => normalizePath(pathname) === path;
const nestedPath = (path: string) => (pathname: string) => normalizePath(pathname).startsWith(`${path}/`);

const NAV_GROUPS: readonly AdminSidebarGroup[] = [
  {
    label: "Orders",
    icon: "cart-outline",
    href: "/admin-orders",
    section: "order",
    children: [
      { label: "Order List", icon: "cart-outline", href: "/admin-orders", isActive: exactPath("/admin-orders") },
      { label: "Order Details", icon: "document-text-outline", href: "/admin-orders", isActive: nestedPath("/admin-orders") },
      { label: "Payment Verification", icon: "card-outline", href: "/admin-payment-verification", isActive: exactPath("/admin-payment-verification") },
    ],
  },
  {
    label: "Customers",
    icon: "people-outline",
    href: "/admin-customers",
    section: "customer",
    children: [
      { label: "Customer List", icon: "people-outline", href: "/admin-customers", isActive: exactPath("/admin-customers") },
      { label: "Customer Details", icon: "person-outline", href: "/admin-customers", isActive: nestedPath("/admin-customers") },
    ],
  },
  {
    label: "Foods",
    icon: "restaurant-outline",
    href: "/admin-foods",
    section: "foods",
    children: [
      { label: "Food List", icon: "restaurant-outline", href: "/admin-foods", isActive: exactPath("/admin-foods") },
      { label: "Food Details", icon: "book-outline", href: "/admin-foods", isActive: nestedPath("/admin-foods") },
      { label: "Categories", icon: "albums-outline", href: "/admin-categories", isActive: exactPath("/admin-categories") },
    ],
  },
];

export function AdminSidebar({ collapsed, onClose, onToggleCollapsed, visible }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { colors } = useAdminTheme();
  const activeSection = getAdminActiveSection(pathname);
  const [expandedSection, setExpandedSection] = useState<AdminSidebarSection | null>(activeSection === "order" || activeSection === "customer" || activeSection === "foods" ? activeSection : null);
  const [loggingOut, setLoggingOut] = useState(false);

  const openRoute = (href: string) => {
    router.push(href as never);
    onClose();
  };

  const toggleGroup = (section: AdminSidebarSection) => {
    setExpandedSection((current) => (current === section ? null : section));
  };

  const handleLogout = () => {
    if (loggingOut) return;

    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          setLoggingOut(true);
          void signOut()
            .then(() => {
              onClose();
              router.replace(WELCOME_ROUTE as never);
            })
            .catch(() => {
              Alert.alert("Could not log out", "Please try again.");
            })
            .finally(() => setLoggingOut(false));
        },
      },
    ]);
  };

  return (
    <Modal transparent animationType="fade" statusBarTranslucent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={[styles.scrim, { backgroundColor: colors.scrim }]} accessibilityRole="button" accessibilityLabel="Close admin menu" onPress={onClose} />

        <SafeAreaView style={[styles.sidebar, { backgroundColor: colors.surface, borderRightColor: colors.divider }, collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded]} edges={["top", "bottom"]}>
          <ScrollView
            style={styles.sidebarScroll}
            contentContainerStyle={[styles.sidebarContent, collapsed && styles.sidebarContentCollapsed]}
            contentInsetAdjustmentBehavior="never"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.brandRow, collapsed && styles.brandRowCollapsed]}>
              {collapsed ? (
                <Text style={styles.brandMark}>A</Text>
              ) : (
                <View style={styles.brandCopy}>
                  <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>Admin</Text>
                  <Text style={[styles.brandSubtitle, { color: colors.iconMuted }]}>Restaurant Admin</Text>
                </View>
              )}

              <Pressable
                style={({ pressed }) => [styles.collapseButton, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={collapsed ? "Expand admin menu" : "Collapse admin menu"}
                onPress={onToggleCollapsed}
              >
                <PhosphorIcon name={collapsed ? "chevron-forward" : "chevron-back"} size={15} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={[styles.navList, collapsed && styles.navListCollapsed]}>
              <Pressable
                style={({ pressed }) => [styles.navItem, collapsed && styles.navItemCollapsed, activeSection === "dashboard" && styles.navItemActive, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityState={{ selected: activeSection === "dashboard" }}
                accessibilityLabel="Open Dashboard"
                onPress={() => openRoute(ADMIN_HOME_ROUTE)}
              >
                <PhosphorIcon name="grid-outline" size={collapsed ? 16 : 17} color={activeSection === "dashboard" ? colors.textPrimary : colors.iconMuted} weight={activeSection === "dashboard" ? "fill" : "regular"} />
                {!collapsed ? <Text style={[styles.navLabel, { color: activeSection === "dashboard" ? colors.textPrimary : colors.iconMuted }, activeSection === "dashboard" && styles.navLabelActive]}>Dashboard</Text> : null}
              </Pressable>

              {NAV_GROUPS.map((group) => {
                const groupActive = group.section === activeSection;
                const expanded = expandedSection === group.section;

                return (
                  <View key={group.section} style={styles.group}>
                    <View style={[styles.groupHeader, groupActive && styles.navItemActive]}>
                      <Pressable
                        style={({ pressed }) => [styles.navItem, styles.groupNavItem, collapsed && styles.navItemCollapsed, pressed && styles.pressed]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: groupActive, expanded }}
                        accessibilityLabel={`Open ${group.label}`}
                        onPress={() => {
                          setExpandedSection(group.section);
                          openRoute(group.href);
                        }}
                      >
                        <PhosphorIcon name={group.icon} size={collapsed ? 16 : 17} color={groupActive ? colors.textPrimary : colors.iconMuted} weight={groupActive ? "fill" : "regular"} />
                        {!collapsed ? <Text style={[styles.navLabel, { color: groupActive ? colors.textPrimary : colors.iconMuted }, groupActive && styles.navLabelActive]} numberOfLines={1}>{group.label}</Text> : null}
                      </Pressable>

                      {!collapsed ? (
                        <Pressable
                          style={({ pressed }) => [styles.groupToggle, pressed && styles.pressed]}
                          accessibilityRole="button"
                          accessibilityState={{ expanded }}
                          accessibilityLabel={`${expanded ? "Collapse" : "Expand"} ${group.label}`}
                          onPress={() => toggleGroup(group.section)}
                        >
                          <PhosphorIcon name={expanded ? "chevron-up" : "chevron-down"} size={14} color={groupActive ? colors.textPrimary : colors.iconMuted} />
                        </Pressable>
                      ) : null}
                    </View>

                    {!collapsed && expanded ? (
                      <View style={styles.submenu}>
                        {group.children.map((child) => {
                          const childActive = child.isActive(pathname);
                          return (
                            <Pressable
                              key={child.label}
                              style={({ pressed }) => [styles.submenuItem, childActive && styles.submenuItemActive, pressed && styles.pressed]}
                              accessibilityRole="button"
                              accessibilityState={{ selected: childActive }}
                              accessibilityLabel={`Open ${child.label}`}
                              onPress={() => openRoute(child.href)}
                            >
                              <PhosphorIcon name={child.icon} size={15} color={childActive ? colors.textPrimary : colors.iconMuted} weight={childActive ? "fill" : "regular"} />
                              <Text style={[styles.submenuLabel, { color: childActive ? colors.textPrimary : colors.iconMuted }, childActive && styles.submenuLabelActive]} numberOfLines={1}>{child.label}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>
                );
              })}

              <Pressable
                style={({ pressed }) => [styles.navItem, collapsed && styles.navItemCollapsed, activeSection === "notifications" && styles.navItemActive, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityState={{ selected: activeSection === "notifications" }}
                accessibilityLabel="Open Notifications"
                onPress={() => openRoute("/admin-notifications")}
              >
                <PhosphorIcon name="chatbox-outline" size={collapsed ? 16 : 17} color={activeSection === "notifications" ? colors.textPrimary : colors.iconMuted} weight={activeSection === "notifications" ? "fill" : "regular"} />
                {!collapsed ? <Text style={[styles.navLabel, { color: activeSection === "notifications" ? colors.textPrimary : colors.iconMuted }, activeSection === "notifications" && styles.navLabelActive]}>Notifications</Text> : null}
              </Pressable>
            </View>

            <View style={[styles.footer, collapsed && styles.footerCollapsed]}>
              <Pressable
                style={({ pressed }) => [styles.logoutItem, collapsed && styles.logoutItemCollapsed, pressed && styles.pressed, loggingOut && styles.disabled]}
                accessibilityRole="button"
                accessibilityState={{ disabled: loggingOut }}
                accessibilityLabel="Log out"
                disabled={loggingOut}
                onPress={handleLogout}
              >
                <PhosphorIcon name="log-out-outline" size={collapsed ? 17 : 16} color={colors.danger} />
                {!collapsed ? <Text style={[styles.logoutLabel, { color: colors.danger }]}>{loggingOut ? "Logging out…" : "Log out"}</Text> : null}
              </Pressable>

              {!collapsed ? (
                <View style={styles.footerMeta}>
                  <Text style={[styles.footerText, { color: colors.iconMuted }]}>YUMMY Restaurant Admin</Text>
                  <Text style={[styles.footerText, { color: colors.iconMuted }]}>© 2023 All Rights Reserved</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.34)",
  },
  sidebar: {
    height: "100%",
    maxHeight: "100%",
    backgroundColor: "#1d1d1d",
    borderRightWidth: 1,
    borderRightColor: "#2b2b2b",
    shadowColor: "#000",
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 18,
  },
  sidebarExpanded: {
    width: 182,
    paddingHorizontal: 11,
    paddingTop: 14,
  },
  sidebarCollapsed: {
    width: 77,
    alignItems: "center",
    paddingTop: 18,
  },
  sidebarContent: {
    flexGrow: 1,
    paddingBottom: 14,
  },
  sidebarContentCollapsed: {
    width: "100%",
  },
  sidebarScroll: {
    flex: 1,
  },
  brandRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  brandRowCollapsed: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 1,
  },
  brandCopy: {
    gap: 8,
    minWidth: 0,
  },
  brandTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
  },
  brandSubtitle: {
    color: "#aaa9a7",
    fontSize: 11,
    lineHeight: 14,
  },
  brandMark: {
    color: "#ef3937",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
  },
  collapseButton: {
    width: 29,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: "#ef3937",
    shadowColor: "#ef3937",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 13,
    elevation: 10,
  },
  navList: {
    marginTop: 18,
    gap: 7,
  },
  navListCollapsed: {
    marginTop: 26,
    alignItems: "center",
    gap: 14,
  },
  navItem: {
    minHeight: 33,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderCurve: "continuous",
  },
  group: {
    gap: 4,
  },
  groupHeader: {
    minHeight: 33,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    borderCurve: "continuous",
  },
  groupNavItem: {
    flex: 1,
  },
  groupToggle: {
    width: 30,
    height: 33,
    alignItems: "center",
    justifyContent: "center",
  },
  submenu: {
    marginLeft: 18,
    paddingLeft: 8,
    gap: 3,
    borderLeftWidth: 1,
    borderLeftColor: "#3a3938",
  },
  submenuItem: {
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderCurve: "continuous",
  },
  submenuItemActive: {
    backgroundColor: "rgba(239,57,55,0.72)",
  },
  submenuLabel: {
    flex: 1,
    minWidth: 0,
    color: "#918f8d",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  submenuLabelActive: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  navItemCollapsed: {
    width: 30,
    height: 30,
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  navItemActive: {
    backgroundColor: "#ef3937",
  },
  navLabel: {
    flex: 1,
    minWidth: 0,
    color: "#aaa9a7",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "600",
  },
  navLabelActive: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  footer: {
    marginTop: "auto",
    paddingHorizontal: 7,
    paddingBottom: 14,
    gap: 4,
  },
  footerCollapsed: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  logoutItem: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderCurve: "continuous",
  },
  logoutItemCollapsed: {
    width: 30,
    justifyContent: "center",
    paddingHorizontal: 0,
  },
  logoutLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },
  footerMeta: {
    gap: 4,
  },
  footerText: {
    color: "#aaa9a7",
    fontSize: 10,
    lineHeight: 13,
  },
  pressed: {
    opacity: 0.76,
  },
  disabled: {
    opacity: 0.5,
  },
});
