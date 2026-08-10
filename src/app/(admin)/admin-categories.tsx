import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors } from "@/constants/theme";
import {
  getCategories,
  updateCategoryImage,
  type Category,
} from "@/services/supabase/categoryService";
import {
  getManagedCategoryImagePath,
  removeCategoryImage,
  uploadCategoryImage,
} from "@/services/supabase/storageService";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAdminTheme } from "@/providers/theme-provider";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function AdminCategoriesScreen() {
  const { colors } = useAdminTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getCategories()
      .then((items) => {
        if (active) setCategories(items);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load categories.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSaved = (categoryId: string, image?: string) => {
    setCategories((items) =>
      items.map((category) => (category.id === categoryId ? { ...category, image } : category))
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
      <Stack.Screen options={{ title: "Categories" }} />
      <StatusBar style="light" />
      <ScrollView
        style={[styles.screen, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <Text style={[styles.title, { color: colors.textHeader }]}>Category Images</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Upload an image or save a public HTTPS image URL for each menu category.
          </Text>
        </View>

        {loading ? <ActivityIndicator color={colors.accent} /> : null}
        {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

        <View style={styles.list}>
          {categories.map((category) => (
            <CategoryImageEditor key={category.id} category={category} onSaved={handleSaved} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryImageEditor({
  category,
  onSaved,
}: {
  category: Category;
  onSaved: (categoryId: string, image?: string) => void;
}) {
  const { colors } = useAdminTheme();
  const [imageUrl, setImageUrl] = useState(category.image ?? "");
  const [pickedAsset, setPickedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const previewUri = pickedAsset?.uri ?? imageUrl.trim();

  const pickImage = async () => {
    setMessage(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage("Photo-library permission is required to upload a category image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
      setMessage("Choose an image smaller than 5 MB.");
      return;
    }

    setPickedAsset(asset);
    setPreviewFailed(false);
  };

  const save = async () => {
    const enteredUrl = imageUrl.trim();
    if (!pickedAsset && enteredUrl && !/^https:\/\//i.test(enteredUrl)) {
      setMessage("Enter a valid HTTPS image URL.");
      return;
    }

    setSaving(true);
    setMessage(null);
    let uploadedPath: string | null = null;

    try {
      let nextImage = enteredUrl;
      if (pickedAsset) {
        const uploaded = await uploadCategoryImage({
          categoryId: category.id,
          contentType: pickedAsset.mimeType,
          fileName: pickedAsset.fileName,
          uri: pickedAsset.uri,
        });
        uploadedPath = uploaded.path;
        nextImage = uploaded.url;
      }

      const updated = await updateCategoryImage(category.id, nextImage);
      const previousPath = getManagedCategoryImagePath(category.image);
      if (previousPath && updated.image !== category.image) {
        void removeCategoryImage(previousPath).catch(() => undefined);
      }

      setImageUrl(updated.image ?? "");
      setPickedAsset(null);
      setPreviewFailed(false);
      setMessage("Saved");
      onSaved(category.id, updated.image);
    } catch (reason) {
      if (uploadedPath) void removeCategoryImage(uploadedPath).catch(() => undefined);
      setMessage(reason instanceof Error ? reason.message : "Could not save the category image.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }] }>
      <View style={styles.cardHeader}>
        <View style={styles.preview}>
          {previewUri && !previewFailed ? (
            <Image
              source={{ uri: previewUri }}
              style={styles.previewImage}
              contentFit="cover"
              accessibilityLabel={`${category.name} category preview`}
              onError={() => setPreviewFailed(true)}
            />
          ) : (
            <PhosphorIcon name="image-outline" size={30} color={colors.iconMuted} />
          )}
        </View>
        <View style={styles.cardTitleCopy}>
          <Text style={[styles.categoryName, { color: colors.textPrimary }]}>{category.name}</Text>
          <Text style={[styles.categoryId, { color: colors.textMuted }]}>{category.id}</Text>
        </View>
      </View>

      <TextInput
        accessibilityLabel={`${category.name} image URL`}
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={(value) => {
          setImageUrl(value);
          setPickedAsset(null);
          setPreviewFailed(false);
          setMessage(null);
        }}
        placeholder="https://..."
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.input, borderColor: colors.inputBorder }]}
        value={imageUrl}
      />

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Choose ${category.name} image`}
          disabled={saving}
          onPress={pickImage}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <PhosphorIcon name="cloud-upload-outline" size={17} color={colors.accent} />
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>Upload</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Save ${category.name} image`}
          disabled={saving}
          onPress={save}
          style={({ pressed }) => [
            [styles.saveButton, { backgroundColor: colors.accent }],
            pressed && styles.pressed,
            saving && styles.disabled,
          ]}
        >
          <Text style={[styles.saveButtonText, { color: colors.onDanger }]}>{saving ? "Saving…" : "Save"}</Text>
        </Pressable>
      </View>

      {message ? (
        <Text style={[message === "Saved" ? styles.successText : styles.errorText, { color: message === "Saved" ? colors.green : colors.danger }]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 40, gap: 20 },
  heading: { gap: 6 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, lineHeight: 19 },
  list: { gap: 14 },
  card: {
    gap: 14,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    borderCurve: "continuous",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  preview: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: "100%" },
  cardTitleCopy: { flex: 1, gap: 3 },
  categoryName: { fontSize: 17, fontWeight: "700" },
  categoryId: { fontSize: 12 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  secondaryButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
  },
  secondaryButtonText: { fontSize: 13, fontWeight: "700" },
  saveButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  saveButtonText: { fontSize: 13, fontWeight: "800" },
  errorText: { fontSize: 12, lineHeight: 17 },
  successText: { fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.5 },
});
