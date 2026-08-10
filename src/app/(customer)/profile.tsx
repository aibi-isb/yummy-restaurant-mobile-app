/**
 * User Profile Screen
 * Matches Figma nodes 2122:19422, 2362:4256, 2362:4406, 2362:4517.
 *
 * All 4 Figma frames are the same screen — each shows a different accordion
 * section expanded. This single screen implements all states interactively:
 *
 *   Address          → expanded: Home + School entries with red left-bar
 *   Order History    → expanded: Total Orders / Received / Successful Payments stats
 *   Account Settings → expanded: 3 sub-items with red left-bar
 *   Payment Methods  → expanded: 3 sub-items with red left-bar
 *   Log Out          → tappable row (no expansion, triggers confirmation)
 */

import { PhosphorIcon } from "@/components/PhosphorIcon";
import { CustomerHeader } from "@/components/features/CustomerHeader";
import { ThemeToggle } from "@/components/features/ThemeToggle";
import { Colors, Radius, Spacing } from "@/constants/theme";
import {
  iconAccountSettings,
  iconAddress,
  iconEdit,
  iconEmail,
  iconLogOut,
  iconOrderHistory,
  iconPaymentMethods,
  iconPhone,
  iconReceivedOrders,
  iconSuccessfulPayments,
  iconTotalOrders,
} from "@/data/profile";
import { signOut } from "@/lib/auth";
import { WELCOME_ROUTE } from "@/lib/routes";
import { useOrders } from "@/hooks/useOrders";
import { usePayments } from "@/hooks/usePayments";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/services/supabase/userService";
import { uploadAvatar } from "@/services/supabase/storageService";
import { getPaymentConfig } from "@/services/paymentConfigService";
import { useTheme } from "@/providers/theme-provider";
import {
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidExpiry,
  isValidPhone,
  normalizePhone,
  sanitizePhoneInput,
} from "@/utils/validation";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────

const defaultAvatar = require("../../../assets/images/home/profile-avatar.png");

