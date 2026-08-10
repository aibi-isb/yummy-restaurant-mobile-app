import { Colors, Radius, Spacing } from "@/constants/theme";
import type { ReactNode } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type AuthTextFieldProps = TextInputProps & {
  label: string;
  rightAccessory?: ReactNode;
};

export function AuthTextField({
  label,
  rightAccessory,
  style,
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          {...inputProps}
          style={[styles.input, style]}
          placeholderTextColor={Colors.authPlaceholder}
        />
        {rightAccessory}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    color: Colors.authInk,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
  },
  inputWrap: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.authInputBorder,
    borderRadius: Radius.figmaMd,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.authBackground,
  },
  input: {
    flex: 1,
    color: Colors.authInk,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20,
    padding: 0,
  },
});
