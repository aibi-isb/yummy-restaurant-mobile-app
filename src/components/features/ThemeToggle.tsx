import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Radius, Spacing, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

type ThemeToggleProps = {
  compact?: boolean;
  variant?: "row" | "header";
  headerSize?: "sm" | "md";
  colors?: ThemeColors;
};

export function ThemeToggle({ compact = false, variant = "row", headerSize = "md", colors: colorOverride }: ThemeToggleProps) {
  const { mode, colors: themeColors, toggleMode } = useTheme();
  const colors = colorOverride ?? themeColors;
  const isDark = mode === "dark";

  if (variant === "header") {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.headerButton,
          headerSize === "sm" && styles.headerButtonSmall,
          { backgroundColor: colors.controlSurface, borderColor: colors.divider },
          pressed && styles.pressed,
        ]}
        onPress={toggleMode}
        accessibilityRole="switch"
        accessibilityState={{ checked: isDark }}
        accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <PhosphorIcon
          name={isDark ? "moon-outline" : "sunny-outline"}
          size={headerSize === "sm" ? 14 : 18}
          color={colors.accent}
        />
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, compact && styles.rowCompact, { backgroundColor: colors.controlSurface, borderColor: colors.divider }]}>
      <View style={[styles.icon, { backgroundColor: `${colors.accent}1c` }]}>
        <PhosphorIcon name={isDark ? "moon-outline" : "sunny-outline"} size={17} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>Appearance</Text>
        {!compact ? <Text style={[styles.description, { color: colors.textMuted }]}>{isDark ? "Dark mode" : "Light mode"}</Text> : null}
      </View>
      <Switch
        value={isDark}
        onValueChange={(value) => {
          if (value !== isDark) toggleMode();
        }}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={isDark ? colors.surface : colors.textPrimary}
        ios_backgroundColor={colors.border}
        accessibilityLabel="Dark mode"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    borderCurve: "continuous",
  },
  rowCompact: {
    minHeight: 52,
    paddingHorizontal: Spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: Radius.full,
    borderCurve: "continuous",
  },
  headerButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 7,
  },
  icon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.76,
  },
});
