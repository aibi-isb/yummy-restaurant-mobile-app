import type { Payment } from "@/services/paymentService";
import { supabase } from "@/services/supabase/client";

function mapPayment(row: any): Payment {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const order = Array.isArray(row.orders) ? row.orders[0] : row.orders;
  const customerName = [profile?.full_name, order?.customer_name, profile?.username]
    .find((value) => typeof value === "string" && value.trim().length > 0);

  return {
    id: String(row.id),
    orderId: String(row.order_id),
    userId: String(row.user_id),
    customerName: typeof customerName === "string" ? customerName.trim() : undefined,
    amount: Number(row.amount ?? 0),
    method: row.method ?? "mobile_money",
    provider: row.provider ?? undefined,
    phone: row.phone ?? undefined,
    cardLast4: row.card_last4 ?? undefined,
    status: row.status ?? "Pending Verification",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

const paymentSelect = "id,order_id,user_id,amount,method,provider,phone,card_last4,status,created_at,profiles(full_name,username,email),orders(customer_name)";

export async function getRemotePayments(userId?: string) {
  let query = supabase
    .from("payments")
    .select(paymentSelect)
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapPayment);
}

export async function createRemotePayment(paymentData: Omit<Payment, "id" | "status" | "createdAt">) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      order_id: paymentData.orderId,
      user_id: paymentData.userId,
      amount: paymentData.amount,
      method: paymentData.method,
      provider: paymentData.provider,
      phone: paymentData.phone,
      card_last4: paymentData.cardLast4,
      status: "Pending Verification",
    })
    .select(paymentSelect)
    .single();

  if (error) throw error;
  return mapPayment(data);
}

export async function updateRemotePaymentStatus(
  paymentId: string,
  status: Payment["status"],
) {
  const { data, error } = await supabase
    .from("payments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", paymentId)
    .select(paymentSelect)
    .single();

  if (error) throw error;
  return mapPayment(data);
}
