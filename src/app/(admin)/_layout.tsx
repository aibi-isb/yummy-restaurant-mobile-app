import { AdminBottomTabBar } from "@/features/admin/components/admin-bottom-tab-bar";
import { AdminShellHeader } from "@/features/admin/components/admin-shell-header";
import { GuardLoading } from "@/components/navigation/GuardLoading";
import { useAdminTheme } from "@/providers/theme-provider";
import { CUSTOMER_HOME_ROUTE, isAdminRole, LOGIN_ROUTE } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Appearance, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";

export default function AdminLayout() {
  const { loading, session, role } = useAuthStore();
  const { colors, mode } = useAdminTheme();

  useEffect(() => {
    Appearance.setColorScheme(mode);
  }, [mode]);

  if (loading) {
    return <GuardLoading />;
  }

  if (!session) {
    return <Redirect href={LOGIN_ROUTE} />;
  }

  if (!isAdminRole(role)) {
    return <Redirect href={CUSTOMER_HOME_ROUTE} />;
  }

  return (
    <SafeAreaView style={[styles.shell, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <AdminShellHeader />
      <View style={styles.stackContainer}>
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
      </View>
      <AdminBottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
  },
});
