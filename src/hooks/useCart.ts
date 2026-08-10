import { useCallback, useMemo } from "react";

import { getCartTotals, type CartLine } from "@/services/cartService";
import type { Food } from "@/services/foodService";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cart-store";
import { useFocusEffect } from "expo-router";

const EMPTY_CART: CartLine[] = [];

export function useCart() {
  const userId = useAuthStore((state) => state.user?.id);
  const scope = userId ?? "guest";
  const {
    scope: activeScope,
    items: storedItems,
    loading: storedLoading,
    error: storedError,
    refresh: refreshStore,
    add: addStore,
    remove: removeStore,
    updateQuantity: updateQuantityStore,
  } = useCartStore();
  const items = activeScope === scope ? storedItems : EMPTY_CART;
  const loading = activeScope === scope ? storedLoading : true;
  const error = activeScope === scope ? storedError : null;

  const refresh = useCallback(() => refreshStore(scope), [refreshStore, scope]);

  useFocusEffect(useCallback(() => {
    void refresh();
  }, [refresh]));

  const add = useCallback(
    (food: Food, quantity = 1) => addStore(scope, food, quantity),
    [addStore, scope]
  );

  const remove = useCallback(
    (itemId: string) => removeStore(scope, itemId),
    [removeStore, scope]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => updateQuantityStore(scope, itemId, quantity),
    [scope, updateQuantityStore]
  );

  const totals = useMemo(() => getCartTotals(items), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return { items, count, totals, loading, error, refresh, add, remove, updateQuantity };
}
