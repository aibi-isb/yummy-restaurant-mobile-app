import { Colors } from "@/constants/theme";
import { initializeApp } from "@/lib/appInit";
import { ONBOARDING_COMPLETE_KEY, WELCOME_ROUTE } from "@/lib/routes";
import { useAuthStore } from "@/store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const SPLASH_DURATION = 2800;
const splashLogoMark = require("../../../assets/images/splash-logo-mark.svg");
const circleNotch = require("../../../assets/images/circle-notch.svg");

export default function SplashScreen() {
  const router = useRouter();
  const spin = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();

  useEffect(() => {
    let cancelled = false;
    const spinner = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinner.start();

    async function launch() {
      const startedAt = Date.now();

      await initializeApp();

      while (!cancelled && useAuthStore.getState().loading) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < SPLASH_DURATION) {
        await new Promise((resolve) => setTimeout(resolve, SPLASH_DURATION - elapsed));
      }

      if (cancelled || useAuthStore.getState().session) return;

      const hasCompletedOnboarding =
        (await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY)) === "true";

      router.replace(hasCompletedOnboarding ? WELCOME_ROUTE : "/onboarding");
    }

    void launch();

    return () => {
      cancelled = true;
      spinner.stop();
    };
  }, [router, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.overlay} />

      <View
        style={[
          styles.logoStack,
          { marginTop: Math.max(0, height * 0.03) },
        ]}
      >
        <Image
          source={splashLogoMark}
          style={styles.logoMark}
          contentFit="fill"
          accessibilityLabel="YUMMI restaurant logo"
        />

        <View style={styles.wordmarkBlock}>
          <Text style={styles.wordmark}>YUMMI</Text>
          <Text style={styles.tagline}>Taste Delivered</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.loader,
          {
            transform: [{ rotate }],
            top: Math.max(620, height * 0.815),
          },
        ]}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading"
      >
        <Image source={circleNotch} style={styles.loaderIcon} contentFit="fill" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.splashBackground,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  logoStack: {
    width: 233,
    alignItems: "flex-end",
    gap: 18,
  },
  logoMark: {
    width: 233,
    height: 152,
  },
  wordmarkBlock: {
    width: 212,
    alignItems: "center",
    gap: 11,
  },
  wordmark: {
    color: Colors.danger,
    fontSize: 55,
    fontWeight: "900",
    lineHeight: 58,
    letterSpacing: 0,
    fontStyle: "italic",
  },
  tagline: {
    color: Colors.splashText,
    fontSize: 25,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: 4,
    fontStyle: "italic",
  },
  loader: {
    position: "absolute",
    width: 32,
    height: 32,
  },
  loaderIcon: {
    width: "100%",
    height: "100%",
  },
});
