import type { CartLine } from "@/services/cartService";
import type { Food } from "@/services/foodService";
import { supabase } from "@/services/supabase/client";

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

function mapCartRow(row: any): CartLine {
  const food = Array.isArray(row.foods) ? row.foods[0] : row.foods;

  return {
    id: String(row.id),
    foodId: String(row.food_id),
    name: food?.name ?? row.name ?? "Food item",
    price: Number(food?.price ?? row.price ?? 0),
    quantity: Number(row.quantity ?? 1),
    image: food?.image ?? row.image ?? "",
  };
}

export async function getRemoteCart() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("cart_items")
    .select("id,food_id,quantity,foods(name,price,image)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCartRow);
}

export async function addRemoteCartItem(food: Food, quantity = 1) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const current = await getRemoteCart();
  const existing = current?.find((item) => item.foodId === food.id);

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .eq("user_id", userId);

    if (error) throw error;
    return getRemoteCart();
  }

  const { error } = await supabase.from("cart_items").insert({
    user_id: userId,
    food_id: food.id,
    quantity,
  });

  if (error) throw error;
  return getRemoteCart();
}

export async function updateRemoteCartQuantity(itemId: string, quantity: number) {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const query = supabase.from("cart_items").delete().eq("id", itemId).eq("user_id", userId);
  if (quantity <= 0) {
    const { error } = await query;
    if (error) throw error;
    return getRemoteCart();
  }

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("user_id", userId);

  if (error) throw error;
  return getRemoteCart();
}

export async function removeRemoteCartItem(itemId: string) {
  return updateRemoteCartQuantity(itemId, 0);
}

export async function clearRemoteCart() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
  if (error) throw error;
  return [] satisfies CartLine[];
}
