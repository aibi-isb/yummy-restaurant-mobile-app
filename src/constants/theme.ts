/**
 * Design tokens extracted from the YUMMI Figma file.
 * Single source of truth for colors, spacing, radius, and typography.
 */

import { Color } from "expo-router";
import { Platform, type ColorValue } from "react-native";

/** Consolidated grayscale foundation used by both theme modes. */
export const Grayscale = {
  gray90: "#212631",
  gray80: "#232323",
  gray70: "#373F4E",
  gray60: "#4E576A",
  gray50: "#667085",
  white100: "#FFFFFF",
  white90: "#EAEAEA",
  white80: "#C8C8C8",
  white70: "#F0F1F5",
  white60: "#E0E4EB",
} as const;

const darkTheme = {
  /** Warm, deeper page canvas so elevated cards remain visually distinct */
  background: "#1B1818",
  /** Shared elevated card surface */
  card: Grayscale.gray80,
  /** Warm control surface for header actions and search */
  controlSurface: "#2A2222",
  /** Card outline used to keep surfaces distinct from the page */
  cardBorder: Grayscale.gray70,
  /** Shared card shadow (React Native CSS boxShadow syntax) */
  cardShadow: "0 2px 8px rgba(0,0,0,0.28)",
  /** Elevated card / surface */
  surface: Grayscale.gray80,
  /** Slightly lighter surface used for icon containers */
  surfaceAlt: Grayscale.gray70,
  /** Overlay used on top of hero images */
  overlay: "rgba(0,0,0,0.35)",

  /** Primary text */
  textPrimary: Grayscale.white100,
  /** Semantic d.header */
  textHeader: Grayscale.white100,
  /** High-contrast supporting text */
  textSecondary: Grayscale.white90,
  /** Semantic d.description */
  textDescription: Grayscale.white90,
  /** Secondary / muted text */
  textMuted: Grayscale.white90,
  /** Placeholder / disabled text */
  textDisabled: Grayscale.gray50,
  /** Semantic d.reverse */
  textReverse: Grayscale.gray90,

  /** Accent / link colour (salmon-pink) */
  accent: "#f7c2c0",
  /** Destructive / badge red */
  danger: "#e53935",
  /** Foreground used on destructive and badge surfaces */
  onDanger: "#ffffff",
  /** Green accent (YUMMY brand) */
  green: "#2E7D32",
  /** Orange accent */
  orange: "#FF9800",
  /** Tinted state surfaces */
  successSurface: "rgba(46,125,50,0.22)",
  warningSurface: "rgba(255,152,0,0.16)",
  dangerSurface: "rgba(229,57,53,0.16)",

  /** Subtle border */
  border: Grayscale.gray70,
  /** Divider line */
  divider: Grayscale.gray70,

  /** Auth choice screen background from Figma */
  authBackground: "#e9e9e9",
  /** Auth choice screen text and line-art colour from Figma */
  authInk: "#1e1e1e",
  /** Auth choice screen outline colour from Figma */
  authOutline: "#747474",
  /** Auth form input border from Figma */
  authInputBorder: "#b9b9b9",
  /** Auth input placeholder text */
  authPlaceholder: "rgba(30, 30, 30, 0.4)",
  /** Splash screen background from Figma */
  splashBackground: "#1e1e1e",
  /** Splash screen logo/tagline light from Figma */
  splashText: "#e9e9e9",
  /** Bottom app navbar surface from Figma */
  navbarCard: Grayscale.gray80,
  /** Bottom app navbar icon colour from Figma */
  navbarIcon: "#a1a1aa",

  /** Shared authenticated-shell colors */
  header: Grayscale.gray80,
  navbar: Grayscale.gray80,
  input: Grayscale.gray80,
  inputBorder: Grayscale.gray70,
  scrim: "rgba(0,0,0,0.6)",
  iconMuted: Grayscale.gray50,
  statusBar: "light" as const,
} as const;

export type ThemeMode = "dark" | "light";
export type ThemeColors = Omit<{ [Key in keyof typeof darkTheme]: string }, "statusBar"> & {
  statusBar: "light" | "dark";
};

/**
 * Neutral YUMMY light palette. The page background is pure white, with
 * grayscale surface offsets providing the card and control hierarchy.
 */
export const lightTheme: ThemeColors = {
  ...darkTheme,
  background: Grayscale.white100,
  card: Grayscale.white90,
  controlSurface: Grayscale.white70,
  cardBorder: Grayscale.white80,
  cardShadow: "0 2px 8px rgba(33,38,49,0.12)",
  surface: Grayscale.white90,
  surfaceAlt: Grayscale.white70,
  overlay: "rgba(31,24,22,0.12)",
  textPrimary: Grayscale.gray90,
  textHeader: Grayscale.gray90,
  textSecondary: Grayscale.gray60,
  textDescription: Grayscale.gray60,
  textMuted: Grayscale.gray60,
  textDisabled: Grayscale.gray50,
  textReverse: Grayscale.white100,
  accent: "#B75B5B",
  danger: "#C93530",
  onDanger: "#ffffff",
  green: "#28733B",
  orange: "#B86B00",
  successSurface: "#E7F4E9",
  warningSurface: "#FFF2D9",
  dangerSurface: "#FBE8E7",
  border: Grayscale.white80,
  divider: Grayscale.white60,
  navbarCard: Grayscale.white100,
  navbarIcon: Grayscale.gray60,
  header: Grayscale.white100,
  navbar: Grayscale.white100,
  input: Grayscale.white70,
  inputBorder: Grayscale.white80,
  scrim: "rgba(31,24,22,0.35)",
  iconMuted: Grayscale.gray60,
  statusBar: "dark",
};

