import { getFoods } from "@/services/foodService";
import { getCategories as getRemoteCategories } from "@/services/supabase/categoryService";

export type MenuCategory = {
  id: string;
  name: string;
  image?: string;
};

const FALLBACK_CATEGORIES = ["Rice", "Burgers", "Pizza", "Drinks", "Snack"];

export async function getCategories(): Promise<MenuCategory[]> {
  try {
    const remoteCategories = await getRemoteCategories();
    if (remoteCategories.length) {
      return remoteCategories
        .filter((category) => category.name.toLowerCase() !== "more")
        .map((category) => ({
          id: category.id,
          name: category.name,
          image: category.image,
        }));
    }
  } catch {
    // If categories are not configured yet, derive them from available foods.
  }

  const foods = await getFoods();
  const names = new Set<string>();

  foods.forEach((food) => {
    food.categories.forEach((category) => names.add(category));
  });

  const categoryNames = Array.from(names).filter(
    (name) => Boolean(name) && name.toLowerCase() !== "more"
  );
  const normalized = categoryNames.length ? categoryNames : FALLBACK_CATEGORIES;

  return normalized.map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
  }));
}
