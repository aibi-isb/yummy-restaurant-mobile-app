import { supabase } from "@/services/supabase/client";

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  location: string;
  avatarUrl?: string;
  registrationDate: string;
};

export async function fetchCustomersFromSupabase() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,username,phone,address,avatar_url,created_at,role")
    .neq("role", "admin")
    .neq("role", "super_admin")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.full_name ?? row.email ?? "Customer",
    email: row.email ?? "",
    username: row.username ?? "",
    phone: row.phone ?? "",
    location: row.address ?? "",
    avatarUrl: row.avatar_url ?? undefined,
    registrationDate: row.created_at
      ? new Date(row.created_at).toLocaleString()
      : "Unknown",
  })) satisfies CustomerProfile[];
}
