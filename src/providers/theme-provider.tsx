import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useSegments } from "expo-router";
import { createContext, use, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { adminLightTheme, darkThemeColors, lightTheme, type ThemeColors, type ThemeMode } from "@/constants/theme";

const THEME_STORAGE_KEY = "@yummy/theme-mode";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  adminColors: ThemeColors;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "dark" || value === "light";
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const segments = useSegments();
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((storedMode) => {
        if (mounted && isThemeMode(storedMode)) setModeState(storedMode);
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode).catch(() => undefined);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const colors = mode === "dark" ? darkThemeColors : lightTheme;
  const adminColors = mode === "dark" ? darkThemeColors : adminLightTheme;
  const value = useMemo<ThemeContextValue>(() => ({ mode, colors, adminColors, hydrated, setMode, toggleMode }), [adminColors, colors, hydrated, mode, setMode, toggleMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <StatusBar style={segments[0] === "(admin)" || segments[0] === "(customer)" ? (mode === "dark" ? "light" : "dark") : "light"} />
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = use(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}

export function useAdminTheme() {
  const value = use(ThemeContext);
  if (!value) throw new Error("useAdminTheme must be used inside ThemeProvider");
  return { ...value, colors: value.adminColors };
}
