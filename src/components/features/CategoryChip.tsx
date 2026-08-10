import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CategoryChipProps = {
  name: string;
  image?: string;
  onPress?: () => void;
  variant?: "round" | "rectangular";
};

export function CategoryChip({
  name,
  image,
  onPress,
  variant = "round",
}: CategoryChipProps) {
  const { colors } = useTheme();
  const isRectangular = variant === "rectangular";
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageFailed = Boolean(image && failedImage === image);

  return (
    <Pressable
      style={({ pressed }) => [
        isRectangular
          ? [styles.rectangularChip, { backgroundColor: colors.card, borderColor: colors.cardBorder, boxShadow: colors.cardShadow }]
          : [styles.chip, { backgroundColor: colors.card, borderColor: colors.cardBorder, boxShadow: colors.cardShadow }],
        pressed && { opacity: 0.75 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      {/* Circle image container with border ring */}
      <View style={isRectangular ? styles.rectangularImageContainer : styles.ringContainer}>
        {image && !imageFailed ? (
          <Image
            source={image}
            style={styles.image}
            contentFit="cover"
            accessibilityLabel={name}
            onError={() => setFailedImage(image)}
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}> 
            <PhosphorIcon name="image-outline" size={26} color={colors.textMuted} />
          </View>
        )}
        {/* Decorative border ring overlay */}
        {!isRectangular && <View style={[styles.ring, { borderColor: colors.cardBorder }]} pointerEvents="none" />}
      </View>

      <Text style={[styles.label, { color: colors.textPrimary }]}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 108,
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    borderCurve: "continuous",
  },
  rectangularChip: {
    width: 96,
    height: 127,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 13,
    borderWidth: 0.25,
    borderColor: Colors.cardBorder,
    borderRadius: 2,
  },
  ringContainer: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  rectangularImageContainer: {
    width: 75,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  ring: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
});
