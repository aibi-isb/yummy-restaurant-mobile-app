import { useAuthStore } from "@/store/authStore";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { ThemeProvider } from "@/providers/theme-provider";

export default function RootLayout() {
  const { init } = useAuthStore();

  // Bootstrap: load the persisted session and subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);          // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#121214" },
          animation: "slide_from_right",
        }}
      />
    </ThemeProvider>
  );
}
