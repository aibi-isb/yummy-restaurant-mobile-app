import { supabase } from "@/services/supabase/client";
import type { Food, FoodSort } from "@/services/foodService";

type FoodRow = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  categories: string[] | null;
  price: number | string;
  image: string | null;
  featured: boolean | null;
  popular: boolean | null;
  available: boolean | null;
  orders: number | string | null;
};

function mapFoodRow(row: FoodRow): Food {
  const category = row.category ?? row.categories?.[0] ?? "Food";

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    category,
    categories: row.categories?.length ? row.categories : [category],
    price: Number(row.price) || 0,
    image: row.image ?? "",
    featured: Boolean(row.featured),
    popular: Boolean(row.popular),
    available: row.available ?? true,
    orders: Number(row.orders) || 0,
  };
}

export async function fetchFoodsFromSupabase() {
  const { data, error } = await supabase
    .from("foods")
    .select("id,name,description,category,categories,price,image,featured,popular,available,orders")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapFoodRow(row as FoodRow));
}

export async function fetchFoodByIdFromSupabase(id: string) {
  const { data, error } = await supabase
    .from("foods")
    .select("id,name,description,category,categories,price,image,featured,popular,available,orders")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapFoodRow(data as FoodRow) : null;
}

export async function fetchFoodsPageFromSupabase({
  category,
  limit,
  offset,
  query,
  sort = "name-asc",
}: {
  category?: string | null;
  limit: number;
  offset: number;
  query?: string;
  sort?: FoodSort;
}) {
  let request = supabase
    .from("foods")
    .select(
      "id,name,description,category,categories,price,image,featured,popular,available,orders",
      { count: "exact" }
    );

  const searchTerm = query?.trim().replace(/[,%()]/g, " ");
  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    request = request.or(
      `name.ilike.${pattern},description.ilike.${pattern},category.ilike.${pattern}`
    );
  }

  if (category && category !== "All" && category !== "More") {
    request = request.contains("categories", [category]);
  }

  if (sort === "price-asc") {
    request = request.order("price", { ascending: true }).order("name", { ascending: true });
  } else if (sort === "price-desc") {
    request = request.order("price", { ascending: false }).order("name", { ascending: true });
  } else if (sort === "popular") {
    request = request.order("orders", { ascending: false }).order("name", { ascending: true });
  } else {
    request = request.order("name", { ascending: true });
  }

  const { count, data, error } = await request.range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    foods: (data ?? []).map((row) => mapFoodRow(row as FoodRow)),
    total: count ?? 0,
  };
}

export async function upsertFoodToSupabase(food: Food) {
  const { error } = await supabase.from("foods").upsert(food);
  if (error) throw error;
}

export async function deleteFoodFromSupabase(id: string) {
  const { error } = await supabase.from("foods").delete().eq("id", id);
  if (error) throw error;
}
