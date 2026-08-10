import { BottomNavbar } from "@/components/features/BottomNavbar";
import { GuardLoading } from "@/components/navigation/GuardLoading";
import { useTheme } from "@/providers/theme-provider";
import { useCart } from "@/hooks/useCart";
import { useNotifications } from "@/hooks/useNotifications";
import { ADMIN_HOME_ROUTE, isAdminRole, LOGIN_ROUTE } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, Appearance, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CustomerLayout() {
  const { loading, session, role, user } = useAuthStore();
  const { colors, mode } = useTheme();

  useEffect(() => {
    Appearance.setColorScheme(mode);
  }, [mode]);
  const { refresh: refreshCart } = useCart();
  const { refresh: refreshNotifications } = useNotifications(user?.id);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void Promise.all([refreshCart(), refreshNotifications()]);
      }
    });

    return () => subscription.remove();
  }, [refreshCart, refreshNotifications]);

  if (loading) {
    return <GuardLoading />;
  }

  if (!session) {
    return <Redirect href={LOGIN_ROUTE} />;
  }

  if (isAdminRole(role)) {
    return <Redirect href={ADMIN_HOME_ROUTE} />;
  }

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
      </View>
      <BottomNavbar />
    </SafeAreaView>
  );
}
