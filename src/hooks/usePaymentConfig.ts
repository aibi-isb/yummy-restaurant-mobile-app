import { useEffect, useState } from "react";
import { getPaymentConfig, type PaymentConfig } from "@/services/paymentConfigService";

export function usePaymentConfig() {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPaymentConfig()
      .then((result) => {
        if (!cancelled) setConfig(result);
      })
      .catch(() => {
        if (!cancelled) setConfig(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { config, loading };
}
