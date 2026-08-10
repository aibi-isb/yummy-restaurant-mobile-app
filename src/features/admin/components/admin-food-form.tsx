import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing, Typography } from "@/constants/theme";
import { AdminFoodMenuItem } from "@/features/admin/types";
import { useMenuCategories } from "@/features/menu/hooks/useMenuCategories";
import { createFood, updateFood } from "@/services/foodService";
import { uploadFoodImage } from "@/services/supabase/storageService";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { fetch } from "expo/fetch";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AdminFoodFormProps = {
  mode: "add" | "edit";
  food?: AdminFoodMenuItem;
};

const MAX_DESCRIPTION_LENGTH = 280;

export function AdminFoodForm({ food, mode }: AdminFoodFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const { categories, loading: categoriesLoading } = useMenuCategories();
  const [name, setName] = useState(food?.name ?? "");
  const [category, setCategory] = useState(food?.categories[0] ?? "Food");
  const [price, setPrice] = useState(food?.price ?? "");
  const [description, setDescription] = useState(food?.description ?? "");
  const [imageUrl, setImageUrl] = useState(food?.image ?? "");
  const [available, setAvailable] = useState(food?.available ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pickedImage, setPickedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const categoryOptions = useMemo(() => {
    const options = categories.map((item) => item.name).filter(Boolean);
    return Array.from(new Set([category, ...options]));
  }, [categories, category]);

  const pickImage = async () => {
    setError(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError("Photo-library permission is required to upload a food image.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        setError("Choose an image smaller than 5 MB.");
        return;
      }

      setPickedImage(asset);
      setImageUrl(asset.uri);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open your photo library.");
    }
  };

  const submit = async () => {
    if (!name.trim() || !category.trim() || !price.trim() || !description.trim()) {
      setError("Complete the required fields before saving this food item.");
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a valid food price greater than zero.");
      return;
    }

    if (!pickedImage && imageUrl.trim() && !/^https?:\/\//i.test(imageUrl.trim())) {
      setError("Use a valid public image URL, or choose a photo from your library.");
      return;
    }

    setSaving(true);
    setError(null);

    let savedImage = imageUrl.trim();
    try {
      if (pickedImage) {
        const response = await fetch(pickedImage.uri);
        if (!response.ok) throw new Error("Could not read the selected food image.");
        savedImage = await uploadFoodImage({
          file: await response.arrayBuffer(),
          contentType: pickedImage.mimeType ?? "image/jpeg",
          fileName: pickedImage.fileName ?? "food-image.jpg",
        });
      }
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Could not upload food image.");
      return;
    }

    const primaryCategory = category.trim();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: primaryCategory,
      categories: Array.from(new Set([primaryCategory, "Food"])),
      price: numericPrice,
      image: savedImage,
      featured: true,
      popular: false,
      available,
    };

    try {
      if (isEdit && food) {
        await updateFood(food.id, payload);
      } else {
        await createFood(payload);
      }
      router.replace("/admin-foods" as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save food item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Back to foods"
            onPress={() => router.back()}
          >
            <PhosphorIcon name="chevron-back" size={21} color={Colors.textPrimary} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>MENU MANAGEMENT</Text>
            <Text style={styles.title}>{isEdit ? "Edit Food" : "Add New Food"}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <PhosphorIcon name="restaurant-outline" size={20} color="#ff8904" />
          </View>
          <View style={styles.introCopy}>
            <Text style={styles.introTitle}>{isEdit ? "Keep your menu up to date" : "Create a menu favourite"}</Text>
            <Text style={styles.introText}>
              Add the details customers need to choose this item with confidence.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading icon="camera-outline" title="Food image" subtitle="Use a clear, appetising photo" />

          {imageUrl ? (
            <Pressable
              style={({ pressed }) => [styles.imagePreviewWrap, pressed && styles.pressed]}
              onPress={pickImage}
              accessibilityRole="button"
              accessibilityLabel="Change food image"
            >
              <Image source={{ uri: imageUrl }} style={styles.imagePreview} contentFit="cover" accessibilityLabel={name || "Food image"} />
              <View style={styles.imageOverlay}>
                <View style={styles.imageOverlayButton}>
                  <PhosphorIcon name="pencil" size={16} color={Colors.textPrimary} />
                  <Text style={styles.imageOverlayText}>Change photo</Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.uploadBox, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Upload food image"
              onPress={pickImage}
            >
              <View style={styles.uploadIcon}>
                <PhosphorIcon name="cloud-upload-outline" size={24} color="#ff8904" />
              </View>
              <Text style={styles.uploadTitle}>Upload a food photo</Text>
              <Text style={styles.uploadHint}>JPG or PNG · 5 MB maximum</Text>
            </Pressable>
          )}

          <FoodInput
            label="Image URL"
            helper={pickedImage ? "Selected photo uploads when you save." : "Optional — use this if your image is already hosted."}
            placeholder="https://..."
            value={imageUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={(value) => {
              setPickedImage(null);
              setImageUrl(value);
            }}
          />
        </View>

        <View style={styles.section}>
          <SectionHeading icon="document-text-outline" title="Food details" subtitle="Give this item a clear identity" />

          <FoodInput
            label="Food name"
            required
            placeholder="e.g. Classic beef burger"
            value={name}
            maxLength={80}
            autoCapitalize="words"
            onChangeText={setName}
          />

          <View style={styles.inputGroup}>
            <FieldLabel label="Category" required />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
              {categoryOptions.map((option) => {
                const selected = option.toLowerCase() === category.toLowerCase();
                return (
                  <Pressable
                    key={option}
                    style={({ pressed }) => [styles.categoryChip, selected && styles.categoryChipSelected, pressed && styles.pressed]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Category ${option}`}
                    onPress={() => setCategory(option)}
                  >
                    {selected ? <PhosphorIcon name="checkmark" size={14} color={Colors.textPrimary} weight="bold" /> : null}
                    <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>{option}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {categoriesLoading ? <Text style={styles.helperText}>Loading categories…</Text> : null}
          </View>

          <FoodInput
            label="Price"
            required
            helper="Enter the selling price in Sierra Leonean leones."
            placeholder="0"
            value={price}
            prefix="Le"
            keyboardType="decimal-pad"
            onChangeText={setPrice}
          />

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <FieldLabel label="Description" required />
              <Text style={styles.characterCount}>{description.length}/{MAX_DESCRIPTION_LENGTH}</Text>
            </View>
            <View style={[styles.inputShell, styles.textAreaShell]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the ingredients, flavour, or portion..."
                placeholderTextColor={Colors.textDisabled}
                multiline
                maxLength={MAX_DESCRIPTION_LENGTH}
                textAlignVertical="top"
                accessibilityLabel="Food description"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeading icon="eye-outline" title="Availability" subtitle="Choose whether customers can order it now" />
          <View style={styles.statusRow}>
            <StatusOption label="Available" description="Visible to customers" selected={available} onPress={() => setAvailable(true)} />
            <StatusOption label="Unavailable" description="Hide from the menu" selected={!available} onPress={() => setAvailable(false)} />
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard} accessibilityRole="alert">
            <PhosphorIcon name="warning" size={19} color="#ff8d8f" />
            <Text style={styles.errorText} selectable>{error}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed, saving && styles.disabled]}
            accessibilityRole="button"
            accessibilityLabel="Cancel and go back"
            disabled={saving}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.submitButton, pressed && !saving && styles.pressed, saving && styles.disabled]}
            accessibilityRole="button"
            accessibilityLabel={isEdit ? "Update food" : "Save food"}
            accessibilityState={{ disabled: saving, busy: saving }}
            disabled={saving}
            onPress={submit}
          >
            {saving ? <ActivityIndicator size="small" color={Colors.textPrimary} /> : <PhosphorIcon name="checkmark" size={18} color={Colors.textPrimary} weight="bold" />}
            <Text style={styles.submitText}>{saving ? "Saving…" : isEdit ? "Update food" : "Save food"}</Text>
          </Pressable>
        </View>
        <Text style={styles.requiredHint}>* Required fields</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeading({ icon, subtitle, title }: { icon: string; subtitle: string; title: string }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIcon}>
        <PhosphorIcon name={icon} size={18} color="#ff8904" />
      </View>
      <View style={styles.sectionHeadingCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function FoodInput({ label, helper, prefix, required, ...inputProps }: {
  label: string;
  helper?: string;
  prefix?: string;
  required?: boolean;
} & TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <FieldLabel label={label} required={required} />
      <View style={[styles.inputShell, focused && styles.inputShellFocused]}>
        {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
        <TextInput
          {...inputProps}
          style={[styles.input, inputProps.multiline && styles.textArea]}
          placeholderTextColor={Colors.textDisabled}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
        />
      </View>
      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
}

function FieldLabel({ label, required = false }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}{required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

function StatusOption({ description, label, onPress, selected }: { description: string; label: string; onPress: () => void; selected: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.statusOption, selected && styles.statusOptionSelected, pressed && styles.pressed]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <PhosphorIcon name="checkmark" size={13} color={Colors.textPrimary} weight="bold" /> : null}
      </View>
      <View style={styles.statusCopy}>
        <Text style={[styles.statusLabel, selected && styles.statusLabelSelected]}>{label}</Text>
        <Text style={styles.statusDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 36,
  },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    borderCurve: "continuous",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: Colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: 40,
  },
  introCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderCurve: "continuous",
    backgroundColor: "rgba(229,57,53,0.12)",
    borderWidth: 1,
    borderColor: "rgba(229,57,53,0.28)",
  },
  introIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,137,4,0.14)",
  },
  introCopy: {
    flex: 1,
    gap: 3,
  },
  introTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  introText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderCurve: "continuous",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "#29292f",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,137,4,0.12)",
  },
  sectionHeadingCopy: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  uploadBox: {
    minHeight: 178,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#55555d",
  },
  uploadIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,137,4,0.14)",
  },
  uploadTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  uploadHint: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  imagePreviewWrap: {
    height: 190,
    overflow: "hidden",
    borderRadius: Radius.md,
    borderCurve: "continuous",
    backgroundColor: Colors.surfaceAlt,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    right: Spacing.md,
    bottom: Spacing.md,
  },
  imageOverlayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: Radius.full,
    backgroundColor: "rgba(18,18,20,0.86)",
  },
  imageOverlayText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  required: {
    color: "#ff8d8f",
  },
  characterCount: {
    color: Colors.textMuted,
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  inputShell: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: "#34343b",
  },
  inputShellFocused: {
    borderColor: Colors.danger,
    backgroundColor: "#1b1b20",
  },
  inputPrefix: {
    color: "#ff8904",
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 0,
  },
  textAreaShell: {
    minHeight: 116,
    alignItems: "flex-start",
    paddingTop: Spacing.md,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  helperText: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  categoryList: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  categoryChip: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: "#3b3b43",
    backgroundColor: Colors.surfaceAlt,
  },
  categoryChipSelected: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
  categoryChipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  categoryChipTextSelected: {
    color: Colors.textPrimary,
  },
  statusRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statusOption: {
    flex: 1,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "#34343b",
    backgroundColor: Colors.surfaceAlt,
  },
  statusOptionSelected: {
    borderColor: "rgba(229,57,53,0.7)",
    backgroundColor: "rgba(229,57,53,0.12)",
  },
  radioOuter: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: "#5c5c65",
  },
  radioOuterSelected: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger,
  },
  statusCopy: {
    flex: 1,
    gap: 2,
  },
  statusLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  statusLabelSelected: {
    color: Colors.textPrimary,
  },
  statusDescription: {
    color: Colors.textDisabled,
    fontSize: 10,
    lineHeight: 14,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    backgroundColor: "rgba(229,57,53,0.14)",
    borderWidth: 1,
    borderColor: "rgba(229,57,53,0.42)",
  },
  errorText: {
    flex: 1,
    color: "#ffb4b5",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  cancelButton: {
    minWidth: 92,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  submitButton: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderCurve: "continuous",
    backgroundColor: Colors.danger,
  },
  submitText: {
    color: Colors.textPrimary,
    ...Typography.label,
    fontWeight: "800",
  },
  requiredHint: {
    color: Colors.textDisabled,
    fontSize: 11,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.76,
  },
  disabled: {
    opacity: 0.5,
  },
});
