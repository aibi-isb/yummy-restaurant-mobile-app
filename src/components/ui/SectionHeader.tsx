import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/providers/theme-provider";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string | null;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel = "See All", onAction }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {actionLabel ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
        >
          <Text style={[styles.link, { color: colors.accent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.23,
  },
  link: {
    color: "#f7c2c0",
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: -0.23,
  },
});
