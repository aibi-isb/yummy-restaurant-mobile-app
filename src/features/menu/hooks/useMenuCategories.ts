import { useCallback, useEffect, useState } from "react";

import { getCategories, MenuCategory } from "@/features/menu/services/menuService";

export function useMenuCategories() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { categories, loading, error, refresh };
}
