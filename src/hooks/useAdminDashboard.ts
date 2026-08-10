import { useCallback, useEffect, useState } from "react";

import {
  getAdminDashboard,
  getAdminDashboardData,
} from "@/features/admin/services/admin-dashboard-service";
import { AdminDashboard } from "@/features/admin/types";

export function useAdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboard>(getAdminDashboard());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await getAdminDashboardData());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { dashboard, loading, error, refresh };
}
