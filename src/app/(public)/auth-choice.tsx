import { ActionButton } from "@/components/features/ActionButton";
import { Colors, Spacing } from "@/constants/theme";
import { ONBOARDING_COMPLETE_KEY } from "@/lib/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const authIllustration = require("../../../assets/images/auth-illustration.svg");

export default function AuthChoiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.illustrationWrap}>
          <Image
            source={authIllustration}
            style={styles.illustration}
            contentFit="fill"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Explore the app</Text>
          <Text style={styles.body}>
            Now your finances are in one place and always under control
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton
          label="Log In"
          variant="authPrimary"
          onPress={() => router.push("/login")}
        />
        <ActionButton
          label="Create account"
          variant="authOutline"
          onPress={() => router.push("/signup")}
        />
      </View>

      {__DEV__ && (
        <Pressable
          style={styles.devReset}
          onPress={async () => {
            await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
            router.replace("/onboarding");
          }}
          hitSlop={8}
        >
          <Text style={styles.devResetText}>Show onboarding again</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.authBackground,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 64,
    paddingTop: 56,
  },
  illustrationWrap: {
    width: "100%",
    maxWidth: 316,
    height: 274,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  textBlock: {
    alignItems: "center",
    gap: Spacing.md,
    maxWidth: 320,
  },
  title: {
    color: Colors.authInk,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 42,
    textAlign: "center",
  },
  body: {
    color: Colors.authInk,
    fontSize: 17,
    fontWeight: "400",
    lineHeight: 22,
    textAlign: "center",
  },
  actions: {
    gap: 14,
    paddingBottom: 16,
  },
  devReset: {
    alignItems: "center",
    paddingBottom: 26,
  },
  devResetText: {
    color: Colors.authInk,
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.5,
    textDecorationLine: "underline",
  },
});
