import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ProductQuantityProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
};

export function ProductQuantity({ value, onChange, min = 1, max = 99 }: ProductQuantityProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quantity</Text>

      <View style={styles.stepper}>
        <Pressable
          style={({ pressed }) => [styles.stepButton, pressed && styles.stepPressed]}
          onPress={decrement}
          disabled={value <= min}
          accessibilityLabel="Decrease quantity"
          accessibilityRole="button"
        >
          <PhosphorIcon
            name="remove-outline"
            size={20}
            color={value <= min ? Colors.textDisabled : Colors.textPrimary}
          />
        </Pressable>

        <View style={styles.valueBox}>
          <Text style={styles.valueText}>{value}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.stepButton, pressed && styles.stepPressed]}
          onPress={increment}
          disabled={value >= max}
          accessibilityLabel="Increase quantity"
          accessibilityRole="button"
        >
          <PhosphorIcon
            name="add-outline"
            size={20}
            color={value >= max ? Colors.textDisabled : Colors.textPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 24,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: Radius.figmaMd,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  stepButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  stepPressed: {
    backgroundColor: Colors.divider,
  },
  valueBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  valueText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.48,
    lineHeight: 29,
  },
});
