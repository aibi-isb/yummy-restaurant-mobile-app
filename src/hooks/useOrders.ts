import { useCallback, useEffect, useState } from "react";

import { getOrders, getUserOrders, Order, updateOrderStatus, OrderStatus } from "@/services/orderService";

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(userId ? await getUserOrders(userId) : await getOrders());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      await updateOrderStatus(orderId, status);
      await refresh();
    },
    [refresh]
  );

  return { orders, loading, error, refresh, updateStatus };
}
