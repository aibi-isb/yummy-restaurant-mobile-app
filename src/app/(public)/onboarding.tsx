/**
 * Onboarding — 3 swipeable screens.
 *
 * Figma nodes: 2188-3203 · 2177-1904 · 2177-1906
 *
 * Layout per screen
 * ─────────────────
 *  • Full-screen dark (#121214) background
 *  • Blue radial glow (logo-glow.png) behind the illustration
 *  • Large circular illustration container (surfaceAlt #18181c)
 *    with a food-specific Ionicon centred inside
 *  • Bold heading (white)
 *  • Body copy (muted)
 *  • Dot row: inactive = #3f3f46 pill, active = #f7c2c0 wide pill
 *  • CTA button: "Next" on screens 1–2, "Get Started" on screen 3
 *  • "Skip" link top-right on screens 1 & 2 only
 *
 * Navigation
 * ──────────
 *  FlatList horizontal pager with snap.
 *  "Next" programmatically scrolls to the next index.
 *  "Get Started" + "Skip" both replace to "/auth-choice".
 */

import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { ONBOARDING_COMPLETE_KEY, WELCOME_ROUTE } from "@/lib/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Assets ───────────────────────────────────────────────────────────────────

const logoGlow = require("../../../assets/images/logo-glow.png");
const img1 = require("../../../assets/images/onbaording/onboarding1.png");
const img2 = require("../../../assets/images/onbaording/onboarding2.png");
const img3 = require("../../../assets/images/onbaording/onboarding3.png");

// ─── Screen data ──────────────────────────────────────────────────────────────

type Step = {
  id: string;
  image: any;
  heading: string;
  body: string;
};

const STEPS: Step[] = [
  {
    id: "s1",
    image: img1,
    heading: "Discover Delicious\nFood Near You",
    body: "Explore a wide variety of cuisines and dishes from the best restaurants in your area.",
  },
  {
    id: "s2",
    image: img2,
    heading: "Fast & Reliable\nDelivery",
    body: "Get your favourite meals delivered right to your doorstep in record time with our trusted partners.",
  },
  {
    id: "s3",
    image: img3,
    heading: "Easy & Secure\nPayment",
    body: "Pay seamlessly with multiple options — cards, cash, or mobile money. Always safe, always simple.",
  },
];

// ─── Derived constants ────────────────────────────────────────────────────────

const { width: W, height: H } = Dimensions.get("window");

const GLOW_SIZE     = W * 1.1;
const CIRCLE_SIZE   = W * 0.72;
const DOT_H         = 8;
const DOT_INACTIVE  = 8;
const DOT_ACTIVE    = 28;

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const listRef = useRef<FlatList<Step>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // ── Navigation helpers ────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    const next = activeIndex + 1;
    if (next < STEPS.length) {
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }
  }, [activeIndex]);

  const finish = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    router.replace(WELCOME_ROUTE);
  }, [router]);

  // ── Viewability callback ──────────────────────────────────────────────────
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useMemo(() => ({ viewAreaCoveragePercentThreshold: 50 }), []);

  // ── Render each slide ─────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: Step }) => (
      <View style={[styles.slide, { width: W }]}>
        {/* Blue glow blob behind illustration */}
        <Image
          source={logoGlow}
          style={styles.glow}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />

        {/* Circular illustration */}
        <View style={styles.illustrationCircle}>
          <Image
            source={item.image}
            style={styles.illustrationImage}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
        </View>

        {/* Text block */}
        <View style={styles.textBlock}>
          <Text style={styles.heading}>{item.heading}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      </View>
    ),
    []
  );

  const isLast = activeIndex === STEPS.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* ── Top bar: Skip (hidden on last screen) ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
        {!isLast ? (
          <Pressable
            style={styles.skipBtn}
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            hitSlop={12}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          // Keeps layout stable — invisible placeholder same size as Skip
          <View style={styles.skipBtn} />
        )}
      </View>

      {/* ── Pager ── */}
      <FlatList
        ref={listRef}
        data={STEPS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={styles.flatList}
        getItemLayout={(_, index) => ({
          length: W,
          offset: W * index,
          index,
        })}
      />

      {/* ── Bottom section: dots + CTA ── */}
      <View
        style={[
          styles.bottomSection,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
      >
        {/* Dot indicators */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA button */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaBtn,
            pressed && styles.ctaBtnPressed,
          ]}
          onPress={isLast ? finish : goNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Get Started" : "Next"}
        >
          <Text style={styles.ctaText}>
            {isLast ? "Get Started" : "Next"}
          </Text>

          {/* Arrow icon — only on Next (screens 1 & 2) */}
          {!isLast && (
            <PhosphorIcon
              name="arrow-forward"
              size={18}
              color={Colors.background}
              style={styles.ctaIcon}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Top bar ──
  topBar: {
    alignItems: "flex-end",
    paddingHorizontal: Spacing.xl,
    zIndex: 10,
  },
  skipBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  skipText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.2,
  },

  // ── Pager ──
  flatList: {
    flex: 1,
  },

  // ── Slide ──
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.xxxl,
  },

  // ── Glow ──
  glow: {
    position: "absolute",
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    opacity: 0.45,
    top: H * 0.04,     // offset upward so glow centres on the illustration
  },

  // ── Illustration circle ──
  illustrationCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
  },

  // ── Text ──
  textBlock: {
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  body: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 23,
  },

  // ── Bottom section ──
  bottomSection: {
    alignItems: "center",
    gap: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },

  // ── Dots ──
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    height: DOT_H,
    borderRadius: DOT_H / 2,
  },
  dotInactive: {
    width: DOT_INACTIVE,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: DOT_ACTIVE,
    backgroundColor: Colors.accent,
  },

  // ── CTA button ──
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent,
    borderRadius: Radius.sm,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xxxl * 1.5,
    width: "100%",
    gap: Spacing.sm,
  },
  ctaBtnPressed: {
    opacity: 0.82,
  },
  ctaText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  ctaIcon: {
    marginLeft: 2,
  },
});
