import type { AppNotification } from "@/services/notificationService";
import { supabase } from "@/services/supabase/client";

function mapNotification(row: any): AppNotification {
  return {
    id: String(row.id),
    userId: row.user_id ?? "all",
    title: row.title ?? "Notification",
    message: row.message ?? "",
    type: row.type ?? "system",
    createdAt: row.created_at ?? new Date().toISOString(),
    read: Boolean(row.read),
    orderId: row.order_id ?? undefined,
  };
}

export async function getNotificationsByUser(userId?: string) {
  let query = supabase
    .from("notifications")
    .select("id,user_id,title,message,type,read,order_id,created_at")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.or(`user_id.eq.${userId},user_id.eq.all`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function createRemoteNotification(
  data: Omit<AppNotification, "id" | "createdAt" | "read">,
) {
  const { data: row, error } = await supabase
    .from("notifications")
    .insert({
      user_id: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      order_id: data.orderId,
      read: false,
    })
    .select("id,user_id,title,message,type,read,order_id,created_at")
    .single();

  if (error) throw error;
  return mapNotification(row);
}

export async function markNotificationAsRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
