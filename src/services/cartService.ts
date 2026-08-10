import { Food } from "@/services/foodService";
import { getJson, setJson, updateJson } from "@/services/storageService";
import {
  addRemoteCartItem,
  clearRemoteCart,
  getRemoteCart,
  removeRemoteCartItem,
  updateRemoteCartQuantity,
} from "@/services/supabase/cartService";

export type CartLine = {
  id: string;
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export const DELIVERY_FEE = 15;
export const GST_RATE = 0.005;
const CART_KEY = "yummy:cart";

export async function getCart() {
  try {
    const remoteCart = await getRemoteCart();
    if (remoteCart) {
      await setJson(CART_KEY, remoteCart);
      return remoteCart;
    }
  } catch {
    // Local cart keeps mobile ordering usable while offline.
  }

  return getJson<CartLine[]>(CART_KEY, []);
}

export async function addToCart(food: Food, quantity = 1) {
  try {
    const remoteCart = await addRemoteCartItem(food, quantity);
    if (remoteCart) {
      await setJson(CART_KEY, remoteCart);
      return remoteCart;
    }
  } catch {
    // Fall through to local persistence.
  }

  return updateJson<CartLine[]>(CART_KEY, [], (items) => {
    const existing = items.find((item) => item.foodId === food.id);
    if (existing) {
      return items.map((item) =>
        item.foodId === food.id ? { ...item, quantity: item.quantity + quantity } : item
      );
    }

    return [
      ...items,
      {
        id: `cart-${food.id}`,
        foodId: food.id,
        name: food.name,
        price: food.price,
        quantity,
        image: food.image,
      },
    ];
  });
}

export async function removeFromCart(itemId: string) {
  try {
    const remoteCart = await removeRemoteCartItem(itemId);
    if (remoteCart) {
      await setJson(CART_KEY, remoteCart);
      return remoteCart;
    }
  } catch {
    // Fall through to local persistence.
  }

  return updateJson<CartLine[]>(CART_KEY, [], (items) => items.filter((item) => item.id !== itemId));
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  try {
    const remoteCart = await updateRemoteCartQuantity(itemId, quantity);
    if (remoteCart) {
      await setJson(CART_KEY, remoteCart);
      return remoteCart;
    }
  } catch {
    // Fall through to local persistence.
  }

  return updateJson<CartLine[]>(CART_KEY, [], (items) =>
    quantity <= 0
      ? items.filter((item) => item.id !== itemId)
      : items.map((item) => (item.id === itemId ? { ...item, quantity } : item))
  );
}

export async function clearCart() {
  try {
    const remoteCart = await clearRemoteCart();
    if (remoteCart) {
      await setJson(CART_KEY, remoteCart);
      return remoteCart;
    }
  } catch {
    // Fall through to local persistence.
  }

  return setJson<CartLine[]>(CART_KEY, []);
}

export function getCartTotals(items: CartLine[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * GST_RATE;
  return {
    subtotal,
    deliveryFee: items.length > 0 ? DELIVERY_FEE : 0,
    tax: items.length > 0 ? tax : 0,
    total: subtotal + (items.length > 0 ? DELIVERY_FEE + tax : 0),
  };
}
