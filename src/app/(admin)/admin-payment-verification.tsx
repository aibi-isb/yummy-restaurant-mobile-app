import {
  AdminPaymentDetailsCard,
  AdminPaymentNoteCard,
  AdminPaymentVerificationActions,
  AdminPaymentVerificationHeader,
  AdminPaymentVerificationToolbar,
} from "@/features/admin/components/admin-payment-verification-sections";
import { Toast } from "@/components/ui/Toast";
import { Colors } from "@/constants/theme";
import { usePayments, type PaymentAction } from "@/hooks/usePayments";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminPaymentVerificationScreen() {
  const { action, actionError, payments, approve, error, loading, reject } = usePayments();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resolvedPaymentIds, setResolvedPaymentIds] = useState<Set<string>>(() => new Set());
  const filteredPayments = useMemo(() => payments.filter((item) => {
    const term = query.trim().toLowerCase();
    const matchesText = !term || [item.id, item.orderId, item.userId, item.provider, item.method].filter(Boolean).join(" ").toLowerCase().includes(term);
    const matchesStatus = filter === "all" || item.status.toLowerCase().startsWith(filter);
    return matchesText && matchesStatus;
  }), [filter, payments, query]);
  const selectedPayment = filteredPayments.find((item) => item.id === selectedId) ?? filteredPayments[0];
  const latestPayment = selectedPayment;
  const payment = latestPayment ? {
    id: latestPayment.id,
    status: latestPayment.status === "Pending Verification" ? "Pending Approval" as const : latestPayment.status,
    timestamp: new Date(latestPayment.createdAt).toLocaleString(),
    paymentInformation: [
      { id: "method", label: "Payment Method", value: latestPayment.provider ?? latestPayment.method, icon: "phone-portrait-outline" as const },
      { id: "amount", label: "Amount", value: `Le ${latestPayment.amount}`, icon: "cash-outline" as const, valueWeight: "bold" as const },
      { id: "date", label: "Payment Date", value: new Date(latestPayment.createdAt).toDateString(), icon: "calendar-outline" as const },
    ],
    customerName: latestPayment.customerName ?? "Customer",
    relatedOrderId: latestPayment.orderId,
    adminNote: "Review the payment record before fulfilling the order.",
  } : null;

  const handlePaymentAction = async (nextAction: PaymentAction) => {
    if (!payment) return;

    const updatedPayment = nextAction === "approve"
      ? await approve(payment.id)
      : await reject(payment.id);

    if (updatedPayment) {
      setResolvedPaymentIds((current) => new Set(current).add(payment.id));
      setToastMessage(nextAction === "approve" ? "Payment approved successfully." : "Payment rejected successfully.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <Stack.Screen options={{ title: "Payment Verification" }} />
      <StatusBar style="light" />
      <Toast
        message={toastMessage ?? ""}
        visible={Boolean(toastMessage)}
        onClose={() => setToastMessage(null)}
      />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AdminPaymentVerificationToolbar query={query} onQueryChange={setQuery} filter={filter} onFilter={() => setFilter((value) => value === "all" ? "pending" : value === "pending" ? "approved" : value === "approved" ? "rejected" : "all")} />
        {filteredPayments.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.paymentPicker}>{filteredPayments.map((item, index) => <Pressable key={item.id} onPress={() => setSelectedId(item.id)} style={[styles.paymentChip, item.id === selectedPayment?.id && styles.paymentChipActive]} accessibilityRole="button" accessibilityLabel={`Select payment ${item.id}`}><Text style={styles.paymentChipText}>{item.customerName ?? `Payment ${index + 1}`}</Text></Pressable>)}</ScrollView> : null}
        {loading ? <Text style={styles.stateText}>Loading payments…</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {payment ? (
          <>
            <AdminPaymentVerificationHeader payment={payment} />
            <AdminPaymentDetailsCard payment={payment} />
            <AdminPaymentNoteCard note={payment.adminNote} />
            {actionError ? <Text style={styles.actionError} accessibilityRole="alert">{actionError}</Text> : null}
            {payment.status === "Pending Approval" ? (
              <AdminPaymentVerificationActions
                busyAction={action as PaymentAction | null}
                disabled={resolvedPaymentIds.has(payment.id)}
                onApprove={() => void handlePaymentAction("approve")}
                onReject={() => void handlePaymentAction("reject")}
              />
            ) : (
              <Text style={styles.reviewedText}>This payment has already been reviewed.</Text>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No payments found</Text>
            <Text style={styles.emptyText}>Try changing the search or payment status filter.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    gap: 24,
    paddingBottom: 16,
  },
  emptyState: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.surface,
    padding: 18,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  stateText: { color: Colors.textMuted, fontSize: 13 },
  errorText: { color: Colors.danger, fontSize: 13, fontWeight: "700" },
  actionError: { color: Colors.danger, fontSize: 13, lineHeight: 19, fontWeight: "700" },
  reviewedText: { color: Colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  paymentPicker: { gap: 8, paddingVertical: 8 },
  paymentChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: Colors.surfaceAlt },
  paymentChipActive: { backgroundColor: Colors.accent },
  paymentChipText: { color: Colors.textPrimary, fontSize: 11, fontWeight: "700" },
});
