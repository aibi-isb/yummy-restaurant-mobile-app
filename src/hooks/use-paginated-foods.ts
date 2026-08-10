import { getFoodsPage, type Food, type FoodSort } from "@/services/foodService";
import { useCallback, useEffect, useMemo, useState } from "react";

export const MENU_PAGE_SIZE = 12;

type PageResult = {
  error: string | null;
  foods: Food[];
  requestKey: string;
  total: number;
};

export function usePaginatedFoods({
  category,
  page,
  query,
  sort,
}: {
  category?: string | null;
  page: number;
  query?: string;
  sort: FoodSort;
}) {
  const requestKey = `${page}:${category ?? ""}:${query ?? ""}:${sort}`;
  const [result, setResult] = useState<PageResult>({
    error: null,
    foods: [],
    requestKey: "",
    total: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    getFoodsPage({
      category,
      limit: MENU_PAGE_SIZE,
      offset: page * MENU_PAGE_SIZE,
      query,
      sort,
    })
      .then(({ foods, total }) => {
        if (active) setResult({ error: null, foods, requestKey, total });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setResult({
          error: error instanceof Error ? error.message : "Could not load the menu.",
          foods: [],
          requestKey,
          total: 0,
        });
      });

    return () => {
      active = false;
    };
  }, [category, page, query, refreshKey, requestKey, sort]);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);
  const loading = result.requestKey !== requestKey;
  const pageCount = Math.max(1, Math.ceil(result.total / MENU_PAGE_SIZE));

  return useMemo(
    () => ({
      error: loading ? null : result.error,
      foods: loading ? [] : result.foods,
      loading,
      pageCount,
      refresh,
      total: result.total,
    }),
    [loading, pageCount, refresh, result]
  );
}
