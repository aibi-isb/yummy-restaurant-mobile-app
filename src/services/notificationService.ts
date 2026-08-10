import { getJson, updateJson } from "@/services/storageService";
import {
  createRemoteNotification,
  getNotificationsByUser,
  markNotificationAsRead,
} from "@/services/supabase/notificationService";

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "payment" | "admin" | "system";
  createdAt: string;
  read: boolean;
  orderId?: string;
};

const NOTIFICATIONS_KEY = "yummy:notifications";

export async function getNotifications(userId?: string) {
  try {
    const notifications = await getNotificationsByUser(userId);
    return notifications;
  } catch {
    // Local fallback preserves in-app history if the backend is unavailable.
  }

  const notifications = await getJson<AppNotification[]>(NOTIFICATIONS_KEY, []);
  return userId ? notifications.filter((item) => item.userId === userId || item.userId === "all") : notifications;
}

export async function createNotification(data: Omit<AppNotification, "id" | "createdAt" | "read">) {
  try {
    const notification = await createRemoteNotification(data);
    const notifications = await getNotifications(data.userId);
    return { notification, notifications };
  } catch {
    // Fall back to local notification persistence.
  }

  const notification: AppNotification = {
    ...data,
    id: `notification-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const notifications = await updateJson<AppNotification[]>(NOTIFICATIONS_KEY, [], (items) => [
    notification,
    ...items,
  ]);

  return { notification, notifications };
}

export async function markNotificationRead(id: string) {
  try {
    await markNotificationAsRead(id);
    return getNotifications();
  } catch {
    // Fall back to local read state.
  }

  return updateJson<AppNotification[]>(NOTIFICATIONS_KEY, [], (items) =>
    items.map((item) => (item.id === id ? { ...item, read: true } : item))
  );
}
