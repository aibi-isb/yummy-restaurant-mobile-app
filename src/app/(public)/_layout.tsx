import { GuardLoading } from "@/components/navigation/GuardLoading";
import { ADMIN_HOME_ROUTE, CUSTOMER_HOME_ROUTE, isAdminRole } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";
import { Redirect, Stack, useSegments } from "expo-router";
import { Appearance } from "react-native";
import { useEffect } from "react";

export default function PublicLayout() {
  const { loading, session, role } = useAuthStore();
  const segments = useSegments();
  const currentScreen = segments.at(-1);

  useEffect(() => {
    Appearance.setColorScheme("dark");
  }, []);

  if (loading && currentScreen !== "splash") {
    return <GuardLoading />;
  }

  if (!loading && session) {
    return <Redirect href={isAdminRole(role) ? ADMIN_HOME_ROUTE : CUSTOMER_HOME_ROUTE} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#121214" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="splash" options={{ animation: "fade" }} />
    </Stack>
  );
}