/**
 * Higher-contrast light palette for the admin workspace. Customer screens
 * retain the softer light palette above, while admin controls use stronger
 * text, borders, and action colors for at-a-glance data entry and review.
 */
export const adminLightTheme: ThemeColors = {
  ...lightTheme,
  card: Grayscale.white90,
  surface: Grayscale.white90,
  surfaceAlt: Grayscale.white70,
  controlSurface: Grayscale.white70,
  textPrimary: Grayscale.gray90,
  textHeader: Grayscale.gray90,
  textSecondary: Grayscale.gray70,
  textDescription: Grayscale.gray70,
  textMuted: Grayscale.gray60,
  textDisabled: Grayscale.gray50,
  accent: "#8F3F3F",
  danger: "#B42318",
  green: "#1F6B3A",
  orange: "#8A4B08",
  successSurface: "#E1F1E6",
  warningSurface: "#FDECC8",
  dangerSurface: "#FBE4E2",
  border: Grayscale.white80,
  divider: Grayscale.white60,
  header: Grayscale.white100,
  navbar: Grayscale.white100,
  input: Grayscale.white70,
  inputBorder: Grayscale.white80,
  iconMuted: Grayscale.gray60,
};

export const darkThemeColors: ThemeColors = darkTheme;

/**
 * Existing screens still import `Colors` directly. Resolve the core surface
 * and text tokens through Expo's native semantic color API so those screens
 * also respond when the authenticated shell changes Appearance color scheme.
 */
function semanticColor(ios: ColorValue, android: ColorValue, fallback: string) {
  return Platform.select({ ios, android, default: fallback }) as string;
}

const adaptiveColors = {
  background: semanticColor(Color.ios.systemBackground, Color.android.dynamic.background, darkTheme.background),
  card: semanticColor(Color.ios.secondarySystemBackground, Color.android.dynamic.surface, darkTheme.card),
  controlSurface: semanticColor(Color.ios.tertiarySystemBackground, Color.android.dynamic.surfaceContainerHigh, darkTheme.controlSurface),
  cardBorder: semanticColor(Color.ios.separator, Color.android.dynamic.outline, darkTheme.cardBorder),
  surface: semanticColor(Color.ios.secondarySystemBackground, Color.android.dynamic.surface, darkTheme.surface),
  surfaceAlt: semanticColor(Color.ios.tertiarySystemBackground, Color.android.dynamic.surfaceContainer, darkTheme.surfaceAlt),
  textPrimary: semanticColor(Color.ios.label, Color.android.dynamic.onSurface, darkTheme.textPrimary),
  textHeader: semanticColor(Color.ios.label, Color.android.dynamic.onSurface, darkTheme.textHeader),
  textSecondary: semanticColor(Color.ios.label, Color.android.dynamic.onSurface, darkTheme.textSecondary),
  textDescription: semanticColor(Color.ios.secondaryLabel, Color.android.dynamic.onSurfaceVariant, darkTheme.textDescription),
  textMuted: semanticColor(Color.ios.secondaryLabel, Color.android.dynamic.onSurfaceVariant, darkTheme.textMuted),
  textDisabled: semanticColor(Color.ios.tertiaryLabel, Color.android.dynamic.onSurfaceVariant, darkTheme.textDisabled),
  textReverse: semanticColor(Color.ios.systemBackground, Color.android.dynamic.background, darkTheme.textReverse),
  border: semanticColor(Color.ios.separator, Color.android.dynamic.outline, darkTheme.border),
  divider: semanticColor(Color.ios.separator, Color.android.dynamic.outlineVariant, darkTheme.divider),
  header: semanticColor(Color.ios.secondarySystemBackground, Color.android.dynamic.surfaceContainer, darkTheme.header),
  navbar: semanticColor(Color.ios.secondarySystemBackground, Color.android.dynamic.surfaceContainer, darkTheme.navbar),
  input: semanticColor(Color.ios.tertiarySystemBackground, Color.android.dynamic.surfaceContainerHigh, darkTheme.input),
  inputBorder: semanticColor(Color.ios.separator, Color.android.dynamic.outline, darkTheme.inputBorder),
  iconMuted: semanticColor(Color.ios.secondaryLabel, Color.android.dynamic.onSurfaceVariant, darkTheme.iconMuted),
} as const;

/** Backwards-compatible tokens used by existing screens and public routes. */
export const Colors = { ...darkTheme, ...adaptiveColors } as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 6,
  figmaMd: 1,
  navbar: 2,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

export const Typography = {
  /** Large screen titles */
  heading1: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.5 },
  /** Section / card headings */
  heading2: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
  /** Sub-headings */
  heading3: { fontSize: 18, fontWeight: "600" as const },
  /** Default body text */
  body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  /** Small labels */
  label: { fontSize: 14, fontWeight: "500" as const },
  /** Tiny captions */
  caption: { fontSize: 12, fontWeight: "400" as const },
  /** Price display */
  price: { fontSize: 22, fontWeight: "700" as const },
  /** CTA button text */
  button: { fontSize: 18, fontWeight: "700" as const },
} as const;
