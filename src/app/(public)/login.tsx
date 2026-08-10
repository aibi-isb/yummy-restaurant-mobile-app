import { PhosphorIcon } from "@/components/PhosphorIcon";
import { ActionButton } from "@/components/features/ActionButton";
import { AuthTextField } from "@/components/features/AuthTextField";
import { Colors, Spacing } from "@/constants/theme";
import { getSessionDestination } from "@/lib/routes";
import { signInWithIdentifier } from "@/services/authService";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const authStar = require("../../../assets/images/auth-star.svg");

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logIn = async () => {
    if (!identifier.trim() || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await signInWithIdentifier(identifier.trim(), password);
      if (!data.session) {
        throw new Error("Login succeeded but no session was returned.");
      }

      router.replace(getSessionDestination(data.session));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const goToSignup = () => router.push("/signup");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Image
          source={authStar}
          style={styles.star}
          contentFit="fill"
          accessibilityIgnoresInvertColors
        />

        <Text style={styles.title}>Log in</Text>

        <View style={styles.form}>
          <AuthTextField
            label="Username or email"
            value={identifier}
            onChangeText={(text) => {
              setIdentifier(text);
              setError(null);
            }}
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            rightAccessory={
              <PhosphorIcon
                name="checkmark-circle"
                size={20}
                color={Colors.authInk}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            }
          />

          <AuthTextField
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            textContentType="password"
            rightAccessory={
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              >
                <PhosphorIcon
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={Colors.authInk}
                />
              </Pressable>
            }
          />
        </View>

        {/* Error message */}
        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <Pressable
          style={styles.forgotLink}
          onPress={() => setError("Password reset is not enabled for this assignment build.")}
          accessibilityRole="button"
          accessibilityLabel="Forgot password?"
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.authInk} size="small" />
          </View>
        ) : (
          <ActionButton label="Log in" variant="authPrimary" onPress={logIn} />
        )}

        <Pressable
          style={styles.signupLink}
          onPress={goToSignup}
          accessibilityRole="button"
          accessibilityLabel="Don't have an account? Sign up"
        >
          <Text style={styles.signupText}>
            {"Don't have an account? "}
            <Text style={styles.signupTextStrong}>Sign up</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.authBackground,
  },
  content: {
    minHeight: "100%",
    paddingHorizontal: Spacing.xl,
    paddingTop: 107,
    paddingBottom: 42,
  },
  star: {
    position: "absolute",
    top: 47,
    right: 27,
    width: 46,
    height: 44,
  },
  title: {
    color: Colors.authInk,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 39,
    marginBottom: 38,
  },
  form: {
    gap: 24,
    marginBottom: 12,
  },
  errorText: {
    color: "#e53935",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 8,
    marginBottom: 4,
  },
  forgotLink: {
    alignSelf: "flex-end",
    paddingVertical: Spacing.xs,
    marginBottom: 35,
  },
  forgotText: {
    color: Colors.authInk,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
  },
  loadingWrap: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  signupLink: {
    alignSelf: "center",
    marginTop: 113,
    padding: Spacing.xs,
  },
  signupText: {
    color: Colors.authInk,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
  },
  signupTextStrong: {
    fontWeight: "600",
  },
});
