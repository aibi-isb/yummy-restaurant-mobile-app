/**
 * Toast
 * Matches Figma nodes 2354:3879 and 2355:4038.
 *
 * A slim dismissible banner that slides in at the top (or bottom) of a screen.
 * Used for transient feedback: "Order Successfully Placed!" and
 * "Your Order is being tracked".
 *
 * Props
 *   message   – text to display
 *   visible   – controls mount / unmount
 *   onClose   – called when the user taps the × button
 *
 * Usage
 *   <Toast
 *     message="Order Successfully Placed!"
 *     visible={showToast}
 *     onClose={() => setShowToast(false)}
 *   />
 */
import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { Image } from "expo-image";
import { useEffect, useMemo } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Figma MCP assets ─────────────────────────────────────────────────────────
// Green check icon that appears inside the pale-green square (same asset for both variants)
const iconCheck =
  "http://localhost:3845/assets/67f5b75065d9f95a090b568df6920a3338dd0a6b.svg";

// ─── Component ────────────────────────────────────────────────────────────────

type ToastProps = {
  message: string;
  visible: boolean;
  onClose: () => void;
  /** Auto-dismiss after this many ms (0 = no auto-dismiss). Default: 3000 */
  autoDismissMs?: number;
};

export function Toast({
  message,
  visible,
  onClose,
  autoDismissMs = 3000,
}: ToastProps) {
  const { colors } = useTheme();
  const opacity = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(-16), []);

  // Animate in / out whenever `visible` changes
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoDismissMs > 0) {
        const timer = setTimeout(onClose, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -16,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [autoDismissMs, onClose, opacity, translateY, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.wrapper, { opacity, transform: [{ translateY }] }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      {/* Card background */}
      <View style={[styles.card, { backgroundColor: colors.surfaceAlt, borderColor: colors.divider }]}>
        {/* Left: pale-green icon square */}
        <View style={[styles.iconBox, { backgroundColor: colors.successSurface }]}>
          <Image
            source={{ uri: iconCheck }}
            style={styles.checkIcon}
            contentFit="contain"
            accessibilityLabel="Success"
          />
        </View>

        {/* Message */}
        <Text style={[styles.message, { color: colors.textPrimary }]} numberOfLines={2}>
          {message}
        </Text>

        {/* Close × */}
        <Pressable
          style={styles.closeBtn}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          hitSlop={8}
        >
          <PhosphorIcon name="close" size={18} color={Colors.textPrimary} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Absolute overlay — caller must render inside a position-aware container
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderCurve: "continuous",
    borderRadius: Radius.sm,
    height: 99,
    paddingLeft: 35,
    paddingRight: Spacing.md,
    gap: 21,
  },

  // Pale-green rounded square (56×56) with green check inside
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  checkIcon: {
    width: 28,
    height: 28,
  },

  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  closeBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
