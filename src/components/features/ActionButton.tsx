import { Colors, Radius, Typography } from "@/constants/theme";
import { Pressable, PressableProps, StyleSheet, Text, View } from "react-native";

type ActionButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "surface"
  | "authPrimary"
  | "authOutline";

type ActionButtonProps = {
  label: string;
  onPress?: PressableProps["onPress"];
  variant?: ActionButtonVariant;
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function ActionButton({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled = false,
  fullWidth = true,
}: ActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: Radius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  fullWidth: {
    width: "100%",
  },

  // Variants
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.surface,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  surface: {
    backgroundColor: Colors.surface,
    borderRadius: 1,
  },
  authPrimary: {
    backgroundColor: Colors.danger,
    borderRadius: Radius.figmaMd,
  },
  authOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.authOutline,
    borderRadius: Radius.figmaMd,
  },

  // Labels per variant
  label: {
    ...Typography.button,
  },
  primaryLabel: {
    color: Colors.background,
  },
  secondaryLabel: {
    color: Colors.textPrimary,
  },
  outlineLabel: {
    color: Colors.textPrimary,
  },
  surfaceLabel: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "600" as const,
    letterSpacing: -0.48,
  },
  authPrimaryLabel: {
    color: Colors.authBackground,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  authOutlineLabel: {
    color: Colors.authInk,
    fontSize: 16,
    fontWeight: "600" as const,
  },

  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.4,
  },
});
