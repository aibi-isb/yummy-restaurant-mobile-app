import { Colors } from "@/constants/theme";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function GuardLoading() {
  return (
    <View style={styles.root}>
      <ActivityIndicator color={Colors.danger} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
});
