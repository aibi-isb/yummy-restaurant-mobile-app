import { supabase } from "@/services/supabase/client";

export type Category = {
  id: string;
  name: string;
  image?: string;
  active?: boolean;
};

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,image,active")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((row) => row.active !== false)
    .map((row) => ({
      id: String(row.id),
      name: row.name ?? "Category",
      image: row.image ?? undefined,
      active: row.active ?? true,
    })) satisfies Category[];
}

export async function updateCategoryImage(categoryId: string, image: string) {
  const { data, error } = await supabase
    .from("categories")
    .update({ image })
    .eq("id", categoryId)
    .select("id,name,image,active")
    .single();

  if (error) throw error;

  return {
    id: String(data.id),
    name: data.name ?? "Category",
    image: data.image ?? undefined,
    active: data.active ?? true,
  } satisfies Category;
}
