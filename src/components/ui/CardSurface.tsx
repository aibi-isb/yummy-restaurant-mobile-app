import { Radius } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

type CardSurfaceProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;

/**
 * Shared elevated surface for customer-facing cards and panels.
 * Padding is intentionally left to each screen so the component works for
 * compact rows as well as larger summary sections.
 */
export function CardSurface({ children, style, testID }: CardSurfaceProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          boxShadow: colors.cardShadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: Radius.md,
    borderCurve: "continuous",
  },
});
