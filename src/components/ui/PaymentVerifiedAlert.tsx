/**
 * PaymentVerifiedAlert
 * Matches Figma node 2354:3856.
 *
 * Full-screen modal overlay shown after a successful payment.
 * Contains:
 *   - Large green check icon
 *   - "Payment Verified" heading + body copy
 *   - "Track Order" primary button  →  navigates to /track-order
 *   - "Return Home" secondary button → navigates to /
 *   - Close × in top-right corner
 *
 * Props
 *   visible   – controls the Modal's visibility
 *   onClose   – called when user taps × or Return Home
 *   onTrack   – called when user taps Track Order
 */
import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { Image } from "expo-image";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ─── Figma MCP assets ─────────────────────────────────────────────────────────
// Large green check circle (48×48)
const iconCheckLarge =
  "http://localhost:3845/assets/d24c531ef6062ba554d35b211c406e9130a24384.svg";

// Location-pin icon inside "Track Order" button
const iconTrackPin =
  "http://localhost:3845/assets/38931178a9b59a92ccede0837de59497edc0bbde.svg";

// Home icon inside "Return Home" button
const iconHome =
  "http://localhost:3845/assets/69a4854115d9214dc3491305490f964d807451c6.svg";

// ─── Component ────────────────────────────────────────────────────────────────

type PaymentVerifiedAlertProps = {
  visible: boolean;
  onClose: () => void;
  onTrack: () => void;
};

export function PaymentVerifiedAlert({
  visible,
  onClose,
  onTrack,
}: PaymentVerifiedAlertProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      {/* Dimmed backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />

      {/* Card */}
      <View style={styles.cardWrap} pointerEvents="box-none">
        <View style={styles.card}>

          {/* Close button */}
          <Pressable
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
          >
            <PhosphorIcon name="close" size={18} color={Colors.textPrimary} />
          </Pressable>

          {/* Green check icon */}
          <Image
            source={{ uri: iconCheckLarge }}
            style={styles.checkIcon}
            contentFit="contain"
            accessibilityLabel="Payment verified"
          />

          {/* Text block */}
          <View style={styles.textBlock}>
            <Text style={styles.heading}>Payment Verified</Text>
            <Text style={styles.body}>
              You payment has been verified successfully.{"\n"}Your order is being prepared.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            {/* Track Order — filled dark button */}
            <Pressable
              style={({ pressed }) => [styles.btnTrack, pressed && { opacity: 0.8 }]}
              onPress={onTrack}
              accessibilityRole="button"
              accessibilityLabel="Track Order"
            >
              <Text style={styles.btnTrackLabel}>Track Order</Text>
              <Image
                source={{ uri: iconTrackPin }}
                style={styles.btnIcon}
                contentFit="contain"
                accessibilityLabel=""
              />
            </Pressable>

            {/* Return Home — outlined button */}
            <Pressable
              style={({ pressed }) => [styles.btnHome, pressed && { opacity: 0.8 }]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Return Home"
            >
              <Text style={styles.btnHomeLabel}>Return Home</Text>
              <Image
                source={{ uri: iconHome }}
                style={styles.btnIcon}
                contentFit="contain"
                accessibilityLabel=""
              />
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Semi-transparent full-screen backdrop
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  // Centre the card on screen
  cardWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },

  // Main card — #18181c, rounded, 393px wide in Figma → we let it fill width
  card: {
    width: "100%",
    backgroundColor: Colors.surfaceAlt,   // #18181c
    borderRadius: Radius.sm,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    alignItems: "center",
    gap: 35,
  },

  // × in top-right corner of card
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  // Large check circle (48×48)
  checkIcon: {
    width: 48,
    height: 48,
  },

  // Text block — centred
  textBlock: {
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  heading: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  body: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
  },

  // Button stack — 104px total height, 16px gap between
  buttons: {
    width: "100%",
    gap: 16,
  },

  // Track Order — dark filled (#222226), 44px tall
  btnTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222226",
    borderRadius: Radius.sm,
    height: 44,
    gap: 12,
  },
  btnTrackLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },

  // Return Home — outlined with border, 44px tall
  btnHome: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,           // #3f3f46
    borderRadius: Radius.sm,
    height: 44,
    gap: 12,
  },
  btnHomeLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
  },

  // Shared small icon in buttons (16px)
  btnIcon: {
    width: 16,
    height: 16,
  },
});
