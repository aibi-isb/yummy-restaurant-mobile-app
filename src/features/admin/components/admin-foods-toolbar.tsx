import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function AdminFoodsToolbar({ onQueryChange, onViewModeChange, query, viewMode }: {
  onQueryChange: (query: string) => void;
  onViewModeChange: (mode: "list" | "grid") => void;
  query: string;
  viewMode: "list" | "grid";
}) {
  const router = useRouter();

  return (
    <View style={styles.hero}>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <PhosphorIcon name="search" size={13} color={Colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            style={styles.searchInput}
            placeholder="Search here"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            accessibilityLabel="Search menu"
          />
        </View>
        <View style={styles.viewToggle}>
          <Pressable style={({ pressed }) => [styles.toggleButton, viewMode === "list" && styles.toggleButtonActive, pressed && styles.pressed]} accessibilityRole="button" accessibilityState={{ selected: viewMode === "list" }} accessibilityLabel="List view" onPress={() => onViewModeChange("list")}>
            <PhosphorIcon name="list" size={14} color={Colors.textMuted} />
          </Pressable>
          <Pressable style={({ pressed }) => [styles.toggleButton, viewMode === "grid" && styles.toggleButtonActive, pressed && styles.pressed]} accessibilityRole="button" accessibilityState={{ selected: viewMode === "grid" }} accessibilityLabel="Grid view" onPress={() => onViewModeChange("grid")}>
            <PhosphorIcon name="grid" size={14} color={Colors.textPrimary} />
          </Pressable>
        </View>
        <Pressable
          style={({ pressed }) => [styles.newMenuButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Create new menu"
          onPress={() => router.push("/admin-foods/new" as never)}
        >
          <PhosphorIcon name="add" size={13} color={Colors.textPrimary} />
          <Text style={styles.newMenuText}>New Menu</Text>
        </Pressable>
      </View>

      <View style={styles.titleGroup}>
        <Text style={styles.title}>Foods</Text>
        <Text style={styles.subtitle}>Here is your menu summary with graph view</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 100,
    justifyContent: "center",
    paddingHorizontal: 15,
    gap: 12,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  searchBox: {
    flex: 1,
    minWidth: 120,
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderCurve: "continuous",
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Colors.textPrimary,
    fontSize: 10.5,
    paddingVertical: 0,
  },
  viewToggle: {
    height: 29,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: Colors.input,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  toggleButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.danger,
  },
  newMenuButton: {
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 7,
    borderCurve: "continuous",
    backgroundColor: Colors.danger,
  },
  newMenuText: {
    color: Colors.textPrimary,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "800",
  },
  titleGroup: {
    gap: 0,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 10.5,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.76,
  },
});
