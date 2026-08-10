import { supabase } from "@/services/supabase/client";
import { fetch } from "expo/fetch";

const FOOD_IMAGES_BUCKET = "food-images";
export const CATEGORY_IMAGES_BUCKET = "category-images";
export const AVATAR_IMAGES_BUCKET = "avatars";

export function getPublicStorageUrl(path: string, bucket = FOOD_IMAGES_BUCKET) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadFoodImage({
  file,
  contentType = "image/jpeg",
  fileName,
}: {
  file: Blob | ArrayBuffer;
  contentType?: string;
  fileName: string;
}) {
  const path = `foods/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const { error } = await supabase.storage
    .from(FOOD_IMAGES_BUCKET)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw error;
  return getPublicStorageUrl(path);
}

export async function uploadCategoryImage({
  categoryId,
  contentType,
  fileName,
  uri,
}: {
  categoryId: string;
  contentType?: string | null;
  fileName?: string | null;
  uri: string;
}) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Could not read the selected category image.");

  const body = await response.arrayBuffer();
  const extension = getImageExtension(fileName, contentType);
  const safeCategoryId = categoryId.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const path = `categories/${safeCategoryId}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(CATEGORY_IMAGES_BUCKET)
    .upload(path, body, {
      contentType: contentType || `image/${extension === "jpg" ? "jpeg" : extension}`,
      upsert: false,
    });

  if (error) throw error;

  return {
    path,
    url: getPublicStorageUrl(path, CATEGORY_IMAGES_BUCKET),
  };
}

export function getManagedCategoryImagePath(url?: string | null) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${CATEGORY_IMAGES_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex < 0) return null;
  return decodeURIComponent(url.slice(markerIndex + marker.length));
}

export async function removeCategoryImage(path: string) {
  const { error } = await supabase.storage.from(CATEGORY_IMAGES_BUCKET).remove([path]);
  if (error) throw error;
}

function getImageExtension(fileName?: string | null, contentType?: string | null) {
  const fileExtension = fileName?.split(".").pop()?.toLowerCase();
  if (fileExtension === "png") return "png";
  if (fileExtension === "jpg" || fileExtension === "jpeg") return "jpg";
  return contentType === "image/png" ? "png" : "jpg";
}

export async function uploadAvatar({
  uri,
  userId,
}: {
  uri: string;
  userId: string;
}) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Could not read the selected image.");

  const body = await response.arrayBuffer();
  const ext = uri.split(".").pop()?.toLowerCase() === "png" ? "png" : "jpg";
  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_IMAGES_BUCKET)
    .upload(path, body, {
      contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(AVATAR_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
