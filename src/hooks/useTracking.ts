import { useEffect, useMemo, useState } from "react";
import { getTrackingConfig, type TrackingConfig } from "@/services/trackingService";
import { useOrders } from "@/hooks/useOrders";

export function useTracking(userId?: string, orderId?: string) {
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const { orders, loading: ordersLoading, refresh: refreshOrders, updateStatus } = useOrders(userId);

  useEffect(() => {
    let cancelled = false;
    setConfigLoading(true);
    getTrackingConfig()
      .then((result) => {
        if (!cancelled) setConfig(result);
      })
      .catch(() => {
        if (!cancelled) setConfig(null);
      })
      .finally(() => {
        if (!cancelled) setConfigLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const order = useMemo(() => {
    if (orderId) return orders.find((o) => o.id === orderId) ?? null;
    return null;
  }, [orders, orderId]);

  const loading = configLoading || ordersLoading;

  return { config, order, loading, refreshOrders, updateStatus };
}
