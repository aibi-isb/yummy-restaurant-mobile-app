import { CartLine, clearCart, getCartTotals } from "@/services/cartService";
import { createNotification } from "@/services/notificationService";
import { getJson, updateJson } from "@/services/storageService";
import {
  createRemoteOrder,
  getAllOrders,
  getOrdersByUser,
  updateRemoteOrderPayment,
  updateRemoteOrderStatus,
} from "@/services/supabase/orderService";

export type OrderStatus = "Pending" | "Payment Received" | "Preparing" | "Ready" | "Delivered";

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartLine[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: "Unpaid" | "Pending Verification" | "Approved" | "Rejected";
  createdAt: string;
  estimatedDeliveryAt?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
};

const ORDERS_KEY = "yummy:orders";

export async function getOrders() {
  try {
    return await getAllOrders();
  } catch {
    // Offline fallback uses the locally persisted order cache.
  }

  return getJson<Order[]>(ORDERS_KEY, []);
}

export async function getUserOrders(userId: string) {
  try {
    return await getOrdersByUser(userId);
  } catch {
    // Offline fallback uses the locally persisted order cache.
  }

  const orders = await getOrders();
  return orders.filter((order) => order.userId === userId);
}

export async function createOrder(orderData: {
  userId: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartLine[];
}) {
  try {
    const remoteOrder = await createRemoteOrder(orderData);
    if (remoteOrder) {
      await clearCart();
      return remoteOrder;
    }
  } catch {
    // Fall through to local order persistence.
  }

  const totals = getCartTotals(orderData.items);
  const order: Order = {
    id: `ORD-${Date.now()}`,
    ...orderData,
    ...totals,
    status: "Pending",
    paymentStatus: "Unpaid",
    createdAt: new Date().toISOString(),
  };

  await updateJson<Order[]>(ORDERS_KEY, [], (orders) => [order, ...orders]);
  await clearCart();
  return order;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const remoteOrder = await updateRemoteOrderStatus(orderId, status);
    if (remoteOrder) {
      await createNotification({
        userId: remoteOrder.userId,
        type: "order",
        title: "Order status updated",
        message: `Your order ${remoteOrder.id} is now ${status}.`,
        orderId,
      });
      return remoteOrder;
    }
  } catch {
    // Fall through to local order persistence.
  }

  const orders = await updateJson<Order[]>(ORDERS_KEY, [], (items) =>
    items.map((item) => (item.id === orderId ? { ...item, status } : item))
  );
  const order = orders.find((item) => item.id === orderId);

  if (order) {
    await createNotification({
      userId: order.userId,
      type: "order",
      title: "Order status updated",
      message: `Your order ${order.id} is now ${status}.`,
      orderId,
    });
  }

  return order ?? null;
}

export async function markOrderPayment(orderId: string, paymentStatus: Order["paymentStatus"]) {
  try {
    await updateRemoteOrderPayment(orderId, paymentStatus);
  } catch {
    // Local fallback still reflects payment state while offline.
  }

  return updateJson<Order[]>(ORDERS_KEY, [], (items) =>
    items.map((item) =>
      item.id === orderId
        ? {
            ...item,
            paymentStatus,
            status: paymentStatus === "Approved" ? "Payment Received" : item.status,
          }
        : item
    )
  );
}
