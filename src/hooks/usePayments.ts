import { useCallback, useEffect, useState } from "react";

import { approvePayment, getPayments, Payment, rejectPayment } from "@/services/paymentService";

export type PaymentAction = "approve" | "reject";

export function usePayments(userId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<PaymentAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPayments(await getPayments(userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load payments.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = useCallback(async (paymentId: string, nextAction: PaymentAction) => {
    setAction(nextAction);
    setActionError(null);
    try {
      const updatedPayment = nextAction === "approve"
        ? await approvePayment(paymentId)
        : await rejectPayment(paymentId);
      await refresh();
      return updatedPayment;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not update payment status.");
      return null;
    } finally {
      setAction(null);
    }
  }, [refresh]);

  const approve = useCallback((paymentId: string) => runAction(paymentId, "approve"), [runAction]);
  const reject = useCallback((paymentId: string) => runAction(paymentId, "reject"), [runAction]);

  return { payments, loading, error, action, actionError, refresh, approve, reject };
}
