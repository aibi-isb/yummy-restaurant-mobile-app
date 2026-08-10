import { useCallback, useEffect, useState } from "react";

import { getCustomers } from "@/services/customerService";
import { CustomerProfile } from "@/services/supabase/customerRepository";

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCustomers(await getCustomers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { customers, loading, error, refresh };
}
