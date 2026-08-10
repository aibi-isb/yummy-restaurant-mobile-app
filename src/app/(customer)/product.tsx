import { PhosphorIcon } from "@/components/PhosphorIcon";
import { ActionButton } from "@/components/features/ActionButton";
import { ProductQuantity } from "@/components/features/ProductQuantity";
import { Colors, Spacing } from "@/constants/theme";
import { useCart } from "@/hooks/useCart";
import { useAuthStore } from "@/store/authStore";
import { getFoodById, Food } from "@/services/foodService";
import { formatBadgeCount, getCartAccessibilityLabel } from "@/utils/badge-count";
import { formatLeones } from "@/utils/format";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const defaultAvatar = require("../../../assets/images/home/profile-avatar.png");

// ─── Hero height matches Figma spec (425 px) ────────────────────────────────
const HERO_HEIGHT = 425;

export default function ProductDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [quantity, setQuantity] = useState(1);
  const [food, setFood] = useState<Food | null>(null);
  const { add, count } = useCart();
  const detailWidth = Math.min(366, width - 24);

  const { user } = useAuthStore();
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  useEffect(() => {
    if (!params.id) return;
    void getFoodById(params.id).then(setFood);
  }, [params.id]);

  const handleOrder = async () => {
    if (!food) return;
    await add(food, quantity);
    router.push("/cart");
  };

  if (!food) {
    return <View style={styles.root}><Text style={styles.emptyText}>Loading food...</Text></View>;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Hero image ── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: food.image }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
            accessibilityLabel={`Photo of ${food.name}`}
          />

          {/* ── Floating header overlay ── */}
          <View style={[styles.header, { top: insets.top + 12 }]}>
            {/* Back button */}
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <PhosphorIcon name="chevron-back" size={22} color={Colors.textPrimary} />
            </Pressable>

            {/* Screen title */}
            <Text style={styles.headerTitle}>Prod. Details</Text>

            {/* Right-side actions: cart badge + avatar */}
            <View style={styles.headerRight}>
              {/* Cart button with notification badge */}
              <Pressable
                style={styles.cartBadgeWrap}
                onPress={() => router.push("/cart")}
                accessibilityRole="button"
                accessibilityLabel={getCartAccessibilityLabel(count)}
              >
                <View style={styles.cartBtn}>
                  <PhosphorIcon name="bag-outline" size={20} color={Colors.textPrimary} />
                </View>
                {count > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{formatBadgeCount(count)}</Text>
                  </View>
                )}
              </Pressable>

              {/* Avatar */}
              <Pressable
                onPress={() => router.push("/profile")}
                accessibilityRole="button"
                accessibilityLabel="Profile"
              >
                <Image
                  source={avatarUrl ? { uri: avatarUrl } : defaultAvatar}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Details section ── */}
        <View style={[styles.detailsContainer, { width: detailWidth }]}>
          {/* Food name */}
          <Text style={styles.foodName}>{food.name}</Text>

          {/* Description */}
          <Text style={styles.description}>{food.description}</Text>

          {/* Price */}
          <Text style={styles.price}>{formatLeones(food.price)}</Text>

          {/* Quantity selector */}
          <View style={styles.quantityWrap}>
            <ProductQuantity value={quantity} onChange={setQuantity} />
          </View>

          {/* Order CTA */}
          <View style={styles.orderWrap}>
            <ActionButton
              label="Order"
              onPress={handleOrder}
              variant="surface"
              icon={<PhosphorIcon name="bag-outline" size={24} color={Colors.textPrimary} />}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Hero ──
  heroContainer: {
    width: "100%",
    height: HERO_HEIGHT,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },

  // ── Header ──
  header: {
    position: "absolute",
    left: 13,
    right: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.48,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Back / icon button (transparent — floats over image)
  iconBtn: {
    width: 32,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnPressed: {
    opacity: 0.6,
  },

  // Cart pill button
  cartBadgeWrap: {
    width: 40,
    height: 40,
  },
  cartBtn: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Colors.onDanger,
    fontSize: 10,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },

  // Avatar circle
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  // ── Details ──
  detailsContainer: {
    alignSelf: "center",
    paddingTop: 29,
    gap: Spacing.xxl,
  },
  foodName: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "400",
    lineHeight: 24,
    textAlign: "center",
  },
  description: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    textAlign: "center",
    opacity: 0.6,
  },
  price: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.48,
    textAlign: "center",
  },
  quantityWrap: {
    // ProductQuantity has its own internal layout; wrapper constrains width
    width: 288,
    alignSelf: "center",
  },
  orderWrap: {
    width: 288,
    alignSelf: "center",
  },
  emptyText: {
    color: Colors.textMuted,
    marginTop: 96,
    textAlign: "center",
  },
});
