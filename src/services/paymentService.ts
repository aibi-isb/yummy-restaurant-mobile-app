import { markOrderPayment } from "@/services/orderService";
import { createNotification } from "@/services/notificationService";
import { getJson, updateJson } from "@/services/storageService";
import {
  createRemotePayment,
  getRemotePayments,
  updateRemotePaymentStatus,
} from "@/services/supabase/paymentService";

export type Payment = {
  id: string;
  orderId: string;
  userId: string;
  customerName?: string;
  amount: number;
  method: "mobile_money" | "credit_card" | "cash";
  provider?: string;
  phone?: string;
  cardLast4?: string;
  status: "Pending Verification" | "Approved" | "Rejected";
  createdAt: string;
};

const PAYMENTS_KEY = "yummy:payments";

function isNetworkFailure(error: unknown) {
  if (error instanceof TypeError) return true;
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return /fetch failed|network|offline|timeout|connection refused|enotfound/.test(message);
}

export async function getPayments(userId?: string) {
  try {
    return await getRemotePayments(userId);
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    // Offline fallback uses local payment records.
  }

  const payments = await getJson<Payment[]>(PAYMENTS_KEY, []);
  return userId ? payments.filter((payment) => payment.userId === userId) : payments;
}

export async function createPayment(paymentData: Omit<Payment, "id" | "status" | "createdAt">) {
  try {
    const payment = await createRemotePayment(paymentData);
    await markOrderPayment(payment.orderId, "Pending Verification");
    return payment;
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    // Fall through to local payment persistence.
  }

  const payment: Payment = {
    ...paymentData,
    id: `PAY-${Date.now()}`,
    status: "Pending Verification",
    createdAt: new Date().toISOString(),
  };

  await updateJson<Payment[]>(PAYMENTS_KEY, [], (payments) => [payment, ...payments]);
  await markOrderPayment(payment.orderId, "Pending Verification");
  return payment;
}

export async function approvePayment(paymentId: string) {
  try {
    const payment = await updateRemotePaymentStatus(paymentId, "Approved");
    await markOrderPayment(payment.orderId, "Approved");
    await createNotification({
      userId: payment.userId,
      type: "payment",
      title: "Payment approved",
      message: `Payment for order ${payment.orderId} has been approved.`,
      orderId: payment.orderId,
    });
    return payment;
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    // Fall through to local payment persistence.
  }

  const payments = await updateJson<Payment[]>(PAYMENTS_KEY, [], (items) =>
    items.map((item) => (item.id === paymentId ? { ...item, status: "Approved" } : item))
  );
  const payment = payments.find((item) => item.id === paymentId);

  if (payment) {
    await markOrderPayment(payment.orderId, "Approved");
    await createNotification({
      userId: payment.userId,
      type: "payment",
      title: "Payment approved",
      message: `Payment for order ${payment.orderId} has been approved.`,
      orderId: payment.orderId,
    });
  }

  return payment ?? null;
}

export async function rejectPayment(paymentId: string) {
  try {
    const payment = await updateRemotePaymentStatus(paymentId, "Rejected");
    await markOrderPayment(payment.orderId, "Rejected");
    await createNotification({
      userId: payment.userId,
      type: "payment",
      title: "Payment rejected",
      message: `Payment for order ${payment.orderId} was rejected. Please try another method.`,
      orderId: payment.orderId,
    });
    return payment;
  } catch (error) {
    if (!isNetworkFailure(error)) throw error;
    // Fall through to local payment persistence.
  }

  const payments = await updateJson<Payment[]>(PAYMENTS_KEY, [], (items) =>
    items.map((item) => (item.id === paymentId ? { ...item, status: "Rejected" } : item))
  );
  const payment = payments.find((item) => item.id === paymentId);

  if (payment) {
    await markOrderPayment(payment.orderId, "Rejected");
    await createNotification({
      userId: payment.userId,
      type: "payment",
      title: "Payment rejected",
      message: `Payment for order ${payment.orderId} was rejected. Please try another method.`,
      orderId: payment.orderId,
    });
  }

  return payment ?? null;
}
