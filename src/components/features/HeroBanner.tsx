/**
 * Static image-led home hero.
 *
 * The active theme controls the contrast treatment and foreground colors while
 * the food photo fills the complete banner like a promotional image asset.
 */
import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Radius, Spacing } from "@/constants/theme";
import { heroFoodImage } from "@/data/restaurant";
import { useTheme } from "@/providers/theme-provider";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type HeroBannerProps = {
  onOrderNow?: () => void;
};

export function HeroBanner({ onOrderNow }: HeroBannerProps) {
  const { colors, mode } = useTheme();
  const isLight = mode === "light";
  const foregroundColor = isLight ? colors.textPrimary : "#FFFFFF";
  const secondaryColor = isLight ? colors.textSecondary : "rgba(255,255,255,0.88)";
  const overlayColor = isLight ? "rgba(255,255,255,0.62)" : "rgba(0,0,0,0.54)";
  const buttonBackground = isLight ? colors.textPrimary : "#FFFFFF";
  const buttonForeground = colors.textReverse;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          boxShadow: colors.cardShadow,
        },
      ]}
    >
      <Image
        source={heroFoodImage}
        style={styles.backgroundImage}
        contentFit="cover"
        accessibilityLabel="Hero food photo"
        pointerEvents="none"
      />
      <View style={[styles.imageOverlay, { backgroundColor: overlayColor }]} pointerEvents="none" />

      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <PhosphorIcon name="restaurant" size={16} color={colors.accent} weight="bold" />
          <Text style={[styles.eyebrow, { color: colors.accent }]}>YUMMI</Text>
        </View>

        <Text style={[styles.title, { color: foregroundColor }]}>
          {isLight ? "Delicious Food, Delivered with ease" : "Good food, made for your mood"}
        </Text>

        {!isLight && (
          <Text style={[styles.description, { color: secondaryColor }]}>Order your favourites and enjoy every bite.</Text>
        )}

        <View style={styles.featureRow}>
          <FeaturePill icon="restaurant-outline" label="Wide variety" color={secondaryColor} />
          <FeaturePill icon="truck-outline" label="Fast delivery" color={secondaryColor} />
          <FeaturePill icon="card-outline" label="Secure payments" color={secondaryColor} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.orderButton,
            { backgroundColor: buttonBackground },
            pressed && styles.pressed,
          ]}
          onPress={onOrderNow}
          accessibilityRole="button"
          accessibilityLabel="Order Now"
        >
          <Text style={[styles.orderButtonText, { color: buttonForeground }]}>Order Now</Text>
          <PhosphorIcon name="arrow-forward" size={16} color={buttonForeground} weight="bold" />
        </Pressable>
      </View>
    </View>
  );
}

type FeaturePillProps = {
  icon: string;
  label: string;
  color: string;
};

function FeaturePill({ icon, label, color }: FeaturePillProps) {
  return (
    <View style={styles.featurePill}>
      <PhosphorIcon name={icon} size={20} color={color} />
      <Text style={[styles.featureLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 236,
    borderRadius: Radius.figmaMd,
    borderWidth: 1,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
  },
  content: {
    flex: 1,
    minHeight: 236,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  title: {
    maxWidth: 280,
    marginTop: Spacing.sm,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: -0.25,
  },
  description: {
    maxWidth: 230,
    marginTop: Spacing.xs,
    fontSize: 13,
    lineHeight: 18,
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: 310,
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "600",
  },
  orderButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.figmaMd,
  },
  orderButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.78,
  },
});
