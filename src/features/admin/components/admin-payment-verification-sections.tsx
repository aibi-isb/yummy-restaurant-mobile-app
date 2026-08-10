import { PhosphorIcon } from "@/components/PhosphorIcon";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { AdminPaymentVerification, AdminPaymentVerificationInfoItem } from "@/features/admin/types";
import type { PaymentAction } from "@/hooks/usePayments";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const ACCENT = "#e11d48";

export function AdminPaymentVerificationToolbar({ filter, onFilter, onQueryChange, query }: { filter: "all" | "pending" | "approved" | "rejected"; onFilter: () => void; onQueryChange: (query: string) => void; query: string }) {
  return (
    <View style={styles.toolbar}>
      <View style={styles.searchGroup}>
        <PhosphorIcon name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          style={styles.searchInput}
          placeholder="Search here..."
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          accessibilityLabel="Search payments"
        />
      </View>

      <View style={styles.toolbarActions}>
        <Pressable style={({ pressed }) => [styles.filterButton, filter !== "all" && styles.filterButtonActive, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Filter payments" onPress={onFilter}>
          <PhosphorIcon name="options-outline" size={18} color={ACCENT} />
        </Pressable>
      </View>
    </View>
  );
}

export function AdminPaymentVerificationHeader({ payment }: { payment: AdminPaymentVerification }) {
  return (
    <View style={styles.headerBlock}>
      <View style={styles.idRow}>
        <Text style={styles.moduleTitle}>Payment Verification</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{payment.status}</Text>
        </View>
      </View>
      <Text style={styles.timestamp}>{payment.timestamp}</Text>
    </View>
  );
}

export function AdminPaymentDetailsCard({ payment }: { payment: AdminPaymentVerification }) {
  return (
    <View style={styles.detailsCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>View Payment Details</Text>
      </View>

      <View style={styles.detailsBody}>
        <Text style={styles.groupTitle}>Payment Information</Text>
        <View style={styles.infoList}>
          {payment.paymentInformation.map((item) => (
            <PaymentInfoRow key={item.id} item={item} />
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.groupTitle}>Payment Source Details</Text>
        <View style={styles.sourceList}>
          <SourceInfo label="Customer Name" value={payment.customerName} />
          <SourceInfo label="Related Order ID" value={payment.relatedOrderId} semibold />
        </View>
      </View>
    </View>
  );
}

function PaymentInfoRow({ item }: { item: AdminPaymentVerificationInfoItem }) {
  return (
    <View style={styles.infoRow}>
      <PhosphorIcon name={item.icon} size={22} color="#6b7280" />
      <View style={styles.infoCopy}>
        <Text style={styles.infoLabel}>{item.label}</Text>
        <Text style={[styles.infoValue, item.valueWeight === "bold" && styles.infoValueBold, item.valueWeight === "semibold" && styles.infoValueSemi]} selectable>
          {item.value}
        </Text>
      </View>
    </View>
  );
}

function SourceInfo({ label, semibold, value }: { label: string; semibold?: boolean; value: string }) {
  return (
    <View style={styles.sourceInfo}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.sourceValue, semibold && styles.infoValueSemi]} selectable>
        {value}
      </Text>
    </View>
  );
}

export function AdminPaymentNoteCard({ note }: { note: string }) {
  return (
    <View style={styles.noteCard}>
      <Text style={styles.noteLabel}>Admin Note (Optional):</Text>
      <Text style={styles.noteText}>{note}</Text>
    </View>
  );
}

export function AdminPaymentVerificationActions({
  busyAction,
  disabled,
  onApprove,
  onReject,
}: {
  busyAction?: PaymentAction | null;
  disabled?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const locked = disabled || Boolean(busyAction);

  return (
    <View style={styles.actions}>
      <Pressable disabled={locked} style={({ pressed }) => [styles.rejectButton, locked && styles.disabledButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityState={{ disabled: locked }} accessibilityLabel="Reject payment" onPress={onReject}>
        <Text style={styles.rejectText}>{busyAction === "reject" ? "Rejecting…" : "Reject Payment"}</Text>
      </Pressable>
      <Pressable disabled={locked} style={({ pressed }) => [styles.approveButton, locked && styles.disabledButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityState={{ disabled: locked }} accessibilityLabel="Approve payment" onPress={onApprove}>
        <Text style={styles.approveText}>{busyAction === "approve" ? "Approving…" : "Approve Payment"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#262626",
  },
  searchGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Colors.textPrimary,
    fontSize: 15.5,
    lineHeight: 20,
    paddingVertical: 0,
  },
  toolbarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  filterButton: {
    width: 24,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: { backgroundColor: "rgba(225,29,72,0.18)", borderRadius: 8 },
  headerBlock: {
    gap: 10,
  },
  moduleTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "900",
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    minHeight: 24,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: "#3f2e1a",
  },
  statusText: {
    color: "#d97706",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  timestamp: {
    paddingTop: 18,
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 20,
  },
  detailsCard: {
    gap: 28,
    padding: 24,
    borderRadius: 16,
    borderCurve: "continuous",
    backgroundColor: "#262626",
    borderWidth: 1,
    borderColor: ACCENT,
  },
  cardHeader: {
    minHeight: 45,
    borderBottomWidth: 1,
    borderBottomColor: "#404040",
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "800",
  },
  detailsBody: {
    gap: 26,
  },
  groupTitle: {
    color: "#9ca3af",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
  },
  infoList: {
    gap: 24,
  },
  infoRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoCopy: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    color: "#9ca3af",
    fontSize: 12,
    lineHeight: 16,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 28,
  },
  infoValueBold: {
    fontWeight: "900",
  },
  infoValueSemi: {
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#404040",
  },
  sourceList: {
    gap: 24,
  },
  sourceInfo: {
    gap: 0,
  },
  sourceValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    lineHeight: 28,
  },
  noteCard: {
    gap: 4,
    padding: 16,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#262626",
    borderWidth: 1,
    borderColor: "#404040",
  },
  noteLabel: {
    color: "#9ca3af",
    fontSize: 12,
    lineHeight: 16,
  },
  noteText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    flexDirection: "row",
    gap: 15,
  },
  rejectButton: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: ACCENT,
  },
  approveButton: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: ACCENT,
  },
  rejectText: {
    color: ACCENT,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  approveText: {
    color: Colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.76,
  },
  disabledButton: {
    opacity: 0.55,
  },
});
