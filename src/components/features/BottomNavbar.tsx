/**
 * BottomNavbar
 * Figma node: 2354:3697 ("App Navbar").
 */
import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { useCart } from "@/hooks/useCart";
import { CUSTOMER_HOME_ROUTE } from "@/lib/routes";
import { formatBadgeCount, getCartAccessibilityLabel } from "@/utils/badge-count";
import { type Href, usePathname, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type NavItem = {
  label: string;
  route: string;
  iconActive: string;
  iconInactive: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", route: CUSTOMER_HOME_ROUTE, iconActive: "home", iconInactive: "home-outline" },
  { label: "Menu", route: "/menu", iconActive: "grid", iconInactive: "grid-outline" },
  { label: "Search", route: "/search", iconActive: "search", iconInactive: "search-outline" },
  { label: "Cart", route: "/cart", iconActive: "bag", iconInactive: "bag-outline" },
  { label: "Track order", route: "/track-order", iconActive: "location", iconInactive: "location-outline" },
];

export function BottomNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { colors } = useTheme();

  return (
    <View style={[styles.navbar, { backgroundColor: colors.navbar, borderTopColor: colors.divider }]}>
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.route ||
          (item.route === CUSTOMER_HOME_ROUTE && pathname === "/home");

        return (
          <Pressable
            key={item.route}
            style={({ pressed }) => [
              styles.navItem,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push(item.route as Href)}
            accessibilityRole="button"
            accessibilityLabel={
              item.route === "/cart"
                ? getCartAccessibilityLabel(cartCount ?? 0)
                : item.label
            }
            accessibilityState={{ selected: isActive }}
          >
            <View style={styles.iconWrap}>
              <PhosphorIcon
                name={isActive ? item.iconActive : item.iconInactive}
                size={24}
                color={isActive ? colors.accent : colors.iconMuted}
                weight={isActive ? "fill" : "regular"}
              />
              {item.route === "/cart" && cartCount > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: colors.danger }]}>
                  <Text style={[styles.cartBadgeText, { color: colors.onDanger }]}>{formatBadgeCount(cartCount)}</Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    width: "100%",
    maxWidth: 394,
    height: 64,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "rgba(38,38,38,0.4)",
    backgroundColor: Colors.navbarCard,
    paddingHorizontal: 16,
  },
  navItem: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.72,
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    zIndex: 10,
  },
  cartBadgeText: {
    color: Colors.textPrimary,
    fontSize: 9,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
