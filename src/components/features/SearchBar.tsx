import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type SearchBarProps = {
  value?: string;
  onChangeText?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  showMic?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Shared search field used by Home, Menu, and Search routes. */
export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Search",
  accessibilityLabel = "Search food",
  showMic = true,
  style,
  testID,
}: SearchBarProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const textValue = value ?? internalValue;

  const handleChangeText = (nextValue: string) => {
    if (!isControlled) setInternalValue(nextValue);
    onChangeText?.(nextValue);
  };

  return (
    <Pressable
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: colors.controlSurface,
          borderColor: colors.cardBorder,
          boxShadow: colors.cardShadow,
        },
        style,
      ]}
      onPress={() => inputRef.current?.focus()}
      accessibilityRole="search"
      accessibilityLabel={accessibilityLabel}
    >
      <PhosphorIcon name="search-outline" size={16} color={colors.textMuted} />
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        value={textValue}
        onChangeText={handleChangeText}
        onSubmitEditing={(event) => onSubmit?.(event.nativeEvent.text)}
        autoCorrect={false}
        accessibilityLabel={accessibilityLabel}
      />
      {showMic ? <PhosphorIcon name="mic-outline" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.sm,
    borderCurve: "continuous",
    paddingHorizontal: Spacing.md,
    paddingVertical: 11,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: "400",
    letterSpacing: -0.08,
    padding: 0,
  },
});
