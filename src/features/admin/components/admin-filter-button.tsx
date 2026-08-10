import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Spacing } from "@/constants/theme";
import { Pressable, StyleSheet, Text } from "react-native";

type AdminFilterButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress?: () => void;
  leadingIcon?: "filter-outline";
};

export function AdminFilterButton({ label, accessibilityLabel, leadingIcon, onPress }: AdminFilterButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      {leadingIcon ? <PhosphorIcon name={leadingIcon} size={13} color={Colors.textMuted} /> : null}
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <PhosphorIcon name="chevron-down" size={13} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 72,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: 11,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.76,
  },
});
