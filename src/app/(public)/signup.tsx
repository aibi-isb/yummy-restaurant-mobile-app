import { PhosphorIcon } from "@/components/PhosphorIcon";
import { ActionButton } from "@/components/features/ActionButton";
import { AuthTextField } from "@/components/features/AuthTextField";
import { Colors, Spacing } from "@/constants/theme";
import { getSessionDestination } from "@/lib/routes";
import { registerCustomer } from "@/services/authService";
import { isValidPhone, normalizePhone, requireFields, sanitizePhoneInput } from "@/utils/validation";
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

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const register = async () => {
    // ── Local validation ──────────────────────────────────────────────────────
    const missing = requireFields({
      "Full name": fullName,
      Address: address,
      Phone: phone,
      Username: username,
      Email: email,
    });
    if (missing) return setError(missing);
    if (!isValidPhone(phone)) return setError("Use +232 77 123 456 or 077 123 456.");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // ── Supabase sign-up ──────────────────────────────────────────────────────
    setError(null);
    setLoading(true);
    try {
      const data = await registerCustomer({
        address: address.trim(),
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        phone: normalizePhone(phone),
        username: username.trim(),
      });

      // Supabase may require email confirmation before a session is granted.
      // If there's already a session, go straight to the app; otherwise prompt.
      if (data.session) {
        router.replace(getSessionDestination(data.session));
      } else {
        // Email confirmation is required — send the user to login with a notice
        router.replace("/login");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.push("/login");

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

        <Text style={styles.title}>Register</Text>

        <View style={styles.form}>
          <AuthTextField
            label="Full name"
            value={fullName}
            onChangeText={(text) => { setFullName(text); clearError(); }}
            placeholder="Your name"
            textContentType="name"
          />
          <AuthTextField
            label="Address"
            value={address}
            onChangeText={(text) => { setAddress(text); clearError(); }}
            placeholder="Delivery address"
            textContentType="fullStreetAddress"
          />
          <AuthTextField
            label="Phone"
            value={phone}
            onChangeText={(text) => { setPhone(sanitizePhoneInput(text)); clearError(); }}
            placeholder="+232 77 123 456"
            keyboardType="phone-pad"
            maxLength={24}
            textContentType="telephoneNumber"
          />
          <AuthTextField
            label="Username"
            value={username}
            onChangeText={(text) => { setUsername(text); clearError(); }}
            placeholder="username"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
          />
          <AuthTextField
            label="Email"
            value={email}
            onChangeText={(text) => { setEmail(text); clearError(); }}
            placeholder="you@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />

          <AuthTextField
            label="Create a password"
            value={password}
            onChangeText={(text) => { setPassword(text); clearError(); }}
            placeholder="Min. 8 chars"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            rightAccessory={
              <PasswordToggle
                visible={showPassword}
                onPress={() => setShowPassword((v) => !v)}
                label={showPassword ? "Hide password" : "Show password"}
              />
            }
          />

          <AuthTextField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); clearError(); }}
            placeholder="Re-enter"
            secureTextEntry={!showConfirmPassword}
            textContentType="newPassword"
            rightAccessory={
              <PasswordToggle
                visible={showConfirmPassword}
                onPress={() => setShowConfirmPassword((v) => !v)}
                label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              />
            }
          />
        </View>

        {/* Error message */}
        {error ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.authInk} size="small" />
          </View>
        ) : (
          <ActionButton label="Register" variant="authPrimary" onPress={register} />
        )}

        <Pressable
          style={styles.loginLink}
          onPress={goToLogin}
          accessibilityRole="button"
          accessibilityLabel="Already have an account? Log in"
        >
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.loginTextStrong}>Log in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Password toggle ──────────────────────────────────────────────────────────

type PasswordToggleProps = {
  visible: boolean;
  onPress: () => void;
  label: string;
};

function PasswordToggle({ visible, onPress, label }: PasswordToggleProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <PhosphorIcon
        name={visible ? "eye-off-outline" : "eye-outline"}
        size={20}
        color={Colors.authInk}
      />
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    marginBottom: 16,
  },
  errorText: {
    color: "#e53935",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 16,
  },
  loadingWrap: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  loginLink: {
    alignSelf: "center",
    marginTop: 54,
    padding: Spacing.xs,
  },
  loginText: {
    color: Colors.authInk,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
  },
  loginTextStrong: {
    fontWeight: "600",
  },
});
