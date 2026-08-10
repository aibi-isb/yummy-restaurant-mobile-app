import {
  deleteFoodFromSupabase,
  fetchFoodByIdFromSupabase,
  fetchFoodsPageFromSupabase,
  fetchFoodsFromSupabase,
  upsertFoodToSupabase,
} from "@/services/supabase/foodRepository";

export type Food = {
  id: string;
  name: string;
  description: string;
  category: string;
  categories: string[];
  price: number;
  image: string;
  featured?: boolean;
  popular?: boolean;
  available: boolean;
  orders: number;
};

export type FoodSort = "name-asc" | "price-asc" | "price-desc" | "popular";

export async function getFoods() {
  return fetchFoodsFromSupabase();
}

export async function getFoodById(id: string) {
  return fetchFoodByIdFromSupabase(id);
}

export async function getFoodsPage({
  category,
  limit,
  offset,
  query,
  sort,
}: {
  category?: string | null;
  limit: number;
  offset: number;
  query?: string;
  sort?: FoodSort;
}) {
  return fetchFoodsPageFromSupabase({ category, limit, offset, query, sort });
}

export async function createFood(data: Omit<Food, "id" | "orders"> & { id?: string }) {
  const id = data.id ?? data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const food: Food = { ...data, id, orders: 0 };
  await upsertFoodToSupabase(food);
  return food;
}

export async function updateFood(id: string, data: Partial<Food>) {
  const currentFood = await getFoodById(id);
  if (!currentFood) throw new Error("Food item not found.");

  const updatedFood = { ...currentFood, ...data, id };
  await upsertFoodToSupabase(updatedFood);
  return updatedFood;
}

export async function deleteFood(id: string) {
  await deleteFoodFromSupabase(id);
}

export function searchFoodsInList(foods: Food[], query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return foods;

  return foods.filter((food) =>
    [food.name, food.description, food.category, ...food.categories]
      .join(" ")
      .toLowerCase()
      .includes(term)
  );
}

export function filterFoodsByCategoryInList(foods: Food[], category?: string | null) {
  if (!category || category === "All" || category === "More") return foods;
  return foods.filter((food) =>
    food.categories.some((item) => item.toLowerCase() === category.toLowerCase())
  );
}

export async function searchFoods(query: string) {
  return searchFoodsInList(await getFoods(), query);
}

export async function filterFoodsByCategory(category: string) {
  return filterFoodsByCategoryInList(await getFoods(), category);
}
