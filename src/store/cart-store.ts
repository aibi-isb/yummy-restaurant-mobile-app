import {
  addToCart,
  type CartLine,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "@/services/cartService";
import type { Food } from "@/services/foodService";
import { create } from "zustand";

type CartState = {
  scope: string | null;
  items: CartLine[];
  loading: boolean;
  error: string | null;
  refresh: (scope: string) => Promise<void>;
  add: (scope: string, food: Food, quantity?: number) => Promise<void>;
  remove: (scope: string, itemId: string) => Promise<void>;
  updateQuantity: (scope: string, itemId: string, quantity: number) => Promise<void>;
};

const refreshes = new Map<string, Promise<void>>();
const revisions = new Map<string, number>();

function getRevision(scope: string) {
  return revisions.get(scope) ?? 0;
}

function bumpRevision(scope: string) {
  const revision = getRevision(scope) + 1;
  revisions.set(scope, revision);
  return revision;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not load cart.";
}

export const useCartStore = create<CartState>((set, get) => {
  const activateScope = (scope: string) => {
    if (get().scope !== scope) {
      set({ scope, items: [], loading: true, error: null });
    }
  };

  const applyMutation = async (scope: string, operation: () => Promise<CartLine[]>) => {
    activateScope(scope);
    const revision = bumpRevision(scope);

    try {
      const items = await operation();
      if (get().scope === scope && getRevision(scope) === revision) {
        set({ items, loading: false, error: null });
      }
    } catch (error) {
      if (get().scope === scope && getRevision(scope) === revision) {
        set({ loading: false, error: getErrorMessage(error) });
      }
      throw error;
    }
  };

  return {
    scope: null,
    items: [],
    loading: true,
    error: null,

    refresh: async (scope) => {
      activateScope(scope);

      const pendingRefresh = refreshes.get(scope);
      if (pendingRefresh) {
        return pendingRefresh;
      }

      set({ loading: true, error: null });
      const revision = getRevision(scope);
      const refresh = (async () => {
        try {
          const items = await getCart();
          if (get().scope === scope && getRevision(scope) === revision) {
            set({ items, loading: false, error: null });
          }
        } catch (error) {
          if (get().scope === scope && getRevision(scope) === revision) {
            set({ loading: false, error: getErrorMessage(error) });
          }
        }
      })();

      refreshes.set(scope, refresh);
      try {
        await refresh;
      } finally {
        if (refreshes.get(scope) === refresh) {
          refreshes.delete(scope);
        }
      }
    },

    add: (scope, food, quantity = 1) =>
      applyMutation(scope, () => addToCart(food, quantity)),

    remove: (scope, itemId) =>
      applyMutation(scope, () => removeFromCart(itemId)),

    updateQuantity: (scope, itemId, quantity) =>
      applyMutation(scope, () => updateCartQuantity(itemId, quantity)),
  };
});
