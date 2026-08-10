import { PhosphorIcon } from "@/components/PhosphorIcon";
import { ThemeToggle } from "@/components/features/ThemeToggle";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { profileImage } from "@/data/restaurant";
import { getProfile } from "@/services/supabase/userService";
import { uploadAvatar } from "@/services/supabase/storageService";
import { supabase } from "@/services/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { useAdminTheme } from "@/providers/theme-provider";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminProfileScreen() {
  const { user } = useAuthStore();
  const { colors, mode } = useAdminTheme();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("Admin");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      return;
    }

    getProfile(user.id)
      .then((profile) => {
        if (cancelled || !profile) return;
        setFullName(profile.fullName || user.user_metadata?.full_name || "Admin");
        setUsername(profile.username || "");
        setAvatarUrl(profile.avatarUrl ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.user_metadata?.full_name]);

  const pickAndUploadAvatar = async () => {
    if (!user?.id || uploading) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to your photo library to change your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const publicUrl = await uploadAvatar({ uri: result.assets[0].uri, userId: user.id });
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (authError) throw authError;

      setAvatarUrl(publicUrl);
      Alert.alert("Profile updated", "Your admin profile picture has been updated.");
    } catch (error) {
      Alert.alert("Upload failed", error instanceof Error ? error.message : "Could not upload your profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const avatarSource = avatarUrl ?? (user?.user_metadata?.avatar_url as string | undefined) ?? profileImage;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
      <Stack.Screen options={{ title: "Profile" }} />
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Admin profile</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Manage the profile shown in the admin header.</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
          <Pressable
            style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
            onPress={pickAndUploadAvatar}
            disabled={uploading || loading}
            accessibilityRole="button"
            accessibilityLabel="Change admin profile picture"
            accessibilityState={{ disabled: uploading || loading }}
          >
            <Image source={{ uri: avatarSource }} style={styles.avatar} contentFit="cover" accessibilityLabel="Admin profile picture" />
            <View style={[styles.cameraBadge, { backgroundColor: colors.danger, borderColor: colors.surface }]}>
              {uploading ? <ActivityIndicator color={colors.textPrimary} size="small" /> : <PhosphorIcon name="camera-outline" size={16} color={colors.textPrimary} />}
            </View>
          </Pressable>
          <View style={styles.profileCopy}>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{loading ? "Loading profile…" : fullName}</Text>
            <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email ?? ""}</Text>
            {username ? <Text style={[styles.username, { color: colors.accent }]}>@{username}</Text> : null}
          </View>
        </View>

        <ThemeToggle />

        <View style={[styles.tipCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.divider }]}>
          <PhosphorIcon name="information-circle-outline" size={18} color={colors.accent} />
          <Text style={[styles.tipText, { color: colors.textMuted }]}>Tap your profile picture to choose a new image. It will also update the avatar in the admin header.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  headerBlock: {
    gap: Spacing.xs,
  },
  title: {
    ...Typography.heading1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  profileCard: {
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.xxl,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  avatarButton: {
    position: "relative",
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  cameraBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: Colors.danger,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  profileCopy: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  name: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  email: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  username: {
    color: Colors.accent,
    fontSize: 12,
    lineHeight: 16,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  tipText: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  pressed: {
    opacity: 0.76,
  },
});