// Accordion section IDs
type SectionId = "address" | "orderHistory" | "accountSettings" | "paymentMethods";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Red vertical bar + bold label + body text — used in accordion content rows. */
const subStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accent: {
    width: 3,
    height: 56,
    backgroundColor: "#ac2b28",
    flexShrink: 0,
  },
  labelWrap: {
    flexShrink: 0,
  },
  label: {
    color: "#c8c8c9",
    fontSize: 13,
    fontWeight: "700",
  },
  value: {
    flex: 1,
    color: "#8f8f91",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Single accordion card.
 * Collapsed → slim 61px row with icon + label (+ optional right edit icon).
 * Expanded  → same header + children content below.
 */
function AccordionCard({
  iconUri,
  label,
  isExpanded,
  onToggle,
  showEditWhenExpanded = true,
  onEdit,
  children,
  isLogout = false,
}: {
  iconUri: string;
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  showEditWhenExpanded?: boolean;
  onEdit?: () => void;
  children?: React.ReactNode;
  isLogout?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={[cardStyles.card, { backgroundColor: isLogout ? "transparent" : colors.surface }, isLogout && { borderColor: colors.danger }, isLogout && cardStyles.cardLogout]}>
      <Pressable
        style={cardStyles.header}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={cardStyles.headerLeft}>
          {isLogout ? (
            <PhosphorIcon name="sign-out" size={22} color={colors.danger} />
          ) : (
            <PhosphorIcon name={iconUri} size={22} color={colors.textMuted} />
          )}
          <Text style={[cardStyles.label, { color: colors.textPrimary }, isLogout && cardStyles.labelLogout]}>
            {label}
          </Text>
        </View>

        {/* Right side: edit pencil when expanded, chevron when collapsed */}
        {isExpanded && showEditWhenExpanded ? (
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${label}`}
          >
            <PhosphorIcon name={iconEdit} size={11} color={colors.iconMuted} />
          </Pressable>
        ) : !isLogout ? (
          <PhosphorIcon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors.iconMuted}
          />
        ) : null}
      </Pressable>

      {/* Expanded content */}
      {isExpanded && children && (
        <View style={cardStyles.content}>{children}</View>
      )}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#26262d",
    borderRadius: Radius.sm,
    overflow: "hidden",
  },
  cardLogout: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 23,
    paddingVertical: 20,
    minHeight: 61,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  label: {
    color: "#c7c7c8",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  labelLogout: {
    color: "#c7c7c8",
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 20,
    gap: 28,
  },
});

// ─────────────────────────────────────────────────────────────────────────────

/** Order History expanded panel — 3 stat columns */
function OrderHistoryPanel({
  receivedCount,
  successfulPaymentsCount,
  totalCount,
}: {
  receivedCount: number;
  successfulPaymentsCount: number;
  totalCount: number;
}) {
  const { colors } = useTheme();
  const orderStats = [
    { icon: iconTotalOrders, count: totalCount, label: "Total Orders" },
    { icon: iconReceivedOrders, count: receivedCount, label: "Received Orders" },
    { icon: iconSuccessfulPayments, count: successfulPaymentsCount, label: "Successful Payments" },
  ];

  return (
    <View style={statsStyles.row}>
      {orderStats.map((stat) => (
        <View key={stat.label} style={statsStyles.col}>
          <PhosphorIcon name={stat.icon} size={36} color={colors.textMuted} />
          <View style={statsStyles.textWrap}>
            <Text style={statsStyles.count}>{stat.count}</Text>
            <Text style={statsStyles.label}>{stat.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const statsStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 32,
    paddingTop: 4,
  },
  col: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  textWrap: {
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  count: {
    color: "#c7c7c8",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  label: {
    color: "#c7c7c8",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 18,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { colors, mode } = useTheme();
  const { orders } = useOrders(user?.id);
  const { payments } = usePayments(user?.id);
  const userMetadata = user?.user_metadata ?? {};

  const [profile, setProfile] = useState<{
    fullName: string;
    username: string;
    phone: string;
    email: string;
    address: string;
    affiliationAddress?: string;
    role: string;
    avatarUrl?: string;
    primaryNetwork?: string;
    cardHolder?: string;
    cardLast4?: string;
    cardExpiry?: string;
  } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getProfile(user.id)
      .then((data) => {
        if (!data) return;
        setProfile({
          fullName: data.fullName,
          username: data.username,
          phone: data.phone,
          email: data.email,
          address: data.address,
          affiliationAddress: data.affiliationAddress,
          role: data.role,
          avatarUrl: data.avatarUrl,
          primaryNetwork: data.primaryNetwork,
          cardHolder: data.cardHolder,
          cardLast4: data.cardLast4,
          cardExpiry: data.cardExpiry,
        });
      })
      .catch(() => {});
  }, [user?.id]);

  const fullName = profile?.fullName ?? String(userMetadata.full_name ?? user?.email ?? "Customer");
  const username = profile?.username ?? String(userMetadata.username ?? "—");
  const phone = profile?.phone ?? String(userMetadata.phone ?? "No phone number added");
  const email = profile?.email ?? user?.email ?? "";
  const address = profile?.address ?? String(userMetadata.address ?? "No delivery address added");
  const primaryNetwork = profile?.primaryNetwork ?? "";
  const cardLast4 = profile?.cardLast4 ?? "";
  const cardHolder = profile?.cardHolder ?? "";
  const cardExpiry = profile?.cardExpiry ?? "";
  const avatarUrl = profile?.avatarUrl ?? (userMetadata.avatar_url as string | undefined);
  const avatarSource = avatarUrl ? { uri: avatarUrl } : defaultAvatar;
  const affiliationAddress = profile?.affiliationAddress ?? (userMetadata.affiliation_address as string | undefined);
  const successfulPaymentsCount = payments.filter((payment) => payment.status === "Approved").length;
  const receivedCount = orders.filter((order) => order.status === "Delivered").length;

  const [expanded, setExpanded] = useState<SectionId | null>("address");

  const pickAndUploadAvatar = async () => {
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

    if (result.canceled || !user?.id) return;

    const uri = result.assets[0].uri;
    try {
      const publicUrl = await uploadAvatar({ uri, userId: user.id });
      await supabase.from("profiles").upsert({
        id: user.id,
        avatar_url: publicUrl,
      });
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    } catch {
      Alert.alert("Upload failed", "Could not upload your profile picture. Please try again.");
    }
  };

  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [editPhone, setEditPhone] = useState("");

  const openPhoneEditor = () => {
    setEditPhone(phone);
    setPhoneModalVisible(true);
  };

  const savePhone = async () => {
    if (!isValidPhone(editPhone)) {
      Alert.alert("Invalid phone", "Use +232 77 123 456 or 077 123 456.");
      return;
    }
    if (!user?.id) return;
    const normalizedPhone = normalizePhone(editPhone);
    try {
      await supabase.from("profiles").upsert({ id: user.id, phone: normalizedPhone });
      await supabase.auth.updateUser({ data: { phone: normalizedPhone } });
      setPhoneModalVisible(false);
      // Refresh local state
      getProfile(user.id).then((data) => {
        if (data) {
          setProfile((prev) => prev ? { ...prev, phone: data.phone } : prev);
        }
      }).catch(() => {});
    } catch {
      Alert.alert("Error", "Could not save phone number. Please try again.");
    }
  };

  // ── Display name edit ──
  const [displayNameModalVisible, setDisplayNameModalVisible] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");

  const openDisplayNameEditor = () => {
    setEditDisplayName(fullName);
    setDisplayNameModalVisible(true);
  };

  const saveDisplayName = async () => {
    if (!editDisplayName.trim()) {
      Alert.alert("Invalid name", "Display name cannot be empty.");
      return;
    }
    if (!user?.id) return;
    try {
      await supabase.from("profiles").upsert({ id: user.id, full_name: editDisplayName.trim() });
      await supabase.auth.updateUser({ data: { full_name: editDisplayName.trim() } });
      setDisplayNameModalVisible(false);
      getProfile(user.id).then((data) => {
        if (data) {
          setProfile((prev) => prev ? { ...prev, fullName: data.fullName } : prev);
        }
      }).catch(() => {});
    } catch {
      Alert.alert("Error", "Could not save display name. Please try again.");
    }
  };

  // ── Address edit ──
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editPrimaryAddress, setEditPrimaryAddress] = useState("");
  const [editAffiliationAddress, setEditAffiliationAddress] = useState("");

  const openAddressEditor = () => {
    setEditPrimaryAddress(address);
    setEditAffiliationAddress(affiliationAddress || "");
    setAddressModalVisible(true);
  };

  const saveAddress = async () => {
    if (!user?.id) return;
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        address: editPrimaryAddress,
        affiliation_address: editAffiliationAddress,
      });
      setAddressModalVisible(false);
      setProfile((prev) =>
        prev ? { ...prev, address: editPrimaryAddress, affiliationAddress: editAffiliationAddress } : prev
      );
    } catch {
      Alert.alert("Error", "Could not save address. Please try again.");
    }
  };

  // ── Network picker ──
  const [mobileNetworks, setMobileNetworks] = useState<string[]>([]);
  const [networkModalVisible, setNetworkModalVisible] = useState(false);
  const [editNetwork, setEditNetwork] = useState("");

  useEffect(() => {
    getPaymentConfig().then((c) => setMobileNetworks(c.mobileNetworks)).catch(() => {});
  }, []);

  const openNetworkEditor = () => {
    setEditNetwork(primaryNetwork);
    setNetworkModalVisible(true);
  };

  const saveNetwork = async () => {
    if (!user?.id) return;
    try {
      await supabase.from("profiles").upsert({ id: user.id, primary_network: editNetwork });
      setNetworkModalVisible(false);
      setProfile((prev) => prev ? { ...prev, primaryNetwork: editNetwork } : prev);
    } catch {
      Alert.alert("Error", "Could not save network. Please try again.");
    }
  };

  // ── Card info edit ──
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [editCardHolder, setEditCardHolder] = useState("");
  const [editCardNumber, setEditCardNumber] = useState("");
  const [editCardExpiry, setEditCardExpiry] = useState("");

  const openCardEditor = () => {
    setEditCardHolder(cardHolder);
    setEditCardNumber("");
    setEditCardExpiry(cardExpiry);
    setCardModalVisible(true);
  };

  const saveCard = async () => {
    if (!user?.id) return;
    if (!editCardHolder.trim()) {
      Alert.alert("Invalid card holder", "Enter the card holder name.");
      return;
    }
    if (!editCardNumber && !cardLast4) {
      Alert.alert("Invalid card number", "Enter 13–16 digits.");
      return;
    }
    if (editCardNumber && !isValidCardNumber(editCardNumber)) {
      Alert.alert("Invalid card number", "Enter 13–16 digits.");
      return;
    }
    if (!isValidExpiry(editCardExpiry)) {
      Alert.alert("Invalid expiry", "Enter a current or future expiry in MM/YY format.");
      return;
    }
    const last4 = editCardNumber.replace(/\D/g, "").slice(-4);
    const savedLast4 = last4 || cardLast4;
    const expiry = editCardExpiry.trim();
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        card_holder: editCardHolder,
        card_last4: savedLast4,
        card_expiry: expiry,
      });
      setCardModalVisible(false);
      setProfile((prev) => prev ? { ...prev, cardHolder: editCardHolder, cardLast4: savedLast4, cardExpiry: expiry } : prev);
    } catch {
      Alert.alert("Error", "Could not save card info. Please try again.");
    }
  };

  const toggle = (id: SectionId) =>
    setExpanded((prev) => (prev === id ? null : id));

  const handleLogout = () =>
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace(WELCOME_ROUTE);
        },
      },
    ]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <CustomerHeader title="User Profile" showBack rightIcons="both" />

      {/* ── Scrollable body ──────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Avatar + user details ── */}
        <View style={styles.profileContainer}>
          <Pressable onPress={pickAndUploadAvatar} accessibilityLabel="Change profile photo">
            <Image
              source={avatarSource}
              style={styles.avatar}
              contentFit="cover"
              accessibilityLabel="Profile photo"
            />
          </Pressable>

          <View style={styles.detailsContainer}>
            {/* Name */}
            <Text style={styles.name}>{fullName}</Text>

            {/* Phone */}
            <View style={styles.infoRow}>
              <Text style={styles.phone}>{phone}</Text>
              <Pressable onPress={openPhoneEditor} hitSlop={8} accessibilityLabel="Edit phone">
                <PhosphorIcon name={iconPhone} size={11} color="#959596" />
              </Pressable>
            </View>

            {/* Email */}
            <View style={styles.infoRow}>
              <Text style={styles.email}>{email}</Text>
              <PhosphorIcon name={iconEmail} size={11} color="#949495" />
            </View>
          </View>
        </View>

        {/* ── Menu accordion ── */}
        <View style={styles.menuList}>

          {/* 1. Address */}
          <AccordionCard
            iconUri={iconAddress}
            label="Address"
            isExpanded={expanded === "address"}
            onToggle={() => toggle("address")}
            onEdit={openAddressEditor}
          >
            <View style={subStyles.row}>
              <View style={subStyles.accent} />
              <Text style={subStyles.label}>Primary</Text>
              <Text style={subStyles.value}>{address}</Text>
            </View>
            <View style={subStyles.row}>
              <View style={subStyles.accent} />
              <Text style={subStyles.label}>Affiliation</Text>
              <Text style={subStyles.value}>{affiliationAddress || "Not set"}</Text>
            </View>
          </AccordionCard>

          {/* 2. Order History */}
          <AccordionCard
            iconUri={iconOrderHistory}
            label="Order History"
            isExpanded={expanded === "orderHistory"}
            onToggle={() => toggle("orderHistory")}
            onEdit={() => {}}
          >
            <OrderHistoryPanel
              receivedCount={receivedCount}
              successfulPaymentsCount={successfulPaymentsCount}
              totalCount={orders.length}
            />
          </AccordionCard>

          {/* 3. Account Settings */}
          <AccordionCard
            iconUri={iconAccountSettings}
            label="Account Settings"
            isExpanded={expanded === "accountSettings"}
            onToggle={() => toggle("accountSettings")}
            onEdit={() => {}}
            showEditWhenExpanded={false}
          >
            <View style={subStyles.row}>
              <View style={subStyles.accent} />
              <Text style={subStyles.label}>Display Name</Text>
              <Text style={subStyles.value}>{fullName}</Text>
              <Pressable onPress={openDisplayNameEditor} hitSlop={8}>
                <PhosphorIcon name={iconEdit} size={14} color="#888" />
              </Pressable>
            </View>
            <View style={subStyles.row}>
              <View style={subStyles.accent} />
              <Text style={subStyles.label}>Username</Text>
              <Text style={subStyles.value}>{username}</Text>
            </View>
            <View style={subStyles.row}>
              <View style={subStyles.accent} />
              <Text style={subStyles.label}>Phone</Text>
              <Text style={subStyles.value}>{phone}</Text>
              <Pressable onPress={openPhoneEditor} hitSlop={8}>
                <PhosphorIcon name={iconEdit} size={14} color="#888" />
              </Pressable>
            </View>
            <View style={subStyles.row}>
              <View style={subStyles.accent} />
              <Text style={subStyles.label}>Email</Text>
              <Text style={subStyles.value}>{email}</Text>
            </View>
            <Pressable onPress={pickAndUploadAvatar} style={subStyles.row}>
              <View style={subStyles.accent} />
              <Text style={subStyles.label}>Avatar</Text>
              <Text style={subStyles.value}>Tap to change photo</Text>
            </Pressable>
            <ThemeToggle compact />
          </AccordionCard>

          {/* 4. Payment Methods */}
          <AccordionCard
            iconUri={iconPaymentMethods}
            label="Payment Methods"
            isExpanded={expanded === "paymentMethods"}
            onToggle={() => toggle("paymentMethods")}
            onEdit={() => router.push("/payment")}
            showEditWhenExpanded={false}
          >
            <View style={subStyles.row}>
              <View style={subStyles.accent} />
              <Text style={subStyles.label}>Primary Network</Text>
              <Text style={subStyles.value}>{primaryNetwork || "Not set"}</Text>
              <Pressable onPress={openNetworkEditor} hitSlop={8}>
                <PhosphorIcon name={iconEdit} size={14} color="#888" />
              </Pressable>
            </View>
            <View style={subStyles.row}>
              <View style={subStyles.accent} />
              <Text style={subStyles.label}>Card Info</Text>
              <Text style={subStyles.value}>{cardLast4 ? `Card ending in ${cardLast4}` : "Not set"}</Text>
              <Pressable onPress={openCardEditor} hitSlop={8}>
                <PhosphorIcon name={iconEdit} size={14} color="#888" />
              </Pressable>
            </View>
          </AccordionCard>

          {/* 5. Log Out — no expansion, just a bordered tap row */}
          <AccordionCard
            iconUri={iconLogOut}
            label="Log Out"
            isExpanded={false}
            onToggle={handleLogout}
            showEditWhenExpanded={false}
            isLogout
          />
        </View>
      </ScrollView>

      {/* ── Phone edit modal ── */}
      <Modal
        visible={phoneModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhoneModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.dialog}>
            <Text style={modalStyles.title}>Edit Phone Number</Text>
            <TextInput
              style={modalStyles.input}
              value={editPhone}
              onChangeText={(value) => setEditPhone(sanitizePhoneInput(value))}
              keyboardType="phone-pad"
              maxLength={24}
              textContentType="telephoneNumber"
              placeholder="+232 00 000 000"
              placeholderTextColor="#999"
              autoFocus
            />
            <View style={modalStyles.actions}>
              <Pressable
                style={modalStyles.cancelBtn}
                onPress={() => setPhoneModalVisible(false)}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={modalStyles.saveBtn} onPress={savePhone}>
                <Text style={modalStyles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Display name edit modal ── */}
      <Modal
        visible={displayNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDisplayNameModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.dialog}>
            <Text style={modalStyles.title}>Edit Display Name</Text>
            <TextInput
              style={modalStyles.input}
              value={editDisplayName}
              onChangeText={setEditDisplayName}
              autoCapitalize="words"
              autoCorrect={false}
              placeholder="Your name"
              placeholderTextColor="#999"
              autoFocus
            />
            <View style={modalStyles.actions}>
              <Pressable
                style={modalStyles.cancelBtn}
                onPress={() => setDisplayNameModalVisible(false)}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={modalStyles.saveBtn} onPress={saveDisplayName}>
                <Text style={modalStyles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Address edit modal ── */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.dialog}>
            <Text style={modalStyles.title}>Edit Addresses</Text>
            <Text style={{ color: "#aaa", fontSize: 13 }}>Primary</Text>
            <TextInput
              style={modalStyles.input}
              value={editPrimaryAddress}
              onChangeText={setEditPrimaryAddress}
              placeholder="Primary delivery address"
              placeholderTextColor="#999"
            />
            <Text style={{ color: "#aaa", fontSize: 13 }}>Affiliation</Text>
            <TextInput
              style={modalStyles.input}
              value={editAffiliationAddress}
              onChangeText={setEditAffiliationAddress}
              placeholder="Affiliation / secondary address"
              placeholderTextColor="#999"
            />
            <View style={modalStyles.actions}>
              <Pressable
                style={modalStyles.cancelBtn}
                onPress={() => setAddressModalVisible(false)}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={modalStyles.saveBtn} onPress={saveAddress}>
                <Text style={modalStyles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Network picker modal ── */}
      <Modal
        visible={networkModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNetworkModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.dialog}>
            <Text style={modalStyles.title}>Select Primary Network</Text>
            <View style={{ gap: 8 }}>
              {mobileNetworks.length === 0 && (
                <Text style={modalStyles.cancelText}>No networks available</Text>
              )}
              {mobileNetworks.map((net) => (
                <Pressable
                  key={net}
                  style={[
                    netOptionStyles.option,
                    editNetwork === net && netOptionStyles.selected,
                  ]}
                  onPress={() => setEditNetwork(net)}
                >
                  <Text
                    style={[
                      netOptionStyles.optionText,
                      editNetwork === net && netOptionStyles.selectedText,
                    ]}
                  >
                    {net}
                  </Text>
                  {editNetwork === net && (
                    <PhosphorIcon name="check" size={18} color={Colors.accent} />
                  )}
                </Pressable>
              ))}
            </View>
            <View style={modalStyles.actions}>
              <Pressable
                style={modalStyles.cancelBtn}
                onPress={() => setNetworkModalVisible(false)}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={modalStyles.saveBtn} onPress={saveNetwork}>
                <Text style={modalStyles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Card info edit modal ── */}
      <Modal
        visible={cardModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCardModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.dialog}>
            <Text style={modalStyles.title}>Edit Card Info</Text>
            <TextInput
              style={modalStyles.input}
              value={editCardHolder}
              onChangeText={setEditCardHolder}
              placeholder="Card holder name"
              placeholderTextColor="#999"
            />
            <TextInput
              style={modalStyles.input}
              value={editCardNumber}
              onChangeText={(value) => setEditCardNumber(formatCardNumber(value))}
              keyboardType="number-pad"
              maxLength={19}
              textContentType="creditCardNumber"
              placeholder="Card number"
              placeholderTextColor="#999"
            />
            <TextInput
              style={modalStyles.input}
              value={editCardExpiry}
              onChangeText={(value) => setEditCardExpiry(formatExpiry(value))}
              keyboardType="number-pad"
              maxLength={5}
              placeholder="Expiry (MM/YY)"
              placeholderTextColor="#999"
            />
            <View style={modalStyles.actions}>
              <Pressable
                style={modalStyles.cancelBtn}
                onPress={() => setCardModalVisible(false)}
              >
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={modalStyles.saveBtn} onPress={saveCard}>
                <Text style={modalStyles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,  // #121214
  },

  // ── Scroll ──
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxxl,
    gap: Spacing.xxxl,
  },

  // ── Avatar block ──
  profileContainer: {
    alignItems: "center",
    gap: 20,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  detailsContainer: {
    alignItems: "center",
    gap: 8,
  },
  name: {
    color: "#dfdfdf",
    fontSize: 23,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 27,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  phone: {
    color: "#959596",
    fontSize: 15,
    fontWeight: "400",
  },
  email: {
    color: "#949495",
    fontSize: 14,
    fontWeight: "400",
  },

  // ── Menu list ──
  menuList: {
    gap: 9,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  dialog: {
    width: "100%",
    backgroundColor: "#26262d",
    borderRadius: 12,
    padding: 24,
    gap: 16,
  },
  title: {
    color: "#dfdfdf",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    color: "#ccc",
    fontSize: 15,
    fontWeight: "500",
  },
  saveBtn: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: Colors.danger,
  },
  saveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});

const netOptionStyles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#1e1e24",
  },
  selected: {
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  optionText: {
    color: "#ccc",
    fontSize: 15,
  },
  selectedText: {
    color: "#fff",
    fontWeight: "600",
  },
});
