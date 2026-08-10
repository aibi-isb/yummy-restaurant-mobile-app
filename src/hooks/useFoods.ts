import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Food,
  filterFoodsByCategoryInList,
  getFoods,
  searchFoodsInList,
} from "@/services/foodService";

export function useFoods(options: { query?: string; category?: string | null } = {}) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setFoods(await getFoods());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load foods.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredFoods = useMemo(() => {
    const byCategory = filterFoodsByCategoryInList(foods, options.category);
    return searchFoodsInList(byCategory, options.query ?? "");
  }, [foods, options.category, options.query]);

  return { foods, filteredFoods, loading, error, refresh };
}
